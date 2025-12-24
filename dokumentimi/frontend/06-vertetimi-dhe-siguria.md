# Vërtetimi dhe Siguria (Authentication & Security)

Siguria e të dhënave të përdoruesit është prioritet. Frontend-i zbaton disa nivele mbrojtjeje.

## Procesi i Autentifikimit

1.  **Login/Register**: Përdoruesi dërgon kredencialet në Backend.
2.  **JWT (JSON Web Token)**: Pas verifikimit të suksesshëm, Backend-i kthen një token JWT.
3.  **Storage**: Token-i ruhet në `localStorage` (ose në `Cookies` të sigurta) për të ruajtur sesionin.
4.  **Authorization Header**: Çdo kërkesë pasuese për të dhëna private (si playlist-at e mia) përfshin token-in në header: `Authorization: Bearer <token>`.

## Mbrojtja e Faqeve (Protected Routes)

Ne përdorim një komponent rrethues (Wrapper) ose Middleware për të mbrojtur rrugët që kërkojnë identifikim (si `/admin` ose `/library`):

```tsx
// Skicë e logjikës së mbrojtjes
if (!isAuthenticated && isProtectedRoute) {
  router.push('/login');
}
```

## Siguria në Frontend

-   **XSS Prevention**: React (dhe Next.js) automatikisht sanitizojnë të dhënat që shfaqen në UI, duke parandaluar sulmet Cross-Site Scripting.
-   **Environment Variables**: Çelësat sensitivë (si Supabase Keys) nuk ekspozohen direkt në kodin burimor, por përdoren përmes variablave të mjedisit të Next.js (`NEXT_PUBLIC_`).
-   **Validation**: Të gjitha format (login, register, emri i playlist-ës) validohen në frontend përpara se të dërgohen në server për të përmirësuar UX dhe për të parandaluar të dhëna të gabuara.

## Çkyçja (Logout)

Kur përdoruesi çkyçet:
1.  Fshihet token-i nga `localStorage`.
2.  Gjendja e `AuthContext` pastrohet.
3.  Përdoruesi ridrejtohet në faqen mirëseardhëse.
