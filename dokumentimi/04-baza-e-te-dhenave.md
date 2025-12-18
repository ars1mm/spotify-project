# Baza e të Dhënave - Struktura dhe Skema

## Përmbledhje

Projekti përdor PostgreSQL si bazë kryesore të dhënash për ruajtjen e të dhënave strukturore. Baza e të dhënave është e dizajnuar për të mbështetur funksionalitetet e një aplikacioni muzikor me users, songs, playlists, dhe relationships ndërmjet tyre.

## Diagrami i Bazës së të Dhënave

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ name                │
│ hashed_password     │
│ is_active           │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:N
           │
    ┌──────┴──────┬──────────────────┐
    │             │                  │
    ▼             ▼                  ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│  playlists  │ │    songs     │ │   follows    │
├─────────────┤ ├──────────────┤ ├──────────────┤
│ id (PK)     │ │ id (PK)      │ │ id (PK)      │
│ name        │ │ title        │ │ follower_id  │
│ description │ │ artist       │ │ following_id │
│ is_public   │ │ album        │ │ created_at   │
│ user_id(FK) │ │ duration_sec │ └──────────────┘
│ created_at  │ │ file_path    │
│ updated_at  │ │ cover_img_url│
└──────┬──────┘ │ audio_url    │
       │        │ uploader_id  │
       │        │ created_at   │
       │        └──────┬───────┘
       │               │
       │ N:M           │
       │               │
       └───────┬───────┘
               │
               ▼
    ┌──────────────────┐
    │  playlist_songs  │
    ├──────────────────┤
    │ id (PK)          │
    │ playlist_id (FK) │
    │ song_id (FK)     │
    │ position         │
    │ added_at         │
    └──────────────────┘
```

## Tabelat

### 1. users

Ruan informacionin e përdoruesve të regjistruar.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Kolonat**:
- `id`: Identifikues unik (UUID)
- `email`: Email i përdoruesit (unique)
- `name`: Emri i plotë i përdoruesit
- `hashed_password`: Password i hash-uar (bcrypt)
- `is_active`: A është aktiv përdoruesi
- `created_at`: Data e krijimit
- `updated_at`: Data e përditësimit të fundit

**Constraints**:
- PRIMARY KEY: `id`
- UNIQUE: `email`
- NOT NULL: `email`, `name`, `hashed_password`

### 2. songs

Ruan metadata e këngëve të ngarkuara.

```sql
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    duration_seconds INTEGER,
    file_path VARCHAR(500) NOT NULL,
    cover_image_url TEXT,
    audio_url TEXT NOT NULL,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_album ON songs(album);
CREATE INDEX idx_songs_uploader ON songs(uploader_id);
CREATE INDEX idx_songs_created_at ON songs(created_at);

-- Full-text search index
CREATE INDEX idx_songs_search ON songs USING gin(
    to_tsvector('english', title || ' ' || artist || ' ' || COALESCE(album, ''))
);
```

**Kolonat**:
- `id`: Identifikues unik (UUID)
- `title`: Titulli i këngës
- `artist`: Emri i artistit/artistëve
- `album`: Emri i albumit (optional)
- `duration_seconds`: Kohëzgjatja në sekonda
- `file_path`: Path i file-it në storage
- `cover_image_url`: URL e imazhit të cover-it
- `audio_url`: URL publik i audio file-it
- `uploader_id`: Foreign key te users
- `created_at`: Data e ngarkimit

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `uploader_id` → `users(id)`
- NOT NULL: `title`, `artist`, `file_path`, `audio_url`

### 3. playlists

Ruan playlists e krijuara nga përdoruesit.

```sql
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_playlists_user ON playlists(user_id);
CREATE INDEX idx_playlists_public ON playlists(is_public);
CREATE INDEX idx_playlists_created_at ON playlists(created_at);
```

**Kolonat**:
- `id`: Identifikues unik (UUID)
- `name`: Emri i playlist-it
- `description`: Përshkrimi (optional)
- `is_public`: A është publik playlist-i
- `user_id`: Foreign key te users (pronari)
- `created_at`: Data e krijimit
- `updated_at`: Data e përditësimit të fundit

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users(id)` ON DELETE CASCADE
- NOT NULL: `name`, `user_id`

### 4. playlist_songs

Tabela e ndërmjetme për many-to-many relationship ndërmjet playlists dhe songs.

```sql
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);

-- Indexes
CREATE INDEX idx_playlist_songs_playlist ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song ON playlist_songs(song_id);
CREATE INDEX idx_playlist_songs_position ON playlist_songs(playlist_id, position);
```

**Kolonat**:
- `id`: Identifikues unik (UUID)
- `playlist_id`: Foreign key te playlists
- `song_id`: Foreign key te songs
- `position`: Pozicioni i këngës në playlist
- `added_at`: Data kur u shtua kënga

**Constraints**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `playlist_id` → `playlists(id)` ON DELETE CASCADE
- FOREIGN KEY: `song_id` → `songs(id)` ON DELETE CASCADE
- UNIQUE: `(playlist_id, song_id)` - Një këngë nuk mund të shtohet dy herë në të njëjtin playlist

### 5. follows (Optional - për të ardhmen)

