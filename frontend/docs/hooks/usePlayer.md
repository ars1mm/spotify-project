# Hook-u usePlayer

Hook-u i personalizuar për menaxhimin e gjendjes dhe kontrolleve të player-it të muzikës.

### Përshkrimi i Detajuar

usePlayer është hook-u më i rëndësishëm i aplikacionit që menaxhon:
- Gjendjen e player-it (kënga aktuale, luajtja, koha)
- Kontrollet e player-it (play, pause, skip, seek)
- Queue management (radha e këngëve)
- Volume control
- Progress tracking
- Audio element management

## Përdorimi

```typescript
import { usePlayer } from '../contexts/PlayerContext';

function MyComponent() {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    playSong,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious
  } = usePlayer();
}
```

## Vlerat e Kthyera

### Gjendja (State)

- `currentSong` (Song | null): Kënga që po luhet aktualisht
- `isPlaying` (boolean): Nëse muzika po luhet aktualisht
- `currentTime` (number): Koha aktuale e luajtjes në sekonda
- `duration` (number): Kohëzgjatja totale e këngës në sekonda
- `volume` (number): Volumi aktual (0-1)
- `hasNext` (boolean): Nëse ka këngë të ardhshme në radhë
- `hasPrevious` (boolean): Nëse ka këngë të mëparshme
- `queue` (Song[]): Radha e këngëve
- `currentIndex` (number): Indeksi i këngës aktuale në radhë
- `isLoading` (boolean): Nëse kënga po ngarkohet
- `error` (string | null): Gabimi i fundit (nëse ka)

### Veprimet (Actions)

- `playSong(song, playlist?)`: Luan një këngë specifike
- `togglePlay()`: Ndryshon midis play/pause
- `playNext()`: Luan këngën e ardhshme në radhë
- `playPrevious()`: Luan këngën e mëparshme
- `seekTo(time)`: Shkon në një kohë specifike
- `setVolume(volume)`: Vendos nivelin e volumit
- `addToQueue(songs)`: Shton këngë në radhë
- `removeFromQueue(index)`: Heq këngë nga radha
- `clearQueue()`: Pastron radhën
- `shuffleQueue()`: Përzien radhën
- `setRepeatMode(mode)`: Vendos mënyrën e përsëritjes

## Shembuj të Detajuar

### Kontrollet Bazike të Luajtjes

```typescript
function PlayerControls() {
  const { 
    isPlaying, 
    togglePlay, 
    currentSong, 
    isLoading,
    error 
  } = usePlayer();

  const handlePlayPause = () => {
    if (!currentSong) {
      toast.error('Zgjidhni një këngë për ta luajtur');
      return;
    }
    togglePlay();
  };

  return (
    <div className="player-controls">
      <button 
        onClick={handlePlayPause} 
        disabled={!currentSong || isLoading}
        className={`play-button ${isPlaying ? 'playing' : 'paused'}`}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : isPlaying ? (
          <FiPause />
        ) : (
          <FiPlay />
        )}
      </button>
      
      {error && (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      )}
    </div>
  );
}
```

### Zgjedhja e Këngëve

```typescript
function SongList({ songs }) {
  const { playSong, currentSong } = usePlayer();
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());

  const handleSongClick = (song, index) => {
    if (!isAuthenticated) {
      toast.error('Ju lutem bëni login për të luajtur këngë');
      return;
    }
    
    // Luan këngën dhe vendos playlist-ën
    playSong(song, songs);
  };

  return (
    <div className="song-list">
      {songs.map((song, index) => (
        <div 
          key={song.id} 
          className={`song-item ${
            currentSong?.id === song.id ? 'active' : ''
          }`}
          onClick={() => handleSongClick(song, index)}
        >
          <div className="song-info">
            <h4>{song.title}</h4>
            <p>{song.artist}</p>
          </div>
          
          {currentSong?.id === song.id && (
            <div className="now-playing-indicator">
              <FiMusic className="pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Progress Bar i Avancuar

```typescript
function AdvancedProgressBar() {
  const { currentTime, duration, seekTo, isPlaying } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayTime = isDragging ? dragTime : currentTime;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateTime(e);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      updateTime(e);
    }
  };
  
  const handleMouseUp = (e) => {
    if (isDragging) {
      updateTime(e);
      seekTo(dragTime);
      setIsDragging(false);
    }
  };
  
  const updateTime = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    setDragTime(newTime);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="progress-container">
      <span className="time-display">
        {formatTime(displayTime)}
      </span>
      
      <div 
        className="progress-bar"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="progress-fill"
          style={{ width: `${isDragging ? (dragTime / duration) * 100 : progress}%` }}
        />
        <div 
          className="progress-handle"
          style={{ left: `${isDragging ? (dragTime / duration) * 100 : progress}%` }}
        />
      </div>
      
      <span className="time-display">
        {formatTime(duration)}
      </span>
    </div>
  );
}
```

### Kontrolli i Volumit

```typescript
function VolumeControl() {
  const { volume, setVolume } = usePlayer();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };
  
  return (
    <div className="volume-control">
      <button onClick={toggleMute} className="mute-button">
        {isMuted || volume === 0 ? (
          <FiVolumeX />
        ) : volume < 0.5 ? (
          <FiVolume1 />
        ) : (
          <FiVolume2 />
        )}
      </button>
      
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        className="volume-slider"
      />
      
      <span className="volume-percentage">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}
