export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const authStorage = {
  setSession: (session: Session) => {
    localStorage.setItem('spotify_session', JSON.stringify(session));
  },
  
  getSession: (): Session | null => {
    const stored = localStorage.getItem('spotify_session');
    return stored ? JSON.parse(stored) : null;
  },
  
  clearSession: () => {
    localStorage.removeItem('spotify_session');
  },
  
  isAuthenticated: (): boolean => {
    return !!authStorage.getSession();
  }
};