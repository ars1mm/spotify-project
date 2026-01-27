"""
Admin Maintenance Routes
Handles admin maintenance and system operations
"""
from fastapi import APIRouter, Depends, HTTPException
from app.services.admin.admin_service import AdminService
from app.services.music.artist_service import ArtistService
from app.middleware.admin_auth import verify_admin_token

router = APIRouter(
    prefix="/admin/maintenance", 
    tags=["admin-maintenance"], 
    dependencies=[Depends(verify_admin_token)]
)


def get_admin_service() -> AdminService:
    return AdminService()


def get_artist_service() -> ArtistService:
    return ArtistService(use_service_role=True)


@router.post("/cleanup")
async def cleanup_orphaned_data(
    admin_service: AdminService = Depends(get_admin_service)
):
    """Clean up orphaned records"""
    result = admin_service.cleanup_orphaned_data()
    return {"message": "Cleanup completed", "removed": result}


@router.get("/artists")
async def get_artists(
    artist_service: ArtistService = Depends(get_artist_service)
):
    """Get list of unique artist names"""
    try:
        artists = artist_service.get_unique_artists()
        return {"artists": artists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))