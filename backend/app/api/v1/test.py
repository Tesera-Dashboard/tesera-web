from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import random
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.order import Order
from app.models.inventory import InventoryItem
from app.models.shipment import Shipment

router = APIRouter()

@router.post("/seed")
def seed_mock_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company_id = current_user.company_id

    # 1. Seed Inventory
    inv_id1, inv_id2, inv_id3, inv_id4 = f"INV-{random.randint(10000,99999)}", f"INV-{random.randint(10000,99999)}", f"INV-{random.randint(10000,99999)}", f"INV-{random.randint(10000,99999)}"

    inventory_items = [
        InventoryItem(id=inv_id1, company_id=company_id, name="Ayva Reçeli", sku=f"REC-{random.randint(1000,9999)}", category="Reçel", stock=150, minStock=20, price=45.00, status="Stokta", lastRestocked="2024-01-15"),
        InventoryItem(id=inv_id2, company_id=company_id, name="Çam Balı", sku=f"BAL-{random.randint(1000,9999)}", category="Bal", stock=85, minStock=15, price=120.00, status="Stokta", lastRestocked="2024-02-20"),
        InventoryItem(id=inv_id3, company_id=company_id, name="Domates Turşusu", sku=f"TUR-{random.randint(1000,9999)}", category="Turşu", stock=12, minStock=50, price=35.00, status="Azalıyor", lastRestocked="2024-03-10"),
        InventoryItem(id=inv_id4, company_id=company_id, name="Siyah Zeytin", sku=f"ZEY-{random.randint(1000,9999)}", category="Zeytin", stock=0, minStock=10, price=55.00, status="Tükendi", lastRestocked="2024-01-20"),
    ]
    for item in inventory_items:
        db.add(item)

    # 2. Seed Orders
    now = datetime.utcnow()
    ord_id1, ord_id2, ord_id3 = f"ORD-{random.randint(10000,99999)}", f"ORD-{random.randint(10000,99999)}", f"ORD-{random.randint(10000,99999)}"

    orders = [
        Order(id=ord_id1, company_id=company_id, customer="Ahmet Yılmaz", email="ahmet@example.com", product="Ayva Reçeli", quantity=2, amount=90.00, status="İşleniyor", date=(now - timedelta(days=1)).isoformat(), address="Atatürk Cad. No:123, İstanbul", notes="Öğleden önce teslim"),
        Order(id=ord_id2, company_id=company_id, customer="Ayşe Demir", email="ayse@example.com", product="Çam Balı", quantity=1, amount=120.00, status="Kargoda", date=(now - timedelta(days=2)).isoformat(), address="Bağdat Cad. No:456, İstanbul", notes=""),
        Order(id=ord_id3, company_id=company_id, customer="Mehmet Kaya", email="mehmet@example.com", product="Domates Turşusu", quantity=5, amount=175.00, status="Teslim Edildi", date=(now - timedelta(days=5)).isoformat(), address="İstiklal Cad. No:789, İstanbul", notes="Kapıcıya bırak"),
    ]
    for o in orders:
        db.add(o)

    # 3. Seed Shipments
    shipments = [
        Shipment(id=f"SHP-{random.randint(10000,99999)}", company_id=company_id, orderId=ord_id2, carrier="Yurtiçi Kargo", trackingCode=f"TRK{random.randint(100000,999999)}", status="Yolda", origin="İstanbul Depo", destination="Bağdat Cad. No:456, İstanbul", estimatedDelivery=(now + timedelta(days=1)).isoformat(), isDelayed=False, delayReason=""),
        Shipment(id=f"SHP-{random.randint(10000,99999)}", company_id=company_id, orderId=ord_id3, carrier="Aras Kargo", trackingCode=f"ARS{random.randint(100000,999999)}", status="Teslim Edildi", origin="İstanbul Depo", destination="İstiklal Cad. No:789, İstanbul", estimatedDelivery=(now - timedelta(days=1)).isoformat(), isDelayed=False, delayReason=""),
    ]
    for s in shipments:
        db.add(s)
        
    try:
        db.commit()
        return {"message": "Veritabanı başarıyla test verileriyle dolduruldu!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class CreateOrderRequest(BaseModel):
    product: str
    quantity: int

@router.post("/orders/create")
def simulate_create_order(req: CreateOrderRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order_id = f"ORD-{random.randint(2000, 9999)}"
    new_order = Order(
        id=order_id,
        company_id=current_user.company_id,
        customer="Simulated Customer",
        email="simulator@tesera.app",
        product=req.product,
        quantity=req.quantity,
        amount=req.quantity * 49.99, # Dummy price
        status="Processing",
        date=datetime.utcnow().isoformat(),
        address="Test Address, NY",
        notes="Created via test simulator"
    )
    db.add(new_order)
    db.commit()
    return {"message": "Order created", "order_id": order_id}

class UpdateShipmentRequest(BaseModel):
    shipment_id: str
    status: str
    is_delayed: bool
    delay_reason: str

@router.post("/shipments/update")
def simulate_update_shipment(req: UpdateShipmentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.notification import Notification as NotificationModel
    import uuid

    shipment = db.query(Shipment).filter(Shipment.id == req.shipment_id, Shipment.company_id == current_user.company_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    old_status = shipment.status
    old_is_delayed = shipment.isDelayed

    shipment.status = req.status
    shipment.isDelayed = req.is_delayed
    if req.is_delayed:
        shipment.delayReason = req.delay_reason
    else:
        shipment.delayReason = ""

    db.commit()

    # Create notification if status changed
    if old_status != req.status:
        notification = NotificationModel(
            id=uuid.uuid4(),
            company_id=current_user.company_id,
            user_id=current_user.id,
            title="Kargo Durumu Değişti",
            message=f"Kargo {shipment.trackingCode} durumu: {old_status} -> {req.status}",
            type="shipment",
            priority="info",
            meta_data={"shipment_id": shipment.id},
            is_read=False
        )
        db.add(notification)
        db.commit()

    # Create notification if delay status changed
    if old_is_delayed != req.is_delayed:
        priority = "warning" if req.is_delayed else "info"
        message = f"Kargo {shipment.trackingCode} gecikmeli olarak işaretlendi" if req.is_delayed else f"Kargo {shipment.trackingCode} gecikme durumu kaldırıldı"
        notification = NotificationModel(
            id=uuid.uuid4(),
            company_id=current_user.company_id,
            user_id=current_user.id,
            title="Kargo Gecikme Durumu",
            message=message,
            type="shipment",
            priority=priority,
            meta_data={"shipment_id": shipment.id},
            is_read=False
        )
        db.add(notification)
        db.commit()

    return {"message": f"Shipment {req.shipment_id} updated"}

@router.post("/inventory/create")
def simulate_create_inventory_item(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item_id = f"INV-{random.randint(1000, 9999)}"
    categories = ["Reçel", "Turşu", "Bal", "Zeytin", "Süt Ürünleri", "Kuru Gıda"]
    names = ["Ayva Reçeli", "Ceviz Reçeli", "Gül Reçeli", "Domates Turşusu", "Salatalık Turşusu", "Kabak Turşusu", "Çam Balı", "Çiçek Balı", "Karaca Balı", "Siyah Zeytin", "Yeşil Zeytin", "Üzüm Zeytini", "Beyaz Peynir", "Kaşar Peyniri", "Tulum Peyniri", "Köy Yoğurdu", "Ayran", "Nohut", "Mercimek", "Bulgur", "Pirinç"]
    
    new_item = InventoryItem(
        id=item_id,
        company_id=current_user.company_id,
        name=random.choice(names),
        sku=f"SKU-{random.randint(10000, 99999)}",
        category=random.choice(categories),
        stock=random.randint(0, 100),
        minStock=random.randint(5, 20),
        price=round(random.uniform(20.0, 150.0), 2),
        status=random.choice(["Stokta", "Azalıyor", "Tükendi"]),
        lastRestocked=datetime.utcnow().isoformat()
    )
    db.add(new_item)
    db.commit()
    return {"message": "Mock ürün başarıyla oluşturuldu", "item": new_item.name}


@router.post("/shipments/create")
def simulate_create_shipment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company_id = current_user.company_id
    carriers = ["FedEx", "UPS", "DHL", "Yurtiçi Kargo", "Aras Kargo"]
    statuses = ["Hazırlanıyor", "Kargoda", "Dağıtımda", "Teslim Edildi"]

    now = datetime.utcnow()
    shipment_id = f"SHP-{random.randint(10000, 99999)}"
    order_id = f"ORD-{random.randint(10000, 99999)}"
    is_delayed = random.choice([True, False])

    new_shipment = Shipment(
        id=shipment_id,
        company_id=company_id,
        orderId=order_id,
        carrier=random.choice(carriers),
        trackingCode=f"TRK{random.randint(100000, 999999)}",
        status=random.choice(statuses),
        origin="İstanbul Depo",
        destination="Teslimat Adresi",
        estimatedDelivery=(now + timedelta(days=random.randint(1, 7))).isoformat(),
        isDelayed=is_delayed,
        delayReason="Kötü hava koşulları" if is_delayed else ""
    )
    db.add(new_shipment)
    db.commit()
    return {"message": "Kargo başarıyla oluşturuldu", "shipment_id": shipment_id, "carrier": new_shipment.carrier}


@router.post("/clear")
def clear_all_test_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company_id = current_user.company_id

    # Delete shipments, orders, inventory items, AI conversations, and workflows for this company
    db.query(Shipment).filter(Shipment.company_id == company_id).delete(synchronize_session=False)
    db.query(Order).filter(Order.company_id == company_id).delete(synchronize_session=False)
    db.query(InventoryItem).filter(InventoryItem.company_id == company_id).delete(synchronize_session=False)

    # Also clear AI chat history for this company/user
    from app.models.ai_chat import AIConversation
    db.query(AIConversation).filter(AIConversation.company_id == company_id).delete(synchronize_session=False)

    # Clear workflows
    from app.models.workflow import Workflow
    db.query(Workflow).filter(Workflow.company_id == company_id).delete(synchronize_session=False)

    # Clear notifications
    from app.models.notification import Notification
    db.query(Notification).filter(Notification.company_id == company_id).delete(synchronize_session=False)

    db.commit()
    return {"message": "Tüm test verileri, yapay zeka konuşma geçmişi, iş akışları ve bildirimler başarıyla temizlendi."}


# Workflow test endpoints
@router.post("/workflows/create")
def create_test_workflow(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.workflow import Workflow, WorkflowStep
    import uuid
    
    workflow_id = uuid.uuid4()
    
    # Create a sample workflow
    workflow = Workflow(
        id=workflow_id,
        company_id=current_user.company_id,
        name="Test İş Akışı",
        description="Bu bir test iş akışıdır",
        trigger_type="manual",
        trigger_config={},
        is_active=True
    )
    db.add(workflow)
    db.flush()
    
    # Add sample steps
    step1 = WorkflowStep(
        id=uuid.uuid4(),
        workflow_id=workflow_id,
        order=0,
        step_type="send_notification",
        step_config={"message": "Stok uyarısı: Ürün stok seviyesi kritik seviyenin altında"},
        name="Bildirim Gönder",
        description="Kullanıcıya bildirim gönder"
    )
    step2 = WorkflowStep(
        id=uuid.uuid4(),
        workflow_id=workflow_id,
        order=1,
        step_type="update_inventory",
        step_config={"action": "restock", "quantity": 10},
        name="Envanter Güncelle",
        description="Stok seviyesini güncelle"
    )
    db.add(step1)
    db.add(step2)

    db.commit()
    return {"message": "Test iş akışı başarıyla oluşturuldu", "workflow_id": str(workflow_id)}


# Notification test endpoints
@router.post("/notifications/create")
def create_test_notification(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.notification import Notification
    import uuid

    notification_types = ["order", "shipment", "inventory", "workflow", "system"]
    notification_type = notification_types[hash(str(current_user.company_id)) % len(notification_types)]

    notification = Notification(
        id=uuid.uuid4(),
        company_id=current_user.company_id,
        user_id=current_user.id,
        title="Test Bildirimi",
        message=f"Bu bir {notification_type} tipinde test bildirimidir",
        type=notification_type,
        priority="info",
        meta_data={"test": True},
        is_read=False
    )

    db.add(notification)
    db.commit()
    return {"message": "Test bildirimi başarıyla oluşturuldu", "notification_id": str(notification.id)}
