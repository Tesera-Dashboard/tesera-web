from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.shipment import Shipment as ShipmentModel
from app.schemas.domain import Shipment

router = APIRouter()

@router.get("/", response_model=List[Shipment])
def read_shipments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    shipments = db.query(ShipmentModel).offset(skip).limit(limit).all()
    return shipments
