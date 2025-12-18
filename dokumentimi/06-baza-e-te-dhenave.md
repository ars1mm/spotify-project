# Baza e të Dhënave dhe Modelet

## Përmbledhje

Projekti përdor PostgreSQL si bazë kryesore të dhënash, me SQLAlchemy si ORM dhe Alembic për menaxhimin e migracioneve. Supabase Storage përdoret për ruajtjen e skedarëve audio.

## Arkitektura e Bazës së të Dhënave

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐      │
│  │  users   │───▶│ playlists│───▶│playlist_songs│      │
│  └──────────┘    └──────────┘    └──────────────┘      │
│       │                                   │              │
│       │                                   │              │
│       ▼                                   ▼              │
│  ┌──────────┐                        ┌────────┐         │
│  │  songs   │◀───────────────────────│ songs  │         │
│  └──────────┘                        └────────┘         │
│       │                                                  │
│       ▼                                                  │
│  ┌──────────┐                                           │
│  │  albums  │                                           │
│  └──────────┘                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              Supabase Storage (Audio Files)              │
└──────────────────────────────────────────────────────────┘
```

## Skema e Tabelave

### Tabela: users

Ruan informacionin e përdoruesve të regjistruar.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Kolonat**:
- `id`: Identifikues unik (UUID)
- `email`: Email i përdoruesit (unik)
- `name`: Emri i plotë
- `hashed_password`: Fjalëkalimi i hash-uar
- `avatar_url`: URL e fotos së profilit
- `is_active`: A është aktiv llogaria
- `is_verified`: A është verifikuar email-i
- `created_at`: Data e krijimit
- `updated_at`: Data e përditësimit të fundit

### Tabela: songs

Ruan metadata e këngëve.

```sql
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    duration INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    cover_image_url VARCHAR(500),
    genre VARCHAR(100),
    release_year INTEGER,
    uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE,
    play_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_genre ON songs(genre);
CREATE INDEX idx_songs_uploaded_by ON songs(uploaded_by);
CREATE INDEX idx_songs_play_count ON songs(play_count DESC);
```

**Kolonat**:
- `id`: Identifikues unik
- `title`: Titulli i këngës
- `artist`: Artisti/Artistët
- `album_id`: Referenca te albumi (opsionale)
- `duration`: Kohëzgjatja në sekonda
- `file_path`: Path i skedarit në Supabase Storage
- `cover_image_url`: URL e cover art
- `genre`: Zhanri muzikor
- `release_year`: Viti i publikimit
- `uploaded_by`: Përdoruesi që e ka ngarkuar
- `play_count`: Numri i luajtjeve
- `is_public`: A është publike
- `created_at`: Data e ngarkimit
- `updated_at`: Data e përditësimit

### Tabela: albums

Ruan informacionin e albumeve.

```sql
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    cover_image_url VARCHAR(500),
    release_year INTEGER,
    genre VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_albums_title ON albums(title);
CREATE INDEX idx_albums_artist ON albums(artist);
```

### Tabela: playlists

Ruan playlist-et e krijuara nga përdoruesit.

```sql
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_name ON playlists(name);
```

**Kolonat**:
- `id`: Identifikues unik
- `name`: Emri i playlist-it
- `description`: Përshkrimi (opsional)
- `cover_image_url`: Imazhi i playlist-it
- `user_id`: Pronari i playlist-it
- `is_public`: A është publike
- `created_at`: Data e krijimit
- `updated_at`: Data e përditësimit

### Tabela: playlist_songs

Tabela lidhëse për shumë-me-shumë midis playlists dhe songs.

```sql
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);

CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);
CREATE INDEX idx_playlist_songs_position ON playlist_songs(playlist_id, position);
```

**Kolonat**:
- `id`: Identifikues unik
- `playlist_id`: Referenca te playlist
- `song_id`: Referenca te kënga
- `position`: Pozicioni në playlist
- `added_at`: Data e shtimit

## Modelet SQLAlchemy

### User Model

```python
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    playlists = relationship("Playlist", back_populates="user", cascade="all, delete-orphan")
    uploaded_songs = relationship("Song", back_populates="uploader", cascade="all, delete-orphan")
```

### Song Model

```python
class Song(Base):
    __tablename__ = "songs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    artist = Column(String(255), nullable=False, index=True)
    album_id = Column(UUID(as_uuid=True), ForeignKey("albums.id", ondelete="SET NULL"))
    duration = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    cover_image_url = Column(String(500))
    genre = Column(String(100), index=True)
    release_year = Column(Integer)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    play_count = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    album = relationship("Album", back_populates="songs")
    uploader = relationship("User", back_populates="uploaded_songs")
    playlist_entries = relationship("PlaylistSong", back_populates="song", cascade="all, delete-orphan")
```

### Playlist Model

```python
class Playlist(Base):
    __tablename__ = "playlists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    cover_image_url = Column(String(500))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="playlists")
    playlist_songs = relationship("PlaylistSong", back_populates="playlist", cascade="all, delete-orphan")
