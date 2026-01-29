"""
Admin Authentication Routes
Handles admin login, key management, and authentication
"""
from fastapi import APIRouter, HTTPException, status, Query
from app.middleware.admin_auth import (
    verify_admin_key, 
    get_key_expiry_info, 
    rotate_admin_key
)

router = APIRouter(tags=["admin-auth"])


@router.get("/login")
async def admin_login(key: str = Query(..., description="The SHA-512 admin key")):
    """
    Admin login endpoint - validates the provided SHA-512 key
    Usage: /api/v1/admin/login?key={your_sha512_key}
    """
    try:
        print(f"Login attempt with key: {key[:8]}...")
        is_valid = verify_admin_key(key)
        print(f"Key valid: {is_valid}")
        
        if is_valid:
            expiry_info = get_key_expiry_info()
            return {
                "success": True,
                "message": "Admin authentication successful",
                "token": key,
                "key_expiry": expiry_info
            }
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin key"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/key-hint")
async def get_key_hint():
    """
    Returns a hint about where to find the admin key (for development only).
    In production, this should be disabled or removed.
    """
    expiry_info = get_key_expiry_info()
    return {
        "message": "The admin key is printed in the backend console on startup. Look for '🔐 ADMIN KEY ROTATED:'",
        "hint": "Check the terminal where uvicorn is running",
        "key_expiry": expiry_info
    }


@router.get("/current-key")
async def get_current_key():
    """
    Get the current admin key (for development only).
    WARNING: This should be disabled in production!
    """
    from app.middleware.admin_auth import get_admin_key
    current_key = get_admin_key()
    expiry_info = get_key_expiry_info()
    return {
        "current_key": current_key,
        "key_expiry": expiry_info,
        "login_url": f"/api/v1/admin/login?key={current_key}",
        "warning": "This endpoint should be disabled in production!"
    }


@router.post("/key/rotate")
async def force_rotate_key():
    """
    Force rotate the admin key immediately.
    Returns the new key. Use this if you suspect the key has been compromised.
    """
    new_key = rotate_admin_key()
    expiry_info = get_key_expiry_info()
    return {
        "success": True,
        "message": "Admin key rotated successfully",
        "new_key": new_key,
        "key_expiry": expiry_info
    }


@router.get("/key/status")
async def get_key_status():
    """
    Get the current admin key's expiry status.
    """
    return get_key_expiry_info()