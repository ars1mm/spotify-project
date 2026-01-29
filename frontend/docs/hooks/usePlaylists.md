# Hook-u usePlaylists

Hook-u i personalizuar për menaxhimin e playlist-eve të përdoruesit.

## Përshkrimi i Detajuar

usePlaylists është hook-u që menaxhon:
- Marrjen e playlist-eve të përdoruesit
- Krijimin e playlist-eve të reja
- Editimin e playlist-eve ekzistuese
- Fshirjen e playlist-eve
- Shtimin/heqjen e këngëve nga playlist-et
- Real-time updates dhe synchronization
- Offline support me caching

## Përdorimi

```typescript
import { usePlaylists } from '../hooks/usePlaylists';

function PlaylistsComponent() {
  const { 
    playlists, 
    loading, 
    createPlaylist, 
    updatePlaylist,
    deletePlaylist, 
    addSongToPlaylist,
    removeSongFromPlaylist,
    refresh,
    error 
  } = usePlaylists();
}
```

## Vlerat e Kthyera

### Gjendja (State)
- `playlists` (Playlist[]): Array e playlist-eve të përdoruesit
- `loading` (boolean): Nëse playlist-et po ngarkohen
- `error` (string | null): Gabimi i fundit (nëse ka)
- `totalCount` (number): Numri total i playlist-eve
- `isCreating` (boolean): Nëse po krijohet playlist e re
- `isUpdating` (boolean): Nëse po përditësohet playlist
- `isDeleting` (boolean): Nëse po fshihet playlist

### Veprimet (Actions)
- `createPlaylist(data)`: Krijon playlist të re
- `updatePlaylist(id, data)`: Përditëson playlist ekzistuese
- `deletePlaylist(id)`: Fshin playlist
- `addSongToPlaylist(playlistId, songId)`: Shton këngë në playlist
- `removeSongFromPlaylist(playlistId, songId)`: Heq këngë nga playlist
- `duplicatePlaylist(id)`: Kopjon playlist
- `reorderSongs(playlistId, fromIndex, toIndex)`: Rendit këngët
- `refresh()`: Rifresko playlist-et

## Shembuj të Detajuar

### Shfaqja e Playlist-eve

```typescript
function PlaylistsList() {
  const { playlists, loading, error, refresh } = usePlaylists();
  const { playSong } = usePlayer();

  if (loading && playlists.length === 0) {
    return (
      <div className="playlists-loading">
        <Spinner size="lg" />
        <Text>Duke ngarkuar playlist-et...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlists-error">
        <Text color="red.500">Gabim: {error}</Text>
        <Button onClick={refresh}>Provo Përsëri</Button>
      </div>
    );
  }

  const handlePlayPlaylist = (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  return (
    <div className="playlists-grid">
      <div className="playlists-header">
        <h2>Playlist-et e Mia ({playlists.length})</h2>
        <Button onClick={refresh} leftIcon={<FiRefreshCw />}>
          Rifresko
        </Button>
      </div>
      
      {playlists.map(playlist => (
        <div key={playlist.id} className="playlist-card">
          <div className="playlist-cover">
            {playlist.cover_image ? (
              <img src={playlist.cover_image} alt={playlist.name} />
            ) : (
              <div className="default-cover">
                <FiMusic size={40} />
              </div>
            )}
            
            <div className="playlist-overlay">
              <button 
                className="play-button"
                onClick={() => handlePlayPlaylist(playlist)}
                disabled={!playlist.songs?.length}
              >
                <FiPlay />
              </button>
            </div>
          </div>
          
          <div className="playlist-info">
            <h3>{playlist.name}</h3>
            <p>{playlist.description || 'Asnjë përshkrim'}</p>
            <span className="song-count">
              {playlist.songs?.length || 0} këngë
            </span>
          </div>
        </div>
      ))}
      
      {playlists.length === 0 && (
        <div className="empty-playlists">
          <FiMusic size={60} />
          <h3>Asnjë playlist ende</h3>
          <p>Krijoni playlist-ën tuaj të parë për të organizuar këngët</p>
        </div>
      )}
    </div>
  );
}
```

### Krijimi i Playlist-eve

