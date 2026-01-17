from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class SkillStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"
    SKIPPED = "skipped"


class SkillMetadata(BaseModel):
    skill_id: str
    name: str
    description: str
    version: str
    author: str = "TokoBapak"
    category: str = ""
    tags: List[str] = []
    supported_intents: List[str]
    required_context: List[str]
    dependencies: List[str]
    priority: int
    enabled: bool
    created_at: datetime
    updated_at: datetime


class ValidationResult(BaseModel):
    is_valid: bool
    missing_context: List[str]
    errors: List[str]


class SkillResult(BaseModel):
    skill_id: str
    status: SkillStatus
    data: Optional[Dict[str, Any]] = None
    message: str
    requires_followup: bool = False
    suggested_actions: List[str] = []
    next_intent: Optional[str] = None
    execution_time_ms: int = 0
    metadata: Dict[str, Any] = {}


class BaseSkill(ABC):
    def __init__(self):
        self.skill_id: str = ""
        self.name: str = ""
        self.description: str = ""
        self.version: str = "1.0.0"
        self.enabled: bool = True
        self.supported_intents: List[str] = []
        self.required_context: List[str] = []
        self.dependencies: List[str] = []
        self.priority: int = 0
        self._config: Dict[str, Any] = {}
    
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> SkillResult:
        pass
    
    @abstractmethod
    def can_handle(self, intent: str, context: Dict[str, Any]) -> bool:
        pass
    
    def validate_context(self, context: Dict[str, Any]) -> ValidationResult:
        missing = [key for key in self.required_context if key not in context]
        return ValidationResult(
            is_valid=len(missing) == 0,
            missing_context=missing,
            errors=[] if len(missing) == 0 else [f"Missing required context: {', '.join(missing)}"]
        )
    
    def configure(self, config: Dict[str, Any]) -> None:
        self._config.update(config)
    
    def get_metadata(self) -> SkillMetadata:
        return SkillMetadata(
            skill_id=self.skill_id,
            name=self.name,
            description=self.description,
            version=self.version,
            category=self.__class__.__bases__[0].__name__ if self.__class__.__bases__ else "",
            tags=[],
            supported_intents=self.supported_intents,
            required_context=self.required_context,
            dependencies=self.dependencies,
            priority=self.priority,
            enabled=self.enabled,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    
    async def pre_execute(self, context: Dict[str, Any]) -> None:
        pass
    
    async def post_execute(self, result: SkillResult, context: Dict[str, Any]) -> SkillResult:
        return result
