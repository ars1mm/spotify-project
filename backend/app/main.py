import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.admin import router as admin_router
from app.core.config import settings
from app.core.rate_limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Spotify-like application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    host = os.getenv("HOST", "127.0.0.1")
    port = os.getenv("PORT", "8000")
    env = os.getenv("APP_ENV", "development")
    
    if host == "0.0.0.0":
        display_host = "127.0.0.1"
    else:
        display_host = host
    
    logging.info(f"[SERVER]Spotify Backend API started")
    logging.info(f"[*]Environment: {env}")
    logging.info(f"[*]Server: http://{display_host}:{port}")
    logging.info(f"[*]Docs: http://{display_host}:{port}/docs")

@app.get("/", tags=["health"])
@limiter.limit("60/30seconds")
def read_root(request: Request):
    """Health check endpoint"""
    return {"message": "Spotify Backend API"}