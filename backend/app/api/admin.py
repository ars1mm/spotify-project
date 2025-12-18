from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict, Any
from app.services.admin_service import AdminService
from app.services.supabase_service import SupabaseService
from app.middleware.admin_auth import verify_admin_token, verify_admin_key, get_admin_key, get_key_expiry_info, rotate_admin_key
from app.schemas.upload import SongUploadRequest
import uuid
import base64

# Public router for admin login (no auth required)
public_router = APIRouter(prefix="/admin", tags=["admin-auth"])

@public_router.get("/login")
async def admin_login(key: str = Query(..., description="The SHA-256 admin key")):
    """
    Admin login endpoint - validates the provided SHA-256 key
    Usage: /api/v1/admin/login?key={your_sha256_key}
    """
    try:
        print(f"Login attempt with key: {key[:8]}...")
        is_valid = verify_admin_key(key)
        print(f"Key valid: {is_valid}")
        
        if is_valid:
            expiry_info = get_key_expiry_info()
            return {
                "success": True,
                "message": "Admin authentication successful",
                "token": key,  # Return the key as the bearer token to use
                "key_expiry": expiry_info
            }
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin key"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@public_router.get("/key-hint")
async def get_key_hint():
    """
    Returns a hint about where to find the admin key (for development only).
    In production, this should be disabled or removed.
    """
    expiry_info = get_key_expiry_info()
    return {
        "message": "The admin key is printed in the backend console on startup. Look for '🔐 ADMIN KEY ROTATED:'",
        "hint": "Check the terminal where uvicorn is running",
        "key_expiry": expiry_info
    }

# Protected router for admin operations (requires auth)
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(verify_admin_token)])

@router.post("/key/rotate")
async def force_rotate_key():
    """
    Force rotate the admin key immediately.
    Returns the new key. Use this if you suspect the key has been compromised.
    """
    new_key = rotate_admin_key()
    expiry_info = get_key_expiry_info()
    return {
        "success": True,
        "message": "Admin key rotated successfully",
        "new_key": new_key,
        "key_expiry": expiry_info
    }

@router.get("/key/status")
async def get_key_status():
    """
    Get the current admin key's expiry status.
    """
    return get_key_expiry_info()

def get_admin_service() -> AdminService:
    return AdminService()

def get_supabase_service() -> SupabaseService:
    """Get SupabaseService with service role key for admin operations"""
    return SupabaseService(use_service_role=True)

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

@router.delete("/songs/{song_id}")
async def delete_song(
    song_id: str,
    supabase_service: SupabaseService = Depends(get_supabase_service)
):
    """Delete a song and its associated file"""
    try:
        result = supabase_service.delete_song(song_id)
        return {"success": True, "message": "Song deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/songs")
async def list_all_songs(
    page: int = 1,
    limit: int = 50,
    supabase_service: SupabaseService = Depends(get_supabase_service)
):
    """List all songs for admin management"""
    try:
        result = supabase_service.list_songs(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/artists")
async def get_artists(
    supabase_service: SupabaseService = Depends(get_supabase_service)
):
    """Get list of unique artist names"""
    try:
        artists = supabase_service.get_unique_artists()
        return {"artists": artists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/songs/upload")
async def upload_song(
    request: SongUploadRequest,
    supabase_service: SupabaseService = Depends(get_supabase_service)
):
    """
    Upload a new song (Admin only)
    - **request**: Base64 encoded song data with metadata
    """
    try:
        # Helper to decode base64
        def decode_str(b64_str: str) -> str:
            if not b64_str: return None
            return base64.b64decode(b64_str).decode('utf-8')
        
        title = decode_str(request.title)
        artist = decode_str(request.artist)
        album = decode_str(request.album) or "Unknown"
        cover_file_name = decode_str(request.cover_file_name)
        cover_content_type = decode_str(request.cover_content_type)
        file_name = decode_str(request.file_name)
        content_type = decode_str(request.content_type)
        
        # Decode file content (bytes)
        file_content = base64.b64decode(request.file_content)
        cover_file_content = base64.b64decode(request.cover_file_content)
        
        # Calculate duration from audio file metadata
        duration_seconds = request.duration_seconds or 174  # Use provided or default
        try:
            import io
            from mutagen import File as MutagenFile
            
            # Try to extract duration from audio metadata
            audio_file = MutagenFile(io.BytesIO(file_content))
            if audio_file and hasattr(audio_file, 'info') and hasattr(audio_file.info, 'length'):
                duration_seconds = int(audio_file.info.length)
        except Exception as e:
            print(f"Could not extract duration: {e}")
            # Keep the provided duration or default
        
        # Sanitize filename for Supabase Storage
        import re
        sanitized_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file_name)
        # Remove songs/ prefix since it's already in the bucket path
        file_path = f"{artist.lower().replace(' ', '_')}_{title.lower().replace(' ', '_')}.mp3"
        
        # If file_path in database has songs/ prefix, remove it for storage
        storage_path = file_path.replace('songs/', '') if file_path.startswith('songs/') else file_path
        
        # Generate cover image path
        cover_ext = cover_file_name.split('.')[-1] if '.' in cover_file_name else 'jpg'
        cover_path = f"{artist.lower().replace(' ', '_')}_{title.lower().replace(' ', '_')}.{cover_ext}"
        
        # 1. Upload cover image to covers bucket
        cover_url = supabase_service.upload_cover(cover_file_content, cover_path, cover_content_type)
        
        # 2. Upload audio file to songs bucket
        uploaded_path = supabase_service.upload_file(file_content, storage_path, content_type)
        
        # 3. Insert metadata to Database with proper structure
        song_data = {
            "title": title,
            "artist": artist,
            "album": album,
            "duration_seconds": duration_seconds,
            "file_path": storage_path,
            "cover_image_url": cover_url
        }
        
        result = supabase_service.insert_song(song_data)
        return {"success": True, "data": result}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))