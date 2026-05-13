from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.ai_chat import AIConversation, AIMessage
from app.models.inventory import InventoryItem as InventoryModel
from app.models.order import Order as OrderModel
from app.models.shipment import Shipment as ShipmentModel
from app.models.user import User
from app.core.config import settings
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID
import logging
import httpx

logger = logging.getLogger(__name__)

router = APIRouter()

# ─── Schemas ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    conversation_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    message: str
    conversation_id: UUID


class AIMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIConversationSummary(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIConversationDetail(AIConversationSummary):
    messages: List[AIMessageResponse]

    class Config:
        from_attributes = True


class RecommendationItem(BaseModel):
    type: str
    message: str
    action: str


class RecommendationsResponse(BaseModel):
    recommendations: List[RecommendationItem]


# ─── Exceptions ───────────────────────────────────────────────────────────────

class LLMProviderError(Exception):
    def __init__(self, provider: str, status_code: int, detail: str):
        self.provider = provider
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"{provider} error {status_code}: {detail}")


# ─── Rate Limit Tracker ───────────────────────────────────────────────────────

import threading
import time

class _RateLimitTracker:
    """
    Bellek içi 429 sayacı. Process yeniden başladığında sıfırlanır.
    Render free plan gibi kısa ömürlü worker'lar için yeterli.
    """
    def __init__(self, cooldown_seconds: int = 60):
        self._lock = threading.Lock()
        self._counts: dict[str, int] = {}          # provider → toplam 429 sayısı
        self._blocked_until: dict[str, float] = {} # provider → epoch saniye
        self._cooldown = cooldown_seconds

    def record_429(self, provider: str) -> None:
        with self._lock:
            self._counts[provider] = self._counts.get(provider, 0) + 1
            self._blocked_until[provider] = time.monotonic() + self._cooldown
            logger.warning(
                f"[RateLimitTracker] {provider} 429 kaydedildi. "
                f"Toplam: {self._counts[provider]}. "
                f"{self._cooldown}s cooldown başladı."
            )

    def is_blocked(self, provider: str) -> bool:
        with self._lock:
            until = self._blocked_until.get(provider, 0.0)
            return time.monotonic() < until

    def stats(self) -> dict:
        with self._lock:
            return {
                p: {"total_429": self._counts.get(p, 0), "blocked": self.is_blocked(p)}
                for p in set(list(self._counts.keys()) + list(self._blocked_until.keys()))
            }


_rate_tracker = _RateLimitTracker(cooldown_seconds=60)


# ─── Context Builder ──────────────────────────────────────────────────────────

