/**
 * Cache utility functions for managing client-side data caching
 */

export type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Checks if a cache entry is still valid based on the cache duration
 */
export const isCacheValid = <T>({ cache, duration = CACHE_DURATION }: { cache: CacheEntry<T> | null; duration?: number }): boolean => {
  if (!cache) return false;
  const now = Date.now();
  return (now - cache.timestamp) < duration;
};

/**
 * Creates a new cache entry with current timestamp
 */
export const createCacheEntry = <T>({ data }: { data: T }): CacheEntry<T> => ({
  data,
  timestamp: Date.now(),
});

/**
 * Gets data from cache if valid, otherwise returns null
 */
export const getCachedData = <T>({ cache, duration = CACHE_DURATION }: { cache: CacheEntry<T> | null; duration?: number }): T | null => {
  if (!cache || !isCacheValid({ cache, duration })) {
    return null;
  }
  return cache.data;
};
