# Menaxhimi i Gjendjes (State Management)

Për të ndarë të dhënat midis komponentëve pa pasur nevojë për "prop drilling", aplikacioni përdor **React Context API**.

## Context-et Kryesore

### 1. AuthContext (`app/contexts/AuthContext.tsx`)
Menaxhon gjendjen e hyrjes së përdoruesit.
-   **Gjendja**: Ruhet objekti `user`, statusi `isAuthenticated` dhe `token`-i.
-   **Funksionet**: `login`, `register`, `logout`.
-   **Persistence**: Përdor `localStorage` për të mbajtur përdoruesin e identifikuar edhe pas rifreskimit të faqes (refresh).

### 2. PlayerContext (`app/contexts/PlayerContext.tsx`)
Ky është "truri" i audio player-it.
-   **Gjendja**:
    -   `currentSong`: Kënga që po luan aktualisht.
    -   `isPlaying`: Boolean që tregon nëse muzika po luan.
    -   `queue`: Lista e këngëve që do të luajnë në vazhdim.
    -   `volume`: Niveli i zërit.
-   **Funksionet**:
    -   `playSong(song)`: Fillon luajtjen e një kënge të re.
    -   `togglePlay()`: Ndërron gjendjen play/pause.
    -   `nextSong()` / `previousSong()`: Navigimi në radhë (queue).
    -   `addToQueue(song)`: Shton një këngë në listën e pritjes.

### 3. UI Context (opsionale)
Përdoret për të menaxhuar elementë globalë të ndërfaqes si modalet (popups) ose hapjen/mbylljen e menusë në celular.

## Strategjia e Përditësimit

-   **useState**: Përdoret për gjendje lokale (p.sh. teksti i një inputi në formë).
-   **useEffect**: Përdoret për sinkronizimin me API-n ose me localStorage.
-   **useMemo & useCallback**: Përdoren për të optimizuar performancën, duke parandaluar ri-renderimet e panevojshme kur të dhënat nuk kanë ndryshuar.

## RRjedha e të Dhënave (Data Flow)

1.  Përdoruesi klikon butonin "Play" në një këngë.
2.  Thirret funksioni `playSong` nga `PlayerContext`.
3.  Context përditëson `currentSong` dhe vendos `isPlaying` në `true`.
4.  Audio element-i në komponentin `Player.tsx` reagon ndaj ndryshimit të context-it dhe fillon luajtjen e skedarit audio.
5.  Ndërfaqja përditësohet në të gjithë aplikacionin (p.sh. shfaqet ikona "pause" në kartën e këngës).
