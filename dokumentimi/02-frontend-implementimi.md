# Frontend - Implementimi Teknik

## Përmbledhje

Frontend-i është ndërtuar me Next.js 13+ duke përdorur App Router, TypeScript, dhe Chakra UI. Aplikacioni ofron një përvojë të ngjashme me Spotify me funksionalitete moderne dhe responsive design.

## Struktura e Projektit

```
frontend/
├── app/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Navigimi anësor
│   │   │   ├── MainContent.tsx      # Përmbajtja kryesore
│   │   │   └── Player.tsx           # Audio player
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx        # Forma e login-it
│   │   │   └── RegisterForm.tsx     # Forma e regjistrimit
│   │   └── playlist/
│   │       └── PlaylistCard.tsx     # Karta e playlist-it
│   ├── contexts/
│   │   ├── PlayerContext.tsx        # Context për audio player
│   │   ├── SearchContext.tsx        # Context për search
│   │   └── AuthContext.tsx          # Context për autentifikim
│   ├── config/
│   │   └── api.ts                   # Konfigurimi i API
│   ├── lib/
│   │   └── auth.ts                  # Utility për autentifikim
│   ├── page.tsx                     # Faqja kryesore
│   ├── login/page.tsx               # Faqja e login-it
│   ├── register/page.tsx            # Faqja e regjistrimit
│   └── layout.tsx                   # Layout kryesor
├── public/                          # Static assets
├── package.json
└── tsconfig.json
```

## Komponentët Kryesorë

### 1. MainContent Component

**Lokacioni**: `app/components/layout/MainContent.tsx`

**Përgjegjësitë**:
- Shfaqja e këngëve dhe playlist-eve
- Implementimi i search functionality
- Menaxhimi i "Made For You" section
- Daily Mix playlists
- Artist playlists dinamike

**Karakteristikat Kryesore**:

#### a) Search Functionality
```typescript
const handleSearch = async (query: string) => {
  if (!query.trim()) {
    setSearchResults([])
    setSearchPlaylists([])
    return
  }

  setSearchLoading(true)
  try {
    const response = await apiRequest(
      `/api/v1/search?q=${encodeURIComponent(query)}`
    )
    setSearchResults(response.songs || [])
    setSearchPlaylists(response.playlists || [])
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    setSearchLoading(false)
  }
}
```

**Veçoritë**:
- Debouncing (300ms delay) për të reduktuar API calls
- Real-time search results
- Kërkimi i këngëve dhe playlist-eve

#### b) Dynamic Artist Playlists
```typescript
const uniqueArtists = useMemo(() => {
  const artistSet = new Set<string>()
  allSongs.forEach(song => {
    // Ekstraktimi i artistit kryesor nga featured tracks
    const primaryArtist = song.artist.split(/feat\.|ft\.|,|&/i)[0].trim()
    artistSet.add(primaryArtist)
  })
  return Array.from(artistSet)
}, [allSongs])
```

**Veçoritë**:
- Ekstraktimi automatik i artistëve unikë
- Mbështetje për featured artists (feat., ft.)
- Filtrimi i këngëve me `includes()` për të përfshirë collaborations

#### c) Daily Mix Covers
```typescript
const dailyMixCovers = useMemo(() => {
  if (allSongs.length === 0) return { mix1: null, mix2: null }
  return {
    mix1: allSongs[Math.floor(Math.random() * allSongs.length)]?.cover_image_url,
    mix2: allSongs[Math.floor(Math.random() * allSongs.length)]?.cover_image_url
  }
}, [allSongs])
```

**Veçoritë**:
- Memoization për të parandaluar re-shuffling
- Random cover images për Daily Mix
- Performance optimization

### 2. Player Component

**Lokacioni**: `app/components/layout/Player.tsx`

**Përgjegjësitë**:
- Luajtja e audio files
- Kontrollet e player-it (play, pause, next, previous)
- Progress bar dhe volume control
- Display i informacionit të këngës

**Teknologjitë**:
- HTML5 Audio API
- React Hooks për state management
- Real-time progress updates

### 3. Sidebar Component

**Lokacioni**: `app/components/layout/Sidebar.tsx`

