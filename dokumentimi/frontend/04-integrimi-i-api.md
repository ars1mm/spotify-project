# Integrimi i API-t (API Integration)

Komunikimi midis Frontend-it dhe Backend-it bëhet përmes një arkitekture RESTful API.

## API Client

Për të thjeshtuar kërkesat HTTP, ne kemi krijuar një helper të centralizuar në `app/config/api.ts`. Ky helper trajton:
-   Shtimin e URL-së bazë (`BASE_URL`).
-   Injektimin e `Authorization` header (Bearer Token) në çdo kërkesë.
-   Trajtimin e gabimeve (error handling) në nivel global.

```typescript
// Shembull i thjeshtuar i apiRequest
export const apiRequest = async (endpoint, options) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.json();
}
```

## Endpoint-et Kryesore që përdoren

-   **Auth**:
    -   `POST /api/v1/auth/login`: Identifikimi.
    -   `POST /api/v1/auth/register`: Regjistrimi.
-   **Songs**:
    -   `GET /api/v1/songs`: Lista e të gjitha këngëve.
    -   `GET /api/v1/songs/{id}`: Detajet e një kënge.
-   **Playlists**:
    -   `GET /api/v1/playlists`: Playlist-at publike dhe ato të përdoruesit.
    -   `POST /api/v1/playlists`: Krijimi i një playlist-e të re.
-   **Search**:
    -   `GET /api/v1/search?q={query}`: Kërkimi global.

## Trajtimi i të Dhënave (Data Fetching)

Ne përdorim kombinimin e `useEffect` për marrjen fillestare të të dhënave dhe state management për t'i shfaqur ato. Në të ardhmen, mund të integrohet **SWR** ose **React Query** për caching më të avancuar.

## Trajtimi i Gabimeve

Kur një kërkesë API dështon (p.sh. 401 Unauthorized ose 500 Server Error):
1.  Sistemi kap gabimin në bllokun `try-catch`.
2.  Shfaqet një njoftim (Toast notification) për përdoruesin përmes Chakra UI.
3.  Nëse gabimi është 401 (token i skaduar), përdoruesi ridrejtohet automatikisht në faqen e Login-it.
