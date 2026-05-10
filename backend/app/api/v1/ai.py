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


class LLMProviderError(Exception):
    def __init__(self, provider: str, status_code: int, detail: str):
        self.provider = provider
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"{provider} error {status_code}: {detail}")


def build_company_context(db: Session, company_id) -> str:
    inventory_items = db.query(InventoryModel).filter(InventoryModel.company_id == company_id).limit(100).all()
    orders = db.query(OrderModel).filter(OrderModel.company_id == company_id).limit(100).all()
    shipments = db.query(ShipmentModel).filter(ShipmentModel.company_id == company_id).limit(100).all()

    low_stock_items = [item for item in inventory_items if item.stock <= item.minStock]
    delayed_shipments = [shipment for shipment in shipments if shipment.isDelayed]
    pending_orders = [order for order in orders if order.status.lower() in {"beklemede", "pending", "hazırlanıyor", "processing"}]
    total_stock_value = sum(item.stock * item.price for item in inventory_items)

    inventory_lines = [
        f"- {item.name} ({item.sku}): {item.stock} adet, minimum {item.minStock}, durum: {item.status}, kategori: {item.category}"
        for item in inventory_items[:20]
    ]
    low_stock_lines = [
        f"- {item.name} ({item.sku}): {item.stock} adet kaldı, minimum seviye {item.minStock}"
        for item in low_stock_items[:10]
    ]
    order_lines = [
        f"- {order.id}: {order.customer}, ürün: {order.product}, adet: {order.quantity}, tutar: {order.amount}, durum: {order.status}, tarih: {order.date}"
        for order in orders[:15]
    ]
    shipment_lines = [
        f"- {shipment.id}: sipariş {shipment.orderId}, taşıyıcı: {shipment.carrier}, durum: {shipment.status}, gecikme: {'evet' if shipment.isDelayed else 'hayır'}, tahmini teslimat: {shipment.estimatedDelivery}"
        for shipment in shipments[:15]
    ]

    return "\n".join([
        "Tesera Operasyon Verileri:",
        f"- Toplam ürün sayısı: {len(inventory_items)}",
        f"- Toplam stok adedi: {sum(item.stock for item in inventory_items)}",
        f"- Tahmini stok değeri: {total_stock_value:.2f}",
        f"- Kritik/düşük stok ürün sayısı: {len(low_stock_items)}",
        f"- Toplam sipariş sayısı: {len(orders)}",
        f"- Bekleyen/hazırlanan sipariş sayısı: {len(pending_orders)}",
        f"- Toplam kargo sayısı: {len(shipments)}",
        f"- Geciken kargo sayısı: {len(delayed_shipments)}",
        "",
        "Envanter örnekleri:",
        "\n".join(inventory_lines) if inventory_lines else "- Kayıtlı envanter ürünü yok.",
        "",
        "Kritik stok ürünleri:",
        "\n".join(low_stock_lines) if low_stock_lines else "- Kritik stokta ürün yok.",
        "",
        "Son siparişler:",
        "\n".join(order_lines) if order_lines else "- Kayıtlı sipariş yok.",
        "",
        "Kargo özeti:",
        "\n".join(shipment_lines) if shipment_lines else "- Kayıtlı kargo yok.",
    ])


