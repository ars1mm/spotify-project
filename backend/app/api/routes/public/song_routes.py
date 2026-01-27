"""
Songs Routes
Handles song-related endpoints: listing, searching, liking
"""
from fastapi import APIRouter, HTTPException
from app.services.music.song_service import SongService
from app.services.music.like_service import LikeService

router = APIRouter(prefix="/songs", tags=["songs"])
song_service = SongService()


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


@router.get("/{song_id}/liked")
def check_song_liked(song_id: str, user_id: str):
    """Check if song is liked"""
    admin_like_service = LikeService(use_service_role=True)
    is_liked = admin_like_service.is_song_liked(user_id, song_id)
    return {"is_liked": is_liked}