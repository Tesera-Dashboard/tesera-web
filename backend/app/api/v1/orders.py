from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.order import Order as OrderModel
from app.schemas.domain import Order

router = APIRouter()

@router.get("/", response_model=List[Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(OrderModel).offset(skip).limit(limit).all()
    return orders
