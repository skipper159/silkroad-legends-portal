// utils/cache.js - Redis Cache System (SRO-CMS inspired)
const redis = require('redis');
const rankingConfig = require('../config/ranking');

class CacheManager {
  constructor() {
    this.client = null;
    this.enabled = rankingConfig.cache.enabled;
    this.ttl = rankingConfig.cache.ttl;
    this.keyPrefix = rankingConfig.cache.keyPrefix;

    if (this.enabled) {
      this.initRedis();
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
    } catch (error) {
      console.warn('⚠️ Redis not available, falling back to memory cache:', error.message);
      this.client = new Map(); // Fallback to memory cache
    }
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

    try {
      if (this.client instanceof Map) {
        // Memory cache fallback
        const cached = this.client.get(key);
        if (cached && cached.expires > Date.now()) {
          return JSON.parse(cached.data);
        } else {
          this.client.delete(key);
          return null;
        }
      } else {
        // Redis cache
        const cached = await this.client.get(key);
        return cached ? JSON.parse(cached) : null;
      }
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  async set(key, data, customTtl = null) {
    if (!this.enabled) return false;

    const ttl = customTtl || this.ttl;

    try {
      if (this.client instanceof Map) {
        // Memory cache fallback
        this.client.set(key, {
          data: JSON.stringify(data),
          expires: Date.now() + ttl * 1000,
        });
      } else {
        // Redis cache
        await this.client.setEx(key, ttl, JSON.stringify(data));
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  async remember(key, fetchFunction, customTtl = null) {
    // Try to get from cache first
    let cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch data
    try {
      const data = await fetchFunction();
      await this.set(key, data, customTtl);
      return data;
    } catch (error) {
      console.error('Cache remember error:', error.message);
      throw error;
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

  async getStats() {
    if (!this.enabled) return { enabled: false };

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
