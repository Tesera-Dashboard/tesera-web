from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from uuid import UUID

from app.core.database import get_db
from app.models.workflow import Workflow as WorkflowModel, WorkflowStep as WorkflowStepModel
from app.schemas.domain import Workflow, WorkflowCreate, WorkflowUpdate
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification as NotificationModel

router = APIRouter()

def create_notification(db: Session, company_id, user_id, title, message, notification_type, priority="info", meta_data=None):
    """Helper function to create notifications"""
    notification = NotificationModel(
        id=uuid.uuid4(),
        company_id=company_id,
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        priority=priority,
        meta_data=meta_data,
        is_read=False
    )
    db.add(notification)
    db.commit()

@router.get("/", response_model=List[Workflow])
def read_workflows(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflows = db.query(WorkflowModel).filter(
        WorkflowModel.company_id == current_user.company_id
    ).offset(skip).limit(limit).all()
    return workflows

@router.get("/{workflow_id}", response_model=Workflow)
def read_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workflow ID format")
    workflow = db.query(WorkflowModel).filter(
        WorkflowModel.id == workflow_uuid,
        WorkflowModel.company_id == current_user.company_id
    ).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/", response_model=Workflow)
def create_workflow(
    workflow: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        workflow_id = uuid.uuid4()
        new_workflow = WorkflowModel(
            id=workflow_id,
            company_id=current_user.company_id,
            name=workflow.name,
            description=workflow.description,
            trigger_type=workflow.trigger_type,
            trigger_config=workflow.trigger_config,
            is_active=True
        )
        db.add(new_workflow)
        db.flush()

        # Add steps if provided
        for step_data in workflow.steps:
            step = WorkflowStepModel(
                id=uuid.uuid4(),
                workflow_id=workflow_id,
                order=step_data.get("order", 0),
                step_type=step_data.get("step_type"),
                step_config=step_data.get("step_config"),
                name=step_data.get("name"),
                description=step_data.get("description")
            )
            db.add(step)

        db.commit()
        db.refresh(new_workflow)

        # Create notification
        create_notification(
            db,
            current_user.company_id,
            current_user.id,
            "Yeni İş Akışı",
            f"{workflow.name} iş akışı oluşturuldu. {len(workflow.steps)} adım içeriyor",
            "workflow",
            "success",
            {"workflow_id": str(new_workflow.id)}
        )

        return new_workflow
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{workflow_id}", response_model=Workflow)
def update_workflow(
    workflow_id: str,
    workflow: WorkflowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workflow ID format")
    db_workflow = db.query(WorkflowModel).filter(
        WorkflowModel.id == workflow_uuid,
        WorkflowModel.company_id == current_user.company_id
    ).first()
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        if workflow.name is not None:
            db_workflow.name = workflow.name
        if workflow.description is not None:
            db_workflow.description = workflow.description
        if workflow.trigger_type is not None:
            db_workflow.trigger_type = workflow.trigger_type
        if workflow.trigger_config is not None:
            db_workflow.trigger_config = workflow.trigger_config
        if workflow.is_active is not None:
            db_workflow.is_active = workflow.is_active
        db_workflow.updated_at = datetime.utcnow()

        # Update steps if provided
        if workflow.steps is not None:
            # Delete existing steps
            db.query(WorkflowStepModel).filter(
                WorkflowStepModel.workflow_id == workflow_id
            ).delete()
            
            # Add new steps
            for step_data in workflow.steps:
                step = WorkflowStepModel(
                    id=uuid.uuid4(),
                    workflow_id=workflow_id,
                    order=step_data.get("order", 0),
                    step_type=step_data.get("step_type"),
                    step_config=step_data.get("step_config"),
                    name=step_data.get("name"),
                    description=step_data.get("description")
                )
                db.add(step)

        db.commit()
        db.refresh(db_workflow)

        # Create notification
        create_notification(
            db,
            current_user.company_id,
            current_user.id,
            "İş Akışı Güncellendi",
            f"{db_workflow.name} iş akışı güncellendi",
            "workflow",
            "info",
            {"workflow_id": str(db_workflow.id)}
        )

        return db_workflow
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{workflow_id}")
def delete_workflow(
    workflow_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workflow ID format")

    workflow = db.query(WorkflowModel).filter(
        WorkflowModel.id == workflow_uuid,
        WorkflowModel.company_id == current_user.company_id
    ).first()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflow_name = workflow.name

    try:
        db.delete(workflow)
        db.commit()

        # Create notification
        create_notification(
            db,
            current_user.company_id,
            current_user.id,
            "İş Akışı Silindi",
            f"{workflow_name} iş akışı silindi",
            "workflow",
            "warning",
            {"workflow_id": str(workflow.id)}
        )

        return {"message": "Workflow deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
