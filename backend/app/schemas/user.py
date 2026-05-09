from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_verified: bool = False

class CompanyBase(BaseModel):
    name: str

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

class CompanyCreate(CompanyBase):
    pass

class RegisterRequest(BaseModel):
    company_name: str = Field(..., description="Name of the company")
    full_name: str = Field(..., description="Full name of the admin user")
    email: EmailStr = Field(..., description="Admin user's work email")
    password: str = Field(..., min_length=8, description="Admin user's password")

# Properties to receive via API on login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None # To distinguish between access, reset, verify tokens

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class VerifyEmailRequest(BaseModel):
    token: str

class MsgResponse(BaseModel):
    message: str

class CompanyResponse(CompanyBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: UUID
    company_id: UUID
    company: Optional[CompanyResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
