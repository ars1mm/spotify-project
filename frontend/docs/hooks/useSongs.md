# Hook-u useSongs

Hook-u i personalizuar për marrjen dhe menaxhimin e këngëve me pagination dhe caching.

## Përshkrimi i Detajuar

useSongs është hook-u që menaxhon:
- Marrjen e këngëve nga API
- Pagination me infinite scroll
- Caching për performance të mirë
- Loading states dhe error handling
- Refresh functionality
- Optimistic updates

## Përdorimi

```typescript
import { useSongs } from '../hooks/useSongs';

function SongsList() {
  const { songs, loading, hasMore, loadMore, refresh, error } = useSongs({
    limit: 20,
    enableCache: true,
    searchQuery: '',
    filters: {}
  });
}
```

## Parametrat (Options)

- `limit` (number): Numri i këngëve për faqe (default: 20)
- `enableCache` (boolean): Aktivizo caching (default: false)
- `searchQuery` (string): Query për kërkim (default: '')
- `filters` (object): Filtra shtesë (artist, genre, etj.)
- `sortBy` (string): Mënyra e renditjes (title, artist, date)
- `sortOrder` ('asc' | 'desc'): Drejtimi i renditjes

## Vlerat e Kthyera

- `songs` (Song[]): Array e këngëve të ngarkuara
- `loading` (boolean): Nëse këngët po ngarkohen aktualisht
- `hasMore` (boolean): Nëse ka më shumë këngë për të ngarkuar
- `error` (string | null): Gabimi i fundit (nëse ka)
- `totalCount` (number): Numri total i këngëve
- `currentPage` (number): Faqja aktuale
- `loadMore` (): Funksioni për të ngarkuar faqen e ardhshme
- `refresh` (): Funksioni për të rifreskuar dhe rinisur nga fillimi
- `retry` (): Funksioni për të provuar përsëri pas gabimit

## Shembuj të Detajuar

### Lista Bazike e Këngëve

```typescript
function BasicSongsList() {
  const { songs, loading, error } = useSongs({ 
    limit: 50,
    enableCache: true 
  });

  if (loading && songs.length === 0) {
    return (
      <div className="loading-container">
        <Spinner size="lg" />
        <Text>Duke ngarkuar këngët...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Text color="red.500">Gabim: {error}</Text>
        <Button onClick={retry}>Provo Përsëri</Button>
      </div>
    );
  }

  return (
    <div className="songs-grid">
      {songs.map(song => (
        <SongCard key={song.id} song={song} />
      ))}
      
      {songs.length === 0 && (
        <Text>Nuk u gjetën këngë.</Text>
      )}
    </div>
  );
}
```

### Infinite Scroll

```typescript
function InfiniteSongsList() {
  const { 
    songs, 
    loading, 
    hasMore, 
    loadMore, 
    error 
  } = useSongs({ 
    limit: 20,
    enableCache: true 
  });

  const [containerRef, setContainerRef] = useState(null);

  // Intersection Observer për infinite scroll
  useEffect(() => {
    if (!containerRef || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = containerRef.querySelector('.scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [containerRef, hasMore, loading, loadMore]);

  // Manual scroll handling
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage > 0.8 && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  return (
    <div 
      ref={setContainerRef}
      className="infinite-scroll-container"
      onScroll={handleScroll}
      style={{ height: '600px', overflow: 'auto' }}
    >
      <div className="songs-list">
        {songs.map((song, index) => (
          <SongItem 
            key={`${song.id}-${index}`} 
            song={song} 
            index={index}
          />
        ))}
      </div>
      
      {/* Sentinel element për intersection observer */}
      <div className="scroll-sentinel" style={{ height: '20px' }}>
        {loading && (
          <div className="loading-more">
            <Spinner size="sm" />
            <Text>Duke ngarkuar më shumë...</Text>
          </div>
        )}
      </div>
      
      {!hasMore && songs.length > 0 && (
        <div className="end-message">
          <Text color="gray.500">
            Të gjitha këngët u ngarkuan ({songs.length} total)
          </Text>
        </div>
      )}
    </div>
  );
}
```

### Me Refresh dhe Search

```typescript
function SongsWithSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('title');
  
  const { 
    songs, 
    loading, 
    refresh, 
    totalCount,
    currentPage 
  } = useSongs({
    limit: 30,
    searchQuery,
    filters,
    sortBy,
    enableCache: true
  });

  const handleSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRefresh = () => {
    // Reset search dhe filters
    setSearchQuery('');
    setFilters({});
    refresh();
  };

  return (
    <div className="songs-with-search">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-controls">
          <Input
            placeholder="Kërko këngë, artist, album..."
            onChange={(e) => handleSearch(e.target.value)}
            leftElement={<FiSearch />}
          />
          
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="title">Titulli</option>
            <option value="artist">Artisti</option>
            <option value="created_at">Data e Shtimit</option>
            <option value="duration">Kohëzgjatja</option>
          </Select>
          
          <Button onClick={handleRefresh} leftIcon={<FiRefreshCw />}>
            Rifresko
          </Button>
        </div>
        
        {/* Filters */}
        <div className="filters">
          <Select 
            placeholder="Zgjidh Zhanrin"
            onChange={(e) => handleFilterChange('genre', e.target.value)}
          >
            <option value="">Të gjitha zhanret</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hip-hop">Hip Hop</option>
          </Select>
          
          <Select 
            placeholder="Zgjidh Artistin"
            onChange={(e) => handleFilterChange('artist', e.target.value)}
          >
            <option value="">Të gjithë artistët</option>
            {/* Dynamic artist options */}
          </Select>
        </div>
        
        {/* Results Info */}
        <div className="results-info">
          <Text>
            {loading ? 'Duke kërkuar...' : `${totalCount} këngë të gjetur`}
            {searchQuery && ` për "${searchQuery}"`}
          </Text>
        </div>
      </div>

      {/* Songs List */}
      <div className="songs-results">
        {loading && songs.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <SongsList songs={songs} />
        )}
      </div>
    </div>
  );
}
```

