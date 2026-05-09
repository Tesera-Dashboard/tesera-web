from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True) # e.g. "ORD-1001"
    customer = Column(String, nullable=False)
    email = Column(String, nullable=False)
    product = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    date = Column(String, nullable=False) # Storing as ISO string to match mock for now
    address = Column(String, nullable=False)
    notes = Column(String, nullable=True)
