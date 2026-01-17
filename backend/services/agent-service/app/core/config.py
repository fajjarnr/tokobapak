from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "TokoBapak Agent Service"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/tokobapak_agent"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    
    SEARCH_SERVICE_URL: str = "http://localhost:3006"
    RECOMMENDATION_SERVICE_URL: str = "http://localhost:3014"
    CART_SERVICE_URL: str = "http://localhost:3003"
    ORDER_SERVICE_URL: str = "http://localhost:3004"
    
    AUTH_SERVICE_URL: str = "http://localhost:3000"
    
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3008"]
    
    MAX_SKILL_EXECUTION_TIME: int = 30
    MAX_CONCURRENT_SKILLS: int = 5
    
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
