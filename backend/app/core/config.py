import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the backend directory
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "Spotify Backend"
    RAPIDAPI_KEY: str = os.getenv("RAPIDAPI_KEY", "")
    RAPIDAPI_HOST: str = os.getenv("RAPIDAPI_HOST", "spotify-scraper.p.rapidapi.com")
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # API Versioning Configuration
    API_PREFIX: str = "/api"
    MAIN_ROUTE_VERSION: int = int(os.getenv("MAIN_ROUTE_VERSION", "1"))
    ADMIN_ROUTE_VERSION: int = int(os.getenv("ADMIN_ROUTE_VERSION", "1"))
    CODEBASE_ROUTE_VERSION: int = int(os.getenv("CODEBASE_ROUTE_VERSION", "1"))
    
    @property
    def main_api_prefix(self) -> str:
        return f"{self.API_PREFIX}/v{self.MAIN_ROUTE_VERSION}"
    
    @property
    def admin_api_prefix(self) -> str:
        return f"{self.API_PREFIX}/v{self.ADMIN_ROUTE_VERSION}"
    
    @property
    def codebase_api_prefix(self) -> str:
        return f"{self.API_PREFIX}/v{self.CODEBASE_ROUTE_VERSION}"

settings = Settings()