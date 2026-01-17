from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1 import api_router
from app.core.config import settings
from app.core.skill_registry import SkillRegistry
from app.skills.chat import ChatSkill
from app.skills.product_search import ProductSearchSkill
from app.skills.product_recommendation import ProductRecommendationSkill
from app.skills.cart import CartSkill
from app.skills.order_tracking import OrderTrackingSkill


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Agent Service...")
    
    app.state.skill_registry = SkillRegistry()
    
    await app.state.skill_registry.register_skill(
        ChatSkill(
            openai_api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_MODEL
        )
    )
    
    await app.state.skill_registry.register_skill(
        ProductSearchSkill(search_service_url=settings.SEARCH_SERVICE_URL)
    )
    
    await app.state.skill_registry.register_skill(
        ProductRecommendationSkill(
            recommendation_service_url=settings.RECOMMENDATION_SERVICE_URL
        )
    )
    
    await app.state.skill_registry.register_skill(
        CartSkill(cart_service_url=settings.CART_SERVICE_URL)
    )
    
    await app.state.skill_registry.register_skill(
        OrderTrackingSkill(order_service_url=settings.ORDER_SERVICE_URL)
    )
    
    logger.info("Skills registered successfully")
    
    yield
    
    logger.info("Shutting down Agent Service...")


app = FastAPI(
    title="TokoBapak Agent Service",
    description="AI Agent service with skill-based architecture for TokoBapak e-commerce platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/v1/agent", tags=["agent"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agent-service"}


@app.get("/")
async def root():
    return {
        "service": "agent-service",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=3008,
        reload=settings.DEBUG
    )
