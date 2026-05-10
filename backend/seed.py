from app.core.database import SessionLocal
from app.models.user import User, Company
from app.models.order import Order
from app.models.inventory import InventoryItem
from app.models.shipment import Shipment
import uuid
import random
from datetime import datetime, timedelta

db = SessionLocal()

# Get first company
company = db.query(Company).first()
if not company:
    print("No company found! Please register a user first.")
    exit(1)

company_id = company.id

# Check if data already exists
existing_orders = db.query(Order).filter(Order.company_id == company_id).count()
if existing_orders == 0:
    print(f"Seeding data for company {company.name}...")
    
    inventory_items = [
        InventoryItem(id="INV-001", company_id=company_id, name="Wireless Keyboard", sku="WK-100", category="Electronics", stock=150, minStock=20, price=49.99, status="Stokta", lastRestocked="2023-10-01"),
        InventoryItem(id="INV-002", company_id=company_id, name="Ergonomic Mouse", sku="EM-200", category="Electronics", stock=85, minStock=15, price=29.99, status="Stokta", lastRestocked="2023-10-05"),
        InventoryItem(id="INV-003", company_id=company_id, name="Desk Mat", sku="DM-300", category="Accessories", stock=12, minStock=50, price=19.99, status="Azalıyor", lastRestocked="2023-09-15"),
        InventoryItem(id="INV-004", company_id=company_id, name="Monitor Stand", sku="MS-400", category="Furniture", stock=0, minStock=10, price=39.99, status="Tükendi", lastRestocked="2023-08-20"),
    ]
    for item in inventory_items:
        db.add(item)
        
    now = datetime.utcnow()
    orders = [
        Order(id="ORD-1001", company_id=company_id, customer="Alice Smith", email="alice@example.com", product="Wireless Keyboard", quantity=2, amount=99.98, status="Beklemede", date=(now - timedelta(days=1)).isoformat(), address="123 Tech Lane, NY", notes="Deliver before noon"),
        Order(id="ORD-1002", company_id=company_id, customer="Bob Jones", email="bob@example.com", product="Ergonomic Mouse", quantity=1, amount=29.99, status="Kargoda", date=(now - timedelta(days=2)).isoformat(), address="456 Silicon Blvd, CA", notes=""),
        Order(id="ORD-1003", company_id=company_id, customer="Charlie Brown", email="charlie@example.com", product="Desk Mat", quantity=5, amount=99.95, status="Teslim Edildi", date=(now - timedelta(days=5)).isoformat(), address="789 StartUp Way, TX", notes="Leave at reception"),
    ]
    for o in orders:
        db.add(o)
        
    shipments = [
        Shipment(id="SHP-1001", company_id=company_id, orderId="ORD-1002", carrier="FedEx", trackingCode="FX123456789", status="Yolda", origin="NY Warehouse", destination="456 Silicon Blvd, CA", estimatedDelivery=(now + timedelta(days=1)).isoformat(), isDelayed=False, delayReason=""),
        Shipment(id="SHP-1002", company_id=company_id, orderId="ORD-1003", carrier="UPS", trackingCode="1Z9999999999999999", status="Teslim Edildi", origin="NY Warehouse", destination="789 StartUp Way, TX", estimatedDelivery=(now - timedelta(days=1)).isoformat(), isDelayed=False, delayReason=""),
    ]
    for s in shipments:
        db.add(s)
        
    db.commit()
    print("Seed complete.")
else:
    print("Data already exists. Skipping seed.")

db.close()
