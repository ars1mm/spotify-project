/*
 * AUTHENTICATION SYSTEM - SISTEMI I AUTENTIFIKIMIT
 * 
 * Ky skedar menaxhon të gjitha aspektet e autentifikimit të përdoruesit.
 * Përdor localStorage për ruajtjen e sesionit dhe përmban utilitë për menaxhimin e të dhënave.
 * 
 * Komponentët kryesorë:
 * - User interface: Përcakton strukturën e përdoruesit
 * - Session interface: Përcakton strukturën e sesionit
 * - authStorage: Objekt me metoda për menaxhimin e sesionit
 * 
 * Raste përdorimi:
 * - Ruajtja e të dhënave të përdoruesit pas login-it
 * - Kontrollimi i statusit të autentifikimit
 * - Pastrimi i sesionit gjatë logout-it
 */

/*
 * USER INTERFACE - STRUKTURA E PËRDORUESIT
 * 
 * Përcakton të dhënat bazike të përdoruesit:
 * - id: Identifikuesi unik
 * - email: Email adresa (e detyrueshme)
 * - name: Emri (opsional)
 */
export interface User {
  id: string;
  email: string;
  name?: string;
}

/*
 * SESSION INTERFACE - STRUKTURA E SESIONIT
 * 
 * Përmban të gjitha të dhënat e nevojshme për një sesion aktiv:
 * - access_token: Token për autorizimin e kërkesave
 * - refresh_token: Token për rinovimin e sesionit
 * - user: Të dhënat e përdoruesit
 */
export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

/*
 * AUTH STORAGE - MENAXHUESI I RUAJTJES SË SESIONIT
 * 
 * Objekt që përmban të gjitha metodat për menaxhimin e sesionit:
 * 
 * Metodat kryesore:
 * - setSession: Ruan sesionin në localStorage
 * - getSession: Merr sesionin nga localStorage
 * - getUser: Ekstrakton të dhënat e përdoruesit nga sesioni
 * - clearSession: Pastron sesionin (logout)
 * - isAuthenticated: Kontrollon nëse përdoruesi është i autentifikuar
 * 
 * Karakteristika të sigurisë:
 * - Kontrollon ekzistencën e window object (SSR safety)
 * - Menaxhon rastet kur localStorage nuk është i disponueshëm
 * - JSON parsing i sigurt me error handling
 */
export const authStorage = {
  setSession: (session: Session) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_session', JSON.stringify(session));
    }
  },
  
  getSession: (): Session | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('spotify_session');
    return stored ? JSON.parse(stored) : null;
  },
  
  getUser: (): User | null => {
    const session = authStorage.getSession();
    return session?.user || null;
  },
  
  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_session');
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!authStorage.getSession();
  }
};