Për të implementuar funksionalitetin e ndjekjes së përdoruesve.

```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

## Relationships

### One-to-Many (1:N)

1. **users → playlists**
   - Një user mund të ketë shumë playlists
   - Një playlist i përket një user-i

2. **users → songs**
   - Një user mund të ngarkojë shumë këngë
   - Një këngë ngarkohet nga një user

### Many-to-Many (N:M)

1. **playlists ↔ songs** (përmes `playlist_songs`)
   - Një playlist mund të ketë shumë këngë
   - Një këngë mund të jetë në shumë playlists

## Queries të Zakonshme

### 1. Merr të gjitha këngët e një përdoruesi

```sql
SELECT s.*
FROM songs s
WHERE s.uploader_id = 'user_uuid'
ORDER BY s.created_at DESC;
```

### 2. Merr të gjitha këngët në një playlist

```sql
SELECT s.*, ps.position, ps.added_at
FROM songs s
JOIN playlist_songs ps ON s.id = ps.song_id
WHERE ps.playlist_id = 'playlist_uuid'
ORDER BY ps.position ASC;
```

### 3. Kërko këngë (Full-text search)

```sql
SELECT *
FROM songs
WHERE to_tsvector('english', title || ' ' || artist || ' ' || COALESCE(album, ''))
      @@ plainto_tsquery('english', 'search_query')
ORDER BY created_at DESC;
```

### 4. Merr playlists publike me numrin e këngëve

```sql
SELECT 
    p.*,
    u.name as owner_name,
    COUNT(ps.song_id) as song_count
FROM playlists p
JOIN users u ON p.user_id = u.id
LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
WHERE p.is_public = TRUE
GROUP BY p.id, u.name
ORDER BY p.created_at DESC;
```

### 5. Merr artistët më të popullarizuar (me më shumë këngë)

```sql
SELECT 
    artist,
    COUNT(*) as song_count
FROM songs
GROUP BY artist
ORDER BY song_count DESC
LIMIT 10;
```

### 6. Shto këngë në playlist

```sql
INSERT INTO playlist_songs (playlist_id, song_id, position)
VALUES (
    'playlist_uuid',
    'song_uuid',
    (SELECT COALESCE(MAX(position), 0) + 1 
     FROM playlist_songs 
     WHERE playlist_id = 'playlist_uuid')
);
```

## Optimizimi i Performance-it

### 1. Indexes

Indexes janë krijuar në:
- Foreign keys për JOIN operations
- Kolonat e përdorura në WHERE clauses
- Kolonat e përdorura në ORDER BY
- Full-text search për kërkimin e këngëve

### 2. Partitioning (për të ardhmen)

Nëse baza e të dhënave rritet shumë, mund të konsiderohet partitioning:

```sql
-- Partition by year për songs table
CREATE TABLE songs_2024 PARTITION OF songs
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 3. Materialized Views

Për queries komplekse që ekzekutohen shpesh:

```sql
CREATE MATERIALIZED VIEW popular_songs AS
SELECT 
    s.*,
    COUNT(ps.playlist_id) as playlist_count
FROM songs s
LEFT JOIN playlist_songs ps ON s.id = ps.song_id
GROUP BY s.id
ORDER BY playlist_count DESC;

-- Refresh periodically
REFRESH MATERIALIZED VIEW popular_songs;
```

## Backup Strategy

### 1. Daily Backups

```bash
# Full backup
pg_dump -U postgres -d spotify_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U postgres -d spotify_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 2. Point-in-Time Recovery

Aktivizoni WAL (Write-Ahead Logging) për continuous backup:

```sql
-- postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'
```

### 3. Restore

```bash
# Restore from backup
psql -U postgres -d spotify_db < backup_20240101.sql
```

## Data Integrity

### 1. Constraints

- PRIMARY KEY për uniqueness
- FOREIGN KEY për referential integrity
- UNIQUE constraints për të parandaluar duplicates
- CHECK constraints për validim

### 2. Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at 
    BEFORE UPDATE ON playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 3. Transactions

Përdorimi i transactions për operacione komplekse:

```python
# SQLAlchemy example
try:
    db.begin()
    # Multiple operations
    db.add(playlist)
    db.add(playlist_song)
    db.commit()
except Exception as e:
    db.rollback()
    raise e
```

## Migration Strategy

### Alembic Migrations

```python
# alembic/versions/001_initial.py
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), default=datetime.utcnow),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_index('idx_users_email')
    op.drop_table('users')
```

## Security Considerations

1. **Password Hashing**: Passwords nuk ruhen në plaintext
2. **SQL Injection Prevention**: Përdorimi i ORM dhe prepared statements
3. **Access Control**: Row-level security për data isolation
4. **Encryption**: Sensitive data encrypted at rest
5. **Audit Logging**: Tracking i ndryshimeve kritike

## Monitoring

### 1. Query Performance

```sql
-- Enable query logging
ALTER DATABASE spotify_db SET log_statement = 'all';
ALTER DATABASE spotify_db SET log_duration = on;

-- Slow query log
ALTER DATABASE spotify_db SET log_min_duration_statement = 1000; -- 1 second
```

### 2. Database Statistics

```sql
-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```
