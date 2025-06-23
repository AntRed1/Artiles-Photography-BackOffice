// utils/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryMs: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, CacheEntry<any>> = {};

export function getFromCache<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < entry.expiryMs) {
    return entry.data;
  }
  return null;
}

export function setInCache<T>(key: string, data: T, expiryMs: number): void {
  cache[key] = { data, timestamp: Date.now(), expiryMs };
}