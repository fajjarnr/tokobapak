from fastapi import APIRouter
from datetime import date, timedelta
from app.models.schemas import TrackEventRequest
from app.services.engine import analytics_engine

router = APIRouter()


@router.post("/analytics/track")
async def track_event(event: TrackEventRequest):
    """Track an analytics event."""
    analytics_engine.track_event(event.model_dump())
    return {"status": "tracked", "event_type": event.event_type}


@router.get("/analytics/dashboard")
async def get_dashboard():
    """Get dashboard overview."""
    return analytics_engine.get_dashboard()


@router.get("/analytics/sales")
async def get_sales_metrics(days: int = 30):
    """Get sales metrics for the last N days."""
    today = date.today()
    start_date = today - timedelta(days=days)
    return analytics_engine.get_sales_metrics(start_date, today)


@router.get("/analytics/products/top")
async def get_top_products(limit: int = 10):
    """Get top performing products."""
    return {"products": analytics_engine.get_top_products(limit)}


@router.get("/analytics/products/{product_id}")
async def get_product_analytics(product_id: str):
    """Get analytics for a specific product."""
    stats = analytics_engine.product_stats.get(product_id, {})
    views = stats.get("views", 0)
    purchases = stats.get("purchases", 0)
    
    return {
        "product_id": product_id,
        "views": views,
        "add_to_cart": stats.get("add_to_cart", 0),
        "purchases": purchases,
        "revenue": stats.get("revenue", 0),
        "conversion_rate": round((purchases / views * 100) if views > 0 else 0, 2),
    }
