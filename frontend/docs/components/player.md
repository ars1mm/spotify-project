# Player Components

## Player

Main player component that combines all player functionality.

### Usage

```typescript
import { Player } from '../components/player/Player';

function App() {
  return (
    <div>
      {/* Your app content */}
      <Player />
    </div>
  );
}
```

### Features

- Fixed position at bottom of screen
- Mobile-responsive design
- Progress bar (desktop and mobile)
- Integrates all player sub-components

## PlayerControls

Controls for play/pause, skip, and download functionality.

### Usage

```typescript
import { PlayerControls } from '../components/player/PlayerControls';

function CustomPlayer() {
  return (
    <div className="player">
      <PlayerControls />
    </div>
  );
}
```

### Features

- Play/pause button
- Previous/next track buttons
- Download button for current song
- Responsive button sizes

## SongInfo

Displays current song information and like functionality.

### Usage

```typescript
import { SongInfo } from '../components/player/SongInfo';

function PlayerDisplay() {
  return (
    <div className="player-info">
      <SongInfo />
    </div>
  );
}
```

### Features

- Song title and artist display
- Album cover image
- Like/unlike button
- Responsive text truncation

## VolumeControl

Volume slider and mute functionality.

### Usage

```typescript
import { VolumeControl } from '../components/player/VolumeControl';

function PlayerSettings() {
  return (
    <div className="player-volume">
      <VolumeControl />
    </div>
  );
}
```

### Features

- Volume slider (0-100%)
- Mute/unmute button
- Visual volume indicator
- Keyboard shortcuts support

## Integration Example

```typescript
function CustomMusicPlayer() {
  return (
    <div className="music-player">
      <div className="player-left">
        <SongInfo />
      </div>
      <div className="player-center">
        <PlayerControls />
      </div>
      <div className="player-right">
        <VolumeControl />
      </div>
    </div>
  );
}
```

## Related

- [usePlayer Hook](../hooks/usePlayer.md)
- [PlayerContext](../contexts/PlayerContext.md)