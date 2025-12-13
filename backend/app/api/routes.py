from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.spotify_service import SpotifyService
from app.services.supabase_service import SupabaseService
from app.schemas.track import TrackDownloadResponse
from app.core.rate_limiter import limiter

router = APIRouter()
spotify_service = SpotifyService()
supabase_service = SupabaseService()
@router.get("/songs", tags=["songs"])
def list_songs(page: int = 1, limit: int = 50):
    """
    List all songs from the Supabase bucket (demo only)
    - **page**: Page number (default 1)
    - **limit**: Number of songs per page (default 50)
    """
    result = supabase_service.list_songs(page=page, limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/track/download", response_model=TrackDownloadResponse)
@limiter.limit("60/30seconds")
def download_track(request: Request, track: str):
    """
    Download track information from Spotify API
    
    - **track**: Track name (e.g., "Lego House Ed Sheeran")
    - **Rate limit**: 60 requests per 30 seconds per IP
    """
    try:
        result = spotify_service.get_track_download(track)
        return TrackDownloadResponse(data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending/songs", tags=["trending"])
def get_trending_songs(limit: int = 10):
    """
    Get trending songs
    - **limit**: Number of trending songs to return (default 10)
    """
    result = supabase_service.get_trending_songs(limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/trending/albums", tags=["trending"])
def get_trending_albums(limit: int = 10):
    """
    Get trending albums
    - **limit**: Number of trending albums to return (default 10)
    """
    result = supabase_service.get_trending_albums(limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ResetPasswordRequest(BaseModel):
    email: str

class UpdatePasswordRequest(BaseModel):
    access_token: str
    new_password: str

@router.post("/auth/signup", tags=["auth"])
def signup_user(request: SignupRequest):
    """
    Create a new user account
    - **email**: User email address
    - **password**: User password
    - **name**: User display name
    """
    result = supabase_service.create_user(email=request.email, password=request.password, name=request.name)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/auth/login", tags=["auth"])
def login_user(request: LoginRequest):
    """
    Login user
    - **email**: User email address
    - **password**: User password
    """
    result = supabase_service.login_user(email=request.email, password=request.password)
    if result.get("error"):
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@router.post("/auth/reset-password", tags=["auth"])
def reset_password(request: ResetPasswordRequest):
    """
    Send password reset email
    - **email**: User email address
    """
    result = supabase_service.reset_password(email=request.email)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/auth/update-password", tags=["auth"])
def update_password(request: UpdatePasswordRequest):
    """
    Update user password with access token
    - **access_token**: Access token from reset email
    - **new_password**: New password
    """
    result = supabase_service.update_password(access_token=request.access_token, new_password=request.new_password)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/search", tags=["search"])
def search_songs(q: str, limit: int = 10):
    """
    Search for songs
    - **q**: Search query
    - **limit**: Number of results to return (default 10)
    """
    result = supabase_service.search_songs(query=q, limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

import base64
import uuid
from app.schemas.upload import SongUploadRequest

@router.post("/upload_song", tags=["songs"])
def upload_song(request: SongUploadRequest):
    """
    Upload a new song
    - **request**: Base64 encoded song data
    """
    try:
        # Helper to decode base64
        def decode_str(b64_str: str) -> str:
            if not b64_str: return None
            return base64.b64decode(b64_str).decode('utf-8')
        
        title = decode_str(request.title)
        artist = decode_str(request.artist)
        album = decode_str(request.album)
        cover_image_url = decode_str(request.cover_image)
        file_name = decode_str(request.file_name)
        content_type = decode_str(request.content_type)
        
        # Decode file content (bytes)
        file_content = base64.b64decode(request.file_content)
        
        # Generate storage path: artist/album/filename (sanitized) or just distinct UUID
        # Using UUID to avoid collisions
        file_path = f"{uuid.uuid4()}-{file_name}"
        
        # 1. Upload file to Storage
        uploaded_path = supabase_service.upload_file(file_content, file_path, content_type)
        
        # 2. Insert metadata to Database
        song_data = {
            "title": title,
            "artist": artist,
            "album": album,
            "cover_image_url": cover_image_url,
            "file_path": uploaded_path,
            "duration_seconds": 0 # You might want to extract this from the file if possible, or pass it in request
        }
        
        result = supabase_service.insert_song(song_data)
        return {"success": True, "data": result}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))