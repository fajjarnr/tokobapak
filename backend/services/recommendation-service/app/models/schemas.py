from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Product(BaseModel):
    id: str
    name: str
    category: str
    brand: Optional[str] = None
    price: float
    tags: list[str] = []


class UserInteraction(BaseModel):
    user_id: str
    product_id: str
    interaction_type: str  # view, purchase, cart_add, wishlist
    timestamp: Optional[datetime] = None


class RecommendationRequest(BaseModel):
    user_id: str
    limit: int = 10
    category: Optional[str] = None


class SimilarProductsRequest(BaseModel):
    product_id: str
    limit: int = 5


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: list[dict]
    algorithm: str
    generated_at: datetime
