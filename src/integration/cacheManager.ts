import { logger } from './logger';

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttlMs: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  entriesCount: number;
  lastPurgedAt: string | null;
}

const CACHE_STORAGE_PREFIX = 'autofix_cache_';
const CACHE_META_KEY = 'autofix_cache_meta';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entriesCount: 0,
    lastPurgedAt: null,
  };

  constructor() {
    this.loadMeta();
    this.loadPersistedEntries();
  }

  private loadMeta() {
    try {
      const raw = localStorage.getItem(CACHE_META_KEY);
      if (raw) {
        this.stats = { ...this.stats, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
  }

  private persistMeta() {
    try {
      this.stats.entriesCount = this.memoryCache.size;
      localStorage.setItem(CACHE_META_KEY, JSON.stringify(this.stats));
    } catch {
      // ignore
    }
  }

  private loadPersistedEntries() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_STORAGE_PREFIX)) {
          const itemKey = key.replace(CACHE_STORAGE_PREFIX, '');
          const raw = localStorage.getItem(key);
          if (raw) {
            const entry: CacheEntry<unknown> = JSON.parse(raw);
            // check expiry
            if (Date.now() - entry.timestamp < entry.ttlMs) {
              this.memoryCache.set(itemKey, entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
      this.persistMeta();
    } catch {
      // ignore
    }
  }

  public get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      this.persistMeta();
      logger.debug('cache_miss', `Cache miss for key: ${key}`);
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttlMs) {
      // expired
      this.memoryCache.delete(key);
      try {
        localStorage.removeItem(CACHE_STORAGE_PREFIX + key);
      } catch {
        // ignore
      }
      this.stats.misses++;
      this.persistMeta();
      logger.debug('cache_miss', `Cache expired for key: ${key} (age: ${Math.round(age / 1000)}s)`);
      return null;
    }

    this.stats.hits++;
    this.persistMeta();
    logger.debug('cache_hit', `Cache hit for key: ${key}`, { ageMs: age });
    return entry.data;
  }

  public set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttlMs,
    };

    this.memoryCache.set(key, entry);

    try {
      localStorage.setItem(CACHE_STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // LocalStorage might be full
    }

    this.persistMeta();
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public invalidate(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(CACHE_STORAGE_PREFIX + key);
    } catch {
      // ignore
    }
    this.persistMeta();
  }

  public clear(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    this.stats.entriesCount = 0;
    this.stats.lastPurgedAt = new Date().toISOString();
    this.persistMeta();
    logger.info('health_check', 'Cache purged by administrator');
  }

  public getStats(): CacheStats {
    this.stats.entriesCount = this.memoryCache.size;
    return { ...this.stats };
  }
}

export const cacheManager = new CacheManager();
