from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.api.dependencies import get_current_user
from app.models.user import User
from app.core.config import settings
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize Gemini if key is provided
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    # We will use gemini-1.5-flash as it is free and fast
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

class ChatMessage(BaseModel):
    role: str # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    message: str

@router.post("/chat", response_model=ChatResponse)
def ai_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    if not model:
        raise HTTPException(
            status_code=503, 
            detail="AI Assistant is currently unavailable. Please configure GEMINI_API_KEY in the backend .env file."
        )
    
    try:
        # Convert our history to Gemini format
        # Gemini expects roles to be 'user' or 'model'
        # The prompt should be the last message.
        
        # System instructions can be added via generation config or by prepending a system message to the first user prompt.
        system_instruction = (
            "You are Tesera's AI Assistant. You help SMEs manage their inventory, shipments, orders, and operations. "
            "Respond in Turkish, since the platform is localized in Turkish. Keep your answers concise, professional, and helpful."
        )
        
        gemini_history = []
        
        # Add system instruction to the first user message if possible
        if request.messages and request.messages[0].role == 'user':
            first_msg = system_instruction + "\n\nUser query: " + request.messages[0].content
            gemini_history.append({"role": "user", "parts": [first_msg]})
            history_start = 1
        else:
            history_start = 0
            
        for msg in request.messages[history_start:-1]:
            # Map roles if needed
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({
                "role": role,
                "parts": [msg.content]
            })
            
        last_message = request.messages[-1].content
        
        chat_session = model.start_chat(history=gemini_history)
        response = chat_session.send_message(last_message)
        
        return ChatResponse(message=response.text)
        
    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while generating the AI response.")
