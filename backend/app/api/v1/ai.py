from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    message: str


def get_gemini_model():
    """Lazily import and configure Gemini model."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        return None


@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    model = get_gemini_model()

    if not model:
        raise HTTPException(
            status_code=503,
            detail="YZ Asistanı şu anda kullanılamıyor. Lütfen backend .env dosyasına GEMINI_API_KEY ekleyin."
        )

    if not request.messages:
        raise HTTPException(status_code=400, detail="Mesaj gereklidir.")

    try:
        import google.generativeai as genai

        system_instruction = (
            "Sen Tesera'nın YZ Asistanısın. KOBİ'lerin envanter, kargo, sipariş ve operasyon yönetiminde "
            "yardımcı oluyorsun. Türkçe yanıt ver — yanıtların kısa, profesyonel ve yardımsever olsun. "
            "Tesera'nın temel modülleri şunlardır: Siparişler, Envanter, Kargolar, İş Akışları, Analitik."
        )

        # Build Gemini history
        gemini_history = []

        # Prepend system instruction to the first user message
        messages = request.messages
        first_msg_content = (
            system_instruction + "\n\nKullanıcı sorusu: " + messages[0].content
            if messages[0].role == "user"
            else messages[0].content
        )
        gemini_history.append({"role": "user", "parts": [first_msg_content]})

        # Add the rest of history except the last message
        for msg in messages[1:-1]:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.content]})

        last_message = messages[-1].content if len(messages) > 1 else None

        chat_session = model.start_chat(history=gemini_history)

        if last_message:
            response = chat_session.send_message(last_message)
        else:
            # Only one message was provided, and it's already in history
            response = chat_session.send_message(first_msg_content)
            # Rebuild properly for single message case
            single_model = genai.GenerativeModel('gemini-1.5-flash')
            response = single_model.generate_content(first_msg_content)

        return ChatResponse(message=response.text)

    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="YZ yanıtı oluşturulurken bir hata oluştu."
        )
