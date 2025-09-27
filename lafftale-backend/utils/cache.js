// utils/cache.js - Redis Cache System (SRO-CMS inspired)
const redis = require('redis');
const rankingConfig = require('../config/ranking');

class CacheManager {
  constructor() {
    this.client = null;
    this.enabled = rankingConfig.cache.enabled;
    this.ttl = rankingConfig.cache.ttl;
    this.keyPrefix = rankingConfig.cache.keyPrefix;
    this.isReady = false; // Cache-Bereitschaftsstatus
    this.initPromise = null; // Promise für Initialisierung

    if (this.enabled) {
      this.initPromise = this.initRedis();
    }
  }

  async initRedis() {
    try {
      // Try Redis first
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
      });

      await this.client.connect();
      console.log('✅ Redis Cache connected successfully');
      this.isReady = true; // Cache ist bereit
    } catch (error) {
      console.warn('⚠️ Redis not available, falling back to memory cache:', error.message);
      this.client = new Map(); // Fallback to memory cache
      this.isReady = true; // Memory Cache ist sofort bereit
    }
    return this.isReady;
  }

  // Überprüfen, ob der Cache bereit ist
  async ensureReady() {
    if (this.initPromise) {
      await this.initPromise;
    }
    return this.isReady;
  }

  generateKey(type, params = {}) {
    const keyParts = [this.keyPrefix, type];

    // Add relevant parameters to key
    Object.keys(params)
      .sort()
      .forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          keyParts.push(`${key}_${params[key]}`);
        }
      });

    return keyParts.join(':');
  }

  async get(key) {
    if (!this.enabled) return null;

    // Sicherstellen, dass der Cache bereit ist
    const isReady = await this.ensureReady();
    if (!isReady) {
      console.warn(`[Cache] Cache not ready yet when getting key: ${key}`);
      return null;
    }

    try {
      if (this.client instanceof Map) {
        // Memory cache fallback
        const cached = this.client.get(key);
        if (cached && cached.expires > Date.now()) {
          console.log(`[Cache] Memory cache hit for key: ${key}`);
          return JSON.parse(cached.data);
        } else {
          if (cached) {
            console.log(`[Cache] Memory cache expired for key: ${key}`);
            this.client.delete(key);
          } else {
            console.log(`[Cache] Memory cache miss for key: ${key}`);
          }
          return null;
        }
      } else {
        // Redis cache
        const cached = await this.client.get(key);
        if (cached) {
          console.log(`[Cache] Redis cache hit for key: ${key}`);
          return JSON.parse(cached);
        } else {
          console.log(`[Cache] Redis cache miss for key: ${key}`);
          return null;
        }
      }
    } catch (error) {
      console.error(`[Cache] Get error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key, data, customTtl = null) {
    // Keine null oder undefined Werte cachen
    if (!this.enabled || data === null || data === undefined) {
      console.log(`[Cache] Not caching null/undefined data for key: ${key}`);
      return false;
    }

    // Für Arrays: Keine leeren Arrays cachen
    if (Array.isArray(data) && data.length === 0) {
      console.log(`[Cache] Not caching empty array for key: ${key}`);
      return false;
    }

    // Sicherstellen, dass der Cache bereit ist
    const isReady = await this.ensureReady();
    if (!isReady) {
      console.warn(`[Cache] Cache not ready yet when setting key: ${key}`);
      return false;
    }

    const ttl = customTtl || this.ttl;

    try {
      if (this.client instanceof Map) {
        // Memory cache fallback
        console.log(`[Cache] Setting memory cache for key: ${key}`);
        this.client.set(key, {
          data: JSON.stringify(data),
          expires: Date.now() + ttl * 1000,
        });
      } else {
        // Redis cache
        console.log(`[Cache] Setting Redis cache for key: ${key}`);
        await this.client.setEx(key, ttl, JSON.stringify(data));
      }
      return true;
    } catch (error) {
      console.error(`[Cache] Set error for key ${key}:`, error.message);
      return false;
    }
  }

  async remember(key, fetchFunction, customTtl = null) {
    // Try to get from cache first
    let cached = await this.get(key);
    if (cached !== null) {
      console.log(`[Cache] Using cached data for key: ${key}`);
      return cached;
    }

    console.log(`[Cache] Cache miss for key: ${key}, fetching data...`);

    // If not in cache, fetch data
    try {
      const data = await fetchFunction();

      // Nur valide Daten cachen (keine null/undefined/leere Arrays)
      if (data === null || data === undefined) {
        console.warn(`[Cache] Not caching null/undefined result for key: ${key}`);
        return data; // Daten zurückgeben, aber nicht cachen
      }

      if (Array.isArray(data) && data.length === 0) {
        console.warn(`[Cache] Not caching empty array result for key: ${key}`);
        return data; // Leeres Array zurückgeben, aber nicht cachen
      }

      // Valide Daten cachen
      console.log(`[Cache] Caching new data for key: ${key}`);
      await this.set(key, data, customTtl);
      return data;
    } catch (error) {
      console.error(`[Cache] Remember error for key ${key}:`, error.message);
      // Bei einem Fehler nichts cachen und Fehler werfen
      throw error;
    }
  }

  async del(key) {
    if (!this.enabled) return false;

    try {
      console.log(`[Cache] Deleting key: ${key}`);
      if (this.client instanceof Map) {
        // Memory cache fallback
        const result = this.client.delete(key);
        console.log(`[Cache] Memory cache key deleted: ${result}`);
        return result;
      } else {
        // Redis cache
        const result = await this.client.del(key);
        console.log(`[Cache] Redis cache key deleted: ${result}`);
        return result > 0;
      }
    } catch (error) {
      console.error('[Cache] Delete error:', error.message);
      return false;
    }
  }

  async invalidate(pattern) {
    if (!this.enabled) return;

    try {
      if (this.client instanceof Map) {
        // Memory cache fallback - clear all matching keys
        for (const key of this.client.keys()) {
          if (key.includes(pattern)) {
            this.client.delete(key);
          }
        }
      } else {
        // Redis cache - use SCAN for pattern matching
        const keys = await this.client.keys(`${this.keyPrefix}:${pattern}*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (error) {
      console.error('Cache invalidate error:', error.message);
    }
  }

  async invalidateAll() {
    if (!this.enabled) return;

    try {
      if (this.client instanceof Map) {
        this.client.clear();
      } else {
        const keys = await this.client.keys(`${this.keyPrefix}:*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (error) {
      console.error('Cache invalidateAll error:', error.message);
    }
  }

  clear() {
    if (!this.enabled) return 0;

    try {
      if (this.client instanceof Map) {
        const itemCount = this.client.size;
        this.client.clear();
        console.log(`🗑️  Memory cache cleared: ${itemCount} items removed`);
        return itemCount;
      } else {
        // For Redis implementation
        console.log('🗑️  Redis cache clear not implemented');
        return 0;
      }
    } catch (error) {
      console.error('Cache clear error:', error.message);
      return 0;
    }
  }

  // Neue Methode zur Überprüfung und Bereinigung verdächtiger Cache-Einträge
  async validateCache(pattern) {
    if (!this.enabled) return { checked: 0, deleted: 0 };
    await this.ensureReady();

    let checked = 0;
    let deleted = 0;

    try {
      if (this.client instanceof Map) {
        // Memory cache
        for (const [key, value] of this.client.entries()) {
          if (key.includes(pattern)) {
            checked++;
            try {
              const data = JSON.parse(value.data);
              if (
                data === null ||
                data === undefined ||
                (Array.isArray(data) && data.length === 0)
              ) {
                console.log(`[Cache] Deleting invalid memory cache entry: ${key}`);
                this.client.delete(key);
                deleted++;
              }
            } catch (parseError) {
              console.error(`[Cache] Invalid JSON in cache for key ${key}, deleting`);
              this.client.delete(key);
              deleted++;
            }
          }
        }
      } else {
        // Redis cache
        const keys = await this.client.keys(`${this.keyPrefix}:${pattern}*`);
        for (const key of keys) {
          checked++;
          const value = await this.client.get(key);
          if (value) {
            try {
              const data = JSON.parse(value);
              if (
                data === null ||
                data === undefined ||
                (Array.isArray(data) && data.length === 0)
              ) {
                console.log(`[Cache] Deleting invalid Redis cache entry: ${key}`);
                await this.client.del(key);
                deleted++;
              }
            } catch (parseError) {
              console.error(`[Cache] Invalid JSON in Redis cache for key ${key}, deleting`);
              await this.client.del(key);
              deleted++;
            }
          }
        }
      }

      return { checked, deleted };
    } catch (error) {
      console.error(`[Cache] Validation error for pattern ${pattern}:`, error.message);
      return { checked, deleted, error: error.message };
    }
  }

  async getStats() {
    if (!this.enabled) return { enabled: false };
    await this.ensureReady();

    try {
      if (this.client instanceof Map) {
        return {
          enabled: true,
          type: 'memory',
          size: this.client.size,
          keys: Array.from(this.client.keys()),
        };
      } else {
        const info = await this.client.info('memory');
        const keys = await this.client.keys(`${this.keyPrefix}:*`);
        return {
          enabled: true,
          type: 'redis',
          memory: info,
          keyCount: keys.length,
          sampleKeys: keys.slice(0, 10),
        };
      }
    } catch (error) {
      console.error('Cache stats error:', error.message);
      return { enabled: true, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new CacheManager();
