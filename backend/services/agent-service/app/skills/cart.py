from typing import Dict, Any
from loguru import logger
import httpx

from app.core.base_skill import BaseSkill, SkillResult, SkillStatus


class CartSkill(BaseSkill):
    def __init__(self, cart_service_url: str):
        super().__init__()
        self.skill_id = "cart"
        self.name = "Cart"
        self.description = "Manage shopping cart operations"
        self.version = "1.0.0"
        self.supported_intents = ["cart.add", "cart.remove", "cart.update", "cart.view"]
        self.required_context = ["user_id"]
        self.priority = 15
        self.cart_service_url = cart_service_url
        self.client = httpx.AsyncClient()
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_id = context.get("user_id")
        intent = context.get("intent")
        
        try:
            if intent == "cart.add":
                result = await self._add_to_cart(user_id, context.get("product_id"), context.get("quantity", 1))
                message = f"Berhasil menambahkan {context.get('quantity', 1)} produk ke keranjang"
            elif intent == "cart.remove":
                result = await self._remove_from_cart(user_id, context.get("item_id"))
                message = "Berhasil menghapus produk dari keranjang"
            elif intent == "cart.update":
                result = await self._update_cart_item(user_id, context.get("item_id"), context.get("quantity"))
                message = "Berhasil memperbarui keranjang"
            else:  # cart.view
                result = await self._get_cart(user_id)
                message = f"Keranjang Anda berisi {len(result.get('items', []))} produk"
            
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.SUCCESS,
                data=result,
                message=message,
                requires_followup=False,
                suggested_actions=["Checkout", "Lanjutkan belanja"],
                next_intent="checkout" if intent == "cart.view" and result.get("items") else None,
                execution_time_ms=0,
                metadata={}
            )
        except Exception as e:
            logger.error(f"Cart skill failed: {e}")
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message="Maaf, terjadi kesalahan dengan keranjang belanja Anda.",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={"error": str(e)}
            )
    
    async def _add_to_cart(self, user_id: str, product_id: str, quantity: int) -> dict:
        response = await self.client.post(
            f"{self.cart_service_url}/v1/cart",
            json={"user_id": user_id, "product_id": product_id, "quantity": quantity},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()
    
    async def _remove_from_cart(self, user_id: str, item_id: str) -> dict:
        response = await self.client.delete(
            f"{self.cart_service_url}/v1/cart/{item_id}",
            params={"user_id": user_id},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()
    
    async def _update_cart_item(self, user_id: str, item_id: str, quantity: int) -> dict:
        response = await self.client.put(
            f"{self.cart_service_url}/v1/cart/{item_id}",
            json={"user_id": user_id, "quantity": quantity},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()
    
    async def _get_cart(self, user_id: str) -> dict:
        response = await self.client.get(
            f"{self.cart_service_url}/v1/cart",
            params={"user_id": user_id},
            timeout=10.0
        )
        response.raise_for_status()
        return response.json()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
