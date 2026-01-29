# PlayerContext

Konteksti kryesor për menaxhimin e gjendjes së player-it në të gjithë aplikacionin.

## Përshkrimi i Detajuar

PlayerContext është konteksti React që:
- Menaxhon gjendjen globale të player-it
- Siguron audio element management
- Trajton queue management dhe navigation
- Ofron API të qartë për komponentët
- Integrohet me localStorage për persistence
- Mbështet keyboard shortcuts dhe media keys

## Struktura e Kontekstit

```typescript
interface PlayerContextType {
  // Audio State
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  
  // Queue State
  queue: Song[];
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
  
  // Actions
  playSong: (song: Song, playlist?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  
  // Queue Management
  addToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}
```

## Implementimi i Provider-it

```typescript
export function PlayerProvider({ children }: { children: ReactNode }) {
  // State management
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Queue state
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleMode, setShuffleMode] = useState(false);
  
  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    // Event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);
  
  // Event handlers
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };
  
  const handleCanPlay = () => {
    setIsLoading(false);
    setDuration(audioRef.current?.duration || 0);
  };
  
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };
  
  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current?.play();
    } else {
      playNext();
    }
  };
  
  const handleError = (e: Event) => {
    setIsLoading(false);
    setError('Gabim në ngarkimin e këngës');
    console.error('Audio error:', e);
  };
  
  // Actions implementation
  const playSong = useCallback((song: Song, playlist?: Song[]) => {
    if (playlist) {
      setQueue(playlist);
      const index = playlist.findIndex(s => s.id === song.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
    
    setCurrentSong(song);
    
    if (audioRef.current && song.audio_url) {
      audioRef.current.src = song.audio_url;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Play failed:', error);
        setError('Dështoi luajtja e këngës');
      });
    }
  }, []);
  
  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Play failed:', error);
        setError('Dështoi luajtja e këngës');
      });
    }
  }, [isPlaying, currentSong]);
  
  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (shuffleMode) {
      // Random next song (excluding current)
      const availableIndices = queue
        .map((_, index) => index)
        .filter(index => index !== currentIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return; // No next song
      }
    }
    
    const nextSong = queue[nextIndex];
    if (nextSong) {
      setCurrentIndex(nextIndex);
      playSong(nextSong);
    }
  }, [queue, currentIndex, shuffleMode, repeatMode, playSong]);
  
  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;
    
    // If more than 3 seconds played, restart current song
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        return; // No previous song
      }
    }
    
    const prevSong = queue[prevIndex];
    if (prevSong) {
      setCurrentIndex(prevIndex);
      playSong(prevSong);
    }
  }, [queue, currentIndex, currentTime, repeatMode, playSong]);
  
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);
  
  const handleSetVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
    
    // Save to localStorage
    localStorage.setItem('playerVolume', clampedVolume.toString());
  }, []);
  
  // Queue management
  const addToQueue = useCallback((songs: Song[]) => {
    setQueue(prev => [...prev, ...songs]);
  }, []);
  
  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      
      // Adjust current index if necessary
      if (index < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (index === currentIndex && newQueue.length > 0) {
        // If removing current song, play next available
        const nextSong = newQueue[Math.min(currentIndex, newQueue.length - 1)];
        if (nextSong) {
          playSong(nextSong);
        }
      }
      
      return newQueue;
    });
  }, [currentIndex, playSong]);
  
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);
  
  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [movedSong] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, movedSong);
      
      // Update current index if necessary
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex(prev => prev + 1);
      }
      
      return newQueue;
    });
  }, [currentIndex]);
  
  const toggleShuffle = useCallback(() => {
    setShuffleMode(prev => !prev);
  }, []);
  
  // Computed values
  const hasNext = useMemo(() => {
    if (shuffleMode) return queue.length > 1;
    if (repeatMode === 'all') return queue.length > 0;
    return currentIndex < queue.length - 1;
  }, [queue.length, currentIndex, shuffleMode, repeatMode]);
  
  const hasPrevious = useMemo(() => {
    if (repeatMode === 'all') return queue.length > 0;
    return currentIndex > 0;
  }, [currentIndex, repeatMode, queue.length]);
  
  // Persistence
  useEffect(() => {
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume) {
      handleSetVolume(parseFloat(savedVolume));
    }
  }, [handleSetVolume]);
  
  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'Unknown Album',
        artwork: currentSong.cover_image_url ? [
          { src: currentSong.cover_image_url, sizes: '300x300', type: 'image/jpeg' }
        ] : []
      });
      
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [currentSong, togglePlay, playNext, playPrevious]);
  
  const contextValue: PlayerContextType = {
    // State
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    queue,
    currentIndex,
    hasNext,
    hasPrevious,
    repeatMode,
    shuffleMode,
    
    // Actions
    playSong,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolume: handleSetVolume,
    setRepeatMode,
    toggleShuffle,
    addToQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue
  };
  
  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}
```

## Përdorimi në Aplikacion

```typescript
// App.tsx
function App() {
  return (
    <PlayerProvider>
      <ChakraProvider>
        <SearchProvider>
          <SpotifyLayout />
        </SearchProvider>
      </ChakraProvider>
    </PlayerProvider>
  );
}

// Në komponentë
function SomeComponent() {
  const { currentSong, isPlaying, playSong } = usePlayer();
  
  return (
    <div>
      {currentSong && (
        <p>Duke luajtur: {currentSong.title}</p>
      )}
    </div>
  );
}
```

## Optimizime dhe Best Practices

### Performance Optimization

```typescript
// Memoize expensive calculations
const queueDuration = useMemo(() => {
  return queue.reduce((total, song) => total + (song.duration_seconds || 0), 0);
}, [queue]);

// Debounce volume changes
const debouncedVolumeChange = useMemo(
  () => debounce((volume: number) => {
    localStorage.setItem('playerVolume', volume.toString());
  }, 300),
  []
);
```

### Error Recovery

```typescript
const retryPlayback = useCallback(async () => {
  if (!currentSong?.audio_url) return;
  
  try {
    setError(null);
    setIsLoading(true);
    
    if (audioRef.current) {
      audioRef.current.src = currentSong.audio_url;
      await audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    }
  } catch (error) {
    setError('Dështoi riluajtja e këngës');
  } finally {
    setIsLoading(false);
  }
}, [currentSong]);
```

## Të Lidhura

- [usePlayer Hook](../hooks/usePlayer.md)
- [Player Components](../components/player.md)
- [Audio Management](../guides/audio-management.md)
- [State Management](../guides/state-management.md)