import os
from supabase import create_client, Client
from typing import List, Dict, Optional

# Global client instance
_supabase_client = None

def get_supabase_client() -> Client:
    """Get or create Supabase client instance"""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        
        _supabase_client = create_client(url, key)
    
    return _supabase_client

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
    
    def get_trending_songs(self, limit: int = 10) -> Dict:
        """Get trending songs from database"""
        try:
            response = self.supabase.table("trending_songs").select(
                "*, songs(title, artist, album, cover_image_url)"
            ).order("rank_position").limit(limit).execute()
            
            return {"trending_songs": response.data}
        except Exception as e:
            return {"error": str(e), "trending_songs": []}
    
    def get_trending_albums(self, limit: int = 10) -> Dict:
        """Get trending albums from database"""
        try:
            response = self.supabase.table("trending_albums").select(
                "*"
            ).order("rank_position").limit(limit).execute()
            
            return {"trending_albums": response.data}
        except Exception as e:
            return {"error": str(e), "trending_albums": []}
    
    def create_user(self, email: str, password: str, name: str) -> Dict:
        """Create a new user with Supabase Auth"""
        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "name": name
                    }
                }
            })
            
            if response.user:
                return {"success": True, "user": response.user}
            else:
                return {"error": "Failed to create user"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def login_user(self, email: str, password: str) -> Dict:
        """Login user with Supabase Auth"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                return {"success": True, "user": response.user, "session": response.session}
            else:
                return {"error": "Invalid credentials"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def reset_password(self, email: str) -> Dict:
        """Send password reset email via Supabase Auth"""
        try:
            response = self.supabase.auth.reset_password_email(
                email,
                {"redirect_to": "http://localhost:3000/auth/reset-password"}
            )
            return {"success": True, "message": "Password reset email sent"}
        except Exception as e:
            return {"error": str(e)}
    
    def update_password(self, access_token: str, new_password: str) -> Dict:
        """Update user password with access token"""
        try:
            # Set the session with the access token
            self.supabase.auth.set_session(access_token, "")
            
            # Update the password
            response = self.supabase.auth.update_user({"password": new_password})
            
            if response.user:
                return {"success": True, "message": "Password updated successfully"}
            else:
                return {"error": "Failed to update password"}
        except Exception as e:
            return {"error": str(e)}
    
    def search_songs(self, query: str, limit: int = 10) -> Dict:
        """Search songs by title or artist"""
        try:
            response = self.supabase.table("songs").select(
                "id, title, artist, album, duration_seconds, cover_image_url, file_path, created_at"
            ).or_(
                f"title.ilike.%{query}%,artist.ilike.%{query}%,album.ilike.%{query}%"
            ).limit(limit).execute()
            
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
            
            return {"songs": songs, "total": len(songs)}
        except Exception as e:
            return {"error": str(e), "songs": [], "total": 0}