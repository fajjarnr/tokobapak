from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analytics import router as analytics_router
from app.api.health import router as health_router

app = FastAPI(
    title="Analytics Service",
    description="Business Analytics for TokoBapak",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["Health"])
app.include_router(analytics_router, prefix="/api/v1", tags=["Analytics"])


@app.get("/")
async def root():
    return {"service": "analytics-service", "status": "running"}
