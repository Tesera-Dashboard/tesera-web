from pydantic import BaseModel
from typing import Optional

class OrderBase(BaseModel):
    id: str
    customer: str
    email: str
    product: str
    quantity: int
    amount: float
    status: str
    date: str
    address: str
    notes: Optional[str] = None

class Order(OrderBase):
    class Config:
        from_attributes = True

class InventoryItemBase(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    stock: int
    minStock: int
    price: float
    status: str
    lastRestocked: str

class InventoryItem(InventoryItemBase):
    class Config:
        from_attributes = True

class ShipmentBase(BaseModel):
    id: str
    orderId: str
    carrier: str
    trackingCode: str
    status: str
    origin: str
    destination: str
    estimatedDelivery: str
    isDelayed: bool
    delayReason: Optional[str] = None

class Shipment(ShipmentBase):
    class Config:
        from_attributes = True
