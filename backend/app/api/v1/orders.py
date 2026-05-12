from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.order import Order as OrderModel
from app.schemas.domain import Order, OrderCreate

from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification as NotificationModel

router = APIRouter()

def create_notification(db: Session, company_id, user_id, title, message, notification_type, priority="info", meta_data=None):
    """Helper function to create notifications"""
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

@router.get("/", response_model=List[Order])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(OrderModel).filter(OrderModel.company_id == current_user.company_id).offset(skip).limit(limit).all()
    return orders

@router.post("/", response_model=Order)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_order = OrderModel(
        company_id=current_user.company_id,
        customer=order.customer,
        email=order.email,
        product=order.product,
        quantity=order.quantity,
        status=order.status
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Create notification
    create_notification(
        db,
        current_user.company_id,
        current_user.id,
        "Yeni Sipariş",
        f"{order.customer} tarafından {order.product} siparişi alındı",
        "order",
        "success",
        {"order_id": str(db_order.id)}
    )

    return db_order

@router.put("/{order_id}")
def update_order(
    order_id: str,
    order_update: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        order_uuid = uuid.UUID(order_id)
    except ValueError:
        return {"error": "Invalid order ID"}

    order = db.query(OrderModel).filter(
        OrderModel.id == order_uuid,
        OrderModel.company_id == current_user.company_id
    ).first()

    if not order:
        return {"error": "Order not found"}

    old_status = order.status

    # Update fields
    order.customer = order_update.customer
    order.email = order_update.email
    order.product = order_update.product
    order.quantity = order_update.quantity
    order.status = order_update.status
    db.commit()

    # Create notification if status changed
    if old_status != order.status:
        create_notification(
            db,
            current_user.company_id,
            current_user.id,
            "Sipariş Durumu Değişti",
            f"{order.customer} sipariş durumu: {old_status} -> {order.status}",
            "order",
            "info",
            {"order_id": str(order.id)}
        )

    return order

@router.put("/{order_id}/check-deadline")
def check_order_deadline(
    order_id: str,
    days_threshold: int = 2,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if order is approaching deadline and create notification if so"""
    from datetime import datetime, timedelta
    import uuid

    try:
        order_uuid = uuid.UUID(order_id)
    except ValueError:
        return {"error": "Invalid order ID"}

    order = db.query(OrderModel).filter(
        OrderModel.id == order_uuid,
        OrderModel.company_id == current_user.company_id
    ).first()

    if not order:
        return {"error": "Order not found"}

    # Assuming orders have a delivery_date field or similar
    # This is a placeholder - adjust based on actual Order model
    if hasattr(order, 'delivery_date') and order.delivery_date:
        deadline = order.delivery_date
        now = datetime.utcnow()
        time_until_deadline = deadline - now

        if timedelta(0) < time_until_deadline <= timedelta(days=days_threshold):
            existing_notification = db.query(NotificationModel).filter(
                NotificationModel.company_id == current_user.company_id,
                NotificationModel.type == "order",
                NotificationModel.meta_data.isnot(None)
            ).filter(
                NotificationModel.meta_data["order_id"].astext == str(order.id)
            ).first()

            if not existing_notification:
                create_notification(
                    db,
                    current_user.company_id,
                    current_user.id,
                    "Sipariş Teslim Tarihi Yaklaşıyor",
                    f"{order.customer} sipariş teslim tarihine {time_until_deadline.days} gün kaldı",
                    "order",
                    "warning",
                    {"order_id": str(order.id)}
                )
                return {"message": "Deadline notification created"}

    return {"message": "No approaching deadline"}
