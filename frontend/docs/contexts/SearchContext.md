# SearchContext

Konteksti për menaxhimin e gjendjes së kërkimit në aplikacion.

## Përshkrimi i Detajuar

SearchContext menaxhon:
- Gjendjen e kërkimit (hapur/mbyllur)
- Query të kërkimit dhe filtrat
- Historikun e kërkimeve
- Sugjerimet e kërkimit
- Rezultatet e cached

## Struktura e Kontekstit

```typescript
interface SearchContextType {
  // Search State
  showSearch: boolean;
  searchQuery: string;
  searchResults: SearchResults;
  isSearching: boolean;
  searchHistory: string[];
  suggestions: string[];
  
  // Filters
  filters: SearchFilters;
  sortBy: SortOption;
  
  // Actions
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSortBy: (sort: SortOption) => void;
  
  // History Management
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
}

interface SearchResults {
  songs: Song[];
  playlists: Playlist[];
  artists: Artist[];
  albums: Album[];
  totalCount: number;
}

interface SearchFilters {
  genre?: string;
  artist?: string;
  album?: string;
  year?: number;
  duration?: {
    min: number;
    max: number;
  };
}
```

## Implementimi i Provider-it

```typescript
export function SearchProvider({ children }: { children: ReactNode }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    songs: [],
    playlists: [],
    artists: [],
    albums: [],
    totalCount: 0
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  
  // Cache për rezultatet
  const searchCache = useRef(new Map<string, SearchResults>());
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults({
          songs: [],
          playlists: [],
          artists: [],
          albums: [],
          totalCount: 0
        });
        return;
      }
      
      await performSearchInternal(query);
    }, 300),
    [filters, sortBy]
  );
  
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);
  
  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);
  
  // Auto-search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);
  
  // Generate suggestions based on history and popular searches
  useEffect(() => {
    if (searchQuery.length > 0) {
      const historySuggestions = searchHistory
        .filter(item => 
          item.toLowerCase().includes(searchQuery.toLowerCase()) &&
          item !== searchQuery
        )
        .slice(0, 3);
      
      // Add popular searches (could be fetched from API)
      const popularSuggestions = [
        'pop music',
        'rock classics',
        'hip hop',
        'electronic'
      ].filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !historySuggestions.includes(item)
      ).slice(0, 2);
      
      setSuggestions([...historySuggestions, ...popularSuggestions]);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, searchHistory]);
  
  const performSearchInternal = async (query: string) => {
    const cacheKey = `${query}-${JSON.stringify(filters)}-${sortBy}`;
    
    // Check cache first
    if (searchCache.current.has(cacheKey)) {
      setSearchResults(searchCache.current.get(cacheKey)!);
      return;
    }
    
    setIsSearching(true);
    
    try {\n      // Build search parameters\n      const params = new URLSearchParams({\n        q: query,\n        sort: sortBy\n      });\n      \n      // Add filters\n      if (filters.genre) params.append('genre', filters.genre);\n      if (filters.artist) params.append('artist', filters.artist);\n      if (filters.album) params.append('album', filters.album);\n      if (filters.year) params.append('year', filters.year.toString());\n      \n      const response = await apiRequest(`/api/v1/songs/search?${params}`);\n      \n      const results: SearchResults = {\n        songs: response.songs || [],\n        playlists: response.playlists || [],\n        artists: response.artists || [],\n        albums: response.albums || [],\n        totalCount: (response.songs?.length || 0) + \n                   (response.playlists?.length || 0) + \n                   (response.artists?.length || 0) + \n                   (response.albums?.length || 0)\n      };\n      \n      // Cache results\n      searchCache.current.set(cacheKey, results);\n      \n      // Limit cache size\n      if (searchCache.current.size > 50) {\n        const firstKey = searchCache.current.keys().next().value;\n        searchCache.current.delete(firstKey);\n      }\n      \n      setSearchResults(results);\n    } catch (error) {\n      console.error('Search failed:', error);\n      setSearchResults({\n        songs: [],\n        playlists: [],\n        artists: [],\n        albums: [],\n        totalCount: 0\n      });\n    } finally {\n      setIsSearching(false);\n    }\n  };\n  \n  const toggleSearch = useCallback(() => {\n    setShowSearch(prev => !prev);\n    \n    // Clear search when closing\n    if (showSearch) {\n      setSearchQuery('');\n      setSearchResults({\n        songs: [],\n        playlists: [],\n        artists: [],\n        albums: [],\n        totalCount: 0\n      });\n    }\n  }, [showSearch]);\n  \n  const handleSetSearchQuery = useCallback((query: string) => {\n    setSearchQuery(query);\n  }, []);\n  \n  const performSearch = useCallback(async (query: string) => {\n    setSearchQuery(query);\n    await performSearchInternal(query);\n    \n    // Add to history if not empty and not already in history\n    if (query.trim() && !searchHistory.includes(query)) {\n      addToHistory(query);\n    }\n  }, [searchHistory]);\n  \n  const clearSearch = useCallback(() => {\n    setSearchQuery('');\n    setSearchResults({\n      songs: [],\n      playlists: [],\n      artists: [],\n      albums: [],\n      totalCount: 0\n    });\n    setFilters({});\n  }, []);\n  \n  const handleSetFilters = useCallback((newFilters: Partial<SearchFilters>) => {\n    setFilters(prev => ({ ...prev, ...newFilters }));\n  }, []);\n  \n  const addToHistory = useCallback((query: string) => {\n    setSearchHistory(prev => {\n      const filtered = prev.filter(item => item !== query);\n      return [query, ...filtered].slice(0, 10); // Keep last 10 searches\n    });\n  }, []);\n  \n  const clearHistory = useCallback(() => {\n    setSearchHistory([]);\n    localStorage.removeItem('searchHistory');\n  }, []);\n  \n  const removeFromHistory = useCallback((query: string) => {\n    setSearchHistory(prev => prev.filter(item => item !== query));\n  }, []);\n  \n  const contextValue: SearchContextType = {\n    showSearch,\n    searchQuery,\n    searchResults,\n    isSearching,\n    searchHistory,\n    suggestions,\n    filters,\n    sortBy,\n    toggleSearch,\n    setSearchQuery: handleSetSearchQuery,\n    performSearch,\n    clearSearch,\n    setFilters: handleSetFilters,\n    setSortBy,\n    addToHistory,\n    clearHistory,\n    removeFromHistory\n  };\n  \n  return (\n    <SearchContext.Provider value={contextValue}>\n      {children}\n    </SearchContext.Provider>\n  );\n}\n```\n\n## Komponentë të Kërkimit\n\n### SearchBar Component\n\n```typescript\nfunction SearchBar() {\n  const {\n    searchQuery,\n    setSearchQuery,\n    suggestions,\n    searchHistory,\n    isSearching,\n    performSearch\n  } = useSearch();\n  \n  const [showSuggestions, setShowSuggestions] = useState(false);\n  const inputRef = useRef<HTMLInputElement>(null);\n  \n  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (searchQuery.trim()) {\n      performSearch(searchQuery);\n      setShowSuggestions(false);\n    }\n  };\n  \n  const handleSuggestionClick = (suggestion: string) => {\n    setSearchQuery(suggestion);\n    performSearch(suggestion);\n    setShowSuggestions(false);\n  };\n  \n  return (\n    <div className=\"search-bar\">\n      <form onSubmit={handleSubmit}>\n        <div className=\"search-input-container\">\n          <FiSearch className=\"search-icon\" />\n          <input\n            ref={inputRef}\n            type=\"text\"\n            value={searchQuery}\n            onChange={(e) => setSearchQuery(e.target.value)}\n            onFocus={() => setShowSuggestions(true)}\n            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}\n            placeholder=\"Kërko këngë, artist, album...\"\n            className=\"search-input\"\n          />\n          \n          {isSearching && (\n            <Spinner size=\"sm\" className=\"search-spinner\" />\n          )}\n          \n          {searchQuery && (\n            <button\n              type=\"button\"\n              onClick={() => setSearchQuery('')}\n              className=\"clear-button\"\n            >\n              <FiX />\n            </button>\n          )}\n        </div>\n      </form>\n      \n      {/* Suggestions Dropdown */}\n      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (\n        <div className=\"suggestions-dropdown\">\n          {suggestions.length > 0 && (\n            <div className=\"suggestions-section\">\n              <h4>Sugjerime</h4>\n              {suggestions.map((suggestion, index) => (\n                <button\n                  key={index}\n                  onClick={() => handleSuggestionClick(suggestion)}\n                  className=\"suggestion-item\"\n                >\n                  <FiSearch />\n                  <span>{suggestion}</span>\n                </button>\n              ))}\n            </div>\n          )}\n          \n          {searchHistory.length > 0 && (\n            <div className=\"history-section\">\n              <h4>Kërkime të fundit</h4>\n              {searchHistory.slice(0, 5).map((item, index) => (\n                <button\n                  key={index}\n                  onClick={() => handleSuggestionClick(item)}\n                  className=\"history-item\"\n                >\n                  <FiClock />\n                  <span>{item}</span>\n                </button>\n              ))}\n            </div>\n          )}\n        </div>\n      )}\n    </div>\n  );\n}\n```\n\n### SearchFilters Component\n\n```typescript\nfunction SearchFilters() {\n  const { filters, setFilters, clearSearch } = useSearch();\n  \n  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical'];\n  const years = Array.from({ length: 30 }, (_, i) => 2024 - i);\n  \n  return (\n    <div className=\"search-filters\">\n      <div className=\"filter-group\">\n        <label>Zhanri:</label>\n        <select\n          value={filters.genre || ''}\n          onChange={(e) => setFilters({ genre: e.target.value || undefined })}\n        >\n          <option value=\"\">Të gjitha</option>\n          {genres.map(genre => (\n            <option key={genre} value={genre.toLowerCase()}>\n              {genre}\n            </option>\n          ))}\n        </select>\n      </div>\n      \n      <div className=\"filter-group\">\n        <label>Viti:</label>\n        <select\n          value={filters.year || ''}\n          onChange={(e) => setFilters({ year: e.target.value ? parseInt(e.target.value) : undefined })}\n        >\n          <option value=\"\">Të gjitha</option>\n          {years.map(year => (\n            <option key={year} value={year}>\n              {year}\n            </option>\n          ))}\n        </select>\n      </div>\n      \n      <div className=\"filter-group\">\n        <label>Kohëzgjatja:</label>\n        <select\n          onChange={(e) => {\n            const value = e.target.value;\n            if (value === 'short') {\n              setFilters({ duration: { min: 0, max: 180 } });\n            } else if (value === 'medium') {\n              setFilters({ duration: { min: 180, max: 300 } });\n            } else if (value === 'long') {\n              setFilters({ duration: { min: 300, max: 999999 } });\n            } else {\n              setFilters({ duration: undefined });\n            }\n          }}\n        >\n          <option value=\"\">Të gjitha</option>\n          <option value=\"short\">E shkurtër (< 3 min)</option>\n          <option value=\"medium\">Mesatare (3-5 min)</option>\n          <option value=\"long\">E gjatë (> 5 min)</option>\n        </select>\n      </div>\n      \n      <button onClick={clearSearch} className=\"clear-filters\">\n        Pastro Filtrat\n      </button>\n    </div>\n  );\n}\n```\n\n## Përdorimi në Aplikacion\n\n```typescript\n// App.tsx\nfunction App() {\n  return (\n    <SearchProvider>\n      <PlayerProvider>\n        <SpotifyLayout />\n      </PlayerProvider>\n    </SearchProvider>\n  );\n}\n\n// Në komponentë\nfunction Header() {\n  const { showSearch, toggleSearch } = useSearch();\n  \n  return (\n    <header>\n      <button onClick={toggleSearch}>\n        <FiSearch />\n      </button>\n      \n      {showSearch && <SearchBar />}\n    </header>\n  );\n}\n```\n\n## Të Lidhura\n\n- [useSearch Hook](../hooks/useSearch.md)\n- [Search Components](../components/search.md)\n- [API Search](../api/search.md)\n- [Performance Tips](../guides/search-optimization.md)