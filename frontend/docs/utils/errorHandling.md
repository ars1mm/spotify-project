# Utilities për Trajtimin e Gabimeve

## `handleApiError(error, defaultMessage)`

Trajton gabimet e API me njoftime toast për përdoruesin.

### Përshkrimi i Detajuar

Ky funksion është përgjegjës për:
- Analizimin e gabimeve të API
- Nxjerrjen e mesazheve të kuptueshme
- Shfaqjen e toast notifications
- Logimin e gabimeve për debugging

### Parametrat

- `error` (unknown): Objekti i gabimit nga thirrja API
- `defaultMessage` (string): Mesazhi rezervë nëse detajet e gabimit nuk janë të disponueshme

### Përdorimi

```typescript
try {
  await apiRequest('/api/v1/songs');
} catch (error) {
  handleApiError(error, 'Dështoi ngarkimi i këngëve');
}
```

### Shembuj të Avancuar

```typescript
// Trajtimi i gabimeve të ndryshme
try {
  const result = await apiRequest('/api/v1/playlists', {
    method: 'POST',
    body: JSON.stringify(playlistData)
  });
} catch (error) {
  // Mesazhe specifike për gabime të ndryshme
  if (error.message.includes('401')) {
    handleApiError(error, 'Ju lutem bëni login për të vazhduar');
    // Ridrejtim në faqen e login-it
    router.push('/login');
  } else if (error.message.includes('403')) {
    handleApiError(error, 'Nuk keni lëjim për këtë veprim');
  } else if (error.message.includes('500')) {
    handleApiError(error, 'Gabim në server, provoni më vonë');
  } else {
    handleApiError(error, 'Dështoi krijimi i playlist-ës');
  }
}
```

## `handleApiSuccess(message)`

Shfaq njoftim sukses me toast.

### Parametrat

- `message` (string): Mesazhi i suksesit për të shfaqur

### Përdorimi

```typescript
// Pas një operacioni të suksesshëm
handleApiSuccess('Kënga u ngarkua me sukses!');
handleApiSuccess('Playlist-ja u krijua!');
handleApiSuccess('Të dhënat u ruajtën!');
```

### Shembuj me Timing

```typescript
// Mesazh sukses me timing të personalizuar
const showSuccessWithDelay = (message, delay = 3000) => {
  handleApiSuccess(message);
  
  // Fshij toast-in pas delay-it
  setTimeout(() => {
    toast.dismiss();
  }, delay);
};

// Përdorimi
showSuccessWithDelay('Operacioni u krye!', 5000);
```

## `withErrorHandling(operation, errorMessage, successMessage?)`

Funksion wrapper që trajton automatikisht rastet e suksesit dhe gabimit.

### Përshkrimi i Detajuar

Ky funksion:
- Ekzekuton operacionin e dhënë
- Trajton automatikisht gabimet
- Shfaq mesazhe sukses (opsionale)
- Kthen rezultatin ose null në rast gabimi

### Parametrat

- `operation` (function): Funksioni async për të ekzekutuar
- `errorMessage` (string): Mesazhi i gabimit për dështime
- `successMessage` (string, opsionale): Mesazhi i suksesit

### Vlera e Kthyer

- `Promise<T | null>`: Rezultati i operacionit ose null nëse dështoi

### Përdorimi Bazik

```typescript
const result = await withErrorHandling(
  () => apiRequest('/api/v1/songs'),
  'Dështoi ngarkimi i këngëve',
  'Këngët u ngarkuan me sukses'
);

if (result) {
  setSongs(result.songs);
}
```

### Shembuj të Avancuar

```typescript
// Upload i skedarit me progress
const uploadSong = async (file, metadata) => {
  const formData = new FormData();
  formData.append('audio_file', file);
  formData.append('title', metadata.title);
  formData.append('artist', metadata.artist);
  
  return await withErrorHandling(
    () => apiRequest('/api/v1/admin/songs', {
      method: 'POST',
      body: formData
    }),
    'Dështoi upload-i i këngës',
    `Kënga "${metadata.title}" u ngarkua me sukses!`
  );
};

// Krijimi i playlist-ës me validim
const createPlaylist = async (playlistData) => {
  // Validimi para se të bëhet thirrja
  if (!playlistData.name.trim()) {
    toast.error('Emri i playlist-ës është i detyrueshëm');
    return null;
  }
  
  return await withErrorHandling(
    () => apiRequest('/api/v1/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData)
    }),
    'Dështoi krijimi i playlist-ës',
    `Playlist-ja "${playlistData.name}" u krijua!`
  );
};

// Fshirja me konfirmim
const deleteSong = async (songId, songTitle) => {
  const confirmed = confirm(`Jeni të sigurt që doni të fshini "${songTitle}"?`);
  
  if (!confirmed) {
    return null;
  }
  
  return await withErrorHandling(
    () => apiRequest(`/api/v1/songs/${songId}`, {
      method: 'DELETE'
    }),
    'Dështoi fshirja e këngës',
    `Kënga "${songTitle}" u fshi me sukses!`
  );
};
```

### Integrimi me React Components

```typescript
// Hook i personalizuar për operacione API
function useApiOperation() {
  const [loading, setLoading] = useState(false);
  
  const executeOperation = async (operation, errorMessage, successMessage) => {
    setLoading(true);
    
    const result = await withErrorHandling(
      operation,
      errorMessage,
      successMessage
    );
    
    setLoading(false);
    return result;
  };
  
  return { executeOperation, loading };
}

// Përdorimi në komponent
function SongUploader() {
  const { executeOperation, loading } = useApiOperation();
  const [file, setFile] = useState(null);
  
  const handleUpload = async () => {
    if (!file) {
      toast.error('Zgjidhni një skedar audio');
      return;
    }
    
    const result = await executeOperation(
      () => uploadSong(file, { title: 'Kënga Ime', artist: 'Artisti' }),
      'Dështoi upload-i',
      'Kënga u ngarkua!'
    );
    
    if (result) {
      setFile(null);
      // Rifresko listën e këngëve
      refreshSongs();
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button 
        onClick={handleUpload} 
        disabled={loading || !file}
      >
        {loading ? 'Duke ngarkuar...' : 'Ngarko Këngën'}
      </button>
    </div>
  );
}
```

### Konfigurimi i Toast Notifications

```typescript
// Konfigurimi global i toast-eve
import toast, { Toaster } from 'react-hot-toast';

// Në App.tsx
function App() {
  return (
    <div className="app">
      {/* Komponenti juaj */}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#1DB954',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

// Toast i personalizuar
const customToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        border: '1px solid #1DB954',
        padding: '16px',
        color: '#1DB954',
      },
      iconTheme: {
        primary: '#1DB954',
        secondary: '#FFFAEE',
      },
    });
  },
  
  error: (message) => {
    toast.error(message, {
      style: {
        border: '1px solid #ff4b4b',
        padding: '16px',
        color: '#ff4b4b',
      },
    });
  },
  
  loading: (message) => {
    return toast.loading(message, {
      style: {
        border: '1px solid #ffa500',
        padding: '16px',
        color: '#ffa500',
      },
    });
  }
};
```

## Të Lidhura

- [apiRequest](../api/apiRequest.md)
- [Toast notifications](https://react-hot-toast.com/)
- [Error Boundaries](../components/error-boundary.md)
- [Logging Utils](../utils/logging.md)