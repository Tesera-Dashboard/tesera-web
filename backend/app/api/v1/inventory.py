from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.inventory import InventoryItem as InventoryModel
from app.schemas.domain import InventoryItem

router = APIRouter()

@router.get("/", response_model=List[InventoryItem])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(InventoryModel).offset(skip).limit(limit).all()
    return items
