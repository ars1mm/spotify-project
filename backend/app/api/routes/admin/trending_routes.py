"""
Admin Trending Management Routes
Handles admin operations for trending content management
"""
from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.services.admin.admin_service import AdminService
from app.middleware.admin_auth import verify_admin_token

router = APIRouter(
    prefix="/trending", 
    tags=["admin-trending"], 
    dependencies=[Depends(verify_admin_token)]
)


def get_admin_service() -> AdminService:
    return AdminService()


@router.post("/songs")
async def update_trending_songs(
    trending_data: List[Dict[str, Any]],
    admin_service: AdminService = Depends(get_admin_service)
):
    """Update trending songs rankings"""
    trending_songs = admin_service.update_trending_songs(trending_data)
    return {"message": f"Updated {len(trending_songs)} trending songs"}


@router.post("/albums")
async def update_trending_albums(
    albums_data: List[Dict[str, Any]],
    admin_service: AdminService = Depends(get_admin_service)
):
    """Update trending albums"""
    albums = admin_service.update_trending_albums(albums_data)
    return {"message": f"Updated {len(albums)} trending albums"}