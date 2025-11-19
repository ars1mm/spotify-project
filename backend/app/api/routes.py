from fastapi import APIRouter, HTTPException, Request
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