from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import csv
import io

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

@router.post("/import")
async def import_inventory(
    file: UploadFile = File(...),
    mode: str = Form("overwrite"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Import inventory items from CSV file
    
    Modes:
    - overwrite: Skip items with duplicate SKUs
    - reset: Delete all existing items and import new ones
    """
    try:
        # Check file extension
        if file.filename and not file.filename.lower().endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        # Validate mode
        if mode not in ["overwrite", "reset"]:
            raise HTTPException(status_code=400, detail="Invalid mode. Must be 'overwrite' or 'reset'")
        
        # If reset mode, delete all existing inventory items
        if mode == "reset":
            db.query(InventoryModel).filter(
                InventoryModel.company_id == current_user.company_id
            ).delete()
            db.commit()
        
        # Read and parse CSV
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")
        
        csv_file = io.StringIO(contents.decode('utf-8'))
        csv_reader = csv.DictReader(csv_file)
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        # Get existing SKUs for duplicate checking (only in overwrite mode)
        existing_skus = set()
        if mode == "overwrite":
            existing_items = db.query(InventoryModel.sku).filter(
                InventoryModel.company_id == current_user.company_id
            ).all()
            existing_skus = {item[0] for item in existing_items}
        
        for row in csv_reader:
            try:
                # Validate required fields
                required_fields = ['SKU', 'Ürün Adı', 'Kategori', 'Stok', 'Minimum Stok', 'Fiyat', 'Durum', 'Son Stok Tarihi']
                for field in required_fields:
                    if field not in row or not row[field].strip():
                        raise ValueError(f"Missing required field: {field}")
                
                sku = row['SKU'].strip()
                
                # Skip if SKU already exists (overwrite mode)
                if mode == "overwrite" and sku in existing_skus:
                    skipped_count += 1
                    continue
                
                # Create inventory item
                item_id = f"INV-{uuid.uuid4().hex[:8]}"
                db_item = InventoryModel(
                    id=item_id,
                    company_id=current_user.company_id,
                    name=row['Ürün Adı'].strip(),
                    sku=sku,
                    category=row['Kategori'].strip(),
                    stock=int(row['Stok']),
                    minStock=int(row['Minimum Stok']),
                    price=float(row['Fiyat']),
                    status=row['Durum'].strip(),
                    lastRestocked=row['Son Stok Tarihi'].strip()
                )
                db.add(db_item)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {imported_count + skipped_count + 1}: {str(e)}")
                continue
        
        db.commit()
        
        # Create notification for successful import
        if imported_count > 0:
            message = f"{imported_count} ürün başarıyla envantere eklendi"
            if mode == "reset":
                message = f"Envanter resetlendi ve {imported_count} ürün eklendi"
            elif skipped_count > 0:
                message = f"{imported_count} ürün eklendi, {skipped_count} ürün atlandı (SKU zaten mevcut)"
            
            create_notification(
                db,
                current_user.company_id,
                current_user.id,
                "Envanter İçe Aktarıldı",
                message,
                "inventory",
                "success"
            )
        
        return {
            "message": f"Import completed. {imported_count} items imported successfully.",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "errors": errors
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
