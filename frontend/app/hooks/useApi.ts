'use client';

import { useState, useEffect } from 'react';
import { apiRequest, apiConfig } from '../config/api';

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