def call_chat_completion(
    client: httpx.Client,
    provider: str,
    base_url: str,
    api_key: str,
    model: str,
    messages: list[dict[str, str]],
) -> str:
    response = client.post(
        f"{base_url}/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": settings.FRONTEND_URL,
            "X-Title": "Tesera",
        },
        json={
            "model": model,
            "messages": messages,
            "stream": False,
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


def _build_system_instruction(db: Session, company_id) -> str:
    company_context = build_company_context(db, company_id)
    return (
        "Sen Tesera'nın YZ Asistanısın. KOBİ'lerin envanter, kargo, sipariş ve operasyon yönetiminde "
        "yardımcı oluyorsun. Türkçe yanıt ver — yanıtların kısa, profesyonel ve yardımsever olsun. "
        "Tesera'nın temel modülleri şunlardır: Siparişler, Envanter, Kargolar, İş Akışları, Analitik. "
        "Kullanıcı stok, sipariş, kargo veya operasyon durumu sorduğunda aşağıdaki Tesera operasyon verilerini esas al. "
        "Veri varsa 'erişimim yok' deme; eldeki veriye göre özet, kritik noktalar ve önerilen aksiyonları ver. "
        "Veri yoksa bunu açıkça söyle ve ilgili modüle veri eklenmesini öner. "
        "Yanıtlarında uydurma müşteri, ürün, adet, tarih veya tutar üretme.\n\n"
        f"{company_context}"
    )


@router.post("/chat", response_model=ChatResponse)
def ai_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not settings.GROK_API_KEY and not settings.OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YZ Asistanı şu anda kullanılamıyor. Lütfen backend .env dosyasına GROK_API_KEY veya OPENROUTER_API_KEY ekleyin."
        )

    if not request.messages:
        raise HTTPException(status_code=400, detail="Mesaj gereklidir.")

    last_user_msg = request.messages[-1]
    if last_user_msg.role != "user":
        raise HTTPException(status_code=400, detail="Son mesaj kullanıcıdan olmalıdır.")

    try:
        # Load or create conversation
        if request.conversation_id:
            conversation = db.query(AIConversation).filter(
                AIConversation.id == request.conversation_id,
                AIConversation.user_id == current_user.id
            ).first()
            if not conversation:
                raise HTTPException(status_code=404, detail="Konuşma bulunamadı.")
        else:
            title = last_user_msg.content[:50] + ("..." if len(last_user_msg.content) > 50 else "")
            conversation = AIConversation(
                company_id=current_user.company_id,
                user_id=current_user.id,
                title=title,
            )
            db.add(conversation)
            db.flush()

        # Save user message
        db.add(AIMessage(
            conversation_id=conversation.id,
            role="user",
            content=last_user_msg.content,
        ))

        # Build LLM messages from full conversation history
        system_instruction = _build_system_instruction(db, current_user.company_id)
        llm_messages = [{"role": "system", "content": system_instruction}]

        # Add all messages from this conversation (already in DB) + the new user message
        for msg in db.query(AIMessage).filter(AIMessage.conversation_id == conversation.id).order_by(AIMessage.created_at):
            role = "assistant" if msg.role == "model" else "user"
            llm_messages.append({"role": role, "content": msg.content})

        # Call LLM
        with httpx.Client(timeout=60.0) as client:
            message = _call_llm_with_fallback(client, llm_messages)

        # Save assistant message
        db.add(AIMessage(
            conversation_id=conversation.id,
            role="model",
            content=message,
        ))
        conversation.updated_at = datetime.utcnow()
        db.commit()

        return ChatResponse(message=message, conversation_id=conversation.id)

    except HTTPException:
        raise
    except LLMProviderError as e:
        if e.status_code == 401:
            raise HTTPException(status_code=503, detail=f"{e.provider} API anahtarı geçersiz veya eksik.")
        if e.status_code == 402:
            raise HTTPException(status_code=402, detail=f"{e.provider} bakiyesi yetersiz. Lütfen hesabınızı kontrol edin.")
        if e.status_code == 429:
            raise HTTPException(status_code=429, detail=f"{e.provider} hız limiti veya kotası aşıldı. Lütfen kısa bir süre sonra tekrar deneyin.")
        raise HTTPException(status_code=502, detail=f"{e.provider} servisinden geçerli bir yanıt alınamadı.")
    except Exception as e:
        error_message = str(e)
        logger.error(f"LLM API Error: {error_message}")
        raise HTTPException(
            status_code=500,
            detail="YZ yanıtı oluşturulurken beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        )


def _call_llm_with_fallback(client: httpx.Client, messages: list[dict[str, str]]) -> str:
    if settings.GROK_API_KEY:
        try:
            return call_chat_completion(
                client=client,
                provider="Grok",
                base_url=settings.GROK_BASE_URL,
                api_key=settings.GROK_API_KEY,
                model=settings.GROK_MODEL,
                messages=messages,
            )
        except LLMProviderError as grok_error:
            if not settings.OPENROUTER_API_KEY:
                raise grok_error
            logger.warning(f"Grok failed, falling back to OpenRouter: {grok_error}")

    if not settings.OPENROUTER_API_KEY:
        raise LLMProviderError("OpenRouter", 503, "OpenRouter fallback için OPENROUTER_API_KEY yapılandırılmamış.")

    return call_chat_completion(
        client=client,
        provider="OpenRouter",
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.OPENROUTER_MODEL,
        messages=messages,
    )


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
