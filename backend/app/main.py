from fastapi import FastAPI
from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Spotify-like application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(router, prefix="/api/v1", tags=["tracks"])

@app.get("/", tags=["health"])
def read_root():
    """Health check endpoint"""
    return {"message": "Spotify Backend API"}