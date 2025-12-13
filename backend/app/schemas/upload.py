from pydantic import BaseModel
from typing import Optional

class SongUploadRequest(BaseModel):
    title: str       # Base64 encoded
    artist: str      # Base64 encoded
    album: Optional[str] = None      # Base64 encoded
    cover_image: Optional[str] = None # Base64 encoded
    file_content: str # Base64 encoded file data
    file_name: str    # Base64 encoded filename
    content_type: str # Base64 encoded MIME type (e.g. audio/mpeg)
