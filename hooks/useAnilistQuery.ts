import { useState, useEffect } from 'react';
import { fetchAnilist } from '../services/anilistService';
import { getCache, setCache } from '../services/cacheService';

export function useAnilistQuery<T>(key: string, query: string, variables = {}, options: { refetchInterval?: number } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const serializedVariables = JSON.stringify(variables);
  const refetchInterval = options.refetchInterval;

  useEffect(() => {
    const cacheKey = `anilist_${key}_${serializedVariables}`;

    // This function handles the initial data load for the component.
    // It will check the cache first, and if it's empty, fetch from the network.
    // It is responsible for setting the component's state (data, loading, error).
    const initialFetch = async () => {
      const cachedData = getCache<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAnilist(query, variables);
        const pageData = result.data.Page as T;
        setData(pageData);
        setCache(cacheKey, pageData);
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    initialFetch();

    // This sets up a background interval to refetch data and update the cache.
    // It does NOT update the component's state, so the UI won't change until
    // the user refreshes the page.
    if (refetchInterval) {
        const intervalId = setInterval(async () => {
            try {
              const result = await fetchAnilist(query, variables);
              const pageData = result.data.Page as T;
              // Only update the cache, do not call setData to avoid UI changes.
              setCache(cacheKey, pageData);
            } catch (err) {
              console.error(`Background refetch failed for key ${key}:`, err);
            }
        }, refetchInterval);

        return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, query, serializedVariables, refetchInterval]);

  return { data, loading, error };
}
