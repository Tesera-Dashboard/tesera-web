from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import random
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserSettings
from app.models.order import Order
from app.models.inventory import InventoryItem
from app.models.shipment import Shipment
from app.models.notification import Notification as NotificationModel

router = APIRouter()

def create_notification_if_enabled(db: Session, company_id, user_id, title, message, notification_type, priority="info", meta_data=None):
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

@router.post("/seed")
def seed_mock_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company_id = current_user.company_id

    # Shared catalog used across inventory and orders
    products_catalog = [
        ("Ayva Reçeli",       "Reçel",          45.00,  "REC"),
        ("Ceviz Reçeli",      "Reçel",          75.00,  "REC"),
        ("Gül Reçeli",        "Reçel",          65.00,  "REC"),
        ("İncir Reçeli",      "Reçel",          55.00,  "REC"),
        ("Domates Turşusu",   "Turşu",          35.00,  "TUR"),
        ("Salatalık Turşusu", "Turşu",          40.00,  "TUR"),
        ("Kabak Turşusu",     "Turşu",          38.00,  "TUR"),
        ("Biber Turşusu",     "Turşu",          42.00,  "TUR"),
        ("Çam Balı",          "Bal",            120.00, "BAL"),
        ("Çiçek Balı",        "Bal",             95.00, "BAL"),
        ("Kestane Balı",      "Bal",            110.00, "BAL"),
        ("Siyah Zeytin",      "Zeytin",          55.00, "ZEY"),
        ("Yeşil Zeytin",      "Zeytin",          50.00, "ZEY"),
        ("Beyaz Peynir",      "Süt Ürünleri",    85.00, "PEY"),
        ("Tulum Peyniri",     "Süt Ürünleri",   130.00, "PEY"),
        ("Köy Yoğurdu",       "Süt Ürünleri",    45.00, "YOG"),
        ("Nohut",             "Kuru Gıda",        30.00, "KGD"),
        ("Mercimek",          "Kuru Gıda",        28.00, "KGD"),
        ("Bulgur",            "Kuru Gıda",        25.00, "KGD"),
        ("Pirinç",            "Kuru Gıda",        35.00, "KGD"),
    ]

    # 1. Seed Inventory - 5 random distinct items
    selected_products = random.sample(products_catalog, 5)
    inventory_items = []
    for prod in selected_products:
        stock    = random.randint(0, 150)
        minStock = random.randint(10, 40)
        if stock == 0:
            status = "Tükendi"
        elif stock < minStock:
            status = "Azalıyor"
        else:
            status = "Stokta"
        days_since_restock = random.randint(5, 90)
        restock_date = (datetime.utcnow() - timedelta(days=days_since_restock)).strftime("%Y-%m-%d")
        inventory_items.append(InventoryItem(
            id=f"INV-{random.randint(10000,99999)}",
            company_id=company_id,
            name=prod[0],
            sku=f"{prod[3]}-{random.randint(1000,9999)}",
            category=prod[1],
            stock=stock,
            minStock=minStock,
            price=prod[2],
            status=status,
            lastRestocked=restock_date,
        ))
    for item in inventory_items:
        db.add(item)

    # 2. Seed Orders - 6 random unique customer+product combos
    now = datetime.utcnow()

    customers = [
        ("Ahmet Yılmaz",  "ahmet.yilmaz@gmail.com",    "Atatürk Cad. No:45, Beşiktaş/İstanbul"),
        ("Ayşe Demir",    "ayse.demir@hotmail.com",     "Bağdat Cad. No:112, Kadıköy/İstanbul"),
        ("Mehmet Kaya",   "mehmet.kaya@gmail.com",      "Cumhuriyet Mah. No:78, Keçiören/Ankara"),
        ("Fatma Şahin",   "fatma.sahin@outlook.com",    "Alsancak Mah. No:33, Konak/İzmir"),
        ("Ali Çelik",     "ali.celik@gmail.com",         "Konyaaltı Cad. No:55, Antalya"),
        ("Zeynep Arslan", "zeynep.arslan@gmail.com",    "Yıldırım Mah. No:22, Osmangazi/Bursa"),
        ("Murat Güneş",   "murat.gunes@gmail.com",      "Çankaya Mah. No:90, Çankaya/Ankara"),
        ("Elif Yıldız",   "elif.yildiz@hotmail.com",    "Karşıyaka Mah. No:17, Karşıyaka/İzmir"),
        ("Hasan Koç",     "hasan.koc@gmail.com",        "Bornova Mah. No:5, Bornova/İzmir"),
        ("Merve Yıldız",  "merve.yildiz@outlook.com",   "Selçuklu Mah. No:28, Selçuklu/Konya"),
    ]

    statuses = ["İşleniyor", "İşleniyor", "Kargoda", "Kargoda", "Teslim Edildi", "Gecikti", "İptal"]
    notes_options = ["Öğleden önce teslim", "Kapıcıya bırak", "", "Kırılmaz ambalaj lütfen", "Hızlı teslimat", ""]

    shuffled_customers = random.sample(customers, 6)
    shuffled_products  = random.sample(products_catalog, 6)
    shuffled_statuses  = random.sample(statuses, 6)

    orders = []
    for i in range(6):
        cust   = shuffled_customers[i]
        prod   = shuffled_products[i]
        status = shuffled_statuses[i]
        qty    = random.randint(1, 8)
        order  = Order(
            id=f"ORD-{random.randint(10000,99999)}",
            company_id=company_id,
            customer=cust[0],
            email=cust[1],
            product=prod[0],
            quantity=qty,
            amount=round(qty * prod[2], 2),
            status=status,
            date=(now - timedelta(days=random.randint(0, 20), hours=random.randint(0, 23))).isoformat(),
            address=cust[2],
            notes=random.choice(notes_options),
        )
        orders.append(order)
    for o in orders:
        db.add(o)

    # 3. Seed Shipments - linked to kargoda/gecikti/teslim orders
    kargoda_orders = [o for o in orders if o.status in ("Kargoda", "Gecikti")]
    teslim_orders  = [o for o in orders if o.status == "Teslim Edildi"]
    carriers = ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "PTT Kargo", "Sürat Kargo"]

    shipments = []
    for o in kargoda_orders:
        is_delayed = o.status == "Gecikti"
        shipments.append(Shipment(
            id=f"SHP-{random.randint(10000,99999)}",
            company_id=company_id,
            orderId=o.id,
            carrier=random.choice(carriers),
            trackingCode=f"TRK{random.randint(100000,999999)}",
            status="Yolda",
            origin=random.choice(["İstanbul Depo", "Ankara Depo", "İzmir Depo"]),
            destination=o.address,
            estimatedDelivery=(now + timedelta(days=random.randint(1, 4))).isoformat(),
            isDelayed=is_delayed,
            delayReason=random.choice(["Kötü hava koşulları", "Yoğun trafik", "Adres hatası"]) if is_delayed else "",
        ))
    for o in teslim_orders:
        shipments.append(Shipment(
            id=f"SHP-{random.randint(10000,99999)}",
            company_id=company_id,
            orderId=o.id,
            carrier=random.choice(carriers),
            trackingCode=f"ARS{random.randint(100000,999999)}",
            status="Teslim Edildi",
            origin=random.choice(["İstanbul Depo", "Ankara Depo", "İzmir Depo"]),
            destination=o.address,
            estimatedDelivery=(now - timedelta(days=random.randint(1, 3))).isoformat(),
            isDelayed=False,
            delayReason="",
        ))
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
    order_id = f"ORD-{random.randint(10000, 99999)}"

    customers = [
        ("Ahmet Yılmaz", "ahmet.yilmaz@gmail.com", "Atatürk Cad. No:45, Beşiktaş/İstanbul"),
        ("Ayşe Demir", "ayse.demir@hotmail.com", "Bağdat Cad. No:112, Kadıköy/İstanbul"),
        ("Mehmet Kaya", "mehmet.kaya@gmail.com", "Cumhuriyet Mah. No:78, Keçiören/Ankara"),
        ("Fatma Şahin", "fatma.sahin@outlook.com", "Alsancak Mah. No:33, Konak/İzmir"),
        ("Ali Çelik", "ali.celik@gmail.com", "Konyaaltı Cad. No:55, Antalya"),
        ("Zeynep Arslan", "zeynep.arslan@gmail.com", "Yıldırım Mah. No:22, Osmangazi/Bursa"),
        ("Murat Güneş", "murat.gunes@gmail.com", "Çankaya Mah. No:90, Çankaya/Ankara"),
        ("Elif Yıldız", "elif.yildiz@hotmail.com", "Karşıyaka Mah. No:17, Karşıyaka/İzmir"),
    ]

    product_prices = {
        "Ayva Reçeli": 45.00, "Çam Balı": 120.00, "Domates Turşusu": 35.00,
        "Siyah Zeytin": 55.00, "Gül Reçeli": 65.00, "Ceviz Reçeli": 75.00,
        "Çiçek Balı": 95.00, "Salatalık Turşusu": 40.00,
    }
    notes_options = ["Öğleden önce teslim", "Kapıcıya bırak", "", "Kırılmaz ambalaj lütfen", ""]

    cust = random.choice(customers)
    unit_price = product_prices.get(req.product, 49.99)

    new_order = Order(
        id=order_id,
        company_id=current_user.company_id,
        customer=cust[0],
        email=cust[1],
        product=req.product,
        quantity=req.quantity,
        amount=round(req.quantity * unit_price, 2),
        status="İşleniyor",
        date=datetime.utcnow().isoformat(),
        address=cust[2],
        notes=random.choice(notes_options)
    )
    db.add(new_order)
    db.commit()

    # Create notification for new order
    create_notification_if_enabled(
        db,
        current_user.company_id,
        current_user.id,
        "Yeni Sipariş Oluşturuldu",
        f"{req.product} ürününden {req.quantity} adet sipariş oluşturuldu. Sipariş ID: {order_id}",
        "order",
        "info",
        {"order_id": order_id}
    )

    return {"message": "Sipariş oluşturuldu", "order_id": order_id}

