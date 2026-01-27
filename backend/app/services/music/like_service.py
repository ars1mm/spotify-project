"""
Like Service Module

Handles liked songs functionality for the Spotify-like application.
This service manages user-song like relationships in the database.

API Endpoints that use this service:
- POST /songs/{song_id}/like -> like_song()
- DELETE /songs/{song_id}/like -> unlike_song()
- GET /songs/liked -> get_liked_songs()
- GET /songs/{song_id}/liked -> is_song_liked()
"""

import logging
from typing import Dict, List, Optional
from app.services.base.base_client import BaseSupabaseClient

logger = logging.getLogger(__name__)


class LikeService(BaseSupabaseClient):
    """
    Service for managing user-song like relationships.

    This service handles all operations related to users liking/unliking songs,
    including checking like status and retrieving liked songs lists.
    """

    def like_song(self, user_id: str, song_id: str) -> Dict[str, any]:
        """
        Add a song to user's liked songs list.

        POST /songs/{song_id}/like

        Args:
            user_id (str): The ID of the user liking the song
            song_id (str): The ID of the song being liked

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - message (str): Success message or error description
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If user_id or song_id are empty
        """
        # Input validation
        if not user_id or not user_id.strip():
            raise ValueError("user_id cannot be empty")
        if not song_id or not song_id.strip():
            raise ValueError("song_id cannot be empty")

        try:
            logger.info(f"User {user_id} attempting to like song {song_id}")

            # Check if the song is already liked by this user
            existing_like_query = (
                self.supabase.table("liked_songs")
                .select("id")
                .eq("user_id", user_id.strip())
                .eq("song_id", song_id.strip())
            )
            existing_result = existing_like_query.execute()

            # If already liked, return success without creating duplicate
            if existing_result.data and len(existing_result.data) > 0:
                logger.info(f"Song {song_id} already liked by user {user_id}")
                return {
                    "success": True,
                    "message": "Song already liked"
                }

            # Create new like relationship
            insert_data = {
                "user_id": user_id.strip(),
                "song_id": song_id.strip()
            }

            insert_result = (
                self.supabase.table("liked_songs")
                .insert(insert_data)
                .execute()
            )

            logger.info(f"User {user_id} successfully liked song {song_id}")
            return {
                "success": True,
                "message": "Song liked successfully"
            }

        except ValueError as ve:
            logger.error(f"Validation error in like_song: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to like song: {str(e)}"
            logger.error(f"Error in like_song for user {user_id}, song {song_id}: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def unlike_song(self, user_id: str, song_id: str) -> Dict[str, any]:
        """
        Remove a song from user's liked songs list.

        DELETE /songs/{song_id}/like

        Args:
            user_id (str): The ID of the user unliking the song
            song_id (str): The ID of the song being unliked

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - message (str): Success message or error description
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If user_id or song_id are empty
        """
        # Input validation
        if not user_id or not user_id.strip():
            raise ValueError("user_id cannot be empty")
        if not song_id or not song_id.strip():
            raise ValueError("song_id cannot be empty")

        try:
            logger.info(f"User {user_id} attempting to unlike song {song_id}")

            # Delete the like relationship
            delete_result = (
                self.supabase.table("liked_songs")
                .delete()
                .eq("user_id", user_id.strip())
                .eq("song_id", song_id.strip())
                .execute()
            )

            logger.info(f"User {user_id} successfully unliked song {song_id}")
            return {
                "success": True,
                "message": "Song unliked successfully"
            }

        except ValueError as ve:
            logger.error(f"Validation error in unlike_song: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to unlike song: {str(e)}"
            logger.error(f"Error in unlike_song for user {user_id}, song {song_id}: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def get_liked_songs(self, user_id: str) -> Dict[str, any]:
        """
        Retrieve all songs liked by a specific user.

        GET /songs/liked

        Args:
            user_id (str): The ID of the user whose liked songs to retrieve

        Returns:
            Dict containing:
            - songs (List[Dict]): List of liked songs with full song details
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If user_id is empty
        """
        # Input validation
        if not user_id or not user_id.strip():
            raise ValueError("user_id cannot be empty")

        try:
            logger.info(f"Retrieving liked songs for user {user_id}")

            # Query liked songs with joined song data, ordered by creation date (newest first)
            query_result = (
                self.supabase.table("liked_songs")
                .select("*, songs(*)")
                .eq("user_id", user_id.strip())
                .order("created_at", desc=True)
                .execute()
            )

            liked_songs = []

            # Process each liked song entry
            for liked_entry in query_result.data:
                song_data = liked_entry.get('songs')

                # Skip if song data is missing (orphaned like entry)
                if not song_data:
                    logger.warning(f"Orphaned like entry found for user {user_id}: {liked_entry}")
                    continue

                # Generate audio URL for the song
                audio_url = self._get_audio_url(song_data.get('file_path'))

                # Format song data for API response
                formatted_song = {
                    "id": song_data['id'],
                    "title": song_data['title'],
                    "artist": song_data['artist'],
                    "album": song_data.get('album'),
                    "duration_seconds": song_data.get('duration_seconds'),
                    "cover_image_url": song_data.get('cover_image_url'),
                    "audio_url": audio_url,
                    "liked_at": liked_entry.get('created_at')  # When the song was liked
                }

                liked_songs.append(formatted_song)

            logger.info(f"Retrieved {len(liked_songs)} liked songs for user {user_id}")
            return {"songs": liked_songs}

        except ValueError as ve:
            logger.error(f"Validation error in get_liked_songs: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to retrieve liked songs: {str(e)}"
            logger.error(f"Error in get_liked_songs for user {user_id}: {error_msg}")
            return {
                "songs": [],
                "error": error_msg
            }

    def is_song_liked(self, user_id: str, song_id: str) -> bool:
        """
        Check if a specific song is liked by a user.

        GET /songs/{song_id}/liked

        Args:
            user_id (str): The ID of the user to check
            song_id (str): The ID of the song to check

        Returns:
            bool: True if the song is liked by the user, False otherwise

        Raises:
            ValueError: If user_id or song_id are empty
        """
        # Input validation
        if not user_id or not user_id.strip():
            raise ValueError("user_id cannot be empty")
        if not song_id or not song_id.strip():
            raise ValueError("song_id cannot be empty")

        try:
            logger.debug(f"Checking if song {song_id} is liked by user {user_id}")

            # Query for existing like relationship
            query_result = (
                self.supabase.table("liked_songs")
                .select("id")
                .eq("user_id", user_id.strip())
                .eq("song_id", song_id.strip())
                .execute()
            )

            is_liked = len(query_result.data) > 0
            logger.debug(f"Song {song_id} liked status for user {user_id}: {is_liked}")

            return is_liked

        except ValueError as ve:
            logger.error(f"Validation error in is_song_liked: {str(ve)}")
            raise ve
        except Exception as e:
            logger.error(f"Error checking like status for user {user_id}, song {song_id}: {str(e)}")
            # Return False on error to be safe (don't break functionality)
            return False
