# Utilities për Storage

## `formatDuration(seconds)`

Formaton kohëzgjatjen në sekonda në formatin MM:SS ose HH:MM:SS.

### Përshkrimi i Detajuar

Ky funksion konverton sekonda në format të lexueshëm për përdoruesit:
- Për kohëzgjatje nën 1 orë: MM:SS
- Për kohëzgjatje mbi 1 orë: HH:MM:SS
- Trajton raste speciale si NaN ose vlera negative

### Parametrat

- `seconds` (number): Kohëzgjatja në sekonda

### Vlera e Kthyer

- `string`: Kohëzgjatja e formatuar

### Përdorimi

```typescript
formatDuration(125);    // "2:05"
formatDuration(3665);   // "1:01:05"
formatDuration(45);     // "0:45"
formatDuration(0);      // "0:00"
formatDuration(NaN);    // "0:00"
```

### Implementimi i Plotë

```typescript
export const formatDuration = (seconds: number): string => {
  // Trajto rastet e pavlefshme
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Shembuj përdorimi në komponentë
function SongItem({ song }) {
  return (
    <div className="song-item">
      <span className="song-title">{song.title}</span>
      <span className="song-duration">
        {formatDuration(song.duration_seconds)}
      </span>
    </div>
  );
}
```

## `formatPlaylistDuration(totalSeconds)`

Formaton kohëzgjatjen totale të playlist-ës në format të lexueshëm.

### Përshkrimi i Detajuar

Konverton sekonda në format human-readable për playlist-e:
- "X min" për kohëzgjatje nën 1 orë
- "X hr Y min" për kohëzgjatje mbi 1 orë
- "X hr" për orë të plota pa minuta

### Parametrat

- `totalSeconds` (number): Kohëzgjatja totale në sekonda

### Vlera e Kthyer

- `string`: Kohëzgjatja e formatuar (p.sh., "2 hr 15 min")

### Përdorimi

```typescript
formatPlaylistDuration(8100);  // "2 hr 15 min"
formatPlaylistDuration(1800);  // "30 min"
formatPlaylistDuration(3600);  // "1 hr"
formatPlaylistDuration(300);   // "5 min"
```

### Implementimi i Avancuar

```typescript
export const formatPlaylistDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds <= 0) {
    return '0 min';
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${hours} hr`;
    }
  }
  
  return `${minutes} min`;
};

// Përdorimi në playlist component
function PlaylistHeader({ playlist, songs }) {
  const totalDuration = songs.reduce((sum, song) => sum + song.duration_seconds, 0);
  
  return (
    <div className="playlist-header">
      <h1>{playlist.name}</h1>
      <p>{songs.length} këngë • {formatPlaylistDuration(totalDuration)}</p>
    </div>
  );
}
```

## `truncateText(text, maxLength)`

Pres tekstin në gjatësinë e specifikuar me elipsis.

### Përshkrimi i Detajuar

Ky funksion:
- Pres tekstin në gjatësinë maksimale
- Shton "..." në fund nëse teksti është i gjatë
- Ruan fjalët e plota (opsionale)
- Trajton raste speciale si tekst bosh

### Parametrat

- `text` (string): Teksti për të prerë
- `maxLength` (number): Gjatësia maksimale

### Vlera e Kthyer

- `string`: Teksti i prerë me "..." nëse nevojitet

### Përdorimi

```typescript
truncateText("Titulli i gjatë i këngës së re", 15); // "Titulli i gjatë..."
truncateText("Këngë e shkurtër", 20);                // "Këngë e shkurtër"
truncateText("", 10);                              // ""
```

### Implementimi i Avancuar

```typescript
export const truncateText = (text: string, maxLength: number, preserveWords = false): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  if (preserveWords) {
    // Pres në hapësirën e fundit para gjatësisë maksimale
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
  }
  
  return text.substring(0, maxLength) + '...';
};

// Shembuj përdorimi
function SongTitle({ title, maxLength = 30 }) {
  return (
    <h3 title={title}>
      {truncateText(title, maxLength, true)}
    </h3>
  );
}

