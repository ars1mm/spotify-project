from pydantic import BaseModel
from typing import Optional

class SongUploadRequest(BaseModel):
    title: str
    artist: str
    album: str
    cover_file_name: str
    cover_content_type: str
    cover_file_content: str  # Base64 encoded cover image
    file_name: str
    content_type: str
    file_content: str  # Base64 encoded file content
    duration_seconds: Optional[int] = None