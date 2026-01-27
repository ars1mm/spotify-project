"""
Trending Routes
Handles trending content endpoints: songs, albums
"""
from fastapi import APIRouter, HTTPException
from app.services.music.trending_service import TrendingService

router = APIRouter(prefix="/trending", tags=["trending"])
trending_service = TrendingService()


@router.get("/songs")
def get_trending_songs(limit: int = 10):
    """
    Get trending songs
    - **limit**: Number of trending songs to return (default 10)
    """
    result = trending_service.get_trending_songs(limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/albums")
def get_trending_albums(limit: int = 10):
    """
    Get trending albums
    - **limit**: Number of trending albums to return (default 10)
    """
    result = trending_service.get_trending_albums(limit=limit)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result