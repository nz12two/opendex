/* ------------------------------------------------------------------ */
/*  Cache utility: localStorage + TTL with graceful degradation       */
/* ------------------------------------------------------------------ */

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

/**
 * Generic cache function with localStorage + TTL.
 *
 * - Checks localStorage first; if valid (not expired), returns cached data.
 * - If expired or missing, calls `fetcher` and stores the result.
 * - If `fetcher` throws and stale data exists, returns the stale data
 *   (graceful degradation).
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
): Promise<T> {
  let stale: T | null = null;

  // 1. Try reading cached entry
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const cached: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data; // fresh cache hit
      }
      stale = cached.data; // expired but keep for fallback
    }
  } catch {
    // Corrupt or inaccessible — ignore
  }

  // 2. Try fetching fresh data
  try {
    const data = await fetcher();
    // 3. Write to cache (best-effort)
    try {
      const entry: CacheEntry<T> = { timestamp: Date.now(), data };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch {
      /* storage full — silently ignore */
    }
    return data;
  } catch (err) {
    // 4. If fetch fails but we have stale data, return it
    if (stale !== null) return stale;
    throw err; // nothing to fall back to
  }
}
