from fastapi import FastAPI, Request
from app.api.routes import router
from app.core.config import settings
from app.core.rate_limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Spotify-like application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(router, prefix="/api/v1")

@app.get("/", tags=["health"])
@limiter.limit("60/30seconds")
def read_root(request: Request):
    """Health check endpoint"""
    return {"message": "Spotify Backend API"}