```

### PlaylistSong Model

```python
class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="CASCADE"))
    song_id = Column(UUID(as_uuid=True), ForeignKey("songs.id", ondelete="CASCADE"))
    position = Column(Integer, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    playlist = relationship("Playlist", back_populates="playlist_songs")
    song = relationship("Song", back_populates="playlist_entries")
    
    __table_args__ = (
        UniqueConstraint('playlist_id', 'song_id', name='unique_playlist_song'),
    )
```

## Pydantic Schemas

### User Schemas

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    avatar_url: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Song Schemas

```python
class SongBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    artist: str = Field(..., min_length=1, max_length=255)
    duration: int = Field(..., gt=0)
    genre: Optional[str] = None
    release_year: Optional[int] = Field(None, ge=1900, le=2100)

class SongCreate(SongBase):
    file_path: str
    cover_image_url: Optional[str] = None
    album_id: Optional[UUID] = None

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    genre: Optional[str] = None
    cover_image_url: Optional[str] = None

class SongResponse(SongBase):
    id: UUID
    file_path: str
    cover_image_url: Optional[str]
    album_id: Optional[UUID]
    uploaded_by: UUID
    play_count: int
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Playlist Schemas

```python
class PlaylistBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: bool = False

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_public: Optional[bool] = None

class PlaylistResponse(PlaylistBase):
    id: UUID
    cover_image_url: Optional[str]
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PlaylistWithSongs(PlaylistResponse):
    songs: List[SongResponse] = []
```

## Migrimet me Alembic

### Inicializimi

```bash
# Inicializo Alembic
alembic init alembic

# Krijo migrimin e parë
alembic revision --autogenerate -m "Initial migration"

# Ekzekuto migrimin
alembic upgrade head
```

### Shembull Migrimi

```python
"""Initial migration

Revision ID: 001
Create Date: 2024-01-01 12:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now())
    )
    
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_index('idx_users_email')
    op.drop_table('users')
```

## Query Examples

### Kërkimi i Këngëve

```python
# Kërko këngë sipas titullit
songs = db.query(Song).filter(
    Song.title.ilike(f"%{search_term}%")
).all()

# Kërko këngë sipas artistit
songs = db.query(Song).filter(
    Song.artist.ilike(f"%{artist_name}%")
).all()

# Kërko këngë më të popullarizuara
popular_songs = db.query(Song).order_by(
    Song.play_count.desc()
).limit(10).all()

# Kërko këngë sipas zhanrit
genre_songs = db.query(Song).filter(
    Song.genre == genre_name,
    Song.is_public == True
).all()
```

### Menaxhimi i Playlist-eve

```python
# Merr playlist me këngët
playlist = db.query(Playlist).filter(
    Playlist.id == playlist_id
).first()

songs = db.query(Song).join(
    PlaylistSong
).filter(
    PlaylistSong.playlist_id == playlist_id
).order_by(
    PlaylistSong.position
).all()

# Shto këngë në playlist
max_position = db.query(func.max(PlaylistSong.position)).filter(
    PlaylistSong.playlist_id == playlist_id
).scalar() or 0

new_entry = PlaylistSong(
    playlist_id=playlist_id,
    song_id=song_id,
    position=max_position + 1
)
db.add(new_entry)
db.commit()
```

## Best Practices

### Indexing
- Krijo indexes për kolonat që përdoren shpesh në WHERE, JOIN, ORDER BY
- Përdor composite indexes për query të shpeshta me shumë kolona
- Monitoroni performance të query-ve me EXPLAIN ANALYZE

### Transactions
```python
from sqlalchemy.orm import Session

def create_playlist_with_songs(
    db: Session,
    playlist_data: dict,
    song_ids: List[UUID]
):
    try:
        # Krijo playlist
        playlist = Playlist(**playlist_data)
        db.add(playlist)
        db.flush()  # Get playlist.id
        
        # Shto këngët
        for idx, song_id in enumerate(song_ids):
            entry = PlaylistSong(
                playlist_id=playlist.id,
                song_id=song_id,
                position=idx
            )
            db.add(entry)
        
        db.commit()
        return playlist
    except Exception as e:
        db.rollback()
        raise e
```

### Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

## Supabase Storage Integration

### Upload Audio File

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_song_file(file_path: str, file_data: bytes) -> str:
    """Upload song to Supabase Storage"""
    bucket_name = "songs"
    
    response = supabase.storage.from_(bucket_name).upload(
        file_path,
        file_data,
        file_options={"content-type": "audio/mpeg"}
    )
    
    # Get public URL
    public_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
    
    return public_url
```

### Delete Audio File

```python
def delete_song_file(file_path: str):
    """Delete song from Supabase Storage"""
    bucket_name = "songs"
    
    supabase.storage.from_(bucket_name).remove([file_path])
```

## Shënime të Rëndësishme

- Përdor UUID për primary keys për siguri dhe skalabilitet
- Implemento soft delete për të dhëna kritike (is_active flag)
- Ruaj timestamps (created_at, updated_at) për audit trail
- Përdor foreign key constraints për integritet referencial
- Implemento indexing strategjik për performance
- Përdor connection pooling për optimizim
- Backup i rregullt i bazës së të dhënave