class UpdateShipmentRequest(BaseModel):
    shipment_id: str
    status: str
    is_delayed: bool
    delay_reason: str

@router.post("/shipments/update")
def simulate_update_shipment(req: UpdateShipmentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    shipment = db.query(Shipment).filter(Shipment.id == req.shipment_id, Shipment.company_id == current_user.company_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Kargo bulunamadı")

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
        create_notification_if_enabled(
            db,
            current_user.company_id,
            current_user.id,
            "Kargo Durumu Değişti",
            f"Kargo {shipment.trackingCode} durumu: {old_status} -> {req.status}",
            "shipment",
            "info",
            {"shipment_id": shipment.id}
        )

    # Create notification if delay status changed
    if old_is_delayed != req.is_delayed:
        priority = "warning" if req.is_delayed else "info"
        message = f"Kargo {shipment.trackingCode} gecikmeli olarak işaretlendi" if req.is_delayed else f"Kargo {shipment.trackingCode} gecikme durumu kaldırıldı"
        create_notification_if_enabled(
            db,
            current_user.company_id,
            current_user.id,
            "Kargo Gecikme Durumu",
            message,
            "shipment",
            priority,
            {"shipment_id": shipment.id}
        )

    return {"message": f"Shipment {req.shipment_id} updated"}

@router.post("/inventory/create")
def simulate_create_inventory_item(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item_id = f"INV-{random.randint(10000, 99999)}"
    
    products_catalog = [
        ("Ayva Reçeli", "Reçel", 45.00),
        ("Ceviz Reçeli", "Reçel", 75.00),
        ("Gül Reçeli", "Reçel", 65.00),
        ("İncir Reçeli", "Reçel", 55.00),
        ("Domates Turşusu", "Turşu", 35.00),
        ("Salatalık Turşusu", "Turşu", 40.00),
        ("Kabak Turşusu", "Turşu", 38.00),
        ("Biber Turşusu", "Turşu", 42.00),
        ("Çam Balı", "Bal", 120.00),
        ("Çiçek Balı", "Bal", 95.00),
        ("Kestane Balı", "Bal", 110.00),
        ("Siyah Zeytin", "Zeytin", 55.00),
        ("Yeşil Zeytin", "Zeytin", 50.00),
        ("Beyaz Peynir", "Süt Ürünleri", 85.00),
        ("Tulum Peyniri", "Süt Ürünleri", 130.00),
        ("Köy Yoğurdu", "Süt Ürünleri", 45.00),
        ("Nohut", "Kuru Gıda", 30.00),
        ("Mercimek", "Kuru Gıda", 28.00),
        ("Bulgur", "Kuru Gıda", 25.00),
        ("Pirinç", "Kuru Gıda", 35.00),
    ]

    prod = random.choice(products_catalog)
    stock = random.randint(0, 120)
    minStock = random.randint(10, 30)

    # Calculate status correctly based on stock/minStock
    if stock == 0:
        status = "Tükendi"
    elif stock < minStock:
        status = "Azalıyor"
    else:
        status = "Stokta"

    new_item = InventoryItem(
        id=item_id,
        company_id=current_user.company_id,
        name=prod[0],
        sku=f"SKU-{random.randint(10000, 99999)}",
        category=prod[1],
        stock=stock,
        minStock=minStock,
        price=prod[2],
        status=status,
        lastRestocked=datetime.utcnow().isoformat()
    )
    db.add(new_item)
    db.commit()

    # Create notification for new inventory item
    priority = "warning" if new_item.status in ["Azalıyor", "Tükendi"] else "info"
    create_notification_if_enabled(
        db,
        current_user.company_id,
        current_user.id,
        "Yeni Ürün Eklendi",
        f"{new_item.name} ürünü envantere eklendi. Stok: {new_item.stock}, Durum: {new_item.status}",
        "inventory",
        priority,
        {"item_id": item_id}
    )

    return {"message": "Mock ürün başarıyla oluşturuldu", "item": new_item.name}


@router.post("/shipments/create")
def simulate_create_shipment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company_id = current_user.company_id
    carriers = ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "PTT Kargo", "Sürat Kargo"]
    statuses = ["Hazırlanıyor", "Yolda", "Dağıtımda", "Teslim Edildi"]
    destinations = [
        "Atatürk Cad. No:45, Beşiktaş/İstanbul",
        "Bağdat Cad. No:112, Kadıköy/İstanbul",
        "Cumhuriyet Mah. No:78, Keçiören/Ankara",
        "Alsancak Mah. No:33, Konak/İzmir",
        "Konyaaltı Cad. No:55, Antalya",
        "Yıldırım Mah. No:22, Osmangazi/Bursa",
    ]

    now = datetime.utcnow()
    shipment_id = f"SHP-{random.randint(10000, 99999)}"
    order_id = f"ORD-{random.randint(10000, 99999)}"
    is_delayed = random.choices([True, False], weights=[20, 80])[0]  # 20% gecikme ihtimali

    new_shipment = Shipment(
        id=shipment_id,
        company_id=company_id,
        orderId=order_id,
        carrier=random.choice(carriers),
        trackingCode=f"TRK{random.randint(100000, 999999)}",
        status=random.choice(statuses),
        origin="İstanbul Depo",
        destination=random.choice(destinations),
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
    db.query(Notification).filter(Notification.company_id == company_id).delete(synchronize_session="fetch")

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
    notification_types = ["order", "shipment", "inventory", "workflow", "system"]
    notification_type = notification_types[hash(str(current_user.company_id)) % len(notification_types)]

    notification = create_notification_if_enabled(
        db,
        current_user.company_id,
        current_user.id,
        "Test Bildirimi",
        f"Bu bir {notification_type} tipinde test bildirimidir",
        notification_type,
        "info",
        {"test": True}
    )

    if not notification:
        return {"message": "Bildirimler kapalı, test bildirimi oluşturulmadı"}

    return {"message": "Test bildirimi başarıyla oluşturuldu", "notification_id": str(notification.id)}
