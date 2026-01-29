# Komponentët e Layout-it

## SpotifyLayout

Komponenti kryesor i layout-it të aplikacionit që kombinon të gjitha seksionet kryesore.

### Përshkrimi i Detajuar

SpotifyLayout është komponenti më i rëndësishëm i aplikacionit që menaxhon:
- Strukturen e përgjithshme të faqes
- Gjendjen e autentifikimit
- Integrimin e sidebar-it dhe player-it
- Responsive design për mobile dhe desktop
- Overlay-n për mobile kur sidebar është hapur

### Përdorimi

```typescript
import { SpotifyLayout } from '../components/layout/SpotifyLayout';

export default function HomePage() {
  return <SpotifyLayout />;
}
```

### Karakteristikat

- **Responsive Design**: Adaptohet automatikisht për mobile (0px+) dhe desktop (768px+)
- **Menaxhimi i Gjendjes së Autentifikimit**: Kontrollon nëse përdoruesi është i loguar
- **Integrimi i Sidebar-it**: Përfshin sidebar-in me navigim dhe playlist-et
- **Integrimi i Player-it**: Player-i i fiksuar në fund të ekranit
- **Header Mobile**: Header i përshtatur për paisje mobile me buton menu

### Detaje Teknike

```typescript
// Struktura e brendshme e SpotifyLayout
function SpotifyLayout() {
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Box h="100vh" bg="#191414">
      {/* Header për Mobile */}
      <MobileHeader />
      
      {/* Butonat e Autentifikimit */}
      <AuthSection />
      
      {/* Layout Kryesor */}
      <MainLayout />
      
      {/* Player i Fiksuar */}
      <Player />
    </Box>
  );
}
```

## MainContent

Zona kryesore e përmbajtjes që shfaq këngët, kërkimin dhe playlist-et.

### Përshkrimi i Detajuar

MainContent është komponenti që përgjigjet për:
- Shfaqjen e këngëve në grid
- Funksionalitetin e kërkimit
- Daily mixes dhe artist playlists
- Trending songs marquee
- Integrimin me liked songs

### Përdorimi

```typescript
import { MainContent } from '../components/layout/MainContent';

function CustomLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <MainContent />
      <Player />
    </div>
  );
}
```

### Karakteristikat e Detajuara

- **Funksionaliteti i Kërkimit**: 
  - Kërkim në kohë reale me debounce
  - Filtrimi sipas titullit, artistit, albumit
  - Shfaqja e rezultateve të këngëve dhe playlist-eve

- **Shfaqja e Këngëve**:
  - Grid responsive për këngët
  - Pagination me infinite scroll
  - Cover images me fallback

- **Trending Songs Marquee**:
  - Animacion horizontal i këngëve trending
  - Click për të luajtur këngën
  - Responsive speed

- **Daily Mixes**:
  - Gjenerimi automatik i playlist-eve
  - Cover images dinamike
  - Shuffle functionality

### Shembull i Përshtatur

```typescript
function EnhancedMainContent() {
  const { showSearch } = useSearch();
  const { currentSong } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Box flex="1" bg="#121212" p={{ base: 4, md: 8 }}>
      {/* Greeting Section */}
      <WelcomeSection />
      
      {/* Search Section - shfaqet vetëm kur showSearch = true */}
      {showSearch && (
        <SearchSection 
          query={searchQuery}
          onQueryChange={setSearchQuery}
        />
      )}
      
      {/* Made For You Section */}
      <MadeForYouSection />
    </Box>
  );
}
```

## LibraryContent

Përmbajtja e faqes së bibliotekës që shfaq playlist-et dhe këngët e pëlqyera të përdoruesit.

### Përshkrimi i Detajuar

LibraryContent menaxhon:
- Shfaqjen e playlist-eve të përdoruesit
- Krijimin e playlist-eve të reja
- Seksionin e liked songs
- Grid layout responsive

### Përdorimi

```typescript
import { LibraryContent } from '../components/layout/LibraryContent';

function LibraryPage() {
  return (
    <div className="library-page">
      <LibraryContent />
    </div>
  );
}
```

### Karakteristikat e Avancuara

- **Menaxhimi i Playlist-eve**:
  - Shfaqja e të gjitha playlist-eve të përdoruesit
  - Krijimi i playlist-eve të reja me modal
  - Fshirja e playlist-eve me konfirmim
  - Editimi i emrit dhe përshkrimit

- **Liked Songs Integration**:
  - Seksion i veçantë për këngët e pëlqyera
  - Numratori i këngëve
  - Gradient background

- **Responsive Grid**:
  - 2 kolona në mobile
  - 3-4 kolona në desktop
  - Auto-adjusting card sizes

## Shembull i Plotë i Layout-it

```typescript
function CompleteAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());
  const { currentSong } = usePlayer();

  return (
    <Box h="100vh" bg="#191414">
      {/* Mobile Header me Menu Toggle */}
      <Box
        display={{ base: "flex", md: "none" }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="56px"
        bg="#000000"
        alignItems="center"
        justifyContent="space-between"
        px={4}
        zIndex={15}
      >
        <IconButton
          aria-label="Toggle menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="ghost"
          color="white"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </IconButton>
        <Text fontSize="lg" fontWeight="bold" color="white">
          Spotify
        </Text>
      </Box>

      {/* Butonat e Autentifikimit */}
      <Box position="absolute" top={{ base: "8px", md: 4 }} right={4} zIndex={16}>
        {isAuthenticated ? <UserProfile /> : <AuthButtons />}
      </Box>

      {/* Overlay për Mobile */}
      {sidebarOpen && (
        <Box
          display={{ base: "block", md: "none" }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.700"
          zIndex={19}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Layout Kryesor */}
      <Flex h="100vh" pt={{ base: "56px", md: 0 }} pb="90px">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <MainContent />
      </Flex>

      {/* Player i Fiksuar */}
      <Player />
    </Box>
  );
}
```

## Responsive Breakpoints

Layout-i përdon Chakra UI responsive props:

- `base`: Mobile (0px+)
- `md`: Desktop (768px+)
- `lg`: Large Desktop (992px+)
- `xl`: Extra Large (1200px+)

### Shembuj Përdorimi Responsive

```typescript
// Padding responsive
<Box p={{ base: 4, md: 8, lg: 12 }}>

// Display responsive
<Box display={{ base: "none", md: "block", lg: "flex" }}>

// Sizing responsive
<Box w={{ base: "full", md: "240px", lg: "280px" }}>

// Grid columns responsive
<SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }}>
```

## Integrimi me Autentifikimin

```typescript
function AuthenticatedLayout() {
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const session = authStorage.getSession();
      setUser(session?.user);
    }
  }, [isAuthenticated]);

  return (
    <SpotifyLayout>
      {isAuthenticated ? (
        <AuthenticatedContent user={user} />
      ) : (
        <GuestContent />
      )}
    </SpotifyLayout>
  );
}
```

## Performance Optimizations

### Lazy Loading
```typescript
// Lazy loading për komponentët e mëdhenj
const LibraryContent = lazy(() => import('./LibraryContent'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/library" element={<LibraryContent />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization
```typescript
// Memoization për komponentët e shtrenjtë
const MemoizedSongList = memo(SongList);
const MemoizedPlaylistGrid = memo(PlaylistGrid);
```

## Të Lidhura

- [Komponentët e Navigimit](./navigation.md)
- [Komponentët e Player-it](./player.md)
- [Autentifikimi](../utils/auth.md)
- [Hooks për Layout](../hooks/useLayout.md)