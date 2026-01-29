"""
Songs Routes
Handles song-related endpoints: listing, searching, liking
"""
from fastapi import APIRouter, HTTPException, Query
from app.services.music.song_service import SongService
from app.services.music.like_service import LikeService
from app.services.external.spotify_service import SpotifyService
from typing import Optional

router = APIRouter(prefix="/songs", tags=["songs"])
song_service = SongService()

def get_spotify_service():
    return SpotifyService()


@router.get("/")
async def list_songs(page: int = 1, limit: int = 20):
    """
    List songs with optimized pagination
    - **page**: Page number (default 1)
    - **limit**: Number of songs per page (default 20, max 50)
    """
    # Limit max results to prevent performance issues
    limit = min(limit, 50)
    
    result = song_service.list_songs(page=page, limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/search")
def search_songs(q: str, limit: int = 10):
    """
    Search for songs
    - **q**: Search query
    - **limit**: Number of results to return (default 10)
    """
    result = song_service.search_songs(query=q, limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/liked")
def get_liked_songs(user_id: str):
    """Get user's liked songs"""
    admin_like_service = LikeService(use_service_role=True)
    result = admin_like_service.get_liked_songs(user_id)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.post("/{song_id}/like")
def like_song(song_id: str, user_id: str):
    """Like a song"""
    admin_like_service = LikeService(use_service_role=True)
    result = admin_like_service.like_song(user_id, song_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.delete("/{song_id}/like")
def unlike_song(song_id: str, user_id: str):
    """Unlike a song"""
    admin_like_service = LikeService(use_service_role=True)
    result = admin_like_service.unlike_song(user_id, song_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/filter")
def filter_songs(
    title: Optional[str] = Query(None, description="Filter by song title"),
    artist: Optional[str] = Query(None, description="Filter by artist name"),
    album: Optional[str] = Query(None, description="Filter by album name"),
    genre: Optional[str] = Query(None, description="Filter by genre")
):
    """
    Filter songs by multiple criteria
    - **title**: Song title (partial match)
    - **artist**: Artist name (partial match)
    - **album**: Album name (partial match)
    - **genre**: Genre (partial match)
    """
    try:
        spotify_service = get_spotify_service()
        tracks = spotify_service.search_tracks(title=title, artist=artist, album=album, genre=genre)
        return {"tracks": tracks, "count": len(tracks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{song_id}/download")
def get_download_url(song_id: str):
    """
    Get download URL for a song
    - **song_id**: ID of the song to download
    """
    try:
        spotify_service = get_spotify_service()
        download_url = spotify_service.get_track_download_url(song_id)
        if not download_url:
            raise HTTPException(status_code=404, detail="Song not found or no file available")
        return {"download_url": download_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{song_id}/liked")
def check_song_liked(song_id: str, user_id: str):
    """Check if song is liked"""
    admin_like_service = LikeService(use_service_role=True)
    is_liked = admin_like_service.is_song_liked(user_id, song_id)
    return {"is_liked": is_liked}