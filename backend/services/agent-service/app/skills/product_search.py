from typing import Dict, Any
from loguru import logger
import httpx

from app.core.base_skill import BaseSkill, SkillResult, SkillStatus


class ProductSearchSkill(BaseSkill):
    def __init__(self, search_service_url: str):
        super().__init__()
        self.skill_id = "product_search"
        self.name = "Product Search"
        self.description = "Search products with advanced filtering"
        self.version = "1.0.0"
        self.supported_intents = ["search.product", "search.category", "search.brand"]
        self.required_context = ["query"]
        self.priority = 10
        self.search_service_url = search_service_url
        self.client = httpx.AsyncClient()
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        query = context.get("query", "")
        filters = context.get("filters", {})
        page = context.get("page", 1)
        limit = context.get("limit", 20)
        
        try:
            response = await self.client.post(
                f"{self.search_service_url}/v1/search",
                json={
                    "query": query,
                    "filters": filters,
                    "page": page,
                    "limit": limit
                },
                timeout=10.0
            )
            
            response.raise_for_status()
            data = response.json()
            
            products = data.get("results", [])
            total = data.get("total", 0)
            
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.SUCCESS,
                data={
                    "products": products,
                    "total": total,
                    "page": page,
                    "limit": limit
                },
                message=f"Menemukan {total} produk untuk '{query}'",
                requires_followup=False,
                suggested_actions=self._generate_suggestions(products),
                next_intent="view_product" if products else None,
                execution_time_ms=0,
                metadata={"query": query, "filters": filters}
            )
        except Exception as e:
            logger.error(f"Product search skill failed: {e}")
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message="Maaf, terjadi kesalahan saat mencari produk.",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={"error": str(e)}
            )
    
    def _generate_suggestions(self, products: list) -> list:
        suggestions = ["Filter berdasarkan harga", "Filter berdasarkan rating"]
        if len(products) > 0:
            suggestions.insert(0, "Lihat detail produk")
        return suggestions
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
