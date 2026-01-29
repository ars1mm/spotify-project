# Dokumentacioni i Frontend-it

Ky direktori përmban dokumentacionin për të gjitha funksionet, komponentët, hooks dhe utilities që përdoren në aplikacionin Spotify frontend.

## Struktura

- **components/**: Dokumentacioni për komponentët React
- **hooks/**: Dokumentacioni për hooks-at e personalizuara React
- **contexts/**: Dokumentacioni për kontekstet React
- **utils/**: Dokumentacioni për funksionet utility
- **api/**: Dokumentacioni për funksionet API

## Si të Përdoret

Çdo skedar `.md` përmban:
- Përshkrimin e funksionit/komponentit
- Parametrat/props-et
- Vlerat e kthyera
- Shembuj përdorimi
- Funksione të lidhura

## Lidhje të Shpejta

### Komponentë Kryesorë
- [Komponentët e Player-it](./components/player.md)
- [Komponentët e Navigimit](./components/navigation.md)
- [Komponentët e Layout-it](./components/layout.md)

### Hooks
- [usePlayer](./hooks/usePlayer.md)
- [useSongs](./hooks/useSongs.md)
- [usePlaylists](./hooks/usePlaylists.md)

### Utilities
- [Funksionet API](./api/apiRequest.md)
- [Trajtimi i Gabimeve](./utils/errorHandling.md)
- [Utils për Storage](./utils/storage.md)

## Udhëzime për Zhvilluesit

### Shtimi i Dokumentacionit të Ri
1. Krijoni një skedar të ri `.md` në drejtorinë përkatëse
2. Përdorni formatin standard me shembuj kodi
3. Përditësoni lidhjet në `README.md`
4. Shtoni cross-references me dokumentacione të tjera

### Konventat e Shkrimit
- Përdorni shqipen për përshkrimet
- Mbani kodin në anglisht
- Jepni shembuj praktikë për çdo funksion
- Përfshini raste gabimi dhe zgjidhjet