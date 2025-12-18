# Backend - Implementimi Teknik

## Përmbledhje

Backend-i është ndërtuar me FastAPI (Python), duke përdorur PostgreSQL për ruajtjen e të dhënave, Redis për caching, dhe Supabase për autentifikim dhe storage. Ofron një REST API të plotë për të gjitha funksionalitetet e aplikacionit.

## Struktura e Projektit

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py          # Autentifikimi
│   │       │   ├── songs.py         # CRUD për këngë
│   │       │   ├── playlists.py     # CRUD për playlists
│   │       │   ├── users.py         # User management
│   │       │   └── search.py        # Search functionality
│   │       └── api.py               # API router
│   ├── core/
│   │   ├── config.py                # Konfigurimi
│   │   ├── security.py              # Security utilities
│   │   └── dependencies.py          # FastAPI dependencies
│   ├── db/
│   │   ├── base.py                  # Database base
│   │   ├── session.py               # Database session
│   │   └── init_db.py               # Database initialization
│   ├── models/
│   │   ├── user.py                  # User model
│   │   ├── song.py                  # Song model
│   │   └── playlist.py              # Playlist model
│   ├── schemas/
│   │   ├── user.py                  # User schemas (Pydantic)
│   │   ├── song.py                  # Song schemas
│   │   └── playlist.py              # Playlist schemas
│   ├── services/
│   │   ├── auth_service.py          # Business logic për auth
│   │   ├── song_service.py          # Business logic për songs
│   │   ├── playlist_service.py      # Business logic për playlists
│   │   └── storage_service.py       # Supabase storage integration
│   └── utils/
│       ├── file_handler.py          # File upload utilities
│       └── validators.py            # Custom validators
├── alembic/                         # Database migrations
├── tests/                           # Unit dhe integration tests
├── main.py                          # Entry point
├── requirements.txt                 # Python dependencies
└── .env                             # Environment variables
```

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register
**Përshkrimi**: Regjistron një përdorues të ri

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/v1/auth/login
**Përshkrimi**: Autentifikon përdoruesin

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Song Endpoints

#### GET /api/v1/songs
**Përshkrimi**: Merr listën e këngëve me pagination

**Query Parameters**:
- `page`: Numri i faqes (default: 1)
- `limit`: Numri i këngëve për faqe (default: 20)

**Response**:
```json
{
  "songs": [
    {
      "id": "uuid",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "duration_seconds": 180,
      "cover_image_url": "https://...",
      "audio_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

#### POST /api/v1/songs
**Përshkrimi**: Upload një këngë të re

**Request**: Multipart form data
- `file`: Audio file (MP3, WAV, etc.)
- `title`: Titulli i këngës
- `artist`: Artisti
- `album`: Albumi (optional)
- `cover_image`: Cover image (optional)

**Response**:
```json
{
  "id": "uuid",
  "title": "Song Title",
  "artist": "Artist Name",
  "audio_url": "https://...",
  "cover_image_url": "https://..."
}
```

#### GET /api/v1/songs/{song_id}
**Përshkrimi**: Merr detajet e një kënge specifike

#### PUT /api/v1/songs/{song_id}
**Përshkrimi**: Përditëson metadata e këngës

#### DELETE /api/v1/songs/{song_id}
**Përshkrimi**: Fshin një këngë

### Playlist Endpoints

#### GET /api/v1/playlists
**Përshkrimi**: Merr playlists e përdoruesit

**Response**:
```json
{
  "playlists": [
    {
      "id": "uuid",
      "name": "My Playlist",
      "description": "Description here",
      "is_public": true,
      "song_count": 15,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/playlists
**Përshkrimi**: Krijon një playlist të re

**Request Body**:
```json
{
  "name": "My Playlist",
  "description": "Description here",
  "is_public": true
}
```

#### POST /api/v1/playlists/{playlist_id}/songs/{song_id}
**Përshkrimi**: Shton një këngë në playlist

#### DELETE /api/v1/playlists/{playlist_id}/songs/{song_id}
**Përshkrimi**: Heq një këngë nga playlist

### Search Endpoint

#### GET /api/v1/search
**Përshkrimi**: Kërkon këngë dhe playlists

**Query Parameters**:
- `q`: Search query

**Response**:
```json
{
  "songs": [...],
  "playlists": [...]
}
```

## Database Models

### User Model

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    playlists = relationship("Playlist", back_populates="user")
    uploaded_songs = relationship("Song", back_populates="uploader")
```

### Song Model

```python
class Song(Base):
    __tablename__ = "songs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    artist = Column(String, nullable=False, index=True)
    album = Column(String)
    duration_seconds = Column(Integer)
    file_path = Column(String, nullable=False)
    cover_image_url = Column(String)
    audio_url = Column(String, nullable=False)
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    uploader = relationship("User", back_populates="uploaded_songs")
    playlists = relationship("PlaylistSong", back_populates="song")
```

### Playlist Model

```python
class Playlist(Base):
    __tablename__ = "playlists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="playlists")
    songs = relationship("PlaylistSong", back_populates="playlist")
```

### PlaylistSong (Many-to-Many)

```python
class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id"))
    song_id = Column(UUID(as_uuid=True), ForeignKey("songs.id"))
    position = Column(Integer)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    playlist = relationship("Playlist", back_populates="songs")
    song = relationship("Song", back_populates="playlists")
```

## Pydantic Schemas

### User Schemas

```python
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Song Schemas

```python
class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None

class SongCreate(SongBase):
    pass

class SongResponse(SongBase):
    id: UUID
    duration_seconds: Optional[int]
    cover_image_url: Optional[str]
    audio_url: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Services Layer

### Song Service

```python
class SongService:
    def __init__(self, db: Session, storage_service: StorageService):
        self.db = db
        self.storage = storage_service
    
    async def create_song(
        self,
        file: UploadFile,
        title: str,
        artist: str,
        album: Optional[str],
        cover_image: Optional[UploadFile],
        user_id: UUID
    ) -> Song:
        # Upload audio file to Supabase Storage
        audio_url = await self.storage.upload_audio(file)
        
        # Upload cover image if provided
        cover_url = None
        if cover_image:
            cover_url = await self.storage.upload_image(cover_image)
        
        # Get audio duration
        duration = await self.get_audio_duration(file)
        
        # Create database record
        song = Song(
            title=title,
            artist=artist,
            album=album,
            audio_url=audio_url,
            cover_image_url=cover_url,
            duration_seconds=duration,
            uploader_id=user_id
        )
        
        self.db.add(song)
        self.db.commit()
        self.db.refresh(song)
        
        return song
    
    def get_songs(
        self,
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[Song], int]:
        offset = (page - 1) * limit
        
        query = self.db.query(Song)
        total = query.count()
        songs = query.offset(offset).limit(limit).all()
        
        return songs, total
    
    def search_songs(self, query: str) -> List[Song]:
        return self.db.query(Song).filter(
            or_(
                Song.title.ilike(f"%{query}%"),
                Song.artist.ilike(f"%{query}%"),
                Song.album.ilike(f"%{query}%")
            )
        ).all()
```

### Storage Service (Supabase Integration)

```python
class StorageService:
    def __init__(self):
        self.client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY
        )
        self.bucket_name = settings.SUPABASE_BUCKET_NAME
    
    async def upload_audio(self, file: UploadFile) -> str:
        # Generate unique filename
        file_ext = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = f"audio/{unique_filename}"
        
        # Read file content
        content = await file.read()
        
        # Upload to Supabase Storage
        self.client.storage.from_(self.bucket_name).upload(
            file_path,
            content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        url = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
        
        return url
    
    async def upload_image(self, file: UploadFile) -> str:
        # Similar implementation for images
        pass
    
    async def delete_file(self, file_path: str):
        self.client.storage.from_(self.bucket_name).remove([file_path])
```

## Authentication & Security

### JWT Token Generation

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt
```

### Password Hashing

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

### Dependency Injection

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user
```

## Error Handling

```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )
```

## Caching me Redis

```python
import redis
from functools import wraps

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)

def cache_result(expire_time: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            redis_client.setex(
                cache_key,
                expire_time,
                json.dumps(result)
            )
            
            return result
        return wrapper
    return decorator
```

## Database Migrations (Alembic)

### Krijimi i Migration

```bash
alembic revision --autogenerate -m "Add songs table"
```

### Ekzekutimi i Migrations

```bash
alembic upgrade head
```

### Rollback

```bash
alembic downgrade -1
```

## Testing

### Unit Tests

```python
def test_create_song(client, test_user, test_token):
    response = client.post(
        "/api/v1/songs",
        headers={"Authorization": f"Bearer {test_token}"},
        files={"file": ("test.mp3", b"fake audio data", "audio/mpeg")},
        data={
            "title": "Test Song",
            "artist": "Test Artist"
        }
    )
    
    assert response.status_code == 201
    assert response.json()["title"] == "Test Song"
```

## Performance Optimization

1. **Database Indexing**: Indexes në columns të përdorura shpesh
2. **Query Optimization**: Eager loading për relationships
3. **Connection Pooling**: SQLAlchemy connection pool
4. **Caching**: Redis për data që nuk ndryshon shpesh
5. **Async Operations**: Async/await për I/O operations

## Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Usage
logger.info("Song uploaded successfully")
logger.error("Failed to upload song", exc_info=True)
```
