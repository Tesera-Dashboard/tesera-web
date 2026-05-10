from pydantic import BaseModel, field_serializer
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

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

class WorkflowStepBase(BaseModel):
    id: uuid.UUID
    workflow_id: uuid.UUID
    order: int
    step_type: str
    step_config: Optional[Dict[str, Any]] = None
    name: str
    description: Optional[str] = None
    created_at: datetime

    @field_serializer('id', 'workflow_id')
    def serialize_uuid(self, value: uuid.UUID) -> str:
        return str(value)

    @field_serializer('created_at')
    def serialize_datetime(self, value: datetime) -> str:
        return value.isoformat()

class WorkflowStep(WorkflowStepBase):
    class Config:
        from_attributes = True

class WorkflowBase(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    steps: List[WorkflowStep] = []

    @field_serializer('id', 'company_id')
    def serialize_uuid(self, value: uuid.UUID) -> str:
        return str(value)

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, value: datetime) -> str:
        return value.isoformat()

class Workflow(WorkflowBase):
    class Config:
        from_attributes = True

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Optional[Dict[str, Any]] = None
    steps: List[Dict[str, Any]] = []

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    steps: Optional[List[Dict[str, Any]]] = None