```typescript
function CreatePlaylist() {
  const { createPlaylist, isCreating } = usePlaylists();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    cover_image: null
  });
  const [selectedSongs, setSelectedSongs] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Emri i playlist-ës është i detyrueshëm');
      return;
    }

    try {
      const playlistData = {
        ...formData,
        song_ids: selectedSongs.map(song => song.id)
      };

      const newPlaylist = await createPlaylist(playlistData);
      
      if (newPlaylist) {
        toast.success(`Playlist-ja "${formData.name}" u krijua me sukses!`);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          is_public: true,
          cover_image: null
        });
        setSelectedSongs([]);
        
        // Redirect to playlist page
        router.push(`/playlist/${newPlaylist.id}`);
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Ju lutem zgjidhni një imazh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imazhi duhet të jetë më i vogël se 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, cover_image: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-playlist-form">
      <div className="form-header">
        <h2>Krijo Playlist të Re</h2>
      </div>
      
      <div className="form-body">
        {/* Cover Image Upload */}
        <div className="cover-upload">
          <div className="cover-preview">
            {formData.cover_image ? (
              <img 
                src={URL.createObjectURL(formData.cover_image)} 
                alt="Preview" 
              />
            ) : (
              <div className="default-cover">
                <FiImage size={40} />
                <span>Shto Imazh</span>
              </div>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="cover-upload"
          />
          <label htmlFor="cover-upload" className="upload-button">
            Zgjidh Imazh
          </label>
        </div>
        
        {/* Basic Info */}
        <div className="basic-info">
          <div className="form-group">
            <label htmlFor="name">Emri i Playlist-ës *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                name: e.target.value 
              }))}
              placeholder="Playlist-ja Ime"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Përshkrimi</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              placeholder="Përshkruani playlist-ën tuaj..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  is_public: e.target.checked 
                }))}
              />
              <span>Bëje publike</span>
            </label>
            <small>
              {formData.is_public 
                ? 'Të gjithë mund ta shohin këtë playlist' 
                : 'Vetëm ju mund ta shihni këtë playlist'
              }
            </small>
          </div>
        </div>
        
        {/* Song Selection */}
        <div className="song-selection">
          <h3>Shto Këngë (Opsionale)</h3>
          <SongSelector 
            selectedSongs={selectedSongs}
            onSelectionChange={setSelectedSongs}
          />
          
          {selectedSongs.length > 0 && (
            <div className="selected-songs-preview">
              <h4>{selectedSongs.length} këngë të zgjedhura</h4>
              <div className="selected-songs-list">
                {selectedSongs.slice(0, 3).map(song => (
                  <div key={song.id} className="selected-song">
                    <span>{song.title} - {song.artist}</span>
                  </div>
                ))}
                {selectedSongs.length > 3 && (
                  <div className="more-songs">
                    +{selectedSongs.length - 3} më shumë
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="form-footer">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="cancel-button"
        >
          Anulo
        </button>
        <button 
          type="submit" 
          disabled={isCreating || !formData.name.trim()}
          className="create-button"
        >
          {isCreating ? (
            <>
              <Spinner size="sm" />
              Duke krijuar...
            </>
          ) : (
            'Krijo Playlist'
          )}
        </button>
      </div>
    </form>
  );
}
```

### Editimi i Playlist-eve

