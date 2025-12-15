import os
from supabase import create_client, Client
from typing import List, Dict, Optional

# Global client instance
_supabase_client = None
_supabase_admin_client = None

def get_supabase_client() -> Client:
    """Get or create Supabase client instance with anon key (for public operations)"""
    global _supabase_client
    if _supabase_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        
        _supabase_client = create_client(url, key)
    
    return _supabase_client

def get_supabase_admin_client() -> Client:
    """Get or create Supabase admin client instance with service role key (for admin operations)"""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        
        _supabase_admin_client = create_client(url, key)
    
    return _supabase_admin_client

class SupabaseStorageClient:
    def __init__(self, use_service_role: bool = False):
        url = os.getenv("SUPABASE_URL")
        
        if use_service_role:
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        else:
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
                # Generate public URL for the audio file
                audio_url = None
                if song.get('file_path'):
                    audio_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{self.bucket_name}/{song['file_path']}"
                
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
    
    def update_password(self, access_token: str, refresh_token: str, new_password: str) -> Dict:
        """Update user password with access token"""
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"Attempting password update, has refresh token: {bool(refresh_token)}")
            
            if refresh_token:
                # Use set_session when we have both tokens
                self.supabase.auth.set_session(access_token, refresh_token)
                response = self.supabase.auth.update_user({"password": new_password})
                
                if response.user:
                    return {"success": True, "message": "Password updated successfully"}
                else:
                    return {"error": "Failed to update password"}
            else:
                # Fallback to direct API call with just access token
                import httpx
                url = os.getenv("SUPABASE_URL")
                
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "apikey": os.getenv("SUPABASE_ANON_KEY"),
                    "Content-Type": "application/json"
                }
                
                with httpx.Client() as client:
                    response = client.put(
                        f"{url}/auth/v1/user",
                        headers=headers,
                        json={"password": new_password}
                    )
                    
                    logger.info(f"Supabase response status: {response.status_code}")
                    logger.info(f"Supabase response body: {response.text}")
                    
                    if response.status_code == 200:
                        return {"success": True, "message": "Password updated successfully"}
                    else:
                        error_data = response.json()
                        error_msg = error_data.get("error_description") or error_data.get("msg") or error_data.get("error") or "Failed to update password"
                        return {"error": error_msg}
        except Exception as e:
            logger.error(f"Password update exception: {str(e)}")
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
                # Generate public URL for the audio file
                audio_url = None
                if song.get('file_path'):
                    audio_url = f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{self.bucket_name}/{song['file_path']}"
                
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

    def upload_file(self, file_content: bytes, file_path: str, content_type: str) -> str:
        """Upload file to Supabase Storage"""
        try:
            self.supabase.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            return file_path
        except Exception as e:
            print(f"Upload error: {str(e)}")
            raise e

    def insert_song(self, song_data: dict) -> dict:
        """Insert song metadata into database"""
        try:
            response = self.supabase.table("songs").insert(song_data).execute()
            if response.data:
                return response.data[0]
            return {"error": "No data returned after insert"}
        except Exception as e:
            print(f"Insert error: {str(e)}")
            raise e
    
    def delete_song(self, song_id: str) -> dict:
        """Delete song and its file from storage"""
        try:
            # First get the song to find the file path
            song_response = self.supabase.table("songs").select("file_path").eq("id", song_id).execute()
            
            if not song_response.data:
                raise Exception("Song not found")
            
            file_path = song_response.data[0].get("file_path")
            
            # Delete from database first
            delete_response = self.supabase.table("songs").delete().eq("id", song_id).execute()
            
            # Then delete file from storage if it exists
            if file_path:
                try:
                    self.supabase.storage.from_(self.bucket_name).remove([file_path])
                except Exception as storage_error:
                    print(f"Warning: Could not delete file from storage: {storage_error}")
            
            return {"success": True, "message": "Song deleted successfully"}
        except Exception as e:
            print(f"Delete error: {str(e)}")
            raise e
    
    def upload_cover(self, file_content: bytes, file_path: str, content_type: str) -> str:
        """Upload cover image to Supabase Storage covers bucket"""
        try:
            covers_bucket = "covers"
            self.supabase.storage.from_(covers_bucket).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            # Return public URL
            return f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{covers_bucket}/{file_path}"
        except Exception as e:
            print(f"Cover upload error: {str(e)}")
            raise e