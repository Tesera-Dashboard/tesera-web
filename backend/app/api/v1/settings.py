from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.core.database import get_db
from app.models.user import User, Company, UserSettings, Subscription
from pydantic import BaseModel

from app.api.deps import get_current_user
from app.models.user import User as UserModel

router = APIRouter()

# Schemas
class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    tax_number: Optional[str] = None
    address: Optional[str] = None

class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    sidebar_order: Optional[list] = None
    sidebar_enabled: Optional[list] = None

class SubscriptionInfo(BaseModel):
    plan: str
    status: str
    trial_ends_at: Optional[str] = None
    days_remaining: Optional[int] = None

@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get user profile information including company details"""
    user = db.query(User).filter(User.id == current_user.id).first()
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    # Calculate profile completion percentage
    completion_fields = 0
    total_fields = 5  # full_name, email, company.name, company.tax_number, company.address
    
    if user.full_name:
        completion_fields += 1
    if user.email:
        completion_fields += 1
    if company.name:
        completion_fields += 1
    if company.tax_number:
        completion_fields += 1
    if company.address:
        completion_fields += 1
    
    completion_percentage = int((completion_fields / total_fields) * 100)
    
    return {
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        "company": {
            "id": str(company.id),
            "name": company.name,
            "tax_number": company.tax_number,
            "address": company.address,
        },
        "completion_percentage": completion_percentage
    }

@router.put("/profile/company")
def update_company(
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update company information"""
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    if company_data.name:
        company.name = company_data.name
    if company_data.tax_number is not None:
        company.tax_number = company_data.tax_number
    if company_data.address is not None:
        company.address = company_data.address
    
    db.commit()
    db.refresh(company)
    
    return {
        "id": str(company.id),
        "name": company.name,
        "tax_number": company.tax_number,
        "address": company.address,
    }

@router.get("/user-settings")
def get_user_settings(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get user settings"""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(
            user_id=current_user.id,
            theme="light",
            sidebar_order=None,
            sidebar_enabled=None
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "theme": settings.theme,
        "sidebar_order": settings.sidebar_order,
        "sidebar_enabled": settings.sidebar_enabled,
    }

@router.put("/user-settings")
def update_user_settings(
    settings_data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Update user settings"""
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    if settings_data.theme is not None:
        settings.theme = settings_data.theme
    if settings_data.sidebar_order is not None:
        settings.sidebar_order = settings_data.sidebar_order
    if settings_data.sidebar_enabled is not None:
        settings.sidebar_enabled = settings_data.sidebar_enabled
    
    db.commit()
    db.refresh(settings)
    
    return {
        "theme": settings.theme,
        "sidebar_order": settings.sidebar_order,
        "sidebar_enabled": settings.sidebar_enabled,
    }

@router.get("/billing")
def get_billing(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get billing and subscription information"""
    subscription = db.query(Subscription).filter(
        Subscription.company_id == current_user.company_id
    ).first()
    
    if not subscription:
        # Create default subscription
        from datetime import datetime, timedelta
        subscription = Subscription(
            company_id=current_user.company_id,
            plan="free",
            status="active",
            trial_ends_at=datetime.utcnow() + timedelta(days=14)
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
    
    # Calculate days remaining
    days_remaining = None
    if subscription.trial_ends_at:
        from datetime import datetime
        delta = subscription.trial_ends_at - datetime.utcnow()
        days_remaining = max(0, delta.days)
    
    return {
        "plan": subscription.plan,
        "status": subscription.status,
        "trial_ends_at": subscription.trial_ends_at.isoformat() if subscription.trial_ends_at else None,
        "days_remaining": days_remaining,
    }
