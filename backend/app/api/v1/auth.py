from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import RegisterRequest, LoginRequest, Token, UserResponse
from app.services.auth import register_company_and_user, authenticate_user
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Annotated[Session, Depends(get_db)]):
    """
    Register a new company and its admin user.
    """
    user = register_company_and_user(db, request)
    return user

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    return authenticate_user(db, request)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Get current logged in user details.
    """
    return current_user
