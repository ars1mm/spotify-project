# Struktura dhe Konfigurimi i Frontend-it

Ky dokument detajon strukturën e projektit të frontend-it dhe konfigurimet kryesore teknike.

## Arkitektura e Dosjeve

Projekti frontend është ndërtuar me **Next.js 14** duke përdorur **App Router**. Struktura është organizuar në mënyrë që të jetë e shkallëzueshme dhe e lehtë për t'u mirëmbajtur:

```text
frontend/
├── app/                      # Next.js App Router (Faqet dhe Layouts)
│   ├── (auth)/               # Grupi i rrugëve për autentifikim (Login/Register)
│   ├── admin/                # Paneli i administrimit
│   ├── components/           # Komponentët UI të ripërdorshëm
│   │   ├── auth/             # Komponentët lidhur me identifikimin
│   │   ├── layout/           # Sidebar, Navbar, Player bar
│   │   ├── navigation/       # Menu-të dhe navigimi
│   │   ├── player/           # Kontrollet e audios
│   │   └── ui/               # Elemente bazë (Buttons, Inputs, etj.)
│   ├── config/               # Cilësimet e aplikacionit (API URLs)
│   ├── contexts/             # Menaxhimi global i gjendjes (Context API)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Biblioteka utility dhe helper functions
│   ├── playlist/             # Faqet e playlist-ave
│   ├── globals.css           # Stilet globale CSS
│   └── layout.tsx            # Root layout i aplikacionit
├── public/                   # Skedarët statikë (Imazhe, ikona, etj.)
├── next.config.ts            # Konfigurimi i Next.js
├── package.json              # Varësitë e projektit dhe scripts
└── tsconfig.json             # Konfigurimi i TypeScript
```

## Teknologjitë Kryesore

- **Next.js**: Framework-u kryesor për React me rendering në server (SSR) dhe gjenerim statik (SSG).
- **TypeScript**: Për sigurinë e tipeve dhe kod më të pastër.
- **Chakra UI**: Libraria e komponentëve për stilim të shpejtë dhe responsive.
- **Lucide React**: Për ikona moderne dhe të lehta.
- **SWR (opsionale)**: Për fetching dhe caching të të dhënave.

## Konfigurimi i Mjedisit (Environment Variables)

Aplikacioni kërkon disa variabla mjedisi për t'u lidhur me backend-in dhe shërbimet e jashtme. Këto ruhen në `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=lidhja_juaj_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=celes_i_anon_supabase
```

## Konfigurimi i API-t

Gjendet në `app/config/api.ts`. Ky skedar përmban URL-në bazë të API-t dhe konfigurimet për kërkesat `fetch`, duke përfshirë shtimin automatik të header-ave të autentifikimit (Bearer Token).

## Stilimi dhe Tema

Aplikacioni përdor një temë të personalizuar të Chakra UI për të imituar estetikën e Spotify:
- **Ngjyrat**: `#121212` (E zezë për sfond), `#1DB954` (Jeshile Spotify).
- **Tipografia**: Fontet sans-serif për lexueshmëri maksimale.
- **Responsive**: Përdorimi i breakpoints të Chakra (`base`, `md`, `lg`) për përshtatje në celular dhe desktop.