def build_company_context(db: Session, company_id) -> str:
    """
    Şirkete ait operasyonel verileri tek seferde çekip yapılandırılmış bir
    bağlam metni olarak döndürür. Her LLM çağrısı için yalnızca bir kez çalışır.
    """
    inventory_items = db.query(InventoryModel).filter(InventoryModel.company_id == company_id).limit(100).all()
    orders = db.query(OrderModel).filter(OrderModel.company_id == company_id).order_by(OrderModel.date.desc()).limit(50).all()
    shipments = db.query(ShipmentModel).filter(ShipmentModel.company_id == company_id).limit(50).all()

    now_str = datetime.utcnow().strftime("%d.%m.%Y %H:%M UTC")

    low_stock_items = [item for item in inventory_items if item.stock <= item.minStock]
    critical_items = [item for item in inventory_items if item.stock == 0]
    delayed_shipments = [s for s in shipments if s.isDelayed]
    pending_orders = [o for o in orders if o.status.lower() in {"beklemede", "pending", "hazırlanıyor", "processing"}]
    completed_orders = [o for o in orders if o.status.lower() in {"teslim edildi", "delivered", "tamamlandı", "completed"}]
    total_revenue = sum(o.amount for o in completed_orders)
    total_stock_value = sum(item.stock * item.price for item in inventory_items)

    inventory_lines = [
        f"  • {item.name} ({item.sku}): {item.stock}/{item.minStock} adet [min], "
        f"{'⚠️ KRİTİK' if item.stock == 0 else '⬇️ DÜŞÜK' if item.stock <= item.minStock else 'OK'}, "
        f"kategori: {item.category}, fiyat: {item.price:.2f}₺"
        for item in inventory_items[:25]
    ]
    order_lines = [
        f"  • {order.id}: {order.customer} — {order.product} x{order.quantity}, "
        f"{order.amount:.2f}₺, durum: {order.status}, tarih: {order.date}"
        for order in orders[:20]
    ]
    shipment_lines = [
        f"  • {s.id} (Sipariş: {s.orderId}): {s.carrier}, durum: {s.status}, "
        f"{'⚠️ GECİKMİŞ' if s.isDelayed else 'zamanında'}, tahmini teslimat: {s.estimatedDelivery}"
        for s in shipments[:20]
    ]

    sections = [
        f"=== TESERA OPERASYONELVERİ — {now_str} ===",
        "",
        "📊 ÖZET GÖSTERGELER:",
        f"  • Toplam ürün çeşidi: {len(inventory_items)}",
        f"  • Toplam stok adedi: {sum(item.stock for item in inventory_items)}",
        f"  • Tahmini stok değeri: {total_stock_value:,.2f}₺",
        f"  • Düşük/kritik stok ürün sayısı: {len(low_stock_items)} (sıfır stok: {len(critical_items)})",
        f"  • Toplam sipariş: {len(orders)} (son 50)",
        f"  • Bekleyen/işlemdeki sipariş: {len(pending_orders)}",
        f"  • Tamamlanan sipariş cirosu: {total_revenue:,.2f}₺",
        f"  • Toplam kargo: {len(shipments)}, geciken: {len(delayed_shipments)}",
        "",
        "📦 ENVANTER DETAYI:",
        "\n".join(inventory_lines) if inventory_lines else "  — Kayıtlı ürün yok.",
        "",
        "🛒 SON SİPARİŞLER:",
        "\n".join(order_lines) if order_lines else "  — Kayıtlı sipariş yok.",
        "",
        "🚚 KARGO DURUMU:",
        "\n".join(shipment_lines) if shipment_lines else "  — Kayıtlı kargo yok.",
    ]
    return "\n".join(sections)


# ─── System Prompt ────────────────────────────────────────────────────────────

def _build_system_instruction(company_context: str, conversation_summary: str = "") -> str:
    """
    LLM için sistem talimatı oluşturur.
    company_context dışarıdan verilir; böylece tek DB çağrısı yeterli olur.
    """
    summary_block = (
        f"\n\n--- Önceki Konuşma Özeti ---\n{conversation_summary}\n--- Özet Sonu ---"
        if conversation_summary
        else ""
    )
    return (
        "Sen Tesera'nın YZ Operasyon Asistanısın. Görevin KOBİ'lerin envanter, "
        "sipariş, kargo ve operasyon yönetiminde somut, veri odaklı destek sağlamak.\n\n"

        "DAVRANŞ KURALLARI:\n"
        "1. Türkçe yanıt ver. Yanıtlar kısa, net ve eyleme dönük olsun.\n"
        "2. Aşağıda sana verilen Tesera operasyonel veriyi kullan. Bu veriler gerçektir — "
        "'erişimim yok', 'bilmiyorum' veya 'veri yok' deme; eldeki veriye dayanarak yanıt ver.\n"
        "3. Veri gerçekten yoksa (ör. liste boş) bunu belirt ve ilgili modüle veri eklenmesini öner.\n"
        "4. Asla uydurma müşteri adı, ürün, tutar, tarih veya sipariş numarası üretme.\n"
        "5. Konuşma geçmişini dikkate al; önceki mesajları tekrar etme.\n"
        "6. Yanıtlarında başlık, madde listesi ve vurgular kullanarak okunabilirliği artır.\n"
        "7. Kullanıcı genel bir özetisterse: kritik stok uyarıları, geciken kargolar ve "
        "bekleyen siparişleri öne çıkar.\n\n"

        f"{summary_block}\n\n"
        f"{company_context}"
    )


# ─── LLM Caller ───────────────────────────────────────────────────────────────

def call_chat_completion(
    client: httpx.Client,
    provider: str,
    base_url: str,
    api_key: str,
    model: str,
    messages: list[dict[str, str]],
    temperature: float = 0.4,
) -> str:
    response = client.post(
        f"{base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": messages,
            "stream": False,
            "temperature": temperature,
        },
    )

    if response.status_code >= 400:
        logger.error(f"{provider} API Error: {response.status_code} {response.text}")
        raise LLMProviderError(provider, response.status_code, response.text)

    data = response.json()
    message = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not message:
        logger.error(f"{provider} Empty Response: {data}")
        raise LLMProviderError(provider, 502, "Empty response")

    return message


