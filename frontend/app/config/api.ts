import { cache } from '../lib/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://spotify-project-achx.onrender.com' 
    : 'http://127.0.0.1:8000');

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    health: '/',
    trackDownload: '/api/v1/track/download',
  },
};

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Check cache for GET requests
  if (!options?.method || options.method === 'GET') {
    const cached = cache.get(url);
    if (cached) {
      return cached;
    }
  }
  
  // Get token from authStorage
  let authHeader = {};
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem('spotify_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.access_token) {
          authHeader = { 'Authorization': `Bearer ${session.access_token}` };
        }
      } catch {
        console.error('Failed to parse session for auth header');
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Cache GET responses
    if (!options?.method || options.method === 'GET') {
      cache.set(url, data);
    }
    
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}