# Frontend - Implementimi Teknik

> **Shënim**: Ky dokument ofron një përmbledhje teknike. Për dokumentim të detajuar për çdo modul, vizitoni folderin: [**dokumentimi/frontend/**](./frontend/README.md)

## Përmbledhje

Frontend-i është ndërtuar me **Next.js 14** duke përdorur **App Router**, **TypeScript**, dhe **Chakra UI**. Aplikacioni ofron një përvojë të pasur dhe dinamike, e ngjashme me Spotify, duke përdorur teknologjitë më moderne të web-it.

## Arkitektura e Dosjeve

Struktura e projektit ndjek standardet e Next.js për organizim modular:

```text
frontend/
├── app/                      # Logjika e rrugëve (Routes) dhe Layouts
│   ├── components/           # Komponentët UI të ndarë sipas funksionit
│   ├── contexts/             # Menaxhimi i gjendjes globale (Auth, Player)
│   ├── hooks/                # Hook-et e personalizuara
│   ├── lib/                  # Utility functions dhe konfigurime
│   └── (auth)/               # Grupi i faqeve për login dhe regjistrim
```

## Modulet Kryesore (Detaje të Shpejta)

### 1. Menaxhimi i Muzikës (Audio Player)
Player-i është i integruar me një Context global që lejon kontrollin e muzikës nga çdo pjesë e aplikacionit. Përdor HTML5 Audio API me sinkronizim në kohë reale.

### 2. Autentifikimi (Auth System)
Sistemi përdor JWT (JSON Web Tokens) të ruajtura në localStorage. Integrimi me Supabase Auth mundëson një proces të sigurt dhe të shpejtë identifikimi.

### 3. Dizajni dhe UI (Chakra UI)
Përdoret Chakra UI për një sistem stilesh elastik (design system). Tema është e personalizuar me ngjyrat e Spotify (Jeshile: `#1DB954`, Sfond: `#121212`).

---

## Dokumentimi i Detajuar

Për shpjegime më të thella teknike, ju lutem referojuni skedarëve të mëposhtëm:

1.  **[Struktura dhe Konfigurimi](./frontend/01-struktura-dhe-konfigurimi.md)**
2.  **[Komponentët e Ndërfaqes](./frontend/02-komponentet-e-nderfaqes.md)**
3.  **[Menaxhimi i Gjendjes](./frontend/03-menaxhimi-i-gjendjes.md)**
4.  **[Integrimi i API-t](./frontend/04-integrimi-i-api.md)**
5.  **[Player-i Audio](./frontend/05-player-audio.md)**
6.  **[Vërtetimi dhe Siguria](./frontend/06-vertetimi-dhe-siguria.md)**

---

*Ky dokument është përditësuar së fundmi më 24 Dhjetor 2025.*
