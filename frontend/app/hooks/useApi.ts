/*
 * API HOOKS - HOOK-AT PËR API OPERATIONS
 * 
 * Përmban custom hooks për operacione specifike API.
 * Ofron state management dhe error handling për thirrjet e API-ve.
 * 
 * Hooks të disponueshme:
 * - useHealthCheck: Kontrollon gjendjen e backend server-it
 * - useTrackDownload: Menaxhon download-in e këngëve
 * 
 * Karakteristika:
 * - Loading states për UX të mirë
 * - Error handling i detajuar
 * - Integrimi me apiRequest function
 */
'use client';

import { useState, useEffect } from 'react';
import { apiRequest, apiConfig } from '../config/api';

/*
 * HEALTH CHECK HOOK - HOOK PËR KONTROLLIMIN E SHËNDETIT
 * 
 * Kontrollon nëse backend server-i është aktiv dhe i arritshëm.
 * Përdoret për të shfaqur status-in e sistemit në UI.
 * 
 * Return values:
 * - isHealthy: A është server-i aktiv
 * - loading: A është duke kontrolluar
 * 
 * Raste përdorimi:
 * - Status indicator në header
 * - Diagnostics page
 * - Connection troubleshooting
 */
export function useHealthCheck() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiRequest(apiConfig.endpoints.health);
        setIsHealthy(true);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Health check failed:', error);
        }
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, loading };
}

/*
 * TRACK DOWNLOAD HOOK - HOOK PËR DOWNLOAD KËNGËSH
 * 
 * Menaxhon procesin e download-it të këngëve nga server-i.
 * Ofron loading state dhe error handling për përvojë të mirë përdoruesi.
 * 
 * Funksionaliteti:
 * - downloadTrack: Funksioni për download
 * - loading: State i loading-ut
 * - error: Mesazhi i gabimit nëse ka
 * 
 * Error handling:
 * - Kontrollon tipin e error-it
 * - Ofron mesazhe të kuptueshme
 * - Reset-on error state në thirrje të reja
 */
export function useTrackDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTrack = async (trackName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(
        `${apiConfig.endpoints.trackDownload}?track=${encodeURIComponent(trackName)}`
      );
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download track';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { downloadTrack, loading, error };
}