### Me Caching të Avancuar

```typescript
function useSongsWithAdvancedCaching(options) {
  const { 
    songs, 
    loading, 
    hasMore, 
    loadMore, 
    refresh 
  } = useSongs({
    ...options,
    enableCache: true
  });

  // Cache management
  const [cacheStats, setCacheStats] = useState({
    hitRate: 0,
    size: 0,
    lastUpdated: null
  });

  // Preload next page
  const preloadNextPage = useCallback(() => {
    if (hasMore && !loading) {
      // Preload në background
      setTimeout(() => {
        loadMore();
      }, 1000);
    }
  }, [hasMore, loading, loadMore]);

  // Cache warming
  useEffect(() => {
    // Ngarko këngët më të populluara në background
    const warmCache = async () => {
      try {
        await apiRequest('/api/v1/songs/popular?limit=50');
      } catch (error) {
        console.log('Cache warming failed:', error);
      }
    };

    warmCache();
  }, []);

  // Cache cleanup
  useEffect(() => {
    const cleanup = () => {
      // Pastro cache të vjetër çdo 30 minuta
      const cacheKeys = Object.keys(localStorage);
      const now = Date.now();
      
      cacheKeys.forEach(key => {
        if (key.startsWith('songs_cache_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.timestamp && now - data.timestamp > 30 * 60 * 1000) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    const interval = setInterval(cleanup, 5 * 60 * 1000); // Çdo 5 minuta
    return () => clearInterval(interval);
  }, []);

  return {
    songs,
    loading,
    hasMore,
    loadMore,
    refresh,
    preloadNextPage,
    cacheStats
  };
}
```

### Optimistic Updates

```typescript
function useSongsWithOptimisticUpdates() {
  const { songs, loading, refresh } = useSongs({ enableCache: true });
  const [optimisticSongs, setOptimisticSongs] = useState([]);

  // Merge real songs me optimistic updates
  const displaySongs = useMemo(() => {
    const merged = [...songs];
    
    optimisticSongs.forEach(optimisticSong => {
      const existingIndex = merged.findIndex(s => s.id === optimisticSong.id);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...optimisticSong };
      } else {
        merged.unshift(optimisticSong);
      }
    });
    
    return merged;
  }, [songs, optimisticSongs]);

  const addOptimisticSong = (song) => {
    const optimisticSong = {
      ...song,
      id: `temp_${Date.now()}`,
      isOptimistic: true
    };
    
    setOptimisticSongs(prev => [optimisticSong, ...prev]);
    
    // Hiq pas 10 sekondash nëse nuk konfirmohet
    setTimeout(() => {
      setOptimisticSongs(prev => 
        prev.filter(s => s.id !== optimisticSong.id)
      );
    }, 10000);
    
    return optimisticSong.id;
  };

  const updateOptimisticSong = (tempId, updates) => {
    setOptimisticSongs(prev =>
      prev.map(song => 
        song.id === tempId ? { ...song, ...updates } : song
      )
    );
  };

  const removeOptimisticSong = (tempId) => {
    setOptimisticSongs(prev => 
      prev.filter(song => song.id !== tempId)
    );
  };

  const confirmOptimisticSong = (tempId, realSong) => {
    removeOptimisticSong(tempId);
    refresh(); // Rifresko për të marrë të dhënat e reja
  };

  return {
    songs: displaySongs,
    loading,
    refresh,
    addOptimisticSong,
    updateOptimisticSong,
    removeOptimisticSong,
    confirmOptimisticSong
  };
}
```

### Performance Monitoring

```typescript
function useSongsWithPerformanceMonitoring(options) {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    errorRate: 0
  });

  const startTime = useRef(Date.now());
  
  const { songs, loading, error, ...rest } = useSongs(options);

  // Track load time
  useEffect(() => {
    if (!loading && songs.length > 0) {
      const loadTime = Date.now() - startTime.current;
      setMetrics(prev => ({ ...prev, loadTime }));
    }
  }, [loading, songs.length]);

  // Track errors
  useEffect(() => {
    if (error) {
      setMetrics(prev => ({ 
        ...prev, 
        errorRate: prev.errorRate + 1 
      }));
    }
  }, [error]);

  // Performance logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Songs Performance Metrics:', metrics);
    }
  }, [metrics]);

  return {
    songs,
    loading,
    error,
    metrics,
    ...rest
  };
}
```

## Të Lidhura

- [apiRequest](../api/apiRequest.md)
- [Komponentët e Këngëve](../components/songs.md)
- [Caching Strategy](../guides/caching.md)
- [Performance Optimization](../guides/performance.md)