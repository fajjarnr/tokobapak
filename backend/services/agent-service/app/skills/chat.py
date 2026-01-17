from typing import Dict, Any, Optional
from loguru import logger
import httpx

from app.core.base_skill import BaseSkill, SkillResult, SkillStatus
from app.core.config import settings


class ChatSkill(BaseSkill):
    def __init__(self, openai_api_key: str, model: str = "gpt-4o-mini"):
        super().__init__()
        self.skill_id = "chat"
        self.name = "Chat"
        self.description = "General conversation skill using LLM"
        self.version = "1.0.0"
        self.supported_intents = ["chat.general", "chat.greeting", "chat.farewell"]
        self.required_context = ["user_id", "session_id"]
        self.priority = 1
        self.openai_api_key = openai_api_key
        self.model = model
        self.client = httpx.AsyncClient(
            base_url="https://api.openai.com/v1",
            headers={"Authorization": f"Bearer {openai_api_key}"}
        )
    
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        return intent in self.supported_intents
    
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        user_message = context.get("message", "")
        user_id = context.get("user_id")
        session_id = context.get("session_id")
        
        try:
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a helpful shopping assistant for TokoBapak, an Indonesian e-commerce platform. Always respond in Indonesian and be friendly and helpful."
                        },
                        {"role": "user", "content": user_message}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            )
            
            response.raise_for_status()
            data = response.json()
            ai_message = data["choices"][0]["message"]["content"]
            tokens_used = data["usage"]["total_tokens"]
            
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.SUCCESS,
                data={"response": ai_message},
                message=ai_message,
                requires_followup=True,
                suggested_actions=self._generate_suggestions(ai_message),
                next_intent=None,
                execution_time_ms=0,
                metadata={"model": self.model, "tokens_used": tokens_used}
            )
        except Exception as e:
            logger.error(f"Chat skill execution failed: {e}")
            return SkillResult(
                skill_id=self.skill_id,
                status=SkillStatus.FAILED,
                data=None,
                message="Maaf, saya mengalami kesalahan. Silakan coba lagi.",
                requires_followup=False,
                suggested_actions=[],
                next_intent=None,
                execution_time_ms=0,
                metadata={"error": str(e)}
            )
    
    def _generate_suggestions(self, response: str) -> list:
        suggestions = []
        response_lower = response.lower()
        
        if "produk" in response_lower or "cari" in response_lower:
            suggestions.extend(["Cari produk lain", "Lihat kategori"])
        
        if "keranjang" in response_lower or "beli" in response_lower:
            suggestions.append("Lihat keranjang")
        
        if "promo" in response_lower or "diskon" in response_lower:
            suggestions.append("Lihat promo")
        
        return suggestions
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
