"""
Storage Service Module

Handles file uploads to Supabase Storage.
"""

import os
from app.services.base.base_client import BaseSupabaseClient


class StorageService(BaseSupabaseClient):
    """Service for file storage operations"""

    def upload_file(self, file_content: bytes, file_path: str, content_type: str) -> str:
        """Upload file to Supabase Storage songs bucket"""
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

    def upload_cover(self, file_content: bytes, file_path: str, content_type: str) -> str:
        """Upload cover image to Supabase Storage covers bucket"""
        try:
            covers_bucket = "covers"
            print(f"Uploading cover to: {covers_bucket}/{file_path}")
            print(f"Content type: {content_type}")
            print(f"File size: {len(file_content)} bytes")

            result = self.supabase.storage.from_(covers_bucket).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            print(f"Upload result: {result}")

            public_url = f"{self.supabase_url}/storage/v1/object/public/{covers_bucket}/{file_path}"
            print(f"Cover URL: {public_url}")
            return public_url
        except Exception as e:
            print(f"Cover upload error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
