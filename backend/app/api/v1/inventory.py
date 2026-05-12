from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.inventory import InventoryItem as InventoryModel
from app.schemas.domain import InventoryItem, InventoryItemCreate

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

@router.get("/", response_model=List[InventoryItem])
def read_inventory(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(InventoryModel).filter(InventoryModel.company_id == current_user.company_id).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=InventoryItem)
def create_inventory_item(
    item: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_item = InventoryModel(
        company_id=current_user.company_id,
        name=item.name,
        sku=item.sku,
        stock=item.quantity,  # quantity from schema maps to stock in model
        price=item.price,
        category=item.category
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # Create notification
    create_notification(
        db,
        current_user.company_id,
        current_user.id,
        "Yeni Ürün",
        f"{item.name} envanterine eklendi. Stok: {item.quantity}",
        "inventory",
        "success",
        {"item_id": str(db_item.id)}
    )

    return db_item

@router.put("/{item_id}")
def update_inventory_item(
    item_id: str,
    item_update: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Inventory ID is a string (e.g., "INV-001"), not a UUID
    item = db.query(InventoryModel).filter(
        InventoryModel.id == item_id,
        InventoryModel.company_id == current_user.company_id
    ).first()

    if not item:
        return {"error": "Item not found"}

    old_quantity = item.stock

    # Update fields - use correct field names from model
    item.name = item_update.name
    item.sku = item_update.sku
    item.stock = item_update.quantity  # quantity from schema maps to stock in model
    item.price = item_update.price
    item.category = item_update.category
    db.commit()
    db.refresh(item)

    print(f"Updated item: {item.id}, stock changed from {old_quantity} to {item.stock}")

    # Create notification if quantity decreased
    if old_quantity > item_update.quantity:
        decrease = old_quantity - item_update.quantity
        create_notification(
            db,
            current_user.company_id,
            current_user.id,
            "Stok Azaldı",
            f"{item.name} stok seviyesi {old_quantity} -> {item_update.quantity} ({decrease} adet azaldı)",
            "inventory",
            "warning",
            {"item_id": str(item.id)}
        )

    # Create notification if stock is below critical level (minStock)
    if item.stock <= item.minStock:
        # Check if there's already a recent low stock notification for this specific item
        # Load notifications and check in memory since SQLite doesn't support JSON queries well
        all_notifications = db.query(NotificationModel).filter(
            NotificationModel.company_id == current_user.company_id,
            NotificationModel.type == "inventory",
            NotificationModel.title == "Kritik Stok Seviyesi"
        ).all()

        existing_notification = None
        for notif in all_notifications:
            if notif.meta_data and notif.meta_data.get("item_id") == str(item.id):
                existing_notification = notif
                break

        if not existing_notification:
            create_notification(
                db,
                current_user.company_id,
                current_user.id,
                "Kritik Stok Seviyesi",
                f"{item.name} stok seviyesi kritik seviyenin altında! Mevcut: {item.stock}, Minimum: {item.minStock}",
                "inventory",
                "error",
                {"item_id": str(item.id)}
            )

    return {"message": "Item updated successfully", "item": item}

@router.put("/{item_id}/check-stock")
def check_low_stock(
    item_id: str,
    threshold: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if item is below threshold and create notification if so"""
    import uuid

    try:
        item_uuid = uuid.UUID(item_id)
    except ValueError:
        return {"error": "Invalid item ID"}

    item = db.query(InventoryModel).filter(
        InventoryModel.id == item_uuid,
        InventoryModel.company_id == current_user.company_id
    ).first()

    if not item:
        return {"error": "Item not found"}

    if item.quantity < threshold:
        existing_notification = db.query(NotificationModel).filter(
            NotificationModel.company_id == current_user.company_id,
            NotificationModel.type == "inventory",
            NotificationModel.meta_data.isnot(None)
        ).filter(
            NotificationModel.meta_data["item_id"].astext == str(item.id)
        ).first()

        if not existing_notification:
            create_notification(
                db,
                current_user.company_id,
                current_user.id,
                "Düşük Stok Uyarısı",
                f"{item.name} stok seviyesi düşük: {item.quantity} adet kaldı",
                "inventory",
                "warning",
                {"item_id": str(item.id)}
            )
            return {"message": "Low stock notification created"}

    return {"message": "Stock level OK"}
