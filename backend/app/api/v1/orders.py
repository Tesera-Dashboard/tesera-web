from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.order import Order as OrderModel
from app.schemas.domain import Order

from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Order])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(OrderModel).filter(OrderModel.company_id == current_user.company_id).offset(skip).limit(limit).all()
    return orders
