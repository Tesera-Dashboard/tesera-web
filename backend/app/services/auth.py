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

import smtplib
from email.message import EmailMessage
from app.core.config import settings

def send_email(email_to: str, subject: str, html_content: str):
    if not settings.SMTP_HOST:
        print(f"Mock Email to {email_to}: {subject}\n{html_content}")
        return

    msg = EmailMessage()
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')
    msg['Subject'] = subject
    msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg['To'] = email_to

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        if settings.SMTP_TLS:
            server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")

def send_verification_email(email: str, token: str):
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <div>
        <h2>Welcome to Tesera!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{link}">Verify Email</a></p>
        <p>If you did not create an account, you can ignore this email.</p>
    </div>
    """
    send_email(email, "Verify your Tesera Account", html)

def send_reset_password_email(email: str, token: str):
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div>
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password. Click the link below to choose a new one:</p>
        <p><a href="{link}">Reset Password</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
    </div>
    """
    send_email(email, "Reset your Tesera Password", html)
