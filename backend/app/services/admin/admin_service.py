"""
Admin Service Module

Handles administrative operations for the Spotify-like application.
This service manages content creation, updates, analytics, and maintenance tasks.

API Endpoints that use this service:
- POST /admin/songs/bulk -> bulk_insert_songs()
- PUT /admin/songs/{song_id} -> update_song()
- POST /admin/trending/songs -> update_trending_songs()
- POST /admin/trending/albums -> update_trending_albums()
- GET /admin/analytics/song/{song_id} -> get_song_analytics()
- GET /admin/analytics/top-songs -> get_top_songs()
- POST /admin/maintenance/cleanup -> cleanup_orphaned_data()
"""

import logging
from typing import List, Optional, Dict, Any
from app.services.base.base_client import BaseSupabaseClient

logger = logging.getLogger(__name__)


class AdminService(BaseSupabaseClient):
    """
    Service for managing administrative operations in the Spotify-like application.

    This service handles content management, analytics, trending data updates,
    and maintenance operations. All operations require admin privileges.
    """

    def create_artist(self, name: str, bio: Optional[str] = None, image_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new artist or return existing one if it already exists.

        Used internally by bulk_insert_songs() for artist management.

        Args:
            name (str): Artist name (required)
            bio (str, optional): Artist biography
            image_url (str, optional): Artist image URL

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (dict): Artist data
            - created (bool): True if new artist was created, False if existing was returned
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If name is empty
        """
        # Input validation
        if not name or not name.strip():
            raise ValueError("Artist name cannot be empty")

        try:
            logger.info(f"Creating/finding artist: {name.strip()}")

            # Check if artist already exists
            existing_query = (
                self.supabase.table('artists')
                .select('*')
                .eq('name', name.strip())
            )
            existing_result = existing_query.execute()

            if existing_result.data and len(existing_result.data) > 0:
                logger.info(f"Artist already exists: {name.strip()}")
                return {
                    "success": True,
                    "data": existing_result.data[0],
                    "created": False
                }

            # Create new artist
            artist_data = {"name": name.strip()}
            if bio and bio.strip():
                artist_data["bio"] = bio.strip()
            if image_url and image_url.strip():
                artist_data["image_url"] = image_url.strip()

            insert_result = (
                self.supabase.table('artists')
                .insert(artist_data)
                .execute()
            )

            logger.info(f"Created new artist: {name.strip()}")
            return {
                "success": True,
                "data": insert_result.data[0],
                "created": True
            }

        except ValueError as ve:
            logger.error(f"Validation error in create_artist: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to create/find artist: {str(e)}"
            logger.error(f"Error creating artist '{name.strip()}': {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def create_album(self, title: str, artist_id: str, cover_image_url: Optional[str] = None, release_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new album or return existing one if it already exists.

        Used internally by bulk_insert_songs() for album management.

        Args:
            title (str): Album title (required)
            artist_id (str): ID of the artist (required)
            cover_image_url (str, optional): Album cover image URL
            release_date (str, optional): Album release date

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (dict): Album data
            - created (bool): True if new album was created, False if existing was returned
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If title or artist_id are empty
        """
        # Input validation
        if not title or not title.strip():
            raise ValueError("Album title cannot be empty")
        if not artist_id or not artist_id.strip():
            raise ValueError("Artist ID cannot be empty")

        try:
            logger.info(f"Creating/finding album: {title.strip()} for artist {artist_id.strip()}")

            # Check if album already exists for this artist
            existing_query = (
                self.supabase.table('albums')
                .select('*')
                .eq('title', title.strip())
                .eq('artist_id', artist_id.strip())
            )
            existing_result = existing_query.execute()

            if existing_result.data and len(existing_result.data) > 0:
                logger.info(f"Album already exists: {title.strip()}")
                return {
                    "success": True,
                    "data": existing_result.data[0],
                    "created": False
                }

            # Create new album
            album_data = {
                "title": title.strip(),
                "artist_id": artist_id.strip()
            }
            if cover_image_url and cover_image_url.strip():
                album_data["cover_image_url"] = cover_image_url.strip()
            if release_date and release_date.strip():
                album_data["release_date"] = release_date.strip()

            insert_result = (
                self.supabase.table('albums')
                .insert(album_data)
                .execute()
            )

            logger.info(f"Created new album: {title.strip()}")
            return {
                "success": True,
                "data": insert_result.data[0],
                "created": True
            }

        except ValueError as ve:
            logger.error(f"Validation error in create_album: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to create/find album: {str(e)}"
            logger.error(f"Error creating album '{title.strip()}': {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def bulk_insert_songs(self, songs_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Bulk insert multiple songs with automatic artist and album creation.

        POST /admin/songs/bulk

        This method processes a list of song data, automatically creating artists and albums
        as needed, then inserts all songs in a single database operation.

        Args:
            songs_data (List[Dict]): List of song data dictionaries. Each dict should contain:
                - title (str): Song title (required)
                - artist_name/artist (str): Artist name (required)
                - album_name/album (str, optional): Album name
                - duration_seconds (int, optional): Song duration in seconds
                - file_path (str, optional): Path to audio file
                - cover_image_url (str, optional): Song cover image URL
                - album_cover_url (str, optional): Album cover image URL

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (list): List of created song records
            - count (int): Number of songs created
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If songs_data is empty or contains invalid data
        """
        # Input validation
        if not songs_data or len(songs_data) == 0:
            raise ValueError("Songs data cannot be empty")

        try:
            logger.info(f"Starting bulk insert of {len(songs_data)} songs")

            processed_songs = []

            for song in songs_data:
                # Validate required fields
                if not song.get('title') or not song.get('title').strip():
                    logger.warning(f"Skipping song with missing title: {song}")
                    continue

                artist_name = song.get('artist_name') or song.get('artist')
                if not artist_name or not artist_name.strip():
                    logger.warning(f"Skipping song '{song.get('title')}' with missing artist")
                    continue

                # Create/get artist
                artist_result = self.create_artist(artist_name.strip())
                if not artist_result.get("success"):
                    logger.error(f"Failed to create/find artist '{artist_name}' for song '{song.get('title')}'")
                    continue

                artist_id = artist_result["data"]["id"]

                # Create/get album if provided
                album_id = None
                album_name = song.get('album_name') or song.get('album')
                if album_name and album_name.strip():
                    album_result = self.create_album(
                        album_name.strip(),
                        artist_id,
                        song.get('album_cover_url')
                    )
                    if album_result.get("success"):
                        album_id = album_result["data"]["id"]
                    else:
                        logger.warning(f"Failed to create album '{album_name}' for song '{song.get('title')}'")

                # Prepare song data for insertion
                song_data = {
                    "title": song["title"].strip(),
                    "artist_id": artist_id,
                    "duration_seconds": song.get("duration_seconds"),
                    "file_path": song.get("file_path"),
                    "cover_image_url": song.get("cover_image_url")
                }

                # Add album_id if available
                if album_id:
                    song_data["album_id"] = album_id

                processed_songs.append(song_data)

            if not processed_songs:
                logger.warning("No valid songs to insert after processing")
                return {
                    "success": False,
                    "error": "No valid songs to insert"
                }

            # Bulk insert all processed songs
            insert_result = (
                self.supabase.table('songs')
                .insert(processed_songs)
                .execute()
            )

            logger.info(f"Successfully bulk inserted {len(insert_result.data)} songs")
            return {
                "success": True,
                "data": insert_result.data,
                "count": len(insert_result.data)
            }

        except ValueError as ve:
            logger.error(f"Validation error in bulk_insert_songs: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to bulk insert songs: {str(e)}"
            logger.error(f"Error in bulk_insert_songs: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def update_song(self, song_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update song information.

        PUT /admin/songs/{song_id}

        Args:
            song_id (str): ID of the song to update
            update_data (Dict): Fields to update (title, duration_seconds, etc.)

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (list): Updated song data
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If song_id is empty
        """
        # Input validation
        if not song_id or not song_id.strip():
            raise ValueError("Song ID cannot be empty")

        try:
            logger.info(f"Updating song {song_id.strip()}")

            # Update song data
            update_result = (
                self.supabase.table('songs')
                .update(update_data)
                .eq('id', song_id.strip())
                .execute()
            )

            if update_result.data:
                logger.info(f"Successfully updated song {song_id.strip()}")
                return {
                    "success": True,
                    "data": update_result.data
                }
            else:
                logger.warning(f"No song found with ID {song_id.strip()}")
                return {
                    "success": False,
                    "error": "Song not found"
                }

        except ValueError as ve:
            logger.error(f"Validation error in update_song: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to update song: {str(e)}"
            logger.error(f"Error updating song {song_id.strip()}: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def update_trending_songs(self, trending_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Update trending songs rankings.

        POST /admin/trending/songs

        This method clears existing trending songs and inserts new trending data.
        Used for updating the trending songs list based on play counts or other metrics.

        Args:
            trending_data (List[Dict]): List of trending song data with ranking information

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (list): Inserted trending song records
            - count (int): Number of trending songs updated
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If trending_data is empty
        """
        # Input validation
        if not trending_data or len(trending_data) == 0:
            raise ValueError("Trending data cannot be empty")

        try:
            logger.info(f"Updating trending songs with {len(trending_data)} entries")

            # Clear existing trending songs (delete all records)
            clear_result = (
                self.supabase.table('trending_songs')
                .delete()
                .neq('id', 0)  # Delete all records
                .execute()
            )

            logger.debug(f"Cleared {len(clear_result.data) if clear_result.data else 0} existing trending songs")

            # Insert new trending data
            insert_result = (
                self.supabase.table('trending_songs')
                .insert(trending_data)
                .execute()
            )

            logger.info(f"Successfully updated {len(insert_result.data)} trending songs")
            return {
                "success": True,
                "data": insert_result.data,
                "count": len(insert_result.data)
            }

        except ValueError as ve:
            logger.error(f"Validation error in update_trending_songs: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to update trending songs: {str(e)}"
            logger.error(f"Error in update_trending_songs: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def update_trending_albums(self, albums_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Update trending albums rankings.

        POST /admin/trending/albums

        This method clears existing trending albums and inserts new trending data.

        Args:
            albums_data (List[Dict]): List of trending album data with ranking information

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (list): Inserted trending album records
            - count (int): Number of trending albums updated
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If albums_data is empty
        """
        # Input validation
        if not albums_data or len(albums_data) == 0:
            raise ValueError("Albums data cannot be empty")

        try:
            logger.info(f"Updating trending albums with {len(albums_data)} entries")

            # Clear existing trending albums
            clear_result = (
                self.supabase.table('trending_albums')
                .delete()
                .neq('id', 0)
                .execute()
            )

            # Insert new trending data
            insert_result = (
                self.supabase.table('trending_albums')
                .insert(albums_data)
                .execute()
            )

            logger.info(f"Successfully updated {len(insert_result.data)} trending albums")
            return {
                "success": True,
                "data": insert_result.data,
                "count": len(insert_result.data)
            }

        except ValueError as ve:
            logger.error(f"Validation error in update_trending_albums: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to update trending albums: {str(e)}"
            logger.error(f"Error in update_trending_albums: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def get_song_analytics(self, song_id: str) -> Dict[str, Any]:
        """
        Get analytics data for a specific song.

        GET /admin/analytics/song/{song_id}

        Note: Currently returns basic song info. Full analytics would require
        additional tables for play counts, user interactions, etc.

        Args:
            song_id (str): ID of the song to get analytics for

        Returns:
            Dict containing song info and placeholder analytics data:
            - song (dict): Basic song information
            - total_plays (int): Placeholder for play count
            - unique_listeners (int): Placeholder for unique listeners
            - favorites_count (int): Placeholder for favorites count
            - error (str, optional): Error message if song not found

        Raises:
            ValueError: If song_id is empty
        """
        # Input validation
        if not song_id or not song_id.strip():
            raise ValueError("Song ID cannot be empty")

        try:
            logger.info(f"Getting analytics for song {song_id.strip()}")

            # Get song information
            song_query = (
                self.supabase.table('songs')
                .select('*')
                .eq('id', song_id.strip())
            )
            song_result = song_query.execute()

            if not song_result.data:
                logger.warning(f"Song not found: {song_id.strip()}")
                return {"error": "Song not found"}

            song_data = song_result.data[0]

            # TODO: Implement actual analytics queries when analytics tables are created
            # For now, return placeholder data
            analytics = {
                "song": song_data,
                "total_plays": 0,  # Would query user_song_plays table
                "unique_listeners": 0,  # Would count distinct users
                "favorites_count": 0  # Would query liked_songs table
            }

            logger.info(f"Retrieved analytics for song: {song_data.get('title', 'Unknown')}")
            return analytics

        except ValueError as ve:
            logger.error(f"Validation error in get_song_analytics: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to get song analytics: {str(e)}"
            logger.error(f"Error getting analytics for song {song_id.strip()}: {error_msg}")
            return {"error": error_msg}

    def get_top_songs(self, limit: int = 50) -> Dict[str, Any]:
        """
        Get top songs by some criteria (currently just returns recent songs).

        GET /admin/analytics/top-songs

        Note: Currently returns songs ordered by ID (recent first).
        Full implementation would use play counts or other metrics.

        Args:
            limit (int): Maximum number of songs to return (default: 50)

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - data (list): List of top songs
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If limit is invalid
        """
        # Input validation
        if limit <= 0 or limit > 1000:
            raise ValueError("Limit must be between 1 and 1000")

        try:
            logger.info(f"Getting top {limit} songs")

            # TODO: Implement actual top songs logic based on play counts/analytics
            # For now, just return recent songs
            songs_query = (
                self.supabase.table('songs')
                .select('*')
                .limit(limit)
                .order('id', desc=True)  # Most recent first
            )
            songs_result = songs_query.execute()

            logger.info(f"Retrieved {len(songs_result.data)} top songs")
            return {
                "success": True,
                "data": songs_result.data
            }

        except ValueError as ve:
            logger.error(f"Validation error in get_top_songs: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to get top songs: {str(e)}"
            logger.error(f"Error in get_top_songs: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def cleanup_orphaned_data(self) -> Dict[str, Any]:
        """
        Clean up orphaned records in the database.

        POST /admin/maintenance/cleanup

        This method identifies and removes records that reference non-existent entities.
        Currently returns placeholder data as cleanup requires custom SQL functions.

        Returns:
            Dict containing cleanup results:
            - message (str): Status message
            - orphaned_playlist_songs (int): Number of orphaned playlist songs removed
            - orphaned_trending_songs (int): Number of orphaned trending songs removed
            - error (str, optional): Error message if operation failed
        """
        try:
            logger.info("Starting database cleanup operation")

            # TODO: Implement actual cleanup logic with custom SQL functions in Supabase
            # This would require stored procedures or complex queries to find:
            # - Playlist songs referencing deleted songs/playlists
            # - Trending entries referencing deleted songs/albums
            # - Other orphaned relationships

            cleanup_result = {
                "message": "Cleanup functionality needs custom SQL functions in Supabase",
                "orphaned_playlist_songs": 0,
                "orphaned_trending_songs": 0
            }

            logger.info("Cleanup operation completed (placeholder implementation)")
            return cleanup_result

        except Exception as e:
            error_msg = f"Cleanup operation failed: {str(e)}"
            logger.error(f"Error in cleanup_orphaned_data: {error_msg}")
            return {"error": error_msg}