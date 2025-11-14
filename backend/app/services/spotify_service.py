import http.client
from app.core.config import settings

class SpotifyService:
    def get_track_download(self, track_name: str) -> str:
        conn = http.client.HTTPSConnection(settings.RAPIDAPI_HOST)
        
        headers = {
            'x-rapidapi-key': settings.RAPIDAPI_KEY,
            'x-rapidapi-host': settings.RAPIDAPI_HOST
        }
        
        conn.request("GET", f"/v1/track/download?track={track_name}", headers=headers)
        
        res = conn.getresponse()
        data = res.read()
        
        return data.decode("utf-8")