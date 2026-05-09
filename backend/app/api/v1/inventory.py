from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.inventory import InventoryItem as InventoryModel
from app.schemas.domain import InventoryItem

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[InventoryItem])
def read_inventory(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(InventoryModel).filter(InventoryModel.company_id == current_user.company_id).offset(skip).limit(limit).all()
    return items
