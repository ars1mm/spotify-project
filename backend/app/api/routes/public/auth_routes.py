"""
Authentication Routes
Handles user authentication endpoints: signup, login, password reset
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthService()


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    captcha_token: str = None


class LoginRequest(BaseModel):
    email: str
    password: str
    captcha_token: str = None


class ResetPasswordRequest(BaseModel):
    email: str
    captcha_token: str = None


class UpdatePasswordRequest(BaseModel):
    access_token: str
    refresh_token: str = ""
    new_password: str


@router.post("/signup")
def signup_user(request: SignupRequest):
    """
    Create a new user account
    - **email**: User email address
    - **password**: User password
    - **name**: User display name
    """
    result = auth_service.create_user(
        email=request.email, 
        password=request.password, 
        name=request.name
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/login")
def login_user(request: LoginRequest):
    """
    Login user
    - **email**: User email address
    - **password**: User password
    """
    result = auth_service.login_user(
        email=request.email, 
        password=request.password
    )
    if result.get("error"):
        raise HTTPException(status_code=401, detail=result["error"])
    return result


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    """
    Send password reset email
    - **email**: User email address
    """
    result = auth_service.reset_password(email=request.email)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/update-password")
def update_password(request: UpdatePasswordRequest):
    """
    Update user password with access token
    - **access_token**: Access token from reset email
    - **refresh_token**: Refresh token from reset email (optional)
    - **new_password**: New password
    """
    result = auth_service.update_password(
        access_token=request.access_token,
        refresh_token=request.refresh_token,
        new_password=request.new_password
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result