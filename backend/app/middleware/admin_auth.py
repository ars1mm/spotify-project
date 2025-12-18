from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import hashlib
import hmac
import secrets
import time
from datetime import datetime

# auto_error=True ensures 403 is returned if no Bearer token is provided
security = HTTPBearer(auto_error=True)

# Key rotation settings
KEY_ROTATION_INTERVAL_SECONDS = int(os.getenv("ADMIN_KEY_ROTATION_SECONDS", "3600"))  # Default: 1 hour

# Admin key state
_generated_admin_key: str | None = None
_key_created_at: float = 0

def _create_new_key() -> str:
    """Create a new SHA-256 admin key"""
    random_bytes = secrets.token_bytes(32)
    return hashlib.sha256(random_bytes).hexdigest()

def rotate_admin_key() -> str:
    """Force rotate the admin key and return the new key"""
    global _generated_admin_key, _key_created_at
    _generated_admin_key = _create_new_key()
    _key_created_at = time.time()
    
    expiry_time = datetime.fromtimestamp(_key_created_at + KEY_ROTATION_INTERVAL_SECONDS)
    print(f"\n{'='*60}")
    print(f"ADMIN KEY ROTATED: {_generated_admin_key}")
    print(f"Expires at: {expiry_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    return _generated_admin_key

def get_admin_key() -> str:
    """Get the current admin key (generates/rotates if needed)"""
    global _generated_admin_key, _key_created_at
    
    current_time = time.time()
    
    # Check if key needs rotation (expired or doesn't exist)
    if _generated_admin_key is None or (current_time - _key_created_at) >= KEY_ROTATION_INTERVAL_SECONDS:
        return rotate_admin_key()
    
    return _generated_admin_key

def get_key_expiry_info() -> dict:
    """Get information about the current key's expiry"""
    global _key_created_at
    
    if _key_created_at == 0:
        return {"message": "No key generated yet"}
    
    current_time = time.time()
    time_remaining = KEY_ROTATION_INTERVAL_SECONDS - (current_time - _key_created_at)
    
    if time_remaining <= 0:
        return {"expired": True, "message": "Key has expired, will rotate on next use"}
    
    expiry_time = datetime.fromtimestamp(_key_created_at + KEY_ROTATION_INTERVAL_SECONDS)
    return {
        "expired": False,
        "expires_at": expiry_time.isoformat(),
        "seconds_remaining": int(time_remaining),
        "rotation_interval_seconds": KEY_ROTATION_INTERVAL_SECONDS
    }

def verify_admin_key(provided_key: str) -> bool:
    """Verify if the provided key matches the admin key"""
    admin_key = get_admin_key()
    # Use constant-time comparison to prevent timing attacks
    return hmac.compare_digest(provided_key, admin_key)

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin access token using SHA-256 hash comparison"""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    token = credentials.credentials
    
    # Verify against the generated admin key
    if verify_admin_key(token):
        return True
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid admin token"
    )