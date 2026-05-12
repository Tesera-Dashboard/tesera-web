from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from uuid import UUID

from app.core.database import get_db
from app.models.notification import Notification as NotificationModel
from app.schemas.domain import Notification, NotificationCreate
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Notification])
def read_notifications(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(NotificationModel).filter(
        NotificationModel.company_id == current_user.company_id
    )
    
    if unread_only:
        query = query.filter(NotificationModel.is_read == False)
    
    notifications = query.order_by(NotificationModel.created_at.desc()).offset(skip).limit(limit).all()
    return notifications

@router.get("/unread-count")
def read_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(NotificationModel).filter(
        NotificationModel.company_id == current_user.company_id,
        NotificationModel.is_read == False
    ).count()
    return {"count": count}

@router.get("/{notification_id}", response_model=Notification)
def read_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        notification_uuid = UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz bildirim ID formatı")
    
    notification = db.query(NotificationModel).filter(
        NotificationModel.id == notification_uuid,
        NotificationModel.company_id == current_user.company_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    
    return notification

@router.post("/", response_model=Notification)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_notification = NotificationModel(
        company_id=current_user.company_id,
        user_id=current_user.id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        priority=notification.priority,
        meta_data=notification.meta_data,
        is_read=False
    )
    
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return db_notification

@router.put("/{notification_id}/mark-read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        notification_uuid = UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz bildirim ID formatı")
    
    notification = db.query(NotificationModel).filter(
        NotificationModel.id == notification_uuid,
        NotificationModel.company_id == current_user.company_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.put("/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(NotificationModel).filter(
        NotificationModel.company_id == current_user.company_id,
        NotificationModel.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@router.delete("/delete-all")
def delete_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(NotificationModel).filter(
        NotificationModel.company_id == current_user.company_id
    ).delete()
    
    db.commit()
    
    return {"message": "All notifications deleted"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        notification_uuid = UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz bildirim ID formatı")
    
    notification = db.query(NotificationModel).filter(
        NotificationModel.id == notification_uuid,
        NotificationModel.company_id == current_user.company_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    
    try:
        db.delete(notification)
        db.commit()
        return {"message": "Notification deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