def _call_llm_with_fallback(
    client: httpx.Client,
    messages: list[dict[str, str]],
    temperature: float = 0.4,
) -> str:
    """
    Önce Gemini'yi dene; 429 veya başka hata varsa OpenAI'ye geç.
    429 olayları _rate_tracker'a kaydedilir; cooldown süresinde provider atlanır.
    """
    use_gemini = bool(settings.GEMINI_API_KEY)
    use_openai = bool(settings.OPENAI_API_KEY)

    if use_gemini:
        if _rate_tracker.is_blocked("Gemini"):
            logger.info("[RateLimitTracker] Gemini cooldown aktif, direkt OpenAI'ye geçiliyor.")
        else:
            try:
                return call_chat_completion(
                    client=client,
                    provider="Gemini",
                    base_url=settings.GEMINI_BASE_URL,
                    api_key=settings.GEMINI_API_KEY,
                    model=settings.GEMINI_MODEL,
                    messages=messages,
                    temperature=temperature,
                )
            except LLMProviderError as gemini_error:
                if gemini_error.status_code == 429:
                    _rate_tracker.record_429("Gemini")
                if not use_openai:
                    raise gemini_error
                logger.warning(
                    f"Gemini hata ({gemini_error.status_code}), OpenAI fallback devrede."
                )

    if not use_openai:
        raise LLMProviderError("OpenAI", 503, "OPENAI_API_KEY yapılandırılmamış.")

    if _rate_tracker.is_blocked("OpenAI"):
        raise LLMProviderError("OpenAI", 429, "OpenAI da rate-limit cooldown'unda. Lütfen bekleyin.")

    try:
        return call_chat_completion(
            client=client,
            provider="OpenAI",
            base_url=settings.OPENAI_BASE_URL,
            api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=temperature,
        )
    except LLMProviderError as openai_error:
        if openai_error.status_code == 429:
            _rate_tracker.record_429("OpenAI")
        raise openai_error


# ─── Conversation Summarizer ─────────────────────────────────────────────────

def _summarize_messages(messages: list) -> str:
    """
    Eski mesajları tek satırlık role+içerik özetine dönüştürür.
    İlk 100 karakter alınır, fazlası kesilir.
    """
    parts = []
    for msg in messages:
        role = "Kullanıcı" if msg.role == "user" else "Asistan"
        snippet = msg.content[:120].replace("\n", " ")
        if len(msg.content) > 120:
            snippet += "…"
        parts.append(f"{role}: {snippet}")
    return " | ".join(parts)


# ─── Endpoints ────────────────────────────────────────────────────────────────

CONTEXT_WINDOW = 8   # Son kaç mesaj tam olarak LLM'e gönderilsin


