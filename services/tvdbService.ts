import type { TvdbSearchResult } from '../types';
import { getCache, setCache } from './cacheService';

const TVDB_API_KEY = '1462dc3a-1002-4652-9444-bb5778b22974';
const TVDB_API_URL = 'https://api4.thetvdb.com/v4';

interface LoginResponse {
  data: {
    token: string;
  };
}

const login = async (): Promise<string | null> => {
  const tokenCacheKey = 'tvdb_auth_token';
  const cachedToken = getCache<string>(tokenCacheKey);
  if (cachedToken) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${TVDB_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        apikey: TVDB_API_KEY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to login to TVDB API: ${response.statusText}`);
    }

    const result: LoginResponse = await response.json();
    const token = result.data.token;
    setCache(tokenCacheKey, token); // Cache the token for 1 hour
    return token;
  } catch (error) {
    console.error('TVDB Login Error:', error);
    throw error;
  }
};

interface SearchResponse {
    data: TvdbSearchResult[];
}

export const searchTvdb = async (query: string): Promise<TvdbSearchResult[]> => {
  const searchCacheKey = `tvdb_search_${query.toLowerCase().replace(/\s/g, '_')}`;
  const cachedResult = getCache<TvdbSearchResult[]>(searchCacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  const token = await login();
  if (!token) {
    return []; // Can't search without a token
  }

  try {
    const response = await fetch(`${TVDB_API_URL}/search?query=${encodeURIComponent(query)}&type=series`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        setCache(searchCacheKey, []);
        return [];
      };
      throw new Error(`Failed to search on TVDB API: ${response.statusText}`);
    }
    
    const result: SearchResponse = await response.json();
    const searchData = result.data || [];
    setCache(searchCacheKey, searchData);
    return searchData;
  } catch (error) {
      console.error(`TVDB Search Error for "${query}":`, error);
      // Don't rethrow, just return empty array so app doesn't crash
      return [];
  }
};