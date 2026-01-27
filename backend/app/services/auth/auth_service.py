"""
Authentication Service Module

Handles user authentication operations for the Spotify-like application.
This service manages user registration, login, password reset, and password updates.

API Endpoints that use this service:
- POST /auth/signup -> create_user()
- POST /auth/login -> login_user()
- POST /auth/reset-password -> reset_password()
- POST /auth/update-password -> update_password()
"""

import os
import httpx
import logging
from typing import Dict, Optional
from app.services.base.base_client import BaseSupabaseClient

logger = logging.getLogger(__name__)


class AuthService(BaseSupabaseClient):
    """
    Service for managing user authentication and account operations.

    This service handles all authentication-related operations including
    user registration, login, password management, and session handling
    using Supabase Auth.
    """

    def create_user(self, email: str, password: str, name: str) -> Dict[str, any]:
        """
        Create a new user account with Supabase Auth.

        POST /auth/signup

        Args:
            email (str): User's email address (must be valid format)
            password (str): User's password (must meet security requirements)
            name (str): User's display name

        Returns:
            Dict containing:
            - success (bool): True if user was created successfully
            - user (dict): User object from Supabase if successful
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If email, password, or name are empty/invalid
        """
        # Input validation
        if not email or not email.strip():
            raise ValueError("Email cannot be empty")
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters long")
        if not name or not name.strip():
            raise ValueError("Name cannot be empty")

        try:
            logger.info(f"Creating new user account for email: {email.strip()}")

            # Create user with Supabase Auth
            signup_response = self.supabase.auth.sign_up({
                "email": email.strip(),
                "password": password,
                "options": {
                    "data": {
                        "name": name.strip()
                    }
                }
            })

            if signup_response.user:
                logger.info(f"User account created successfully for: {email.strip()}")
                return {
                    "success": True,
                    "user": signup_response.user
                }
            else:
                logger.warning(f"User creation failed for email: {email.strip()}")
                return {
                    "success": False,
                    "error": "Failed to create user account"
                }

        except ValueError as ve:
            logger.error(f"Validation error in create_user: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to create user: {str(e)}"
            logger.error(f"Error creating user for {email.strip()}: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def login_user(self, email: str, password: str) -> Dict[str, any]:
        """
        Authenticate user with email and password.

        POST /auth/login

        Args:
            email (str): User's email address
            password (str): User's password

        Returns:
            Dict containing:
            - success (bool): True if login was successful
            - user (dict): User object from Supabase if successful
            - session (dict): Session data including tokens if successful
            - error (str, optional): Error message if login failed

        Raises:
            ValueError: If email or password are empty
        """
        # Input validation
        if not email or not email.strip():
            raise ValueError("Email cannot be empty")
        if not password or not password.strip():
            raise ValueError("Password cannot be empty")

        try:
            logger.info(f"Attempting login for user: {email.strip()}")

            # Authenticate with Supabase
            login_response = self.supabase.auth.sign_in_with_password({
                "email": email.strip(),
                "password": password.strip()
            })

            if login_response.user:
                logger.info(f"Login successful for user: {email.strip()}")
                return {
                    "success": True,
                    "user": login_response.user,
                    "session": login_response.session
                }
            else:
                logger.warning(f"Login failed for user: {email.strip()} - invalid credentials")
                return {
                    "success": False,
                    "error": "Invalid email or password"
                }

        except ValueError as ve:
            logger.error(f"Validation error in login_user: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Login failed: {str(e)}"
            logger.error(f"Error during login for {email.strip()}: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def reset_password(self, email: str) -> Dict[str, any]:
        """
        Send password reset email to user.

        POST /auth/reset-password

        Args:
            email (str): Email address to send reset link to

        Returns:
            Dict containing:
            - success (bool): True if reset email was sent successfully
            - message (str): Success message
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If email is empty or invalid
        """
        # Input validation
        if not email or not email.strip():
            raise ValueError("Email cannot be empty")

        try:
            logger.info(f"Sending password reset email to: {email.strip()}")

            # Send password reset email via Supabase
            reset_response = self.supabase.auth.reset_password_email(
                email.strip(),
                {"redirect_to": "http://localhost:3000/auth/reset-password"}
            )

            logger.info(f"Password reset email sent successfully to: {email.strip()}")
            return {
                "success": True,
                "message": "Password reset email sent successfully"
            }

        except ValueError as ve:
            logger.error(f"Validation error in reset_password: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Failed to send password reset email: {str(e)}"
            logger.error(f"Error sending password reset to {email.strip()}: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

    def update_password(self, access_token: str, refresh_token: str, new_password: str) -> Dict[str, any]:
        """
        Update user password using access tokens from password reset.

        POST /auth/update-password

        Args:
            access_token (str): Access token from password reset email
            refresh_token (str): Refresh token from password reset email (optional)
            new_password (str): New password to set

        Returns:
            Dict containing:
            - success (bool): True if password was updated successfully
            - message (str): Success message
            - error (str, optional): Error message if operation failed

        Raises:
            ValueError: If access_token or new_password are empty/invalid
        """
        # Input validation
        if not access_token or not access_token.strip():
            raise ValueError("Access token cannot be empty")
        if not new_password or len(new_password) < 6:
            raise ValueError("New password must be at least 6 characters long")

        try:
            logger.info(f"Attempting password update, has refresh token: {bool(refresh_token)}")

            if refresh_token and refresh_token.strip():
                # Use refresh token to update password
                logger.debug("Using refresh token for password update")
                self.supabase.auth.set_session(access_token.strip(), refresh_token.strip())
                update_response = self.supabase.auth.update_user({"password": new_password})

                if update_response.user:
                    logger.info("Password updated successfully using refresh token")
                    return {
                        "success": True,
                        "message": "Password updated successfully"
                    }
                else:
                    logger.warning("Password update failed using refresh token")
                    return {
                        "success": False,
                        "error": "Failed to update password"
                    }
            else:
                # Fallback: Use direct API call with access token
                logger.debug("Using direct API call for password update")
                supabase_url = os.getenv("SUPABASE_URL")
                anon_key = os.getenv("SUPABASE_ANON_KEY")

                if not supabase_url or not anon_key:
                    raise ValueError("Supabase configuration missing")

                headers = {
                    "Authorization": f"Bearer {access_token.strip()}",
                    "apikey": anon_key,
                    "Content-Type": "application/json"
                }

                # Make direct API call to update password
                with httpx.Client() as client:
                    response = client.put(
                        f"{supabase_url}/auth/v1/user",
                        headers=headers,
                        json={"password": new_password}
                    )

                    logger.info(f"Supabase API response status: {response.status_code}")

                    if response.status_code == 200:
                        logger.info("Password updated successfully using direct API call")
                        return {
                            "success": True,
                            "message": "Password updated successfully"
                        }
                    else:
                        # Parse error from response
                        try:
                            error_data = response.json()
                            error_msg = (
                                error_data.get("error_description") or
                                error_data.get("msg") or
                                error_data.get("error") or
                                "Failed to update password"
                            )
                        except:
                            error_msg = f"API error: {response.status_code}"

                        logger.warning(f"Password update failed: {error_msg}")
                        return {
                            "success": False,
                            "error": error_msg
                        }

        except ValueError as ve:
            logger.error(f"Validation error in update_password: {str(ve)}")
            raise ve
        except Exception as e:
            error_msg = f"Password update failed: {str(e)}"
            logger.error(f"Exception during password update: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }
