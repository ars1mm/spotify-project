# Navigation Components

## Sidebar

Main navigation sidebar with menu items and playlists.

### Props

- `isOpen` (boolean, optional): Whether sidebar is open (mobile)
- `onClose` (function, optional): Callback when sidebar closes

### Usage

```typescript
import { Sidebar } from '../components/navigation/Sidebar';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
}
```

## MainNavigation

Core navigation items (Home, Search, Library).

### Props

- `onNavClick` (function): Handler for navigation clicks
- `onSearchToggle` (function): Handler for search toggle

### Usage

```typescript
import { MainNavigation } from '../components/navigation/MainNavigation';

function CustomNav() {
  const handleNavClick = (callback) => {
    callback?.();
    // Additional logic
  };

  return (
    <MainNavigation 
      onNavClick={handleNavClick}
      onSearchToggle={() => setShowSearch(true)}
    />
  );
}
```

## NavItem

Individual navigation item component.

### Props

- `icon` (IconType): React icon component
- `label` (string): Display text
- `href` (string, optional): Link destination
- `onClick` (function, optional): Click handler

### Usage

```typescript
import { NavItem } from '../components/navigation/NavItem';
import { FiHome } from 'react-icons/fi';

function CustomNavItem() {
  return (
    <NavItem 
      icon={FiHome} 
      label="Home" 
      href="/" 
    />
  );
}
```

## PlaylistsList

Displays user playlists in sidebar.

### Props

- `playlists` (Playlist[]): Array of playlists to display

### Usage

```typescript
import { PlaylistsList } from '../components/navigation/PlaylistsList';

function SidebarContent() {
  const { playlists } = usePlaylists();

  return (
    <div>
      <PlaylistsList playlists={playlists} />
    </div>
  );
}
```

## QuickActions

Quick action buttons (Create Playlist, Liked Songs).

### Usage

```typescript
import { QuickActions } from '../components/navigation/QuickActions';

function SidebarActions() {
  return (
    <div className="sidebar-section">
      <QuickActions />
    </div>
  );
}
```

## Complete Sidebar Example

```typescript
function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { playlists } = usePlaylists();
  const { toggleSearch } = useSearch();

  const handleNavClick = (callback) => {
    callback?.();
    setIsOpen(false); // Close on mobile
  };

  return (
    <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <SidebarHeader />
      <MainNavigation 
        onNavClick={handleNavClick}
        onSearchToggle={toggleSearch}
      />
      <QuickActions />
      <PlaylistsList playlists={playlists} />
    </Sidebar>
  );
}
```

## Related

- [Layout Components](./layout.md)
- [usePlaylists Hook](../hooks/usePlaylists.md)