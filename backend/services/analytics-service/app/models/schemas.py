from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class SalesMetrics(BaseModel):
    total_revenue: float
    total_orders: int
    average_order_value: float
    period_start: date
    period_end: date


class ProductMetrics(BaseModel):
    product_id: str
    views: int
    add_to_cart: int
    purchases: int
    revenue: float
    conversion_rate: float


class SellerMetrics(BaseModel):
    seller_id: str
    total_revenue: float
    total_orders: int
    total_products: int
    average_rating: float


class TrackEventRequest(BaseModel):
    event_type: str  # page_view, product_view, add_to_cart, purchase
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    seller_id: Optional[str] = None
    value: Optional[float] = None
    metadata: Optional[dict] = None


class DashboardResponse(BaseModel):
    sales: SalesMetrics
    top_products: list[ProductMetrics]
    recent_orders: int
    active_users: int
