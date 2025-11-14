from pydantic import BaseModel

class TrackDownloadRequest(BaseModel):
    track: str

class TrackDownloadResponse(BaseModel):
    data: str