from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from datetime import datetime, timedelta
from typing import Dict, List, Any
from app.core.database import get_db
from app.models.order import Order
from app.models.inventory import InventoryItem
from app.models.shipment import Shipment
from app.models.user import User
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter()

class OverviewStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_inventory: int
    low_stock_items: int
    active_shipments: int
    delayed_shipments: int
    pending_orders: int

class OrderTrend(BaseModel):
    date: str
    count: int
    revenue: float

class InventoryByCategory(BaseModel):
    category: str
    total_stock: int
    item_count: int
    total_value: float

class ShipmentStatus(BaseModel):
    status: str
    count: int

@router.get("/overview", response_model=OverviewStats)
def get_overview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overview statistics for the dashboard"""
    company_id = current_user.company_id

    # Total orders and revenue
    total_orders = db.query(func.count(Order.id)).filter(
        Order.company_id == company_id
    ).scalar() or 0

    total_revenue = db.query(func.sum(Order.amount)).filter(
        Order.company_id == company_id
    ).scalar() or 0

    # Total inventory items
    total_inventory = db.query(func.count(InventoryItem.id)).filter(
        InventoryItem.company_id == company_id
    ).scalar() or 0

    # Low stock items (stock <= minStock)
    low_stock_items = db.query(func.count(InventoryItem.id)).filter(
        InventoryItem.company_id == company_id,
        InventoryItem.stock <= InventoryItem.minStock
    ).scalar() or 0

    # Active shipments (not delivered)
    active_shipments = db.query(func.count(Shipment.id)).filter(
        Shipment.company_id == company_id,
        Shipment.status != "Delivered"
    ).scalar() or 0

    # Delayed shipments
    delayed_shipments = db.query(func.count(Shipment.id)).filter(
        Shipment.company_id == company_id,
        Shipment.isDelayed == True
    ).scalar() or 0

    # Pending orders
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.company_id == company_id,
        Order.status == "Pending"
    ).scalar() or 0

    return OverviewStats(
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_inventory=total_inventory,
        low_stock_items=low_stock_items,
        active_shipments=active_shipments,
        delayed_shipments=delayed_shipments,
        pending_orders=pending_orders
    )

@router.get("/orders/trends", response_model=List[OrderTrend])
def get_order_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get order trends over time"""
    company_id = current_user.company_id
    start_date = datetime.now() - timedelta(days=days)

    # Query orders grouped by date
    trends = db.query(
        func.date(Order.date).label("date"),
        func.count(Order.id).label("count"),
        func.sum(Order.amount).label("revenue")
    ).filter(
        Order.company_id == company_id,
        Order.date >= start_date.isoformat()
    ).group_by(
        func.date(Order.date)
    ).order_by(
        func.date(Order.date)
    ).all()

    return [
        OrderTrend(
            date=str(trend.date),
            count=trend.count or 0,
            revenue=trend.revenue or 0
        )
        for trend in trends
    ]

@router.get("/inventory/by-category", response_model=List[InventoryByCategory])
def get_inventory_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get inventory statistics by category"""
    company_id = current_user.company_id

    # Query inventory grouped by category
    categories = db.query(
        InventoryItem.category,
        func.sum(InventoryItem.stock).label("total_stock"),
        func.count(InventoryItem.id).label("item_count"),
        func.sum(InventoryItem.stock * InventoryItem.price).label("total_value")
    ).filter(
        InventoryItem.company_id == company_id
    ).group_by(
        InventoryItem.category
    ).all()

    return [
        InventoryByCategory(
            category=category.category,
            total_stock=category.total_stock or 0,
            item_count=category.item_count or 0,
            total_value=category.total_value or 0
        )
        for category in categories
    ]

@router.get("/shipments/status", response_model=List[ShipmentStatus])
def get_shipment_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get shipment status distribution"""
    company_id = current_user.company_id

    # Query shipments grouped by status
    statuses = db.query(
        Shipment.status,
        func.count(Shipment.id).label("count")
    ).filter(
        Shipment.company_id == company_id
    ).group_by(
        Shipment.status
    ).all()

    return [
        ShipmentStatus(
            status=status.status,
            count=status.count or 0
        )
        for status in statuses
    ]
