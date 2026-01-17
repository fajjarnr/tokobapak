import random
from datetime import datetime
from typing import Optional
import numpy as np


class RecommendationEngine:
    """Simple collaborative filtering recommendation engine."""
    
    def __init__(self):
        # In-memory storage for demo
        self.user_interactions: dict[str, list[str]] = {}
        self.product_features: dict[str, dict] = {}
        
    def record_interaction(self, user_id: str, product_id: str, interaction_type: str):
        """Record user-product interaction."""
        if user_id not in self.user_interactions:
            self.user_interactions[user_id] = []
        self.user_interactions[user_id].append(product_id)
    
    def add_product(self, product_id: str, category: str, tags: list[str], price: float):
        """Add product features for content-based filtering."""
        self.product_features[product_id] = {
            "category": category,
            "tags": tags,
            "price": price,
        }
    
    def get_personalized_recommendations(
        self, user_id: str, limit: int = 10, category: Optional[str] = None
    ) -> list[dict]:
        """Get personalized recommendations based on user history."""
        user_history = self.user_interactions.get(user_id, [])
        
        if not user_history:
            # New user: return popular items
            return self._get_popular_products(limit, category)
        
        # Content-based: find similar products to user's history
        recommendations = self._content_based_filter(user_history, limit, category)
        return recommendations
    
    def get_similar_products(self, product_id: str, limit: int = 5) -> list[dict]:
        """Get products similar to the given product."""
        if product_id not in self.product_features:
            return self._get_popular_products(limit)
        
        target = self.product_features[product_id]
        similar = []
        
        for pid, features in self.product_features.items():
            if pid == product_id:
                continue
            
            score = self._calculate_similarity(target, features)
            similar.append({"product_id": pid, "score": score})
        
        similar.sort(key=lambda x: x["score"], reverse=True)
        return similar[:limit]
    
    def _calculate_similarity(self, product1: dict, product2: dict) -> float:
        """Calculate similarity score between two products."""
        score = 0.0
        
        # Category match
        if product1.get("category") == product2.get("category"):
            score += 0.5
        
        # Tag overlap
        tags1 = set(product1.get("tags", []))
        tags2 = set(product2.get("tags", []))
        if tags1 and tags2:
            overlap = len(tags1 & tags2) / len(tags1 | tags2)
            score += overlap * 0.3
        
        # Price similarity (closer prices = higher score)
        price1 = product1.get("price", 0)
        price2 = product2.get("price", 0)
        if price1 > 0 and price2 > 0:
            price_ratio = min(price1, price2) / max(price1, price2)
            score += price_ratio * 0.2
        
        return round(score, 3)
    
    def _content_based_filter(
        self, user_history: list[str], limit: int, category: Optional[str] = None
    ) -> list[dict]:
        """Content-based filtering using user history."""
        all_scores = {}
        
        for viewed_product in user_history:
            similar = self.get_similar_products(viewed_product, limit * 2)
            for item in similar:
                pid = item["product_id"]
                if pid not in user_history:
                    if pid not in all_scores:
                        all_scores[pid] = 0
                    all_scores[pid] += item["score"]
        
        recommendations = [
            {"product_id": pid, "score": score}
            for pid, score in all_scores.items()
        ]
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:limit]
    
    def _get_popular_products(self, limit: int, category: Optional[str] = None) -> list[dict]:
        """Return popular products (placeholder for actual analytics)."""
        products = list(self.product_features.keys())
        if category:
            products = [
                p for p in products
                if self.product_features.get(p, {}).get("category") == category
            ]
        
        random.shuffle(products)
        return [{"product_id": p, "score": 0.5} for p in products[:limit]]


# Global engine instance
recommendation_engine = RecommendationEngine()
