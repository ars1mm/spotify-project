# Indekset dhe Optimizimi i Performancës

Për të siguruar që aplikacioni të mbetet i shpejtë edhe me rritjen e vëllimit të të dhënave, kemi implementuar një strategji të qëndrueshme indeksimi.

## Indekset Kryesore

### 1. Kërkimi (Search)
Fushat si `title` dhe `artist` janë indeksuar për të lejuar kërkim të shpejtë.

```sql
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_playlists_name ON playlists(name);
```

### 2. Çelësat e Jashtëm (Foreign Keys)
Të gjitha fushat që përdoren në veprimet `JOIN` janë të indeksuara.

```sql
CREATE INDEX idx_liked_songs_user_id ON liked_songs(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
```

### 3. Renditja dhe Filtrimi
Fushat që përdoren shpesh për renditje (si `created_at` ose `position`) janë gjithashtu të indeksuara.

## Strategjitë e Optimizimit

1.  **Composite Indexes**: Përdoren në rastet kur query-t filtrojnë sipas dy kolonave njëkohësisht (p.sh., `playlist_id` dhe `position`).
2.  **Unique Constraints**: Përdoren jo vetëm për integritet, por edhe për të përshpejtuar kërkimin e një rekordi specifik dypalësh (p.sh., check nëse një këngë është e pëlqyer).
3.  **Lazy Loading vs Eager Loading**: Në nivel të Backend-it (SQLAlchemy), ne zgjedhim me kujdes metodën e ngarkimit të marrëdhënieve për të shmangur problemin N+1.
