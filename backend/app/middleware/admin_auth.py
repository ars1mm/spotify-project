from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

security = HTTPBearer()

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin access token"""
    token = credentials.credentials
    
    # Simple admin key check
    admin_key = os.getenv("ADMIN_SECRET_KEY", "admin-secret-key-123")
    if token == admin_key:
        return True
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid admin token"
    )