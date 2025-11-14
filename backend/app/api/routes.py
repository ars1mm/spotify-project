from fastapi import APIRouter, HTTPException
from app.services.spotify_service import SpotifyService
from app.schemas.track import TrackDownloadResponse

router = APIRouter()
spotify_service = SpotifyService()

@router.get("/track/download", response_model=TrackDownloadResponse)
def download_track(track: str):
    """
    Download track information from Spotify API
    
    - **track**: Track name (e.g., "Lego House Ed Sheeran")
    """
    try:
        result = spotify_service.get_track_download(track)
        return TrackDownloadResponse(data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))