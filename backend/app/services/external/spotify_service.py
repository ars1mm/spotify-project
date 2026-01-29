from app.utils.supabase_client import get_supabase_client
from typing import Optional, Dict, Any, List

class SpotifyService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def search_tracks(self, title: str = None, artist: str = None, album: str = None, genre: str = None) -> List[Dict[Any, Any]]:
        """Search tracks with multiple filters"""
        query = self.supabase.table('songs').select('*')
        
        if title:
            query = query.ilike('title', f'%{title}%')
        if artist:
            query = query.ilike('artist', f'%{artist}%')
        if album:
            query = query.ilike('album', f'%{album}%')
        if genre:
            query = query.ilike('genre', f'%{genre}%')
            
        response = query.execute()
        return response.data
    
    def get_track_by_name(self, track_name: str) -> Optional[Dict[Any, Any]]:
        """Get track from database by name"""
        response = self.supabase.table('songs').select('*').ilike('title', f'%{track_name}%').execute()
        return response.data[0] if response.data else None
    
    def get_track_download_url(self, track_id: str) -> Optional[str]:
        """Get download URL for a track from Supabase storage"""
        response = self.supabase.table('songs').select('file_path').eq('id', track_id).execute()
        if response.data:
            file_path = response.data[0]['file_path']
            return self.supabase.storage.from_('songs').get_public_url(file_path)
        return None