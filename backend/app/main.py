import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.admin import router as admin_router, public_router as admin_public_router
from app.api.codebase import router as codebase_router
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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(router, prefix="/api/v1")
app.include_router(admin_public_router, prefix="/api/v1")  # Public admin routes (login)
app.include_router(admin_router, prefix="/api/v1")  # Protected admin routes
app.include_router(codebase_router, prefix="/api/v1")  # Codebase explorer routes

@app.on_event("startup")
async def startup_event():
    # Generate admin key on startup
    from app.middleware.admin_auth import get_admin_key
    admin_key = get_admin_key()
    
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
    logging.info(f"[*]Admin Login: http://{display_host}:{port}/api/v1/admin/login?key={{YOUR_KEY}}")
    logging.info(f"[*]Codebase Explorer: http://{display_host}:{port}/api/v1/codebase")

@app.get("/", tags=["health"])
@limiter.limit("60/30seconds")
def read_root(request: Request):
    """Health check endpoint"""
    return {"message": "Spotify Backend API"}