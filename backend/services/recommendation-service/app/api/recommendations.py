from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.schemas import (
    RecommendationRequest,
    SimilarProductsRequest,
    RecommendationResponse,
    UserInteraction,
    Product,
)
from app.services.engine import recommendation_engine

router = APIRouter()


@router.post("/recommendations/personalized", response_model=RecommendationResponse)
async def get_personalized_recommendations(request: RecommendationRequest):
    """Get personalized product recommendations for a user."""
    recommendations = recommendation_engine.get_personalized_recommendations(
        user_id=request.user_id,
        limit=request.limit,
        category=request.category,
    )
    
    return RecommendationResponse(
        user_id=request.user_id,
        recommendations=recommendations,
        algorithm="content_based_filtering",
        generated_at=datetime.utcnow(),
    )


@router.post("/recommendations/similar")
async def get_similar_products(request: SimilarProductsRequest):
    """Get products similar to a given product."""
    similar = recommendation_engine.get_similar_products(
        product_id=request.product_id,
        limit=request.limit,
    )
    
    return {
        "product_id": request.product_id,
        "similar_products": similar,
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.post("/interactions")
async def record_interaction(interaction: UserInteraction):
    """Record a user-product interaction for training."""
    recommendation_engine.record_interaction(
        user_id=interaction.user_id,
        product_id=interaction.product_id,
        interaction_type=interaction.interaction_type,
    )
    return {"status": "recorded", "interaction": interaction}


@router.post("/products")
async def add_product(product: Product):
    """Add a product to the recommendation engine."""
    recommendation_engine.add_product(
        product_id=product.id,
        category=product.category,
        tags=product.tags,
        price=product.price,
    )
    return {"status": "added", "product_id": product.id}


@router.get("/recommendations/trending")
async def get_trending(limit: int = 10):
    """Get trending products (placeholder)."""
    products = recommendation_engine._get_popular_products(limit)
    return {
        "trending": products,
        "generated_at": datetime.utcnow().isoformat(),
    }
