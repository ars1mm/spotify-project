"""
Song Service Module

Handles song-related operations for the Spotify-like application.
This service manages song listing, searching, creation, and deletion.

API Endpoints that use this service:
- GET /songs -> list_songs()
- GET /search -> search_songs()
- DELETE /admin/songs/{song_id} -> delete_song()
"""

import logging
from typing import Dict, List, Optional
from app.services.base.base_client import BaseSupabaseClient

logger = logging.getLogger(__name__)


class SongService(BaseSupabaseClient):
    """
    Service for managing song-related operations.

    This service handles song listing with pagination, searching across songs and playlists,
    inserting new songs, and deleting songs with their associated files.
    """

    def list_songs(self, page: int = 1, limit: int = 50) -> Dict[str, any]:
        """
        Retrieve a paginated list of songs from the database.

        GET /songs

        Args:
            page (int): Page number to retrieve (1-based, default: 1)
            limit (int): Number of songs per page (default: 50, max: 100)

        Returns:
            Dict containing:
            - songs (List[Dict]): List of song objects with metadata and audio URLs
            - page (int): Current page number
            - limit (int): Items per page
            - total (int): Total number of songs available
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If page or limit are invalid
        """
        # Input validation
        if page < 1:
            raise ValueError("Page must be 1 or greater")
        if limit < 1 or limit > 100:
            raise ValueError("Limit must be between 1 and 100")

        try:
            logger.info(f"Listing songs - page {page}, limit {limit}")

            # Calculate offset for pagination
            offset = (page - 1) * limit

            # Get total count of songs
            count_query = self.supabase.table("songs").select("*", count="exact")
            count_response = count_query.execute()
            total_count = count_response.count if count_response.count is not None else 0

            # Get paginated songs
            songs_query = (
                self.supabase.table("songs")
                .select("*")
                .range(offset, offset + limit - 1)
            )
            songs_response = songs_query.execute()

            songs = []
            for song in songs_response.data:
                # Generate audio URL for the song
                audio_url = self._get_audio_url(song.get('file_path'))

                # Format song data for API response
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

            logger.info(f"Retrieved {len(songs)} songs (page {page} of {((total_count - 1) // limit) + 1})")
            return {
                "songs": songs,
                "page": page,
                "limit": limit,
                "total": total_count
            }

        except ValueError as ve:
            logger.error(f"Validation error in list_songs: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to list songs: {str(e)}"
            logger.error(f"Error in list_songs (page {page}, limit {limit}): {error_msg}")
            return {
                "error": error_msg,
                "songs": [],
                "page": page,
                "limit": limit,
                "total": 0
            }

    def search_songs(self, query: str, limit: int = 10) -> Dict[str, any]:
        """
        Search for songs and public playlists by title, artist, album, or playlist name.

        GET /search

        Performs a case-insensitive search across multiple fields and returns both
        matching songs and public playlists.

        Args:
            query (str): Search query string
            limit (int): Maximum number of results per category (default: 10)

        Returns:
            Dict containing:
            - songs (List[Dict]): List of matching songs with metadata
            - playlists (List[Dict]): List of matching public playlists
            - total (int): Total number of results across both categories
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If query is empty or limit is invalid
        """
        # Input validation
        if not query or not query.strip():
            raise ValueError("Search query cannot be empty")
        if limit < 1 or limit > 50:
            raise ValueError("Limit must be between 1 and 50")

        try:
            logger.info(f"Searching for: '{query.strip()}' (limit: {limit})")

            # Search songs by title, artist, or album
            songs_query = (
                self.supabase.table("songs")
                .select("id, title, artist, album, duration_seconds, cover_image_url, file_path, created_at")
                .or_(f"title.ilike.%{query.strip()}%,artist.ilike.%{query.strip()}%,album.ilike.%{query.strip()}%")
                .limit(limit)
            )
            songs_response = songs_query.execute()

            songs = []
            for song in songs_response.data:
                # Generate audio URL for the song
                audio_url = self._get_audio_url(song.get('file_path'))

                songs.append({
                    "id": song['id'],
                    "title": song['title'],
                    "artist": song['artist'],
                    "album": song.get('album'),
                    "duration_seconds": song.get('duration_seconds'),
                    "cover_image_url": song.get('cover_image_url'),
                    "audio_url": audio_url,
                    "created_at": song['created_at']
                })

            # Search public playlists by name or description
            playlists_query = (
                self.supabase.table("playlists")
                .select("id, name, description, is_public, user_id, created_at")
                .or_(f"name.ilike.%{query.strip()}%,description.ilike.%{query.strip()}%")
                .eq("is_public", True)
                .limit(limit)
            )
            playlists_response = playlists_query.execute()

            total_results = len(songs) + len(playlists_response.data or [])

            logger.info(f"Search completed: {len(songs)} songs, {len(playlists_response.data or [])} playlists")
            return {
                "songs": songs,
                "playlists": playlists_response.data or [],
                "total": total_results
            }

        except ValueError as ve:
            logger.error(f"Validation error in search_songs: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Search failed: {str(e)}"
            logger.error(f"Error searching for '{query.strip()}': {error_msg}")
            return {
                "error": error_msg,
                "songs": [],
                "playlists": [],
                "total": 0
            }

    def insert_song(self, song_data: Dict[str, any]) -> Dict[str, any]:
        """
        Insert a new song record into the database.

        Used internally by admin operations for adding songs to the database.

        Args:
            song_data (Dict): Song data to insert containing fields like:
                - title (str): Song title
                - artist_id (str): Artist ID
                - album_id (str, optional): Album ID
                - duration_seconds (int, optional): Song duration
                - file_path (str, optional): Path to audio file
                - cover_image_url (str, optional): Cover image URL

        Returns:
            Dict: The inserted song record or error information

        Raises:
            ValueError: If required fields are missing
        """
        # Input validation
        if not song_data or not isinstance(song_data, dict):
            raise ValueError("Song data must be a non-empty dictionary")
        if not song_data.get('title') or not song_data.get('artist_id'):
            raise ValueError("Song title and artist_id are required")

        try:
            logger.info(f"Inserting song: {song_data.get('title', 'Unknown')}")

            # Insert song into database
            insert_response = (
                self.supabase.table("songs")
                .insert(song_data)
                .execute()
            )

            if insert_response.data:
                logger.info(f"Successfully inserted song: {song_data.get('title')}")
                return insert_response.data[0]
            else:
                logger.warning(f"Insert returned no data for song: {song_data.get('title')}")
                return {"error": "No data returned after insert"}

        except ValueError as ve:
            logger.error(f"Validation error in insert_song: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to insert song: {str(e)}"
            logger.error(f"Error inserting song '{song_data.get('title', 'Unknown')}': {error_msg}")
            raise Exception(error_msg)

    def delete_song(self, song_id: str) -> Dict[str, any]:
        """
        Delete a song from the database and remove its associated audio file from storage.

        DELETE /admin/songs/{song_id}

        This method performs a cascading delete - it removes the song record from the database
        and attempts to delete the associated audio file from Supabase storage.

        Args:
            song_id (str): ID of the song to delete

        Returns:
            Dict containing:
            - success (bool): True if deletion succeeded
            - message (str): Success message
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If song_id is empty
            Exception: If song is not found or deletion fails
        """
        # Input validation
        if not song_id or not song_id.strip():
            raise ValueError("Song ID cannot be empty")

        try:
            logger.info(f"Deleting song: {song_id.strip()}")

            # First, get the song's file path for cleanup
            song_query = (
                self.supabase.table("songs")
                .select("file_path, title")
                .eq("id", song_id.strip())
            )
            song_response = song_query.execute()

            if not song_response.data:
                logger.warning(f"Song not found: {song_id.strip()}")
                raise Exception("Song not found")

            song_info = song_response.data[0]
            file_path = song_info.get("file_path")
            song_title = song_info.get("title", "Unknown")

            # Delete the song record from database
            delete_response = (
                self.supabase.table("songs")
                .delete()
                .eq("id", song_id.strip())
                .execute()
            )

            # Attempt to delete the associated file from storage
            if file_path:
                try:
                    logger.debug(f"Attempting to delete file from storage: {file_path}")
                    self.supabase.storage.from_(self.bucket_name).remove([file_path])
                    logger.info(f"Successfully deleted file from storage: {file_path}")
                except Exception as storage_error:
                    # Log warning but don't fail the operation if file deletion fails
                    logger.warning(f"Could not delete file from storage '{file_path}': {str(storage_error)}")

            logger.info(f"Successfully deleted song: {song_title} ({song_id.strip()})")
            return {
                "success": True,
                "message": "Song deleted successfully"
            }

        except ValueError as ve:
            logger.error(f"Validation error in delete_song: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to delete song: {str(e)}"
            logger.error(f"Error deleting song {song_id.strip()}: {error_msg}")
            raise Exception(error_msg)