```

### Menaxhimi i Radhës (Queue)

```typescript
function QueueManager() {
  const { 
    queue, 
    currentIndex, 
    addToQueue, 
    removeFromQueue, 
    clearQueue,
    shuffleQueue,
    playSong
  } = usePlayer();
  
  const handlePlayFromQueue = (song, index) => {
    playSong(song, queue);
  };
  
  const handleRemoveFromQueue = (index) => {
    if (confirm('Doni ta hiqni këtë këngë nga radha?')) {
      removeFromQueue(index);
    }
  };
  
  return (
    <div className="queue-manager">
      <div className="queue-header">
        <h3>Radha e Këngëve ({queue.length})</h3>
        <div className="queue-actions">
          <button onClick={shuffleQueue} title="Përzie radhën">
            <FiShuffle />
          </button>
          <button onClick={clearQueue} title="Pastro radhën">
            <FiTrash2 />
          </button>
        </div>
      </div>
      
      <div className="queue-list">
        {queue.map((song, index) => (
          <div 
            key={`${song.id}-${index}`}
            className={`queue-item ${
              index === currentIndex ? 'current' : ''
            }`}
          >
            <div className="queue-item-info">
              <span className="queue-number">{index + 1}</span>
              <div className="song-details">
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
              </div>
            </div>
            
            <div className="queue-item-actions">
              <button 
                onClick={() => handlePlayFromQueue(song, index)}
                title="Luaj këtë këngë"
              >
                <FiPlay />
              </button>
              <button 
                onClick={() => handleRemoveFromQueue(index)}
                title="Hiq nga radha"
              >
                <FiX />
              </button>
            </div>
          </div>
        ))}
        
        {queue.length === 0 && (
          <div className="empty-queue">
            <p>Radha është bosh. Shtoni këngë për të filluar!</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Keyboard Shortcuts

```typescript
function usePlayerKeyboardShortcuts() {
  const { 
    togglePlay, 
    playNext, 
    playPrevious, 
    seekTo, 
    currentTime, 
    duration,
    volume,
    setVolume
  } = usePlayer();
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Mos reago nëse përdoruesi po shkruan në input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
          
        case 'ArrowRight':
          if (e.ctrlKey) {
            playNext();
          } else {
            seekTo(Math.min(duration, currentTime + 10));
          }
          break;
          
        case 'ArrowLeft':
          if (e.ctrlKey) {
            playPrevious();
          } else {
            seekTo(Math.max(0, currentTime - 10));
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
          
        case 'KeyM':
          setVolume(volume > 0 ? 0 : 0.5);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, playNext, playPrevious, seekTo, currentTime, duration, volume, setVolume]);
}

// Përdorimi në komponent
function App() {
  usePlayerKeyboardShortcuts();
  
  return (
    <div className="app">
      {/* Komponenti juaj */}
    </div>
  );
}
```

### Integrimi me Local Storage

```typescript
function usePlayerPersistence() {
  const { volume, setVolume, currentSong } = usePlayer();
  
  // Ruaj volumin në localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('playerVolume', volume.toString());
  }, [volume]);
  
  // Ruaj këngën e fundit
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('lastPlayedSong', JSON.stringify(currentSong));
    }
  }, [currentSong]);
}
```

## Të Lidhura

- [PlayerContext](../contexts/PlayerContext.md)
- [Komponentët e Player-it](../components/player.md)
- [Audio Management](../utils/audio.md)
- [Storage Utils](../utils/storage.md)
              >
                <FiX />
              </button>
            </div>
          </div>
        ))}
        
        {queue.length === 0 && (
          <div className="empty-queue">
            <p>Radha është bosh. Shtoni këngë për të filluar!</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Keyboard Shortcuts

```typescript
function usePlayerKeyboardShortcuts() {
  const { 
    togglePlay, 
    playNext, 
    playPrevious, 
    seekTo, 
    currentTime, 
    duration,
    volume,
    setVolume
  } = usePlayer();
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Mos reago nëse përdoruesi po shkruan në input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
          
        case 'ArrowRight':
          if (e.ctrlKey) {
            playNext();
          } else {
            seekTo(Math.min(duration, currentTime + 10));
          }
          break;
          
        case 'ArrowLeft':
          if (e.ctrlKey) {
            playPrevious();
          } else {
            seekTo(Math.max(0, currentTime - 10));
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
          
        case 'KeyM':
          setVolume(volume > 0 ? 0 : 0.5);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, playNext, playPrevious, seekTo, currentTime, duration, volume, setVolume]);
}

// Përdorimi në komponent
function App() {
  usePlayerKeyboardShortcuts();
  
  return (
    <div className="app">
      {/* Komponenti juaj */}
    </div>
  );
}
```

### Integrimi me Local Storage

```typescript
function usePlayerPersistence() {
  const { volume, setVolume, currentSong } = usePlayer();
  
  // Ruaj volumin në localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('playerVolume', volume.toString());
  }, [volume]);
  
  // Ruaj këngën e fundit
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('lastPlayedSong', JSON.stringify(currentSong));
    }
  }, [currentSong]);
}
```

## Të Lidhura

- [PlayerContext](../contexts/PlayerContext.md)
- [Komponentët e Player-it](../components/player.md)
- [Audio Management](../utils/audio.md)
- [Storage Utils](../utils/storage.md)