@router.post("/chat", response_model=ChatResponse)
def ai_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YZ Asistanı şu anda kullanılamıyor. Lütfen backend .env dosyasına GEMINI_API_KEY veya OPENAI_API_KEY ekleyin."
        )

    if not request.messages:
        raise HTTPException(status_code=400, detail="Mesaj gereklidir.")

    last_user_msg = request.messages[-1]
    if last_user_msg.role != "user":
        raise HTTPException(status_code=400, detail="Son mesaj kullanıcıdan olmalıdır.")

    try:
        # ── 1. Konuşmayı yükle veya oluştur ─────────────────────────────────
        if request.conversation_id:
            conversation = db.query(AIConversation).filter(
                AIConversation.id == request.conversation_id,
                AIConversation.user_id == current_user.id
            ).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Konuşma bulunamadı.")
        else:
            title = last_user_msg.content[:60] + ("…" if len(last_user_msg.content) > 60 else "")
            conversation = AIConversation(
                company_id=current_user.company_id,
                user_id=current_user.id,
                title=title,
            )
            db.add(conversation)
            db.flush()

        # ── 2. Kullanıcı mesajını kaydet ─────────────────────────────────────
        db.add(AIMessage(
            conversation_id=conversation.id,
            role="user",
            content=last_user_msg.content,
        ))
        db.flush()

        # ── 3. Tüm konuşma geçmişini çek ─────────────────────────────────────
        all_db_messages = (
            db.query(AIMessage)
            .filter(AIMessage.conversation_id == conversation.id)
            .order_by(AIMessage.created_at)
            .all()
        )

        # ── 4. Şirket bağlamını tek seferde oluştur ───────────────────────────
        company_context = build_company_context(db, current_user.company_id)

        # ── 5. Eski mesajları özetle, son CONTEXT_WINDOW mesajı tam gönder ───
        if len(all_db_messages) > CONTEXT_WINDOW:
            older = all_db_messages[:-CONTEXT_WINDOW]
            recent = all_db_messages[-CONTEXT_WINDOW:]
            conversation_summary = _summarize_messages(older)
        else:
            recent = all_db_messages
            conversation_summary = ""

        system_instruction = _build_system_instruction(company_context, conversation_summary)
        llm_messages = [{"role": "system", "content": system_instruction}]

        for msg in recent:
            # DB'de "model" olarak saklı; OpenAI/Gemini "assistant" bekler
            llm_role = "assistant" if msg.role == "model" else "user"
            llm_messages.append({"role": llm_role, "content": msg.content})

        # ── 6. LLM çağrısı ───────────────────────────────────────────────────
        # Timeout: 45s — Render free plan worker'ları uzun isteklerde kesilebilir.
        # Gemini/GPT normal yanıt süresi <10s; 45s yeterli ve güvenli margin sağlar.
        with httpx.Client(timeout=45.0) as client:
            ai_response = _call_llm_with_fallback(client, llm_messages, temperature=0.5)

        # ── 7. Asistan yanıtını kaydet ────────────────────────────────────────
        db.add(AIMessage(
            conversation_id=conversation.id,
            role="model",
            content=ai_response,
        ))
        conversation.updated_at = datetime.utcnow()
        db.commit()

        return ChatResponse(message=ai_response, conversation_id=conversation.id)

    except HTTPException:
        raise
    except LLMProviderError as e:
        db.rollback()
        if e.status_code == 401:
            raise HTTPException(status_code=503, detail=f"{e.provider} API anahtarı geçersiz veya eksik.")
        if e.status_code == 402:
            raise HTTPException(status_code=402, detail=f"{e.provider} bakiyesi yetersiz. Lütfen hesabınızı kontrol edin.")
        if e.status_code == 429:
            raise HTTPException(status_code=429, detail=f"{e.provider} hız limiti veya kotası aşıldı. Lütfen kısa bir süre sonra tekrar deneyin.")
        raise HTTPException(status_code=502, detail=f"{e.provider} servisinden geçerli bir yanıt alınamadı.")
    except Exception as e:
        db.rollback()
        logger.exception(f"AI chat unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="YZ yanıtı oluşturulurken beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        )


@router.get("/rate-limit-stats")
def get_rate_limit_stats(current_user: User = Depends(get_current_user)):
    """
    Gemini / OpenAI 429 olaylarını ve mevcut cooldown durumunu döner.
    Render loglarında sık 429 görülüyorsa bu endpoint ile anlık durum izlenebilir.
    """
    return {"providers": _rate_tracker.stats()}


@router.get("/conversations", response_model=List[AIConversationSummary])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversations = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).order_by(AIConversation.updated_at.desc()).all()
    return conversations



