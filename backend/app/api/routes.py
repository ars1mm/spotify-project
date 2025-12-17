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
    - **refresh_token**: Refresh token from reset email (optional)
    - **new_password**: New password
    """
    result = supabase_service.update_password(access_token=request.access_token, refresh_token=request.refresh_token, new_password=request.new_password)
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

class CreatePlaylistRequest(BaseModel):
    name: str
    description: str = ""
    is_public: bool = True
    user_id: str
    song_ids: list = []

@router.post("/playlists", tags=["playlists"])
def create_playlist(request: CreatePlaylistRequest):
    """
    Create a new playlist
    """
    # Use service role for playlist creation to bypass RLS
    admin_service = SupabaseService(use_service_role=True)
    result = admin_service.create_playlist(
        name=request.name,
        description=request.description,
        is_public=request.is_public,
        user_id=request.user_id,
        song_ids=request.song_ids
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/playlists", tags=["playlists"])
def get_playlists(user_id: str = None, public_only: bool = False):
    """
    Get playlists
    """
    result = supabase_service.get_playlists(user_id=user_id, public_only=public_only)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.get("/playlists/{playlist_id}", tags=["playlists"])
def get_playlist(playlist_id: str):
    """
    Get a specific playlist with its songs
    """
    result = supabase_service.get_playlist_by_id(playlist_id)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result

class UpdatePlaylistRequest(BaseModel):
    name: str = None
    description: str = None
    is_public: bool = None

@router.put("/playlists/{playlist_id}", tags=["playlists"])
def update_playlist(playlist_id: str, request: UpdatePlaylistRequest):
    """
    Update playlist details
    """
    admin_service = SupabaseService(use_service_role=True)
    result = admin_service.update_playlist(playlist_id, request.name, request.description, request.is_public)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.delete("/playlists/{playlist_id}/songs/{song_id}", tags=["playlists"])
def remove_song_from_playlist(playlist_id: str, song_id: str):
    """
    Remove a song from playlist
    """
    admin_service = SupabaseService(use_service_role=True)
    result = admin_service.remove_song_from_playlist(playlist_id, song_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

# Upload endpoint moved to admin routes (/api/v1/admin/songs/upload)
# This ensures only authenticated admins can upload songs