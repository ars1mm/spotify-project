import os
from supabase import create_client, Client
from typing import List, Dict, Optional

class SupabaseStorageClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        
        self.supabase: Client = create_client(url, key)
        self.bucket_name = os.getenv("SUPABASE_BUCKET_NAME", "songs")
    
    def list_songs(self, page: int = 1, limit: int = 50) -> Dict:
        """Fetch songs from database with pagination"""
        try:
            # Calculate offset for pagination
            offset = (page - 1) * limit
            
            # Get total count
            count_response = self.supabase.table("songs").select("*", count="exact").execute()
            total_count = count_response.count if count_response.count else 0
            
            # Get paginated songs
            response = self.supabase.table("songs").select("*").range(offset, offset + limit - 1).execute()
            
            songs = []
            for song in response.data:
                # Generate public URL for the audio file if it exists in storage
                audio_url = None
                if song.get('file_path'):
                    try:
                        audio_url = self.supabase.storage.from_(self.bucket_name).get_public_url(song['file_path'])
                    except:
                        audio_url = None
                
                song_data = {
                    "id": song['id'],
                    "title": song['title'],
                    "artist": song['artist'],
                    "album": song.get('album'),
                    "duration_seconds": song.get('duration_seconds'),
                    "cover_image_url": song.get('cover_image_url'),
                    "audio_url": audio_url,
                    "created_at": song['created_at']
                }
                songs.append(song_data)
            
            return {
                "songs": songs,
                "page": page,
                "limit": limit,
                "total": total_count
            }
            
        except Exception as e:
            print(f"Error in list_songs: {str(e)}")
            return {"error": str(e), "songs": [], "page": page, "limit": limit, "total": 0}
