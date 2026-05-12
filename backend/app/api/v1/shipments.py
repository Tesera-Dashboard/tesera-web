from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.shipment import Shipment as ShipmentModel
from app.schemas.domain import Shipment, ShipmentCreate

from app.api.deps import get_current_user
from app.models.user import User, UserSettings
from app.models.notification import Notification as NotificationModel

router = APIRouter()

def create_notification(db: Session, company_id, user_id, title, message, notification_type, priority="info", meta_data=None):
    """Helper function to create notifications - checks if notifications are enabled"""
    # Check if user has notifications enabled
    user_settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if user_settings and user_settings.notifications_enabled == False:
        return None
    
    notification = NotificationModel(
        id=uuid.uuid4(),
        company_id=company_id,
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        priority=priority,
        meta_data=meta_data,
        is_read=False
    )
    db.add(notification)
    db.commit()
    return notification

@router.get("/", response_model=List[Shipment])
def read_shipments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shipments = db.query(ShipmentModel).filter(ShipmentModel.company_id == current_user.company_id).offset(skip).limit(limit).all()
    return shipments

@router.post("/", response_model=Shipment)
def create_shipment(
    shipment: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_shipment = ShipmentModel(
        company_id=current_user.company_id,
        order_id=shipment.order_id,
        carrier=shipment.carrier,
        tracking_number=shipment.tracking_number,
        status=shipment.status,
        estimated_delivery=shipment.estimated_delivery
    )
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)

    # Create notification
    create_notification(
        db,
        current_user.company_id,
        current_user.id,
        "Yeni Kargo",
        f"{shipment.carrier} ile yeni kargo oluşturuldu. Takip: {shipment.tracking_number}",
        "shipment",
        "success",
        {"shipment_id": str(db_shipment.id)}
    )

    return db_shipment

@router.put("/{shipment_id}")
def update_shipment(
    shipment_id: str,
    shipment_update: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        shipment_uuid = uuid.UUID(shipment_id)
    except ValueError:
        return {"error": "Invalid shipment ID"}

    shipment = db.query(ShipmentModel).filter(
        ShipmentModel.id == shipment_uuid,
        ShipmentModel.company_id == current_user.company_id
    ).first()

    if not shipment:
        return {"error": "Shipment not found"}

    old_status = shipment.status

    # Update fields
    shipment.carrier = shipment_update.carrier
    shipment.tracking_number = shipment_update.tracking_number
    shipment.status = shipment_update.status
    shipment.estimated_delivery = shipment_update.estimated_delivery
    db.commit()

    # Create notification if status changed
    if old_status != shipment.status:
        create_notification(
            db,
            current_user.company_id,
            current_user.id,
            "Kargo Durumu Değişti",
            f"Kargo {shipment.tracking_number} durumu: {old_status} -> {shipment.status}",
            "shipment",
            "info",
            {"shipment_id": str(shipment.id)}
        )

    return shipment

@router.put("/{shipment_id}/check-delay")
def check_shipment_delay(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if shipment is delayed and create notification if so"""
    from datetime import datetime
    import uuid

    try:
        shipment_uuid = uuid.UUID(shipment_id)
    except ValueError:
        return {"error": "Invalid shipment ID"}

    shipment = db.query(ShipmentModel).filter(
        ShipmentModel.id == shipment_uuid,
        ShipmentModel.company_id == current_user.company_id
    ).first()

    if not shipment:
        return {"error": "Shipment not found"}

    if shipment.status == "delivered":
        return {"message": "Shipment already delivered"}

    if shipment.estimated_delivery and shipment.estimated_delivery < datetime.utcnow():
        # Shipment is delayed
        existing_notification = db.query(NotificationModel).filter(
            NotificationModel.company_id == current_user.company_id,
            NotificationModel.type == "shipment",
            NotificationModel.meta_data.isnot(None)
        ).filter(
            NotificationModel.meta_data["shipment_id"].astext == str(shipment.id)
        ).first()

        if not existing_notification:
            create_notification(
                db,
                current_user.company_id,
                current_user.id,
                "Kargo Gecikmesi",
                f"Kargo {shipment.tracking_number} tahmini teslim tarihinden geçti. Taşıyıcı: {shipment.carrier}",
                "shipment",
                "warning",
                {"shipment_id": str(shipment.id)}
            )
            return {"message": "Delay notification created"}

    return {"message": "No delay detected"}
