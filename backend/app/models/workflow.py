import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Uuid, JSON, Text, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(Uuid(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String, nullable=False)  # "manual", "webhook", "scheduled", "event"
    trigger_config = Column(JSON, nullable=True)  # Configuration for the trigger
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan", order_by="WorkflowStep.order")

class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(Uuid(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    order = Column(Integer, nullable=False)
    step_type = Column(String, nullable=False)  # "send_notification", "update_inventory", "create_order", "ai_action", "delay"
    step_config = Column(JSON, nullable=True)  # Configuration for the step
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    workflow = relationship("Workflow", back_populates="steps")
