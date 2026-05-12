import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Uuid, Integer, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False)
    tax_number = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="users")
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    theme = Column(String(10), default="light")
    sidebar_order = Column(JSON, nullable=True)
    sidebar_enabled = Column(JSON, nullable=True)
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="settings")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    plan = Column(String, default="free")
    status = Column(String, default="active")
    trial_ends_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    company = relationship("Company", backref="subscription")
