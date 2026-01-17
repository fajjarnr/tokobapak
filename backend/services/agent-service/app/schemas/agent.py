from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class AgentAction(BaseModel):
    action_type: str
    parameters: Dict[str, Any]
    target_service: str
    description: str


class AgentRequest(BaseModel):
    request_id: str
    user_id: str
    session_id: str
    message: str
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime


class AgentResponse(BaseModel):
    request_id: str
    response: str
    actions: List[AgentAction] = []
    context_updates: Dict[str, Any] = {}
    suggested_next_actions: List[str] = []
    metadata: Dict[str, Any] = {}
    processing_time_ms: int
    timestamp: datetime


class Intent(BaseModel):
    intent_id: str
    name: str
    confidence: float
    entities: List[Dict[str, Any]] = []
    sentiment: Optional[str] = None


class RecommendationRequest(BaseModel):
    request_id: str
    user_id: str
    recommendation_type: str = "product"
    context: Optional[Dict[str, Any]] = None
    limit: int = 10
    timestamp: datetime


class RecommendationResponse(BaseModel):
    request_id: str
    recommendations: List[Dict[str, Any]]
    explanation: str
    metadata: Dict[str, Any] = {}
    processing_time_ms: int
    timestamp: datetime


class SkillInfo(BaseModel):
    skill_id: str
    name: str
    description: str
    enabled: bool
    version: str


class SkillListResponse(BaseModel):
    skills: List[SkillInfo]
    total: int
    timestamp: datetime
