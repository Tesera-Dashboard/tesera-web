from sqlalchemy import Column, String, Integer, Float
from app.core.database import Base

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(String, primary_key=True, index=True) # e.g. "INV-001"
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    stock = Column(Integer, nullable=False)
    minStock = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    lastRestocked = Column(String, nullable=False)