@router.get("/conversations/{conversation_id}", response_model=AIConversationDetail)
def get_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Konuşma bulunamadı.")
    return conversation


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = db.query(AIConversation).filter(
        AIConversation.id == conversation_id,
        AIConversation.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Konuşma bulunamadı.")
    db.delete(conversation)
    db.commit()
    return {"message": "Konuşma silindi."}


@router.get("/predictions")
def get_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YZ Asistanı şu anda kullanılamıyor."
        )

    try:
        company_context = build_company_context(db, current_user.company_id)
        system_instruction = (
            "Sen Tesera'nın YZ Analitik Asistanısın. Aşağıdaki operasyonel verilere dayanarak "
            "şirket için detaylı bir öngörü ve özet üret. Yanıt şu formatta olmalı:\n\n"
            "## İşletme Özeti\n"
            "[Kısa, 2-3 cümlelik işletme durumu özeti]\n\n"
            "## Performans Analizi\n"
            "- Sipariş trendleri: [analiz]\n"
            "- Stok durumu: [analiz]\n"
            "- Kargo performansı: [analiz]\n\n"
            "## Öngörüler\n"
            "- Kısa vadeli (1 ay): [öngörü]\n"
            "- Orta vadeli (3 ay): [öngörü]\n"
            "- Uzun vadeli (6 ay): [öngörü]\n\n"
            "## Risk ve Aksiyonlar\n"
            "- Risk faktörleri: [riskler]\n"
            "- Önerilen aksiyonlar: [aksiyonlar]\n\n"
            "Yanıtlarında uydurma veri üretme. Eldeki veriye dayanarak mantıklı tahminler yap.\n\n"
            f"{company_context}"
        )

        llm_messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": "Şirketin güncel durumuna göre detaylı öngörü ve analiz ver."}
        ]

        with httpx.Client(timeout=90.0) as client:
            raw = _call_llm_with_fallback(client, llm_messages, temperature=0.3)

        return {"predictions": raw}

    except HTTPException:
        raise
    except LLMProviderError as e:
        if e.status_code == 401:
            raise HTTPException(status_code=503, detail=f"{e.provider} API anahtarı geçersiz veya eksik.")
        if e.status_code == 402:
            raise HTTPException(status_code=502, detail=f"{e.provider} bakiyesi yetersiz.")
        if e.status_code == 429:
            raise HTTPException(status_code=429, detail=f"{e.provider} hız limiti veya kotası aşıldı.")
        raise HTTPException(status_code=502, detail=f"{e.provider} servisinden geçerli bir yanıt alınamadı.")
    except Exception as e:
        logger.exception(f"Predictions API Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="YZ öngörüleri oluşturulurken beklenmeyen bir hata oluştu."
        )


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YZ Asistanı şu anda kullanılamıyor."
        )

    try:
        company_context = build_company_context(db, current_user.company_id)
        system_instruction = (
            "Sen Tesera'nın YZ Asistanısın. Aşağıdaki operasyonel verilere dayanarak şirket için "
            "3 adet kısa, somut ve eyleme dönük öneri üret.\n\n"
            "ÇIKTI FORMATI (başka hiçbir şey yazma, sadece bu 3 satır):\n"
            "type|message|action\n\n"
            "Geçerli type değerleri: stock, shipment, workflow, order\n\n"
            "Örnekler:\n"
            "stock|Çilek Reçeli stoku kritik (2 adet kaldı, minimum 10). Acil sipariş verin.|Sipariş Ver\n"
            "shipment|SHP-1023 nolu kargo 3 gündür gecikiyor. Kargo firmasıyla iletişime geçin.|Kargoları Gör\n"
            "order|5 sipariş 'Beklemede' durumunda, hazırlanmayı bekliyor.|Siparişlere Git\n\n"
            "Veri yoksa genel öneriler verme; mevcut veriden en kritik 3 öneriyi seç.\n\n"
            f"{company_context}"
        )

        llm_messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": "Güncel veriye göre en kritik 3 öneriyi ver."}
        ]

        with httpx.Client(timeout=60.0) as client:
            raw = _call_llm_with_fallback(client, llm_messages, temperature=0.2)

        recommendations: List[RecommendationItem] = []
        for line in raw.strip().splitlines():
            line = line.strip()
            # Boş satır, başlık veya açıklama satırlarını atla
            if not line or line.startswith("#") or "|" not in line:
                continue
            parts = line.split("|", 2)
            if len(parts) == 3:
                rec_type = parts[0].strip().lower()
                # Geçerli type değilse "order" olarak normalize et
                if rec_type not in {"stock", "shipment", "workflow", "order"}:
                    rec_type = "order"
                recommendations.append(RecommendationItem(
                    type=rec_type,
                    message=parts[1].strip(),
                    action=parts[2].strip(),
                ))

        if not recommendations:
            logger.warning(f"Recommendations parse failed. Raw output: {raw}")
            raise HTTPException(status_code=502, detail="YZ önerileri ayrıştırılamadı.")

        return RecommendationsResponse(recommendations=recommendations[:3])

    except HTTPException:
        raise
    except LLMProviderError as e:
        if e.status_code == 401:
            raise HTTPException(status_code=503, detail=f"{e.provider} API anahtarı geçersiz veya eksik.")
        if e.status_code == 402:
            raise HTTPException(status_code=402, detail=f"{e.provider} bakiyesi yetersiz.")
        if e.status_code == 429:
            raise HTTPException(status_code=429, detail=f"{e.provider} hız limiti veya kotası aşıldı.")
        raise HTTPException(status_code=502, detail=f"{e.provider} servisinden geçerli bir yanıt alınamadı.")
    except Exception as e:
        logger.exception(f"Recommendations API Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="YZ önerileri oluşturulurken beklenmeyen bir hata oluştu."
        )
