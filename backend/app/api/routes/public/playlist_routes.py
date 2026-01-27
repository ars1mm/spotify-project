"""
Playlist Routes
Handles playlist-related endpoints: CRUD operations, song management
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.music.playlist_service import PlaylistService

router = APIRouter(prefix="/playlists", tags=["playlists"])


class CreatePlaylistRequest(BaseModel):
    name: str
    description: str = ""
    is_public: bool = True
    user_id: str
    song_ids: list = []


class UpdatePlaylistRequest(BaseModel):
    name: str = None
    description: str = None
    is_public: bool = None


@router.post("/")
def create_playlist(request: CreatePlaylistRequest):
    """Create a new playlist"""
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.create_playlist(
        name=request.name,
        description=request.description,
        is_public=request.is_public,
        user_id=request.user_id,
        song_ids=request.song_ids
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/")
def get_playlists(user_id: str = None, public_only: bool = False):
    """
    Get playlists - returns user's own playlists (public + private) plus other public playlists
    """
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.get_playlists(user_id=user_id, public_only=public_only)
    if result.get("error"):
        raise HTTPException(status_code=500, detail=result["error"])
    return result


@router.get("/private")
def get_private_playlists(user_id: str):
    """Get only user's private playlists"""
    try:
        playlist_service = PlaylistService()
        private_playlists = (
            playlist_service.supabase.table("playlists")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_public", False)
            .order("created_at", desc=True)
            .execute()
        )
        return {"playlists": private_playlists.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{playlist_id}")
def get_playlist(playlist_id: str):
    """Get a specific playlist with its songs"""
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.get_playlist_by_id(playlist_id)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.put("/{playlist_id}")
def update_playlist(playlist_id: str, request: UpdatePlaylistRequest):
    """Update playlist details"""
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.update_playlist(
        playlist_id, 
        request.name, 
        request.description, 
        request.is_public
    )
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.delete("/{playlist_id}")
def delete_playlist(playlist_id: str, user_id: str):
    """Delete a playlist (only owner can delete)"""
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.delete_playlist(playlist_id, user_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{playlist_id}/songs/{song_id}")
def add_song_to_playlist(playlist_id: str, song_id: str):
    """Add a song to playlist"""
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.add_song_to_playlist(playlist_id, song_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.delete("/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(playlist_id: str, song_id: str):
    """Remove a song from playlist"""
    admin_playlist_service = PlaylistService(use_service_role=True)
    result = admin_playlist_service.remove_song_from_playlist(playlist_id, song_id)
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result