function PlaylistDescription({ description }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 100;
  
  const shouldTruncate = description.length > maxLength;
  const displayText = expanded || !shouldTruncate 
    ? description 
    : truncateText(description, maxLength);
  
  return (
    <div className="playlist-description">
      <p>{displayText}</p>
      {shouldTruncate && (
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Shfaq më pak' : 'Shfaq më shumë'}
        </button>
      )}
    </div>
  );
}
```

## `getStorageItem(key, defaultValue)`

Merr item nga localStorage në mënyrë të sigurt me fallback.

### Përshkrimi i Detajuar

Ky funksion:
- Lexon të dhëna nga localStorage
- Parse-on JSON automatikisht
- Kthen vlerën default në rast gabimi
- Trajton raste kur localStorage nuk është i disponueshëm

### Parametrat

- `key` (string): Çelsi i localStorage
- `defaultValue` (T): Vlera default nëse çelsi nuk gjendet

### Vlera e Kthyer

- `T`: Vlera e parsed ose default

### Përdorimi

```typescript
const settings = getStorageItem('userSettings', { theme: 'dark' });
const volume = getStorageItem('playerVolume', 0.8);
const lastSong = getStorageItem('lastPlayedSong', null);
```

### Implementimi i Plotë

```typescript
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    // Kontrollo nëse localStorage është i disponueshëm
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    // Provo të parse-osh JSON
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to get storage item "${key}":`, error);
    return defaultValue;
  }
};

// Hook i personalizuar për localStorage
function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    return getStorageItem(key, defaultValue);
  });
  
  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    setStorageItem(key, newValue);
  };
  
  return [value, setStoredValue] as const;
}

// Përdorimi në komponent
function UserSettings() {
  const [settings, setSettings] = useLocalStorage('userSettings', {
    theme: 'dark',
    volume: 0.8,
    autoplay: true
  });
  
  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };
  
  return (
    <div className="settings">
      <label>
        <input 
          type="checkbox" 
          checked={settings.autoplay}
          onChange={(e) => updateSetting('autoplay', e.target.checked)}
        />
        Autoplay
      </label>
    </div>
  );
}
```

## `setStorageItem(key, value)`

Vendos item në localStorage në mënyrë të sigurt me trajtim gabimesh.

### Përshkrimi i Detajuar

Ky funksion:
- Stringify-on automatikisht objektet
- Trajton gabimet e localStorage (quota exceeded, etj.)
- Log-on gabimet për debugging
- Funksionon edhe kur localStorage nuk është i disponueshëm

### Parametrat

- `key` (string): Çelsi i localStorage
- `value` (unknown): Vlera për të ruajtur

### Përdorimi

```typescript
setStorageItem('userSettings', { theme: 'light', volume: 0.5 });
setStorageItem('lastPlayedSong', currentSong);
setStorageItem('playerQueue', songQueue);
```

### Implementimi i Avancuar

```typescript
export const setStorageItem = (key: string, value: unknown): boolean => {
  try {
    // Kontrollo nëse localStorage është i disponueshëm
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available');
      return false;
    }
    
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    
    return true;
  } catch (error) {
    console.error(`Failed to set storage item "${key}":`, error);
    
    // Trajto rastin e quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old data...');
      clearOldStorageData();
      
      // Provo përsëri
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('Failed to set storage item after cleanup:', retryError);
      }
    }
    
    return false;
  }
};

// Funksion helper për pastrimin e të dhënave të vjetra
const clearOldStorageData = () => {
  const keysToRemove = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('temp_') || key.startsWith('cache_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Storage manager i avancuar
class StorageManager {
  private prefix: string;
  
  constructor(prefix = 'spotify_') {
    this.prefix = prefix;
  }
  
  set<T>(key: string, value: T, expirationHours?: number): boolean {
    const fullKey = this.prefix + key;
    const data = {
      value,
      timestamp: Date.now(),
      expiration: expirationHours ? Date.now() + (expirationHours * 60 * 60 * 1000) : null
    };
    
    return setStorageItem(fullKey, data);
  }
  
  get<T>(key: string, defaultValue: T): T {
    const fullKey = this.prefix + key;
    const data = getStorageItem(fullKey, null);
    
    if (!data) {
      return defaultValue;
    }
    
    // Kontrollo expiration
    if (data.expiration && Date.now() > data.expiration) {
      this.remove(key);
      return defaultValue;
    }
    
    return data.value;
  }
  
  remove(key: string): void {
    const fullKey = this.prefix + key;
    try {
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Failed to remove storage item "${fullKey}":`, error);
    }
  }
  
  clear(): void {
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Përdorimi
const storage = new StorageManager('spotify_');

// Ruaj me expiration
storage.set('user_session', sessionData, 24); // Skadon pas 24 orësh

// Lexo të dhëna
const session = storage.get('user_session', null);
```

## Të Lidhura

- [Local Storage Best Practices](../guides/storage-best-practices.md)
- [Performance Optimization](../guides/performance.md)
- [Error Handling](./errorHandling.md)
- [React Hooks](../hooks/useLocalStorage.md)