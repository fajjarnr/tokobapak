from typing import Dict, Any
from loguru import logger
import httpx

from app.core.base_skill import BaseSkill, SkillResult, SkillStatus


class ProductRecommendationSkill(BaseSkill):
    def __init__(self, recommendation_service_url: str):
        super().__init__()
        self.skill_id = "product_recommendation"
        self.name = "Product Recommendation"
        self.description = "Recommend products using ML algorithms"
        self.version = "1.0.0"
        self.supported_intents = ["recommend.product", "recommend.similar", "recommend.trending"]
        self.required_context = ["user_id"]
        self.priority = 8
        self.recommendation_service_url = recommendation_service_url
        self.client = httpx.AsyncClient()
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_id = context.get("user_id")
        intent = context.get("intent")
        limit = context.get("limit", 10)
        
        try:
            if intent == "recommend.similar" and "product_id" in context:
                products = await self._get_similar_products(context["product_id"], limit)
                message = "Berikut produk yang mirip dengan yang Anda lihat"
            elif intent == "recommend.trending":
                products = await self._get_trending_products(limit)
                message = "Berikut produk yang sedang populer"
            else:
                products = await self._get_personalized_recommendations(user_id, limit)
                message = "Berikut rekomendasi produk untuk Anda"
            
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.SUCCESS,
                data={"products": products},
                message=message,
                requires_followup=False,
                suggested_actions=["Lihat detail produk", "Tambahkan ke keranjang"],
                next_intent="view_product",
                execution_time_ms=0,
                metadata={"algorithm": "collaborative_filtering", "limit": limit}
            )
        except Exception as e:
            logger.error(f"Product recommendation skill failed: {e}")
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message="Maaf, terjadi kesalahan saat membuat rekomendasi.",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={"error": str(e)}
            )
    
    async def _get_personalized_recommendations(self, user_id: str, limit: int) -> list:
        response = await self.client.get(
            f"{self.recommendation_service_url}/v1/recommendations/personalized/{user_id}",
            params={"limit": limit},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json().get("products", [])
    
    async def _get_similar_products(self, product_id: str, limit: int) -> list:
        response = await self.client.get(
            f"{self.recommendation_service_url}/v1/recommendations/similar/{product_id}",
            params={"limit": limit},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json().get("products", [])
    
    async def _get_trending_products(self, limit: int) -> list:
        response = await self.client.get(
            f"{self.recommendation_service_url}/v1/recommendations/trending",
            params={"limit": limit},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json().get("products", [])
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
