from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.recommendations import router as recommendations_router
from app.api.health import router as health_router

app = FastAPI(
    title="Recommendation Service",
    description="ML-based Product Recommendations for TokoBapak",
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
app.include_router(recommendations_router, prefix="/api/v1", tags=["Recommendations"])


@app.get("/")
async def root():
    return {"service": "recommendation-service", "status": "running"}
