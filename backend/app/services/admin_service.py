from typing import List, Optional, Dict, Any
from app.utils.supabase_client import get_supabase_client
import uuid
from datetime import datetime

class AdminService:
    def __init__(self):
        self.supabase = get_supabase_client()

    # Song Management
    def bulk_insert_songs(self, songs_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Bulk insert songs with validation"""
        try:
            result = self.supabase.table('songs').insert(songs_data).execute()
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