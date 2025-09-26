const CACHE_PREFIX = 'arc_cache_';
const DEFAULT_TTL_MS = 20 * 60 * 1000; // 20 minutes

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export const setCache = <T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const now = new Date();
  const item: CacheItem<T> = {
    value: data,
    expiry: now.getTime() + ttlMs,
  };

  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting item in localStorage:', error);
  }
};

export const getCache = <T>(key: string): T | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  
  try {
    const itemStr = localStorage.getItem(CACHE_PREFIX + key);
    if (!itemStr) {
      return null;
    }

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error('Error getting item from localStorage:', error);
    return null;
  }
};