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