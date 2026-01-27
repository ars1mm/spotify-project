"""
Admin Song Management Routes
Handles admin-only song operations: CRUD, upload, bulk operations
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.services.music.song_service import SongService
from app.services.external.storage_service import StorageService
from app.middleware.admin_auth import verify_admin_token
from app.schemas.upload import SongUploadRequest
import base64

router = APIRouter(
    prefix="/admin/songs", 
    tags=["admin-songs"], 
    dependencies=[Depends(verify_admin_token)]
)


def get_song_service() -> SongService:
    return SongService(use_service_role=True)


def get_storage_service() -> StorageService:
    return StorageService(use_service_role=True)


@router.get("/")
async def list_all_songs(
    page: int = 1,
    limit: int = 50,
    song_service: SongService = Depends(get_song_service)
):
    """List all songs for admin management"""
    try:
        result = song_service.list_songs(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk")
async def bulk_create_songs(
    songs_data: List[Dict[str, Any]],
    song_service: SongService = Depends(get_song_service)
):
    """Bulk insert songs"""
    try:
        from app.services.admin.admin_service import AdminService
        admin_service = AdminService()
        songs = admin_service.bulk_insert_songs(songs_data)
        return {"message": f"Successfully created {len(songs)} songs", "songs": songs}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{song_id}")
async def update_song(
    song_id: str,
    update_data: Dict[str, Any],
    song_service: SongService = Depends(get_song_service)
):
    """Update song information"""
    from app.services.admin.admin_service import AdminService
    admin_service = AdminService()
    song = admin_service.update_song(song_id, update_data)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.delete("/{song_id}")
async def delete_song(
    song_id: str,
    song_service: SongService = Depends(get_song_service)
):
    """Delete a song and its associated file"""
    try:
        result = song_service.delete_song(song_id)
        return {"success": True, "message": "Song deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_song(
    request: SongUploadRequest,
    song_service: SongService = Depends(get_song_service),
    storage_service: StorageService = Depends(get_storage_service)
):
    """
    Upload a new song (Admin only)
    - **request**: Base64 encoded song data with metadata
    """
    try:
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
        
        file_content = base64.b64decode(request.file_content)
        cover_file_content = base64.b64decode(request.cover_file_content)
        
        duration_seconds = request.duration_seconds or 174
        try:
            import io
            from mutagen import File as MutagenFile
            
            audio_file = MutagenFile(io.BytesIO(file_content))
            if audio_file and hasattr(audio_file, 'info') and hasattr(audio_file.info, 'length'):
                duration_seconds = int(audio_file.info.length)
        except Exception as e:
            print(f"Could not extract duration: {e}")
        
        import re
        sanitized_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file_name)
        file_path = f"{artist.lower().replace(' ', '_')}_{title.lower().replace(' ', '_')}.mp3"
        
        storage_path = file_path.replace('songs/', '') if file_path.startswith('songs/') else file_path
        
        cover_ext = cover_file_name.split('.')[-1] if '.' in cover_file_name else 'jpg'
        cover_path = f"{artist.lower().replace(' ', '_')}_{title.lower().replace(' ', '_')}.{cover_ext}"
        
        cover_url = storage_service.upload_cover(cover_file_content, cover_path, cover_content_type)
        uploaded_path = storage_service.upload_file(file_content, storage_path, content_type)
        
        song_data = {
            "title": title,
            "artist": artist,
            "album": album,
            "duration_seconds": duration_seconds,
            "file_path": storage_path,
            "cover_image_url": cover_url
        }
        
        result = song_service.insert_song(song_data)
        return {"success": True, "data": result}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))