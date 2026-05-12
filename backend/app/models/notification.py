from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Uuid, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Uuid, ForeignKey("users.id"), nullable=True)

    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # order, shipment, inventory, workflow, system
    priority = Column(String, default="info")  # info, warning, error, success
    meta_data = Column(JSON, nullable=True)  # Additional data like order_id, shipment_id, etc.

    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company", backref="notifications")
    user = relationship("User", backref="notifications")
