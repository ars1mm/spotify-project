"""
Admin Analytics Routes
Handles admin analytics and reporting functionality
"""
from fastapi import APIRouter, Depends
from app.services.admin.admin_service import AdminService
from app.middleware.admin_auth import verify_admin_token

router = APIRouter(
    prefix="/analytics", 
    tags=["admin-analytics"], 
    dependencies=[Depends(verify_admin_token)]
)


def get_admin_service() -> AdminService:
    return AdminService()

# Nuk eshte implementuar ne service
@router.get("/song/{song_id}")
async def get_song_analytics(
    song_id: str,
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get song analytics"""
    return admin_service.get_song_analytics(song_id)

# Nuk eshte implementuar ne service
@router.get("/top-songs")
async def get_top_songs(
    limit: int = 50,
    admin_service: AdminService = Depends(get_admin_service)
):
    """Get top songs by play count"""
    return admin_service.get_top_songs(limit)