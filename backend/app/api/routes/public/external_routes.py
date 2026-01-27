"""
DISABLED API SERVICE - NO SPOTIFY KEY AVAILABLE
External API Routes
Handles external service integrations: Spotify API, track downloads
"""
from fastapi import APIRouter, HTTPException, Request
from app.services.external.spotify_service import SpotifyService
from app.schemas.track import TrackDownloadResponse
from app.core.rate_limiter import limiter

router = APIRouter(prefix="/external", tags=["external"])
spotify_service = SpotifyService()


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