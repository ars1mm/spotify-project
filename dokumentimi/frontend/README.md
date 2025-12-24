# Dokumentimi Detajuar i Frontend-it

Mirësevini në dokumentimin teknik të pjesës ballore (frontend) të projektit Spotify. Ky seksion mbulon gjithçka nga struktura e dosjeve deri te logjika komplekse e audio player-it.

## Përmbajtja

1.  **[Struktura dhe Konfigurimi](01-struktura-dhe-konfigurimi.md)**
    - Arkitektura e dosjeve, teknologjitë e përdorura dhe variablat e mjedisit.
2.  **[Komponentët e Ndërfaqes](02-komponentet-e-nderfaqes.md)**
    - Detaje mbi Sidebar, Player, dhe elementet UI të krijuara me Chakra UI.
3.  **[Menaxhimi i Gjendjes](03-menaxhimi-i-gjendjes.md)**
    - Përdorimi i Context API për Autentifikimin dhe Player-in.
4.  **[Integrimi i API-t](04-integrimi-i-api.md)**
    - Si komunikon frontend-i me backend-in përmes kërkesave HTTP.
5.  **[Player-i Audio](05-player-audio.md)**
    - Logjika e luajtjes së muzikës, queue management dhe shuffle.
6.  **[Vërtetimi dhe Siguria](06-vertetimi-dhe-siguria.md)**
    - Ruajtja e sesioneve, JWT dhe mbrojtja e faqeve private.

---

## Si të filloni me zhvillimin?

Për të punuar me këtë pjesë të projektit, sigurohuni që keni të instaluar **Node.js**:

```bash
cd frontend
npm install
npm run dev
```

Aplikacioni do të jetë i disponueshëm në `http://localhost:3000`.
