from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional, List
from datetime import datetime
from loguru import logger

from app.schemas.agent import (
    AgentRequest, 
    AgentResponse, 
    RecommendationRequest, 
    RecommendationResponse, 
    SkillInfo, 
    SkillListResponse
)
from app.core.skill_registry import SkillRegistry

router = APIRouter()


async def get_skill_registry(request: Request) -> SkillRegistry:
    """Dependency to get skill registry from app state"""
    return request.app.state.skill_registry


@router.post("/chat", response_model=AgentResponse)
async def chat(
    request_data: AgentRequest,
    registry: SkillRegistry = Depends(get_skill_registry)
):
    """Process chat message and return agent response"""
    start_time = datetime.now()
    
    try:
        # Simple intent classification (in production, use NLU model)
        intent = _classify_intent(request_data.message)
        
        # Update context with intent
        context = request_data.context or {}
        context["intent"] = intent
        context["user_id"] = request_data.user_id
        context["session_id"] = request_data.session_id
        context["message"] = request_data.message
        
        # Find best skill
        best_skill = registry.find_best_skill(intent, context)
        
        if not best_skill:
            raise HTTPException(
                status_code=400,
                detail=f"No skill available to handle intent: {intent}"
            )
        
        # Execute skill
        result = await registry.execute_skill(best_skill.skill_id, context)
        
        # Build response
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        response = AgentResponse(
            request_id=request_data.request_id,
            response=result.message,
            actions=_build_actions(result, intent),
            context_updates=result.data or {},
            suggested_next_actions=result.suggested_actions,
            metadata={
                "skills_used": [result.skill_id],
                "intent": intent,
                "skill_status": result.status.value
            },
            processing_time_ms=processing_time,
            timestamp=datetime.now()
        )
        
        logger.info(f"Processed chat request {request_data.request_id} with skill {best_skill.skill_id}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend(
    request_data: RecommendationRequest,
    registry: SkillRegistry = Depends(get_skill_registry)
):
    """Get recommendations based on user preferences"""
    start_time = datetime.now()
    
    try:
        # Build context
        context = request_data.context or {}
        context["user_id"] = request_data.user_id
        context["intent"] = f"recommend.{request_data.recommendation_type}"
        context["limit"] = request_data.limit
        
        # Find and execute recommendation skill
        intent = context["intent"]
        best_skill = registry.find_best_skill(intent, context)
        
        if not best_skill:
            raise HTTPException(
                status_code=400,
                detail=f"No skill available for recommendation type: {request_data.recommendation_type}"
            )
        
        result = await registry.execute_skill(best_skill.skill_id, context)
        
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        recommendations = result.data.get("products", []) if result.data else []
        
        response = RecommendationResponse(
            request_id=request_data.request_id,
            recommendations=recommendations,
            explanation=result.message,
            metadata={
                "skill_id": result.skill_id,
                "skill_status": result.status.value
            },
            processing_time_ms=processing_time,
            timestamp=datetime.now()
        )
        
        logger.info(f"Generated recommendations for request {request_data.request_id}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/skills", response_model=SkillListResponse)
async def list_skills(
    enabled_only: Optional[bool] = False,
    registry: SkillRegistry = Depends(get_skill_registry)
):
    """List all available skills"""
    skills = registry.get_all_skills()
    
    if enabled_only:
        skills = [s for s in skills if s.enabled]
    
    skill_infos = [
        SkillInfo(
            skill_id=s.skill_id,
            name=s.name,
            description=s.description,
            enabled=s.enabled,
            version=s.version
        )
        for s in skills
    ]
    
    return SkillListResponse(
        skills=skill_infos,
        total=len(skill_infos),
        timestamp=datetime.now()
    )


def _classify_intent(message: str) -> str:
    """Simple rule-based intent classification"""
    message_lower = message.lower()
    
    # Product search keywords
    search_keywords = ["cari", "tampilkan", "temukan", "list", "show", "search", "find"]
    if any(kw in message_lower for kw in search_keywords):
        return "search.product"
    
    # Recommendation keywords
    recommend_keywords = ["rekomendasi", "recommend", "saran", "suggested", "terlaris", "populer"]
    if any(kw in message_lower for kw in recommend_keywords):
        return "recommend.product"
    
    # Cart keywords
    cart_keywords = ["keranjang", "cart", "tambah", "tambahkan", "add", "hapus", "remove"]
    if any(kw in message_lower for kw in cart_keywords):
        return "cart.view"
    
    # Order tracking keywords
    order_keywords = ["pesanan", "order", "status", "lacak", "track", "history"]
    if any(kw in message_lower for kw in order_keywords):
        return "order.history"
    
    # Default to general chat
    return "chat.general"


def _build_actions(result, intent: str) -> List:
    """Build list of actions from skill result"""
    actions = []
    
    if result.data:
        if "products" in result.data:
            actions.append({
                "action_type": "display_products",
                "parameters": {"products": result.data["products"]},
                "target_service": "product-service",
                "description": "Display search results"
            })
    
    return actions
