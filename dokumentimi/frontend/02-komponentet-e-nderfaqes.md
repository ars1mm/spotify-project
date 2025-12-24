# Komponentët e Ndërfaqes (UI Components)

Frontend-i i aplikacionit është i ndërtuar mbi një arkitekturë komponentesh modulare, ku secili pjesë ka një përgjegjësi të caktuar.

## Struktura e Layout-it

Layout-i kryesor (`app/layout.tsx`) ndan ekranin në tri pjesë kryesore:

1.  **Sidebar (Majtas)**: Navigimi kryesor (Home, Search, Library) dhe lista e playlist-ave të përdoruesit.
2.  **Main Content (Qendër)**: Pjesa dinamike që ndryshon sipas rrugës (URL). Këtu shfaqen këngët, albumet dhe playlist-at.
3.  **Player Bar (Poshtë)**: Kontrollet e muzikës që qëndrojnë gjithmonë aktive.

## Komponentët Kryesorë

### 1. Sidebar (`app/components/layout/Sidebar.tsx`)
Menaxhon menunë anësore. Përfshin:
-   **NavItem**: Elementë individualë të menusë me ikona.
-   **Library**: Seksioni ku përdoruesi sheh koleksionin e tij.
-   **PlaylistList**: Shfaq playlist-at e krijuara nga përdoruesi.

### 2. Player (`app/components/layout/Player.tsx`)
Komponenti më kompleks që komunikon me `PlayerContext`. Ai përmban:
-   **Song Info**: Titulli, artisti dhe imazhi i këngës aktuale.
-   **Playback Controls**: Play/Pause, Skip, Previous, Shuffle dhe Repeat.
-   **Progress Bar**: Vizualizimi i kohës së këngës dhe mundësia për të lëvizur në pjesë të caktuara.
-   **Volume Control**: Rregullimi i volumit të audios.

### 3. SongCard / PlaylistCard (`app/components/ui/`)
Karta vizuale që përdoren në faqen kryesore:
-   Shfaqin imazhin e kopertinës.
-   Butoni "Play" që shfaqet në hover.
-   Efekte tranzicioni për një eksperiencë premium.

### 4. Search Bar (`app/components/navigation/SearchBar.tsx`)
Lejon përdoruesit të kërkojnë për këngë, artistë ose playlist-a në kohë reale. Përdor teknikën *Debouncing* për të evituar kërkesat e tepërta në API.

## Përdorimi i Chakra UI

Ne përdorim Chakra UI për konsistencë vizuale:
-   **Box & Flex**: Për layouts elastikë.
-   **Text & Heading**: Për hierarki tipografike.
-   **Slider**: Për progress bar dhe volume control.
-   **Menu & Popover**: Për opsionet e llogarisë së përdoruesit.

## Responsive Design

Komponentët janë ndërtuar me parimin "Mobile First":
-   Në celular, Sidebar fshihet ose zëvendësohet me një menu "Hamburger".
-   Grid-et e këngëve përshtaten nga 2 kolona (celular) në 6-7 kolona (ekran i madh).
-   Elementët më pak kritikë të Player-it fshihen në ekrane të vogla për të kursyer hapësirë.
