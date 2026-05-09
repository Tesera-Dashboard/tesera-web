from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, Company
from app.schemas.user import RegisterRequest, LoginRequest, Token
from app.core.security import hash_password, verify_password, create_access_token

def register_company_and_user(db: Session, request: RegisterRequest) -> User:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create Company
    company = Company(name=request.company_name)
    db.add(company)
    db.commit()
    db.refresh(company)

    # Create Admin User
    user = User(
        company_id=company.id,
        email=request.email,
        full_name=request.full_name,
        hashed_password=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def authenticate_user(db: Session, request: LoginRequest) -> Token:
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer")
