from datetime import datetime, date, timedelta
from collections import defaultdict
import random


class AnalyticsEngine:
    """In-memory analytics engine for demo purposes."""
    
    def __init__(self):
        self.events: list[dict] = []
        self.daily_stats: dict[str, dict] = defaultdict(lambda: {
            "revenue": 0.0,
            "orders": 0,
            "views": 0,
        })
        self.product_stats: dict[str, dict] = defaultdict(lambda: {
            "views": 0,
            "add_to_cart": 0,
            "purchases": 0,
            "revenue": 0.0,
        })
    
    def track_event(self, event: dict) -> None:
        """Record an analytics event."""
        event["timestamp"] = datetime.utcnow().isoformat()
        self.events.append(event)
        
        today = date.today().isoformat()
        event_type = event.get("event_type")
        product_id = event.get("product_id")
        value = event.get("value", 0)
        
        if event_type == "page_view":
            self.daily_stats[today]["views"] += 1
        elif event_type == "product_view" and product_id:
            self.product_stats[product_id]["views"] += 1
        elif event_type == "add_to_cart" and product_id:
            self.product_stats[product_id]["add_to_cart"] += 1
        elif event_type == "purchase":
            self.daily_stats[today]["orders"] += 1
            self.daily_stats[today]["revenue"] += value
            if product_id:
                self.product_stats[product_id]["purchases"] += 1
                self.product_stats[product_id]["revenue"] += value
    
    def get_sales_metrics(self, start_date: date, end_date: date) -> dict:
        """Get sales metrics for a date range."""
        total_revenue = 0.0
        total_orders = 0
        
        current = start_date
        while current <= end_date:
            day_key = current.isoformat()
            stats = self.daily_stats.get(day_key, {})
            total_revenue += stats.get("revenue", 0)
            total_orders += stats.get("orders", 0)
            current += timedelta(days=1)
        
        avg_order = total_revenue / total_orders if total_orders > 0 else 0
        
        return {
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "average_order_value": round(avg_order, 2),
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
        }
    
    def get_top_products(self, limit: int = 10) -> list[dict]:
        """Get top products by revenue."""
        products = []
        for pid, stats in self.product_stats.items():
            views = stats.get("views", 0)
            purchases = stats.get("purchases", 0)
            conversion = (purchases / views * 100) if views > 0 else 0
            
            products.append({
                "product_id": pid,
                "views": views,
                "add_to_cart": stats.get("add_to_cart", 0),
                "purchases": purchases,
                "revenue": stats.get("revenue", 0),
                "conversion_rate": round(conversion, 2),
            })
        
        products.sort(key=lambda x: x["revenue"], reverse=True)
        return products[:limit]
    
    def get_dashboard(self) -> dict:
        """Get dashboard overview."""
        today = date.today()
        last_30_days = today - timedelta(days=30)
        
        sales = self.get_sales_metrics(last_30_days, today)
        top_products = self.get_top_products(5)
        
        return {
            "sales": sales,
            "top_products": top_products,
            "recent_orders": self.daily_stats.get(today.isoformat(), {}).get("orders", 0),
            "active_users": len(set(e.get("user_id") for e in self.events[-1000:] if e.get("user_id"))),
        }


# Global engine instance
analytics_engine = AnalyticsEngine()
