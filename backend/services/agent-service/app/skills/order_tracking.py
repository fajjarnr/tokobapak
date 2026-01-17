from typing import Dict, Any
from loguru import logger
import httpx

from app.core.base_skill import BaseSkill, SkillResult, SkillStatus


class OrderTrackingSkill(BaseSkill):
    def __init__(self, order_service_url: str):
        super().__init__()
        self.skill_id = "order_tracking"
        self.name = "Order Tracking"
        self.description = "Track order status and timeline"
        self.version = "1.0.0"
        self.supported_intents = ["order.track", "order.history"]
        self.required_context = ["user_id"]
        self.priority = 12
        self.order_service_url = order_service_url
        self.client = httpx.AsyncClient()
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_id = context.get("user_id")
        intent = context.get("intent")
        
        try:
            if intent == "order.track" and "order_id" in context:
                result = await self._track_order(context["order_id"])
                message = f"Status pesanan Anda: {result.get('status', 'Unknown')}"
            else:  # order.history
                result = await self._get_order_history(user_id)
                message = f"Menampilkan {len(result.get('orders', []))} pesanan terakhir Anda"
            
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.SUCCESS,
                data=result,
                message=message,
                requires_followup=False,
                suggested_actions=["Lihat detail pesanan", "Beli lagi"],
                next_intent="view_order" if result else None,
                execution_time_ms=0,
                metadata={}
            )
        except Exception as e:
            logger.error(f"Order tracking skill failed: {e}")
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message="Maaf, terjadi kesalahan saat melacak pesanan.",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={"error": str(e)}
            )
    
    async def _track_order(self, order_id: str) -> dict:
        response = await self.client.get(
            f"{self.order_service_url}/v1/orders/{order_id}",
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()
    
    async def _get_order_history(self, user_id: str) -> dict:
        response = await self.client.get(
            f"{self.order_service_url}/v1/orders",
            params={"user_id": user_id},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
