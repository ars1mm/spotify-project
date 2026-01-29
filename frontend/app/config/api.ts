/*
 * API CONFIGURATION - KONFIGURIMI I API-VE
 * 
 * Skedari kryesor për konfigurimin e komunikimit me backend API.
 * Përmban URL-të, endpoint-et dhe funksionin universal për kërkesat.
 * 
 * Komponentët kryesorë:
 * - API_BASE_URL: URL bazike e server-it
 * - apiConfig: Konfigurimi i endpoint-eve
 * - apiRequest: Funksioni universal për kërkesat HTTP
 * 
 * Karakteristika:
 * - Cache integration për performancë
 * - Automatic authentication headers
 * - Error handling i detajuar
 * - Environment-based URL selection
 */
import { cache } from '../lib/cache';

/*
 * API BASE URL - URL BAZIKE E API-VE
 * 
 * Përcakton URL-në bazike të server-it sipas environment-it:
 * - Production: Render.com hosted URL
 * - Development: Local server (127.0.0.1:8000)
 * - Mund të mbishkruhet me NEXT_PUBLIC_API_URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://spotify-project-achx.onrender.com' 
    : 'http://127.0.0.1:8000');

/*
 * API CONFIG - KONFIGURIMI I ENDPOINT-EVE
 * 
 * Objekt që përmban të gjitha endpoint-et e API-ve.
 * Lehtëson menaxhimin dhe përditësimin e URL-ve.
 * 
 * Struktura:
 * - baseURL: URL bazike
 * - endpoints: Lista e endpoint-eve të disponueshme
 */
export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    health: '/',
    trackDownload: '/api/v1/track/download',
  },
};

/*
 * API REQUEST FUNCTION - FUNKSIONI UNIVERSAL I KËRKESAVE
 * 
 * Funksioni kryesor për të gjitha kërkesat HTTP në aplikacion.
 * Ofron funksionalitete të avancuara për komunikimin me API.
 * 
 * Karakteristikat kryesore:
 * - Cache integration: Ruan përgjigjet GET në cache
 * - Authentication: Shton automatikisht Bearer token
 * - Error handling: Menaxhon gabimet dhe i konverton në mesazhe
 * - Content-Type: Përcakton automatikisht JSON headers
 * 
 * Parametrat:
 * - endpoint: Rruga relative e API-s
 * - options: Opsionet e fetch (method, body, headers, etj.)
 * 
 * Cache behavior:
 * - GET requests: Kontrollon cache para thirrjes
 * - POST/PUT/DELETE: Nuk përdor cache
 * 
 * Authentication:
 * - Merr token nga localStorage
 * - Shton Authorization header automatikisht
 * - Menaxhon rastet kur nuk ka token
 */
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