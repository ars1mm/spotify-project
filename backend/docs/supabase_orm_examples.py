"""
Supabase ORM Usage Examples
============================

This file demonstrates practical usage of Supabase ORM models and operations
for the Spotify project. These examples show real-world scenarios and best practices.
"""

import os
from typing import List, Dict, Optional, Any
from uuid import UUID
from datetime import datetime

from app.utils.supabase_client import SupabaseStorageClient, get_supabase_client, get_supabase_admin_client
from app.models.supabase_models import (
    SongModel, PlaylistModel, UserModel, CreateSongRequest, 
    CreatePlaylistRequest, PaginatedSongsResponse, SearchResponse,
    supabase_row_to_song, supabase_row_to_playlist, ModelValidator
)


class SpotifySupabaseService:
    """
    Enhanced Supabase service with model integration
    Demonstrates how to use Pydantic models with Supabase operations
    """
    
    def __init__(self, use_service_role: bool = False):
        self.client = SupabaseStorageClient(use_service_role=use_service_role)
        self.supabase = get_supabase_admin_client() if use_service_role else get_supabase_client()
        self.bucket_name = os.getenv("SUPABASE_BUCKET_NAME", "songs")
        self.supabase_url = os.getenv("SUPABASE_URL", "")
    
    # Song Operations with Models
    
    async def create_song_with_validation(self, song_request: CreateSongRequest, file_content: bytes, file_name: str) -> Dict[str, Any]:
        """
        Create a song with full validation using Pydantic models
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        request = CreateSongRequest(
            title="My Song",
            artist="My Artist",
            album="My Album",
            duration_seconds=180
        )
        
        with open("song.mp3", "rb") as f:
            result = await service.create_song_with_validation(request, f.read(), "song.mp3")
        ```
        """
        try:
            # Validate request data
            errors = ModelValidator.validate_song_data(song_request.dict())
            if errors:
                return {"success": False, "errors": errors}
            
            # Upload file first
            file_path = f"songs/{datetime.now().strftime('%Y/%m')}/{file_name}"
            uploaded_path = self.client.upload_file(file_content, file_path, "audio/mpeg")
            
            # Prepare song data
            song_data = {
                "title": song_request.title,
                "artist": song_request.artist,
                "album": song_request.album,
                "duration_seconds": song_request.duration_seconds,
                "file_path": uploaded_path,
                "cover_image_url": song_request.cover_image_url
            }
            
            # Insert into database
            db_result = self.client.insert_song(song_data)
            
            # Convert to model
            song_model = supabase_row_to_song(db_result, self.bucket_name, self.supabase_url)
            
            return {
                "success": True,
                "song": song_model.dict(),
                "message": "Song created successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_songs_paginated(self, page: int = 1, limit: int = 50) -> PaginatedSongsResponse:
        """
        Get paginated songs with proper model conversion
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        response = service.get_songs_paginated(page=1, limit=20)
        
        for song in response.songs:
            print(f"{song.title} by {song.artist}")
        ```
        """
        try:
            result = self.client.list_songs(page=page, limit=limit)
            
            if "error" in result:
                return PaginatedSongsResponse(songs=[], page=page, limit=limit, total=0)
            
            # Convert to models
            songs = [
                supabase_row_to_song(song_data, self.bucket_name, self.supabase_url)
                for song_data in result.get("songs", [])
            ]
            
            total = result.get("total", 0)
            has_next = (page * limit) < total
            has_prev = page > 1
            
            return PaginatedSongsResponse(
                songs=songs,
                page=page,
                limit=limit,
                total=total,
                has_next=has_next,
                has_prev=has_prev
            )
            
        except Exception as e:
            return PaginatedSongsResponse(songs=[], page=page, limit=limit, total=0)
    
    def search_with_models(self, query: str, limit: int = 10) -> SearchResponse:
        """
        Search songs and playlists with model conversion
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        results = service.search_with_models("rock music")
        
        print(f"Found {len(results.songs)} songs and {len(results.playlists)} playlists")
        ```
        """
        try:
            result = self.client.search_songs(query, limit)
            
            if "error" in result:
                return SearchResponse(songs=[], playlists=[], total=0)
            
            # Convert songs to models
            songs = [
                supabase_row_to_song(song_data, self.bucket_name, self.supabase_url)
                for song_data in result.get("songs", [])
            ]
            
            # Convert playlists to models
            playlists = [
                supabase_row_to_playlist(playlist_data)
                for playlist_data in result.get("playlists", [])
            ]
            
            return SearchResponse(
                songs=songs,
                playlists=playlists,
                total=len(songs) + len(playlists)
            )
            
        except Exception as e:
            return SearchResponse(songs=[], playlists=[], total=0)
    
    # Playlist Operations with Models
    
    def create_playlist_with_validation(self, playlist_request: CreatePlaylistRequest, user_id: str) -> Dict[str, Any]:
        """
        Create playlist with validation
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        request = CreatePlaylistRequest(
            name="My Playlist",
            description="My favorite songs",
            is_public=True,
            song_ids=["song-uuid-1", "song-uuid-2"]
        )
        
        result = service.create_playlist_with_validation(request, "user-uuid")
        ```
        """
        try:
            # Validate data
            validation_data = {
                "name": playlist_request.name,
                "user_id": user_id
            }
            errors = ModelValidator.validate_playlist_data(validation_data)
            if errors:
                return {"success": False, "errors": errors}
            
            # Create playlist
            result = self.client.create_playlist(
                name=playlist_request.name,
                description=playlist_request.description or "",
                is_public=playlist_request.is_public,
                user_id=user_id,
                song_ids=playlist_request.song_ids or []
            )
            
            if result.get("success"):
                playlist_model = supabase_row_to_playlist(result["playlist"])
                return {
                    "success": True,
                    "playlist": playlist_model.dict(),
                    "message": "Playlist created successfully"
                }
            else:
                return {"success": False, "error": result.get("error", "Unknown error")}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_playlist_with_songs(self, playlist_id: str) -> Dict[str, Any]:
        """
        Get playlist with songs using models
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        result = service.get_playlist_with_songs("playlist-uuid")
        
        if result["success"]:
            playlist = PlaylistModel(**result["playlist"])
            songs = [SongModel(**song) for song in result["songs"]]
        ```
        """
        try:
            result = self.client.get_playlist_by_id(playlist_id)
            
            if "error" in result:
                return {"success": False, "error": result["error"]}
            
            # Convert playlist to model
            playlist_model = supabase_row_to_playlist(result["playlist"])
            
            # Convert songs to models
            songs = [
                supabase_row_to_song(song_data, self.bucket_name, self.supabase_url)
                for song_data in result.get("songs", [])
            ]
            
            return {
                "success": True,
                "playlist": playlist_model.dict(),
                "songs": [song.dict() for song in songs]
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Advanced Query Examples
    
    def get_user_library(self, user_id: str) -> Dict[str, Any]:
        """
        Get complete user library (playlists + liked songs)
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        library = service.get_user_library("user-uuid")
        
        print(f"User has {len(library['playlists'])} playlists")
        print(f"User has {len(library['liked_songs'])} liked songs")
        ```
        """
        try:
            # Get user playlists
            playlists_result = self.client.get_playlists(user_id=user_id)
            playlists = [
                supabase_row_to_playlist(playlist_data)
                for playlist_data in playlists_result.get("playlists", [])
            ]
            
            # Get liked songs
            liked_result = self.client.get_liked_songs(user_id)
            liked_songs = [
                supabase_row_to_song(song_data, self.bucket_name, self.supabase_url)
                for song_data in liked_result.get("songs", [])
            ]
            
            return {
                "success": True,
                "playlists": [p.dict() for p in playlists],
                "liked_songs": [s.dict() for s in liked_songs],
                "stats": {
                    "total_playlists": len(playlists),
                    "total_liked_songs": len(liked_songs)
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_trending_content(self) -> Dict[str, Any]:
        """
        Get trending songs and albums
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        trending = service.get_trending_content()
        
        for song in trending["trending_songs"]:
            print(f"#{song['rank_position']}: {song['song']['title']}")
        ```
        """
        try:
            # Get trending songs
            trending_songs = self.client.get_trending_songs(limit=20)
            
            # Get trending albums  
            trending_albums = self.client.get_trending_albums(limit=10)
            
            return {
                "success": True,
                "trending_songs": trending_songs.get("trending_songs", []),
                "trending_albums": trending_albums.get("trending_albums", [])
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Batch Operations
    
    def batch_like_songs(self, user_id: str, song_ids: List[str]) -> Dict[str, Any]:
        """
        Like multiple songs in batch
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        result = service.batch_like_songs("user-uuid", ["song1", "song2", "song3"])
        ```
        """
        try:
            results = []
            errors = []
            
            for song_id in song_ids:
                result = self.client.like_song(user_id, song_id)
                if result.get("success"):
                    results.append(song_id)
                else:
                    errors.append({"song_id": song_id, "error": result.get("error")})
            
            return {
                "success": len(errors) == 0,
                "liked_songs": results,
                "errors": errors,
                "stats": {
                    "total_attempted": len(song_ids),
                    "successful": len(results),
                    "failed": len(errors)
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # Analytics and Reporting
    
    def get_user_listening_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get user listening statistics
        
        Example usage:
        ```python
        service = SpotifySupabaseService()
        stats = service.get_user_listening_stats("user-uuid")
        
        print(f"Total playlists: {stats['total_playlists']}")
        print(f"Total liked songs: {stats['total_liked_songs']}")
        print(f"Favorite artists: {stats['top_artists']}")
        ```
        """
        try:
            # Get user playlists count
            playlists_result = self.client.get_playlists(user_id=user_id)
            total_playlists = len(playlists_result.get("playlists", []))
            
            # Get liked songs
            liked_result = self.client.get_liked_songs(user_id)
            liked_songs = liked_result.get("songs", [])
            total_liked_songs = len(liked_songs)
            
            # Calculate top artists from liked songs
            artist_counts = {}
            for song in liked_songs:
                artist = song.get("artist", "Unknown")
                artist_counts[artist] = artist_counts.get(artist, 0) + 1
            
            top_artists = sorted(artist_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            
            return {
                "success": True,
                "stats": {
                    "total_playlists": total_playlists,
                    "total_liked_songs": total_liked_songs,
                    "top_artists": [{"name": artist, "count": count} for artist, count in top_artists],
                    "listening_diversity": len(artist_counts)  # Number of different artists
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}


# Usage Examples and Best Practices

class SpotifyUsageExamples:
    """
    Collection of usage examples for common scenarios
    """
    
    @staticmethod
    def example_song_upload():
        """Example: Upload a song with cover image"""
        service = SpotifySupabaseService(use_service_role=True)
        
        # Create song request
        song_request = CreateSongRequest(
            title="Beautiful Song",
            artist="Amazing Artist",
            album="Great Album",
            duration_seconds=240
        )
        
        # Simulate file upload (in real scenario, this would come from FastAPI file upload)
        # with open("path/to/song.mp3", "rb") as audio_file:
        #     audio_content = audio_file.read()
        
        # result = await service.create_song_with_validation(
        #     song_request, 
        #     audio_content, 
        #     "beautiful_song.mp3"
        # )
        
        print("Song upload example prepared")
    
    @staticmethod
    def example_playlist_management():
        """Example: Create and manage playlists"""
        service = SpotifySupabaseService()
        
        # Create playlist
        playlist_request = CreatePlaylistRequest(
            name="My Rock Playlist",
            description="Best rock songs ever",
            is_public=True,
            song_ids=[]  # Will add songs later
        )
        
        user_id = "user-uuid-here"
        # result = service.create_playlist_with_validation(playlist_request, user_id)
        
        print("Playlist management example prepared")
    
    @staticmethod
    def example_search_and_discovery():
        """Example: Search and content discovery"""
        service = SpotifySupabaseService()
        
        # Search for content
        search_results = service.search_with_models("rock", limit=20)
        
        print(f"Found {len(search_results.songs)} songs")
        print(f"Found {len(search_results.playlists)} playlists")
        
        # Get trending content
        trending = service.get_trending_content()
        if trending["success"]:
            print(f"Trending songs: {len(trending['trending_songs'])}")
    
    @staticmethod
    def example_user_library():
        """Example: User library management"""
        service = SpotifySupabaseService()
        
        user_id = "user-uuid-here"
        
        # Get complete user library
        library = service.get_user_library(user_id)
        if library["success"]:
            print(f"User has {library['stats']['total_playlists']} playlists")
            print(f"User has {library['stats']['total_liked_songs']} liked songs")
        
        # Get user statistics
        stats = service.get_user_listening_stats(user_id)
        if stats["success"]:
            print(f"User's top artists: {stats['stats']['top_artists']}")


# Error Handling Best Practices

class ErrorHandler:
    """
    Centralized error handling for Supabase operations
    """
    
    @staticmethod
    def handle_supabase_error(error: Exception) -> Dict[str, Any]:
        """Handle Supabase-specific errors"""
        error_message = str(error)
        
        if "duplicate key value" in error_message:
            return {
                "error_type": "DUPLICATE_ENTRY",
                "message": "This item already exists",
                "user_message": "This song or playlist already exists in your library"
            }
        elif "foreign key constraint" in error_message:
            return {
                "error_type": "INVALID_REFERENCE",
                "message": "Referenced item does not exist",
                "user_message": "The referenced item could not be found"
            }
        elif "permission denied" in error_message:
            return {
                "error_type": "PERMISSION_DENIED",
                "message": "Insufficient permissions",
                "user_message": "You don't have permission to perform this action"
            }
        else:
            return {
                "error_type": "UNKNOWN_ERROR",
                "message": error_message,
                "user_message": "An unexpected error occurred. Please try again."
            }


if __name__ == "__main__":
    # Run examples
    examples = SpotifyUsageExamples()
    examples.example_search_and_discovery()
    examples.example_user_library()
    
    print("Supabase ORM examples completed!")