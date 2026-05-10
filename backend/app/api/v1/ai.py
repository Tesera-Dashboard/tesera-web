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


@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="YZ Asistanı şu anda kullanılamıyor. Lütfen backend .env dosyasına GEMINI_API_KEY ekleyin."
        )

    if not request.messages:
        raise HTTPException(status_code=400, detail="Mesaj gereklidir.")

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        system_instruction = (
            "Sen Tesera'nın YZ Asistanısın. KOBİ'lerin envanter, kargo, sipariş ve operasyon yönetiminde "
            "yardımcı oluyorsun. Türkçe yanıt ver — yanıtların kısa, profesyonel ve yardımsever olsun. "
            "Tesera'nın temel modülleri şunlardır: Siparişler, Envanter, Kargolar, İş Akışları, Analitik."
        )

        # Build content list
        contents = []
        for msg in request.messages:
            role = "user" if msg.role == "user" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg.content)]
                )
            )

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
            contents=contents,
        )

        return ChatResponse(message=response.text)

    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"YZ yanıtı oluşturulurken bir hata oluştu: {str(e)}"
        )
