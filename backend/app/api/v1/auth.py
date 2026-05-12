from typing import Annotated
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.schemas.user import (
    RegisterRequest, LoginRequest, Token, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest, MsgResponse
)
from app.services.auth import (
    register_company_and_user, authenticate_user, 
    send_verification_email, send_reset_password_email
)
from app.api.deps import get_current_user
from app.models.user import User, Company
from app.core.security import create_verification_token, create_reset_token, decode_token, hash_password, verify_password

router = APIRouter()

# Schemas for new endpoints
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Annotated[Session, Depends(get_db)]):
    """
    Register a new company and its admin user.
    """
    user = register_company_and_user(db, request)
    token = create_verification_token(user.email)
    send_verification_email(user.email, token)
    return user

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # For now we allow login even if not verified, but we can check if needed.
    return authenticate_user(db, request)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Get current logged in user details.
    """
    return current_user

@router.post("/forgot-password", response_model=MsgResponse)
def forgot_password(request: ForgotPasswordRequest, db: Annotated[Session, Depends(get_db)]):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        token = create_reset_token(user.email)
        send_reset_password_email(user.email, token)
    # Always return success to prevent email enumeration
    return {"message": "If that email is registered, you will receive a password reset link."}

@router.post("/reset-password", response_model=MsgResponse)
def reset_password(request: ResetPasswordRequest, db: Annotated[Session, Depends(get_db)]):
    email = decode_token(request.token, "reset")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.post("/verify-email", response_model=MsgResponse)
def verify_email(request: VerifyEmailRequest, db: Annotated[Session, Depends(get_db)]):
    email = decode_token(request.token, "verification")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        return {"message": "Email already verified"}
        
    user.is_verified = True
    db.commit()
    return {"message": "Email verified successfully"}

@router.post("/resend-verification", response_model=MsgResponse)
def resend_verification(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.is_verified:
        return {"message": "Email is already verified."}
    
    token = create_verification_token(current_user.email)
    send_verification_email(current_user.email, token)
    return {"message": "Verification email sent successfully."}

@router.post("/change-password", response_model=MsgResponse)
def change_password(
    request: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Change password for authenticated user.
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Update password
    current_user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.delete("/delete-account", response_model=MsgResponse)
def delete_account(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    """
    Delete user account and associated company data.
    """
    from app.models.user import Subscription
    
    company_id = current_user.company_id
    
    # Delete subscriptions first
    db.query(Subscription).filter(Subscription.company_id == company_id).delete()
    
    # Delete all users associated with the company
    db.query(User).filter(User.company_id == company_id).delete()
    
    # Delete the company
    company = db.query(Company).filter(Company.id == company_id).first()
    if company:
        db.delete(company)
    
    db.commit()
    
    return {"message": "Account deleted successfully"}
