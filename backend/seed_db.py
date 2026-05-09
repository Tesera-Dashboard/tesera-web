import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.order import Order
from app.models.inventory import InventoryItem
from app.models.shipment import Shipment

# Recreate tables to start fresh
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()

orders_data = [
  {"id": "ORD-1001", "customer": "Elif Yıldız", "email": "elif.yildiz@mail.com", "product": "Ev Yapımı Çilek Reçeli (370g)", "quantity": 3, "amount": 135, "status": "Kargoda", "date": "2026-05-09T09:14:00", "address": "Kadıköy, İstanbul", "notes": "Kapıda ödeme isteniyor"},
  {"id": "ORD-1002", "customer": "Mehmet Demir", "email": "mehmet.demir@mail.com", "product": "Tarhana Çorbası (500g)", "quantity": 2, "amount": 90, "status": "İşleniyor", "date": "2026-05-09T08:41:00", "address": "Çankaya, Ankara"},
  {"id": "ORD-1003", "customer": "Zeynep Kaya", "email": "zeynep.kaya@mail.com", "product": "Domates Salçası (1kg)", "quantity": 5, "amount": 225, "status": "Teslim Edildi", "date": "2026-05-08T18:22:00", "address": "Bornova, İzmir"},
  {"id": "ORD-1004", "customer": "Can Özkan", "email": "can.ozkan@mail.com", "product": "Karışık Turşu (1L)", "quantity": 4, "amount": 180, "status": "Gecikti", "date": "2026-05-08T14:05:00", "address": "Nilüfer, Bursa", "notes": "Müşteri teslimat gecikmesinden şikayetçi"},
  {"id": "ORD-1005", "customer": "Selin Arslan", "email": "selin.arslan@mail.com", "product": "Karadut Marmeladı (250g)", "quantity": 2, "amount": 110, "status": "Teslim Edildi", "date": "2026-05-08T11:30:00", "address": "Konak, İzmir"},
  {"id": "ORD-1006", "customer": "Ahmet Yılmaz", "email": "ahmet.yilmaz@mail.com", "product": "Biber Salçası (750g)", "quantity": 3, "amount": 157.50, "status": "Kargoda", "date": "2026-05-08T10:15:00", "address": "Seyhan, Adana"},
  {"id": "ORD-1007", "customer": "Fatma Çelik", "email": "fatma.celik@mail.com", "product": "Cevizli Sucuk (5 adet)", "quantity": 10, "amount": 350, "status": "İşleniyor", "date": "2026-05-08T09:00:00", "address": "Şahinbey, Gaziantep", "notes": "Toptan sipariş — hediye paketi isteniyor"},
  {"id": "ORD-1008", "customer": "Burak Şahin", "email": "burak.sahin@mail.com", "product": "Ev Yapımı Erişte (1kg)", "quantity": 2, "amount": 80, "status": "Teslim Edildi", "date": "2026-05-07T16:45:00", "address": "Odunpazarı, Eskişehir"}
]

inventory_data = [
  {"id": "INV-001", "name": "Ev Yapımı Çilek Reçeli", "sku": "RCL-CLK-370", "category": "Reçel", "stock": 48, "minStock": 10, "price": 45, "status": "Stokta", "lastRestocked": "2026-05-01"},
  {"id": "INV-002", "name": "Kayısı Reçeli", "sku": "RCL-KYS-370", "category": "Reçel", "stock": 3, "minStock": 10, "price": 45, "status": "Azalıyor", "lastRestocked": "2026-04-15"},
  {"id": "INV-003", "name": "Gül Reçeli", "sku": "RCL-GUL-250", "category": "Reçel", "stock": 22, "minStock": 8, "price": 65, "status": "Stokta", "lastRestocked": "2026-04-28"},
  {"id": "INV-004", "name": "İncir Reçeli", "sku": "RCL-INC-370", "category": "Reçel", "stock": 0, "minStock": 10, "price": 55, "status": "Tükendi", "lastRestocked": "2026-03-20"},
  {"id": "INV-007", "name": "Domates Salçası", "sku": "SLC-DMT-1000", "category": "Salça", "stock": 65, "minStock": 15, "price": 45, "status": "Stokta", "lastRestocked": "2026-05-05"},
  {"id": "INV-008", "name": "Biber Salçası", "sku": "SLC-BBR-750", "category": "Salça", "stock": 4, "minStock": 12, "price": 52.50, "status": "Azalıyor", "lastRestocked": "2026-04-08"}
]

shipments_data = [
  {"id": "SHP-1001", "orderId": "ORD-1001", "carrier": "Yurtiçi Kargo", "trackingCode": "YK987654321", "status": "Yolda", "origin": "İstanbul", "destination": "Ankara", "estimatedDelivery": "2026-05-12", "isDelayed": False},
  {"id": "SHP-1002", "orderId": "ORD-1004", "carrier": "Aras Kargo", "trackingCode": "AR123456789", "status": "Gecikti", "origin": "İstanbul", "destination": "Bursa", "estimatedDelivery": "2026-05-07", "isDelayed": True, "delayReason": "Depo yoğunluğu nedeniyle gecikme"},
  {"id": "SHP-1003", "orderId": "ORD-1003", "carrier": "MNG Kargo", "trackingCode": "MNG456789012", "status": "Teslim Edildi", "origin": "İstanbul", "destination": "İzmir", "estimatedDelivery": "2026-05-08", "isDelayed": False}
]

for o in orders_data:
    db.add(Order(**o))

for i in inventory_data:
    db.add(InventoryItem(**i))

for s in shipments_data:
    db.add(Shipment(**s))

db.commit()
db.close()

print("Veritabanı başarıyla mock verilerle dolduruldu!")
