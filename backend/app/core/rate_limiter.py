from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
import os

# Try Redis first, fallback to memory storage
try:
    redis_url = os.getenv("REDIS_URL")
    if redis_url and not redis_url.startswith("redis://localhost"):
        # Test Redis connection only for non-localhost URLs
        import redis
        r = redis.from_url(redis_url, socket_connect_timeout=5)
        r.ping()  # Test connection
        storage_uri = redis_url
        print(f"Using Redis for rate limiting: {redis_url}")
    else:
        storage_uri = "memory://"
        print("Using memory storage for rate limiting")
except Exception as e:
    print(f"Redis connection failed: {e}. Using memory storage for rate limiting")
    storage_uri = "memory://"

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri,
    default_limits=["60/30seconds"]
)