```typescript
function EditPlaylist({ playlistId }) {
  const { 
    playlists, 
    updatePlaylist, 
    addSongToPlaylist, 
    removeSongFromPlaylist,
    reorderSongs,
    isUpdating 
  } = usePlaylists();
  
  const playlist = playlists.find(p => p.id === playlistId);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    is_public: playlist?.is_public || false
  });

  const handleUpdate = async () => {
    try {
      await updatePlaylist(playlistId, formData);
      setEditMode(false);
      toast.success('Playlist-ja u përditësua me sukses!');
    } catch (error) {
      toast.error('Dështoi përditësimi i playlist-ës');
    }
  };

  const handleAddSong = async (song) => {
    try {
      await addSongToPlaylist(playlistId, song.id);
      toast.success(`"${song.title}" u shtua në playlist`);
    } catch (error) {
      toast.error('Dështoi shtimi i këngës');
    }
  };

  const handleRemoveSong = async (songId, songTitle) => {
    const confirmed = confirm(`Hiq "${songTitle}" nga playlist-ja?`);
    if (confirmed) {
      try {
        await removeSongFromPlaylist(playlistId, songId);
        toast.success('Kënga u hoq nga playlist-ja');
      } catch (error) {
        toast.error('Dështoi heqja e këngës');
      }
    }
  };

  const handleReorder = async (fromIndex, toIndex) => {
    try {
      await reorderSongs(playlistId, fromIndex, toIndex);
    } catch (error) {
      toast.error('Dështoi renditja e këngëve');
    }
  };

  if (!playlist) {
    return <div>Playlist nuk u gjet</div>;
  }

  return (
    <div className="edit-playlist">
      {/* Playlist Header */}
      <div className="playlist-header">
        <div className="playlist-cover">
          <img 
            src={playlist.cover_image || '/default-playlist.png'} 
            alt={playlist.name} 
          />
        </div>
        
        <div className="playlist-info">
          {editMode ? (
            <div className="edit-form">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
                className="name-input"
              />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                className="description-input"
                placeholder="Shto përshkrim..."
              />
              <label className="public-checkbox">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    is_public: e.target.checked 
                  }))}
                />
                Publike
              </label>
              
              <div className="edit-actions">
                <button onClick={() => setEditMode(false)}>
                  Anulo
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Duke ruajtur...' : 'Ruaj'}
                </button>
              </div>
            </div>
          ) : (
            <div className="display-info">
              <h1>{playlist.name}</h1>
              <p>{playlist.description || 'Asnjë përshkrim'}</p>
              <div className="playlist-meta">
                <span>{playlist.songs?.length || 0} këngë</span>
                <span>•</span>
                <span>{playlist.is_public ? 'Publike' : 'Private'}</span>
                <button 
                  onClick={() => setEditMode(true)}
                  className="edit-button"
                >
                  <FiEdit2 /> Edito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Songs List */}
      <div className="playlist-songs">
        <div className="songs-header">
          <h3>Këngët</h3>
          <AddSongButton onAddSong={handleAddSong} />
        </div>
        
        <DraggableSongsList
          songs={playlist.songs || []}
          onRemove={handleRemoveSong}
          onReorder={handleReorder}
        />
      </div>
    </div>
  );
}
```

### Fshirja e Playlist-eve

```typescript
function DeletePlaylistButton({ playlist }) {
  const { deletePlaylist, isDeleting } = usePlaylists();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePlaylist(playlist.id);
      toast.success(`Playlist-ja "${playlist.name}" u fshi me sukses!`);
      router.push('/library');
    } catch (error) {
      toast.error('Dështoi fshirja e playlist-ës');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="delete-button"
        title="Fshi playlist-ën"
      >
        <FiTrash2 />
      </button>
      
      {showConfirm && (
        <div className="confirm-modal">
          <div className="modal-content">
            <h3>Fshi Playlist-ën?</h3>
            <p>
              Jeni të sigurt që doni të fshini "{playlist.name}"? 
              Ky veprim nuk mund të zhbëhet.
            </p>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Anulo
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="delete-confirm"
              >
                {isDeleting ? 'Duke fshirë...' : 'Fshi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

### Real-time Updates

```typescript
function usePlaylistsWithRealTime() {
  const baseHook = usePlaylists();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // WebSocket connection për real-time updates
    const ws = new WebSocket(`${WS_URL}/playlists`);
    
    ws.onopen = () => {
      console.log('Connected to playlist updates');
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'PLAYLIST_CREATED':
          baseHook.refresh();
          toast.info(`Playlist e re: "${update.playlist.name}"`);
          break;
          
        case 'PLAYLIST_UPDATED':
          baseHook.refresh();
          break;
          
        case 'PLAYLIST_DELETED':
          baseHook.refresh();
          toast.info(`Playlist-ja "${update.playlist.name}" u fshi`);
          break;
          
        case 'SONG_ADDED':
          baseHook.refresh();
          break;
      }
    };
    
    ws.onclose = () => {
      console.log('Disconnected from playlist updates');
      setSocket(null);
    };
    
    return () => {
      ws.close();
    };
  }, []);

  return {
    ...baseHook,
    isConnected: socket?.readyState === WebSocket.OPEN
  };
}
```

## Të Lidhura

- [Komponentët e Playlist-eve](../components/playlist.md)
- [apiRequest](../api/apiRequest.md)
- [Real-time Updates](../guides/websockets.md)
- [Drag and Drop](../components/drag-drop.md)