**Përgjegjësitë**:
- Navigimi kryesor
- Lista e playlist-eve
- Quick access links
- User profile section

## Context API Implementation

### 1. PlayerContext

**Lokacioni**: `app/contexts/PlayerContext.tsx`

**State Management**:
```typescript
interface PlayerContextType {
  currentSong: Song | null
  isPlaying: boolean
  playSong: (song: Song) => void
  pauseSong: () => void
  nextSong: () => void
  previousSong: () => void
  queue: Song[]
}
```

**Përgjegjësitë**:
- Menaxhimi i këngës aktuale
- Queue management
- Play/pause state
- Global access në të gjithë aplikacionin

### 2. SearchContext

**Lokacioni**: `app/contexts/SearchContext.tsx`

**State Management**:
```typescript
interface SearchContextType {
  showSearch: boolean
  toggleSearch: () => void
}
```

**Përgjegjësitë**:
- Toggle search bar visibility
- Global search state

### 3. AuthContext

**Lokacioni**: `app/contexts/AuthContext.tsx`

**State Management**:
```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
}
```

**Përgjegjësitë**:
- User authentication state
- Login/logout functionality
- Token management
- Protected routes

## API Integration

### API Client Configuration

**Lokacioni**: `app/config/api.ts`

```typescript
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = authStorage.getToken()
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}
```

**Veçoritë**:
- Automatic token injection
- Error handling
- Type-safe responses
- Centralized configuration

## State Management Strategy

### Local State (useState)
Përdoret për:
- Form inputs
- UI toggles
- Component-specific data

### Context API
Përdoret për:
- Global application state
- User authentication
- Audio player state
- Search state

### useMemo & useCallback
Përdoret për:
- Performance optimization
- Expensive calculations
- Preventing unnecessary re-renders

## Styling dhe UI

### Chakra UI
- Component library për UI consistency
- Responsive design out of the box
- Dark theme implementation
- Custom color scheme (Spotify-like)

### Color Palette
```typescript
const colors = {
  background: '#121212',
  surface: '#181818',
  surfaceHover: '#282828',
  primary: '#1db954',
  primaryHover: '#1ed760',
  text: '#ffffff',
  textSecondary: '#a7a7a7',
}
```

### Responsive Design
- Mobile-first approach
- Breakpoints: base, md, lg, xl
- Adaptive layouts
- Touch-friendly controls

## Performance Optimization

### 1. Code Splitting
- Dynamic imports për large components
- Route-based splitting
- Lazy loading

### 2. Memoization
```typescript
// Prevent unnecessary re-renders
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])

// Prevent function recreation
const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### 3. Image Optimization
- Next.js Image component
- Lazy loading images
- Responsive images
- WebP format support

### 4. Data Fetching
- SWR për caching
- Debouncing për search
- Pagination për large lists
- Optimistic updates

## Error Handling

### User-Facing Errors
```typescript
try {
  await apiRequest('/api/v1/songs')
} catch (error) {
  toast.error('Failed to load songs. Please try again.')
  console.error('Error:', error)
}
```

### Error Boundaries
- Catch React component errors
- Fallback UI
- Error reporting

## Security Considerations

### 1. Token Storage
- localStorage për persistence
- Automatic token refresh
- Secure token handling

### 2. Input Validation
- Client-side validation
- Sanitization
- XSS prevention

### 3. HTTPS
- All API calls over HTTPS
- Secure cookie handling
- CORS configuration

## Testing Strategy

### Unit Tests
- Component testing
- Hook testing
- Utility function testing

### Integration Tests
- API integration
- Context providers
- User flows

### E2E Tests
- Critical user journeys
- Authentication flows
- Playlist creation

## Build dhe Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Best Practices

1. **TypeScript**: Përdorimi i types për të gjitha props dhe state
2. **Component Composition**: Komponente të vogla dhe të ripërdorshme
3. **Separation of Concerns**: Business logic e ndarë nga UI
4. **Error Handling**: Graceful error handling në të gjitha nivelet
5. **Performance**: Memoization dhe optimization kur është e nevojshme
6. **Accessibility**: ARIA labels dhe keyboard navigation
7. **Code Organization**: Struktura e qartë e folderëve
8. **Documentation**: Comments për logjikë komplekse
