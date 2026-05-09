from sqlalchemy import Column, String, Boolean
from app.core.database import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String, primary_key=True, index=True) # e.g. "SHP-1001"
    orderId = Column(String, nullable=False)
    carrier = Column(String, nullable=False)
    trackingCode = Column(String, nullable=False)
    status = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    estimatedDelivery = Column(String, nullable=False)
    isDelayed = Column(Boolean, default=False)
    delayReason = Column(String, nullable=True)
