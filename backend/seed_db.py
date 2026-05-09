import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.order import Order
from app.models.inventory import InventoryItem
from app.models.shipment import Shipment
from app.models.user import User

# Drop only the tables that need to be updated with company_id
# This avoids deleting the users and companies tables
Order.__table__.drop(engine, checkfirst=True)
InventoryItem.__table__.drop(engine, checkfirst=True)
Shipment.__table__.drop(engine, checkfirst=True)

# Recreate them with the new schema
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Get the user to associate the data with their company
user = db.query(User).filter(User.email == "alice2@acme.com").first()

if not user:
    print("HATA: alice2@acme.com kullanicisi bulunamadi!")
    print("Lutfen once 'python test_auth.py' komutunu calistirin.")
    db.close()
    exit(1)

company_id = user.company_id
print(f"Veriler '{user.full_name}' kullanicisinin sirketine (ID: {company_id}) ataniyor...")

orders_data = [
  {"id": "ORD-1001", "customer": "Elif Yildiz", "email": "elif.yildiz@mail.com", "product": "Ev Yapimi Cilek Receli (370g)", "quantity": 3, "amount": 135, "status": "Kargoda", "date": "2026-05-09T09:14:00", "address": "Kadikoy, Istanbul", "notes": "Kapida odeme isteniyor"},
  {"id": "ORD-1002", "customer": "Mehmet Demir", "email": "mehmet.demir@mail.com", "product": "Tarhana Corbasi (500g)", "quantity": 2, "amount": 90, "status": "Isleniyor", "date": "2026-05-09T08:41:00", "address": "Cankaya, Ankara"},
  {"id": "ORD-1003", "customer": "Zeynep Kaya", "email": "zeynep.kaya@mail.com", "product": "Domates Salcasi (1kg)", "quantity": 5, "amount": 225, "status": "Teslim Edildi", "date": "2026-05-08T18:22:00", "address": "Bornova, Izmir"},
  {"id": "ORD-1004", "customer": "Can Ozkan", "email": "can.ozkan@mail.com", "product": "Karisik Tursu (1L)", "quantity": 4, "amount": 180, "status": "Gecikti", "date": "2026-05-08T14:05:00", "address": "Nilufer, Bursa", "notes": "Musteri teslimat gecikmesinden sikayetci"},
  {"id": "ORD-1005", "customer": "Selin Arslan", "email": "selin.arslan@mail.com", "product": "Karadut Marmeladi (250g)", "quantity": 2, "amount": 110, "status": "Teslim Edildi", "date": "2026-05-08T11:30:00", "address": "Konak, Izmir"},
  {"id": "ORD-1006", "customer": "Ahmet Yilmaz", "email": "ahmet.yilmaz@mail.com", "product": "Biber Salcasi (750g)", "quantity": 3, "amount": 157.50, "status": "Kargoda", "date": "2026-05-08T10:15:00", "address": "Seyhan, Adana"},
  {"id": "ORD-1007", "customer": "Fatma Celik", "email": "fatma.celik@mail.com", "product": "Cevizli Sucuk (5 adet)", "quantity": 10, "amount": 350, "status": "Isleniyor", "date": "2026-05-08T09:00:00", "address": "Sahinbey, Gaziantep", "notes": "Toptan siparis - hediye paketi isteniyor"},
  {"id": "ORD-1008", "customer": "Burak Sahin", "email": "burak.sahin@mail.com", "product": "Ev Yapimi Eriste (1kg)", "quantity": 2, "amount": 80, "status": "Teslim Edildi", "date": "2026-05-07T16:45:00", "address": "Odunpazari, Eskisehir"}
]

inventory_data = [
  {"id": "INV-001", "name": "Ev Yapimi Cilek Receli", "sku": "RCL-CLK-370", "category": "Recel", "stock": 48, "minStock": 10, "price": 45, "status": "Stokta", "lastRestocked": "2026-05-01"},
  {"id": "INV-002", "name": "Kayisi Receli", "sku": "RCL-KYS-370", "category": "Recel", "stock": 3, "minStock": 10, "price": 45, "status": "Azaliyor", "lastRestocked": "2026-04-15"},
  {"id": "INV-003", "name": "Gul Receli", "sku": "RCL-GUL-250", "category": "Recel", "stock": 22, "minStock": 8, "price": 65, "status": "Stokta", "lastRestocked": "2026-04-28"},
  {"id": "INV-004", "name": "Incir Receli", "sku": "RCL-INC-370", "category": "Recel", "stock": 0, "minStock": 10, "price": 55, "status": "Tukendi", "lastRestocked": "2026-03-20"},
  {"id": "INV-007", "name": "Domates Salcasi", "sku": "SLC-DMT-1000", "category": "Salca", "stock": 65, "minStock": 15, "price": 45, "status": "Stokta", "lastRestocked": "2026-05-05"},
  {"id": "INV-008", "name": "Biber Salcasi", "sku": "SLC-BBR-750", "category": "Salca", "stock": 4, "minStock": 12, "price": 52.50, "status": "Azaliyor", "lastRestocked": "2026-04-08"}
]

shipments_data = [
  {"id": "SHP-1001", "orderId": "ORD-1001", "carrier": "Yurtici Kargo", "trackingCode": "YK987654321", "status": "Yolda", "origin": "Istanbul", "destination": "Ankara", "estimatedDelivery": "2026-05-12", "isDelayed": False},
  {"id": "SHP-1002", "orderId": "ORD-1004", "carrier": "Aras Kargo", "trackingCode": "AR123456789", "status": "Gecikti", "origin": "Istanbul", "destination": "Bursa", "estimatedDelivery": "2026-05-07", "isDelayed": True, "delayReason": "Depo yogunlugu nedeniyle gecikme"},
  {"id": "SHP-1003", "orderId": "ORD-1003", "carrier": "MNG Kargo", "trackingCode": "MNG456789012", "status": "Teslim Edildi", "origin": "Istanbul", "destination": "Izmir", "estimatedDelivery": "2026-05-08", "isDelayed": False}
]

for o in orders_data:
    db.add(Order(**o, company_id=company_id))

for i in inventory_data:
    db.add(InventoryItem(**i, company_id=company_id))

for s in shipments_data:
    db.add(Shipment(**s, company_id=company_id))

db.commit()
db.close()

print("Veritabani basariyla guncellendi ve veriler alice2@acme.com hesabina baglandi!")
