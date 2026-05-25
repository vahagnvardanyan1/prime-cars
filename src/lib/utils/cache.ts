/**
 * Cache utility functions for managing client-side data caching.
 *
 * Two layers:
 *  - Primitive helpers (CacheEntry / isCacheValid / createCacheEntry) —
 *    operate on a single entry. Use when you already manage your own storage.
 *  - createKeyedTTLCache<K, V>() — the typical "Map of key → fresh value"
 *    case. Owns the Map, applies a TTL on read, exposes a 3-method API.
 *    Prefer this for new keyed caches so call sites stay short.
 */

export type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

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

const getCachedData = <T>({ cache, duration = CACHE_DURATION }: { cache: CacheEntry<T> | null; duration?: number }): T | null => {
  if (!cache || !isCacheValid({ cache, duration })) {
    return null;
  }
  return cache.data;
};

export type KeyedTTLCache<K, V> = {
  get: (key: K) => V | null;
  set: (key: K, value: V) => void;
  clear: () => void;
};

/**
 * Factory: a typed keyed cache with a TTL. Wraps a Map and the primitives
 * above so call sites stay short and consistent.
 *
 *   const citiesCache = createKeyedTTLCache<string, string[]>();
 *   const cached = citiesCache.get("copart");
 *   if (cached) return cached;
 *   // ...fetch...
 *   citiesCache.set("copart", result);
 *
 * The default TTL is CACHE_DURATION (10 min). Pass `{ ttlMs }` to override.
 */
export const createKeyedTTLCache = <K, V>({ ttlMs = CACHE_DURATION }: { ttlMs?: number } = {}): KeyedTTLCache<K, V> => {
  const store = new Map<K, CacheEntry<V>>();
  return {
    get: (key) => getCachedData({ cache: store.get(key) ?? null, duration: ttlMs }),
    set: (key, value) => {
      store.set(key, createCacheEntry({ data: value }));
    },
    clear: () => {
      store.clear();
    },
  };
};
