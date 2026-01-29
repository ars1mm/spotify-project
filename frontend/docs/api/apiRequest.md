# Funksioni i Kërkesave API

## `apiRequest(endpoint, options?)`

Funksioni kryesor për bërjen e thirrjeve API në backend.

### Përshkrimi i Detajuar

ApiRequest është funksioni më i rëndësishëm për komunikimin me serverin. Ai:
- Menaxhon automatikisht autentifikimin
- Trajton gabimet në mënyrë të qartë
- Parses automatikisht përgjigjet JSON
- Përfshin headers të nevojshme
- Mbron nga sulmet CSRF

### Parametrat

- `endpoint` (string): Rruga e API endpoint-it (p.sh. `/api/v1/songs`)
- `options` (RequestInit, opsionale): Opsionet e fetch (method, body, headers, etj.)

### Vlera e Kthyer

- `Promise<any>`: Përgjigja e parsed JSON nga API

### Shembuj Përdorimi

#### Kërkesa GET
```typescript
// Marrja e këngëve me pagination
const songs = await apiRequest('/api/v1/songs?page=1&limit=20');
console.log('Këngët e marra:', songs.songs);
console.log('Numri total:', songs.total);

// Marrja e një kënge specifike
const song = await apiRequest(`/api/v1/songs/${songId}`);

// Kërkimi i këngëve
const searchResults = await apiRequest(
  `/api/v1/songs/search?q=${encodeURIComponent(query)}`
);
```

#### Kërkesa POST
```typescript
// Krijimi i një playlist-e të re
const newPlaylist = await apiRequest('/api/v1/playlists', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Playlist-ja Ime',
    description: 'Këngët e mia të pëlqyera',
    is_public: true,
    song_ids: ['song1', 'song2', 'song3']
  })
});

// Upload i një kënge të re
const formData = new FormData();
formData.append('audio_file', audioFile);
formData.append('title', 'Titulli i Këngës');
formData.append('artist', 'Artisti');

const uploadResult = await apiRequest('/api/v1/admin/songs', {
  method: 'POST',
  body: formData,
  headers: {
    // Mos vendosni Content-Type për FormData
  }
});
```

#### Kërkesa PUT/PATCH
```typescript
// Përditësimi i një playlist-e
const updatedPlaylist = await apiRequest(`/api/v1/playlists/${playlistId}`, {
  method: 'PUT',
  body: JSON.stringify({
    name: 'Emri i Ri',
    description: 'Përshkrimi i ri'
  })
});

// Shtimi i një kënge në playlist
const result = await apiRequest(`/api/v1/playlists/${playlistId}/songs`, {
  method: 'PATCH',
  body: JSON.stringify({
    song_ids: [newSongId]
  })
});
```

#### Kërkesa DELETE
```typescript
// Fshirja e një kënge
await apiRequest(`/api/v1/songs/${songId}`, {
  method: 'DELETE'
});

// Fshirja e një playlist-e
await apiRequest(`/api/v1/playlists/${playlistId}`, {
  method: 'DELETE'
});
```

### Karakteristikat e Avancuara

#### Auto-Autentifikimi
```typescript
// Funksioni automatikisht shton Bearer token nga localStorage
const session = localStorage.getItem('spotify_session');
if (session) {
  const { access_token } = JSON.parse(session);
  headers['Authorization'] = `Bearer ${access_token}`;
}
```

#### Trajtimi i Gabimeve
```typescript
// Gabimet trajtohen automatikisht
if (!response.ok) {
  const errorData = await response.json();
  const message = errorData.detail || errorData.message || `API Error: ${response.status}`;
  throw new Error(message);
}
```

#### Headers të Paracaktuara
```typescript
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...authHeaders,
  ...customHeaders
};
```

### Trajtimi i Gabimeve në Aplikacion

```typescript
// Trajtimi bazik i gabimeve
try {
  const data = await apiRequest('/api/v1/songs');
  setSongs(data.songs);
} catch (error) {
  console.error('Dështoi marrja e këngëve:', error.message);
  toast.error('Nuk mund të ngarkojmë këngët');
}

// Trajtimi i gabimeve të autentifikimit
try {
  const data = await apiRequest('/api/v1/user/profile');
} catch (error) {
  if (error.message.includes('401')) {
    // Përdoruesi nuk është i autentifikuar
    authStorage.logout();
    router.push('/login');
  }
}

// Trajtimi i gabimeve të rrjetit
try {
  const data = await apiRequest('/api/v1/songs');
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    toast.error('Probleme me lidhjen e internetit');
  } else if (error.message.includes('500')) {
    toast.error('Gabim në server, provoni më vonë');
  }
}
```

### Konfigurimi i API Base URL

```typescript
// Në config/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://spotify-project-achx.onrender.com' 
    : 'http://127.0.0.1:8000');

// Përdorimi në funksion
export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  // ...
}
```

### Shembuj të Avancuar

#### Retry Logic
```typescript
async function apiRequestWithRetry(endpoint: string, options?: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

#### Caching
```typescript
const cache = new Map();

async function cachedApiRequest(endpoint: string, options?: RequestInit) {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await apiRequest(endpoint, options);
  cache.set(cacheKey, result);
  
  // Cache expires after 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return result;
}
```

#### Progress Tracking
```typescript
async function apiRequestWithProgress(
  endpoint: string, 
  options?: RequestInit,
  onProgress?: (progress: number) => void
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.body) {
    throw new Error('ReadableStream not supported');
  }

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    chunks.push(value);
    loaded += value.length;
    
    if (onProgress && total > 0) {
      onProgress((loaded / total) * 100);
    }
  }

  const text = new TextDecoder().decode(
    new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
  );
  
  return JSON.parse(text);
}
```

### Të Lidhura

- [handleApiError](../utils/errorHandling.md#handleapierror)
- [withErrorHandling](../utils/errorHandling.md#witherrorhandling)
- [Autentifikimi](../utils/auth.md)
- [Konfigurimi i API](../config/api-config.md)