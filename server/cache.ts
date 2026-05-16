/**
 * Redis Caching Layer
 * Implements distributed caching with TTL, invalidation, and clustering support
 */

import Redis from "ioredis";

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
  maxRetries: number;
  enableOfflineQueue: boolean;
}

let redisClient: Redis | null = null;
let redisPub: Redis | null = null;
let redisSub: Redis | null = null;

/**
 * Initialize Redis client
 */
export async function initializeCache(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  const config: CacheConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
    ttl: parseInt(process.env.CACHE_TTL || "3600", 10),
    maxRetries: 3,
    enableOfflineQueue: true,
  };

  try {
    redisClient = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
      maxRetriesPerRequest: config.maxRetries,
      enableOfflineQueue: config.enableOfflineQueue,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on("error", (err: any) => {
      console.error("❌ Redis connection error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis cache connected");
    });

    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.error("❌ Failed to initialize cache:", error);
    throw error;
  }
}

/**
 * Get value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    const value = await redisClient!.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`❌ Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function set<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<boolean> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    const serialized = JSON.stringify(value);
    const finalTtl = ttl || parseInt(process.env.CACHE_TTL || "3600", 10);

    if (finalTtl > 0) {
      await redisClient!.setex(key, finalTtl, serialized);
    } else {
      await redisClient!.set(key, serialized);
    }
    return true;
  } catch (error) {
    console.error(`❌ Cache set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<boolean> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    await redisClient!.del(key);
    return true;
  } catch (error) {
    console.error(`❌ Cache delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function delPattern(pattern: string): Promise<number> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    const keys = await redisClient!.keys(pattern);
    if (keys.length === 0) return 0;
    return await redisClient!.del(...keys);
  } catch (error) {
    console.error(`❌ Cache delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Increment counter in cache
 */
export async function increment(key: string, amount: number = 1): Promise<number> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    return await redisClient!.incrby(key, amount);
  } catch (error) {
    console.error(`❌ Cache increment error for key ${key}:`, error);
    return 0;
  }
}

/**
 * Set expiration on key
 */
export async function expire(key: string, seconds: number): Promise<boolean> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    const result = await redisClient!.expire(key, seconds);
    return result === 1;
  } catch (error) {
    console.error(`❌ Cache expire error for key ${key}:`, error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getStats() {
  if (!redisClient) {
    return null;
  }

  try {
    const info = await redisClient.info("stats");
    const memory = await redisClient.info("memory");
    return {
      info,
      memory,
    };
  } catch (error) {
    console.error("❌ Cache stats error:", error);
    return null;
  }
}

/**
 * Clear all cache
 */
export async function clear(): Promise<boolean> {
  if (!redisClient) {
    await initializeCache();
  }

  try {
    await redisClient!.flushdb();
    console.log("✅ Cache cleared");
    return true;
  } catch (error) {
    console.error("❌ Cache clear error:", error);
    return false;
  }
}

/**
 * Close Redis connection
 */
export async function closeCache() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("✅ Redis cache closed");
  }
}

/**
 * Cache decorator for functions
 */
export function cached(ttl: number = 3600) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation helper
 */
export async function invalidateCache(patterns: string[]) {
  let invalidated = 0;
  for (const pattern of patterns) {
    invalidated += await delPattern(pattern);
  }
  return invalidated;
}
