from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.services.admin_service import AdminService
from app.middleware.admin_auth import verify_admin_token
import uuid

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(verify_admin_token)])

def get_admin_service() -> AdminService:
    return AdminService()

@router.post("/songs/bulk")
async def bulk_create_songs(
    songs_data: List[Dict[str, Any]],
    admin_service: AdminService = Depends(get_admin_service)
):
    """Bulk insert songs"""
    try:
        songs = admin_service.bulk_insert_songs(songs_data)
        return {"message": f"Successfully created {len(songs)} songs", "songs": songs}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/songs/{song_id}")
async def update_song(
    song_id: str,
    update_data: Dict[str, Any],
    admin_service: AdminService = Depends(get_admin_service)
):
    """Update song information"""
    song = admin_service.update_song(song_id, update_data)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.post("/trending/songs")
async def update_trending_songs(
    trending_data: List[Dict[str, Any]],
    admin_service: AdminService = Depends(get_admin_service)
):
    """Update trending songs rankings"""
    trending_songs = admin_service.update_trending_songs(trending_data)
    return {"message": f"Updated {len(trending_songs)} trending songs"}

@router.post("/trending/albums")
async def update_trending_albums(
    albums_data: List[Dict[str, Any]],
    admin_service: AdminService = Depends(get_admin_service)
):
    """Update trending albums"""
    albums = admin_service.update_trending_albums(albums_data)
    return {"message": f"Updated {len(albums)} trending albums"}

@router.get("/analytics/song/{song_id}")
async def get_song_analytics(
    song_id: str,
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get song analytics"""
    return admin_service.get_song_analytics(song_id)

@router.get("/analytics/top-songs")
async def get_top_songs(
    limit: int = 50,
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get top songs by play count"""
    return admin_service.get_top_songs(limit)

@router.post("/maintenance/cleanup")
async def cleanup_orphaned_data(
    admin_service: AdminService = Depends(get_admin_service)
):
    """Clean up orphaned records"""
    result = admin_service.cleanup_orphaned_data()
    return {"message": "Cleanup completed", "removed": result}