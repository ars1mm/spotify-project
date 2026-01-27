"""
Playlist Service Module

Handles playlist operations for the Spotify-like application.
This service manages playlist creation, retrieval, updates, and song management within playlists.

API Endpoints that use this service:
- POST /playlists -> create_playlist()
- GET /playlists -> get_playlists()
- GET /playlists/{playlist_id} -> get_playlist_by_id()
- PUT /playlists/{playlist_id} -> update_playlist()
- POST /playlists/{playlist_id}/songs/{song_id} -> add_song_to_playlist()
- DELETE /playlists/{playlist_id}/songs/{song_id} -> remove_song_from_playlist()
"""

import logging
from typing import Dict, List, Optional
from app.services.base.base_client import BaseSupabaseClient
from app.services.base.base_client import get_supabase_admin_client

logger = logging.getLogger(__name__)


class PlaylistService(BaseSupabaseClient):
    """
    Service for managing playlist operations.

    This service handles all playlist-related functionality including creation,
    retrieval, updates, and managing songs within playlists.
    """

    def create_playlist(self, name: str, description: str, is_public: bool, user_id: str, song_ids: Optional[List[str]] = None) -> Dict[str, any]:
        """
        Create a new playlist with optional initial songs.

        POST /playlists

        Args:
            name (str): Playlist name
            description (str): Playlist description
            is_public (bool): Whether the playlist is public
            user_id (str): ID of the user creating the playlist
            song_ids (List[str], optional): List of song IDs to add to the playlist

        Returns:
            Dict containing:
            - success (bool): True if creation succeeded
            - playlist (dict): Created playlist data
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If required fields are missing
        """
        # Input validation
        if not name or not name.strip():
            raise ValueError("Playlist name cannot be empty")
        if not user_id or not user_id.strip():
            raise ValueError("User ID cannot be empty")

        try:
            logger.info(f"Creating playlist '{name.strip()}' for user {user_id.strip()}")

            # Create the playlist
            playlist_data = {
                "name": name.strip(),
                "description": description.strip() if description else "",
                "is_public": is_public,
                "user_id": user_id.strip()
            }

            insert_response = (
                self.supabase.table("playlists")
                .insert(playlist_data)
                .execute()
            )

            if insert_response.data:
                playlist_id = insert_response.data[0]['id']

                # Add songs to playlist if provided
                if song_ids and len(song_ids) > 0:
                    logger.debug(f"Adding {len(song_ids)} songs to new playlist {playlist_id}")
                    for idx, song_id in enumerate(song_ids):
                        if song_id and song_id.strip():
                            song_insert = (
                                self.supabase.table("playlist_songs")
                                .insert({
                                    "playlist_id": playlist_id,
                                    "song_id": song_id.strip(),
                                    "position": idx
                                })
                                .execute()
                            )

                logger.info(f"Successfully created playlist '{name.strip()}' with ID {playlist_id}")
                return {
                    "success": True,
                    "playlist": insert_response.data[0]
                }
            else:
                logger.warning(f"Playlist creation returned no data for '{name.strip()}'")
                return {"error": "Failed to create playlist"}

        except ValueError as ve:
            logger.error(f"Validation error in create_playlist: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to create playlist: {str(e)}"
            logger.error(f"Error creating playlist '{name.strip()}': {error_msg}")
            return {"error": error_msg}

    def get_playlists(self, user_id: Optional[str] = None, public_only: bool = False) -> Dict[str, any]:
        """
        Retrieve playlists based on user and visibility criteria.

        GET /playlists

        Args:
            user_id (str, optional): Filter playlists by specific user
            public_only (bool): If True, return only public playlists

        Returns:
            Dict containing:
            - playlists (List[Dict]): List of playlist objects
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If user_id is provided but empty
        """
        # Input validation
        if user_id is not None and (not user_id or not user_id.strip()):
            raise ValueError("User ID cannot be empty when provided")

        try:
            logger.info(f"Retrieving playlists - user_id: {user_id}, public_only: {public_only}")

            # Build query based on parameters
            query = self.supabase.table("playlists").select("*")

            if public_only:
                query = query.eq("is_public", True)
            elif user_id:
                query = query.eq("user_id", user_id.strip())

            # Order by creation date (newest first)
            query = query.order("created_at", desc=True)
            response = query.execute()

            logger.info(f"Retrieved {len(response.data)} playlists")
            return {"playlists": response.data}

        except ValueError as ve:
            logger.error(f"Validation error in get_playlists: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to retrieve playlists: {str(e)}"
            logger.error(f"Error in get_playlists: {error_msg}")
            return {
                "error": error_msg,
                "playlists": []
            }

    def get_playlist_by_id(self, playlist_id: str) -> Dict[str, any]:
        """
        Retrieve a specific playlist with its songs and owner information.

        GET /playlists/{playlist_id}

        Args:
            playlist_id (str): ID of the playlist to retrieve

        Returns:
            Dict containing:
            - playlist (dict): Playlist metadata including owner information
            - songs (List[Dict]): List of songs in the playlist with full details
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If playlist_id is empty
        """
        # Input validation
        if not playlist_id or not playlist_id.strip():
            raise ValueError("Playlist ID cannot be empty")

        try:
            logger.info(f"Retrieving playlist: {playlist_id.strip()}")

            # Get playlist metadata
            playlist_query = (
                self.supabase.table("playlists")
                .select("*")
                .eq("id", playlist_id.strip())
            )
            playlist_response = playlist_query.execute()

            if not playlist_response.data:
                logger.warning(f"Playlist not found: {playlist_id.strip()}")
                return {"error": "Playlist not found"}

            playlist = playlist_response.data[0]

            # Try to get user information using admin client first
            try:
                admin_client = get_supabase_admin_client()
                user_response = admin_client.auth.admin.get_user_by_id(playlist['user_id'])
                if user_response and user_response.user:
                    user_metadata = user_response.user.user_metadata or {}
                    user_name = (
                        user_metadata.get('name') or
                        user_response.user.email.split('@')[0] if user_response.user.email else 'Unknown'
                    )
                    playlist['users'] = {"name": user_name}
                    logger.debug(f"Retrieved user info via admin client for playlist {playlist_id.strip()}")
            except Exception as admin_error:
                logger.debug(f"Admin client failed, falling back to users table: {str(admin_error)}")
                # Fallback: try to get user info from users table
                try:
                    user_query = (
                        self.supabase.table("users")
                        .select("name")
                        .eq("id", playlist['user_id'])
                    )
                    user_response = user_query.execute()
                    if user_response.data and user_response.data[0].get('name'):
                        playlist['users'] = {"name": user_response.data[0]['name']}
                        logger.debug(f"Retrieved user info from users table for playlist {playlist_id.strip()}")
                except Exception as user_error:
                    logger.warning(f"Could not retrieve user info for playlist {playlist_id.strip()}: {str(user_error)}")

            # Get songs in the playlist with their details
            songs_query = (
                self.supabase.table("playlist_songs")
                .select("*, songs(*)")
                .eq("playlist_id", playlist_id.strip())
                .order("position")
            )
            songs_response = songs_query.execute()

            songs = []
            for playlist_song in songs_response.data:
                song_data = playlist_song.get('songs')
                if not song_data:
                    logger.warning(f"Orphaned playlist song entry found in playlist {playlist_id.strip()}")
                    continue

                # Generate audio URL for the song
                audio_url = self._get_audio_url(song_data.get('file_path'))

                # Format song data for response
                formatted_song = {
                    "id": song_data['id'],
                    "title": song_data['title'],
                    "artist": song_data['artist'],
                    "album": song_data.get('album'),
                    "duration_seconds": song_data.get('duration_seconds'),
                    "cover_image_url": song_data.get('cover_image_url'),
                    "audio_url": audio_url,
                    "position": playlist_song.get('position')  # Song position in playlist
                }
                songs.append(formatted_song)

            logger.info(f"Retrieved playlist '{playlist.get('name', 'Unknown')}' with {len(songs)} songs")
            return {
                "playlist": playlist,
                "songs": songs
            }

        except ValueError as ve:
            logger.error(f"Validation error in get_playlist_by_id: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to retrieve playlist: {str(e)}"
            logger.error(f"Error retrieving playlist {playlist_id.strip()}: {error_msg}")
            return {"error": error_msg}

    def update_playlist(self, playlist_id: str, name: Optional[str] = None, description: Optional[str] = None, is_public: Optional[bool] = None) -> Dict[str, any]:
        """
        Update playlist metadata.

        PUT /playlists/{playlist_id}

        Args:
            playlist_id (str): ID of the playlist to update
            name (str, optional): New playlist name
            description (str, optional): New playlist description
            is_public (bool, optional): New visibility setting

        Returns:
            Dict containing:
            - success (bool): True if update succeeded
            - playlist (dict): Updated playlist data
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If playlist_id is empty or no update fields provided
        """
        # Input validation
        if not playlist_id or not playlist_id.strip():
            raise ValueError("Playlist ID cannot be empty")

        # Check if at least one field is being updated
        update_fields = [name, description, is_public]
        if not any(field is not None for field in update_fields):
            raise ValueError("At least one field must be provided for update")

        try:
            logger.info(f"Updating playlist {playlist_id.strip()}")

            # Build update data object
            update_data = {}
            if name is not None:
                if not name or not name.strip():
                    raise ValueError("Playlist name cannot be empty")
                update_data['name'] = name.strip()
            if description is not None:
                update_data['description'] = description.strip() if description else ""
            if is_public is not None:
                update_data['is_public'] = is_public

            # Perform update
            update_response = (
                self.supabase.table("playlists")
                .update(update_data)
                .eq("id", playlist_id.strip())
                .execute()
            )

            if update_response.data:
                logger.info(f"Successfully updated playlist {playlist_id.strip()}")
                return {
                    "success": True,
                    "playlist": update_response.data[0]
                }
            else:
                logger.warning(f"No playlist found with ID {playlist_id.strip()}")
                return {"error": "Playlist not found"}

        except ValueError as ve:
            logger.error(f"Validation error in update_playlist: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to update playlist: {str(e)}"
            logger.error(f"Error updating playlist {playlist_id.strip()}: {error_msg}")
            return {"error": error_msg}

    def add_song_to_playlist(self, playlist_id: str, song_id: str) -> Dict[str, any]:
        """
        Add a song to an existing playlist.

        POST /playlists/{playlist_id}/songs/{song_id}

        The song is added at the end of the playlist (highest position number).

        Args:
            playlist_id (str): ID of the playlist
            song_id (str): ID of the song to add

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - message (str): Success message
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If playlist_id or song_id are empty
        """
        # Input validation
        if not playlist_id or not playlist_id.strip():
            raise ValueError("Playlist ID cannot be empty")
        if not song_id or not song_id.strip():
            raise ValueError("Song ID cannot be empty")

        try:
            logger.info(f"Adding song {song_id.strip()} to playlist {playlist_id.strip()}")

            # Get the highest position in the playlist to determine next position
            position_query = (
                self.supabase.table("playlist_songs")
                .select("position")
                .eq("playlist_id", playlist_id.strip())
                .order("position", desc=True)
                .limit(1)
            )
            position_response = position_query.execute()

            # Calculate next position (0 if playlist is empty, otherwise max + 1)
            next_position = (position_response.data[0]['position'] + 1) if position_response.data else 0

            # Add song to playlist
            insert_data = {
                "playlist_id": playlist_id.strip(),
                "song_id": song_id.strip(),
                "position": next_position
            }

            insert_response = (
                self.supabase.table("playlist_songs")
                .insert(insert_data)
                .execute()
            )

            logger.info(f"Successfully added song {song_id.strip()} to playlist {playlist_id.strip()} at position {next_position}")
            return {
                "success": True,
                "message": "Song added to playlist successfully"
            }

        except ValueError as ve:
            logger.error(f"Validation error in add_song_to_playlist: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to add song to playlist: {str(e)}"
            logger.error(f"Error adding song {song_id.strip()} to playlist {playlist_id.strip()}: {error_msg}")
            return {"error": error_msg}

    def remove_song_from_playlist(self, playlist_id: str, song_id: str) -> Dict[str, any]:
        """
        Remove a song from a playlist.

        DELETE /playlists/{playlist_id}/songs/{song_id}

        Args:
            playlist_id (str): ID of the playlist
            song_id (str): ID of the song to remove

        Returns:
            Dict containing:
            - success (bool): True if operation succeeded
            - message (str): Success message
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If playlist_id or song_id are empty
        """
        # Input validation
        if not playlist_id or not playlist_id.strip():
            raise ValueError("Playlist ID cannot be empty")
        if not song_id or not song_id.strip():
            raise ValueError("Song ID cannot be empty")

        try:
            logger.info(f"Removing song {song_id.strip()} from playlist {playlist_id.strip()}")

            # Delete the playlist-song relationship
            delete_response = (
                self.supabase.table("playlist_songs")
                .delete()
                .eq("playlist_id", playlist_id.strip())
                .eq("song_id", song_id.strip())
                .execute()
            )

            logger.info(f"Successfully removed song {song_id.strip()} from playlist {playlist_id.strip()}")
            return {
                "success": True,
                "message": "Song removed from playlist successfully"
            }

        except ValueError as ve:
            logger.error(f"Validation error in remove_song_from_playlist: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to remove song from playlist: {str(e)}"
            logger.error(f"Error removing song {song_id.strip()} from playlist {playlist_id.strip()}: {error_msg}")
            return {"error": error_msg}
