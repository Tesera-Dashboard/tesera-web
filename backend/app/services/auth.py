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
    msg.set_content("Bu e-postayı görüntülemek için lütfen HTML'i etkinleştirin.")
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-bottom: 1px solid #eaeaec;">
            <img src="{settings.FRONTEND_URL}/logo.png" alt="Tesera" style="height: 40px; width: auto;" />
        </div>
        <div style="padding: 32px; color: #374151;">
            <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Tesera'ya Hoş Geldiniz!</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Kayıt olduğunuz için teşekkür ederiz. Hesabınızı etkinleştirmek ve panelinize erişmek için lütfen e-posta adresinizi doğrulayın.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{link}" style="background-color: #fa7f05; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">E-posta Adresini Doğrula</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eaeaec; font-size: 12px; color: #9ca3af;">
            &copy; Tesera. Tüm hakları saklıdır.
        </div>
    </div>
    """
    send_email(email, "Tesera Hesabınızı Doğrulayın", html)

def send_reset_password_email(email: str, token: str):
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-bottom: 1px solid #eaeaec;">
            <img src="{settings.FRONTEND_URL}/logo.png" alt="Tesera" style="height: 40px; width: auto;" />
        </div>
        <div style="padding: 32px; color: #374151;">
            <h2 style="color: #111827; margin-top: 0; font-size: 24px;">Şifrenizi Sıfırlayın</h2>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">Şifrenizi sıfırlamak için bir istek aldık. Yeni bir şifre belirlemek için aşağıdaki butona tıklayın:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{link}" style="background-color: #fa7f05; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Şifreyi Sıfırla</a>
            </div>
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">Eğer şifre sıfırlama isteğinde bulunmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #eaeaec; font-size: 12px; color: #9ca3af;">
            &copy; Tesera. Tüm hakları saklıdır.
        </div>
    </div>
    """
    send_email(email, "Tesera Şifrenizi Sıfırlayın", html)
