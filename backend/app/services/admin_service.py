from typing import List, Optional, Dict, Any
from app.utils.supabase_client import get_supabase_client
import uuid
from datetime import datetime

class AdminService:
    def __init__(self):
        self.supabase = get_supabase_client()

    # Artist Management
    def create_artist(self, name: str, bio: str = None, image_url: str = None) -> Dict[str, Any]:
        """Create or get existing artist"""
        try:
            # Check if artist exists
            existing = self.supabase.table('artists').select('*').eq('name', name).execute()
            if existing.data:
                return {"success": True, "data": existing.data[0], "created": False}
            
            # Create new artist
            artist_data = {"name": name}
            if bio:
                artist_data["bio"] = bio
            if image_url:
                artist_data["image_url"] = image_url
                
            result = self.supabase.table('artists').insert(artist_data).execute()
            return {"success": True, "data": result.data[0], "created": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def create_album(self, title: str, artist_id: str, cover_image_url: str = None, release_date: str = None) -> Dict[str, Any]:
        """Create or get existing album"""
        try:
            # Check if album exists
            existing = self.supabase.table('albums').select('*').eq('title', title).eq('artist_id', artist_id).execute()
            if existing.data:
                return {"success": True, "data": existing.data[0], "created": False}
            
            # Create new album
            album_data = {"title": title, "artist_id": artist_id}
            if cover_image_url:
                album_data["cover_image_url"] = cover_image_url
            if release_date:
                album_data["release_date"] = release_date
                
            result = self.supabase.table('albums').insert(album_data).execute()
            return {"success": True, "data": result.data[0], "created": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Song Management
    def bulk_insert_songs(self, songs_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Bulk insert songs with artist/album creation"""
        try:
            processed_songs = []
            for song in songs_data:
                # Create/get artist
                artist_result = self.create_artist(song.get('artist_name', song.get('artist')))
                if not artist_result["success"]:
                    continue
                    
                artist_id = artist_result["data"]["id"]
                
                # Create/get album if provided
                album_id = None
                if song.get('album_name', song.get('album')):
                    album_result = self.create_album(
                        song.get('album_name', song.get('album')), 
                        artist_id,
                        song.get('album_cover_url')
                    )
                    if album_result["success"]:
                        album_id = album_result["data"]["id"]
                
                # Prepare song data
                song_data = {
                    "title": song["title"],
                    "artist_id": artist_id,
                    "duration_seconds": song.get("duration_seconds"),
                    "file_path": song.get("file_path"),
                    "cover_image_url": song.get("cover_image_url")
                }
                if album_id:
                    song_data["album_id"] = album_id
                    
                processed_songs.append(song_data)
            
            result = self.supabase.table('songs').insert(processed_songs).execute()
            return {"success": True, "data": result.data, "count": len(result.data)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_song(self, song_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update song information"""
        try:
            result = self.supabase.table('songs').update(update_data).eq('id', song_id).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Trending Management
    def update_trending_songs(self, trending_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Update trending songs rankings"""
        try:
            # Clear existing trending
            self.supabase.table('trending_songs').delete().neq('id', 0).execute()
            # Insert new data
            result = self.supabase.table('trending_songs').insert(trending_data).execute()
            return {"success": True, "data": result.data, "count": len(result.data)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_trending_albums(self, albums_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Update trending albums"""
        try:
            # Clear existing trending
            self.supabase.table('trending_albums').delete().neq('id', 0).execute()
            # Insert new data
            result = self.supabase.table('trending_albums').insert(albums_data).execute()
            return {"success": True, "data": result.data, "count": len(result.data)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Analytics
    def get_song_analytics(self, song_id: str) -> Dict[str, Any]:
        """Get analytics for a specific song"""
        try:
            # Get song info
            song = self.supabase.table('songs').select('*').eq('id', song_id).execute()
            if not song.data:
                return {"error": "Song not found"}
            
            # For now, return basic song info (analytics tables need to be created)
            return {
                "song": song.data[0],
                "total_plays": 0,  # Placeholder - needs user_song_plays table
                "unique_listeners": 0,
                "favorites_count": 0
            }
        except Exception as e:
            return {"error": str(e)}

    def get_top_songs(self, limit: int = 50) -> Dict[str, Any]:
        """Get top songs"""
        try:
            result = self.supabase.table('songs').select('*').limit(limit).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Batch Operations
    def cleanup_orphaned_data(self) -> Dict[str, int]:
        """Clean up orphaned records"""
        try:
            # This would need custom SQL functions in Supabase
            return {
                "message": "Cleanup functionality needs custom SQL functions in Supabase",
                "orphaned_playlist_songs": 0,
                "orphaned_trending_songs": 0
            }
        except Exception as e:
            return {"error": str(e)}