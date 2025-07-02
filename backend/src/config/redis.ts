import Redis from 'ioredis';
import logger from '@/utils/logger';
import config from '@/config';

let redisClient: Redis | null = null;

export async function connectToRedis(): Promise<Redis> {
  try {
    const redisOptions: Record<string, unknown> = {
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      keyPrefix: 'omnisecai:',
      maxRetriesPerRequest: 3
    };
    
    if (config.redis.password) {
      redisOptions['password'] = config.redis.password;
    }
    
    if (config.redis.db !== undefined) {
      redisOptions['db'] = config.redis.db;
    }
    
    redisClient = new Redis(config.redis.url, redisOptions);
    
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });
    
    redisClient.on('error', (err: Error) => {
      logger.error('Redis client error', {
        error: err.message,
        stack: err.stack
      });
    });
    
    redisClient.on('close', () => {
      logger.info('Redis connection closed');
    });
    
    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
    
    await redisClient.ping();
    
    logger.info('Redis connected successfully', {
      db: config.redis.db
    });
    
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      config: {
        db: config.redis.db
      }
    });
    throw error;
  }
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectToRedis() first.');
  }
  return redisClient;
}

export async function setSession(sessionId: string, sessionData: Record<string, unknown>, ttl = 3600): Promise<void> {
  try {
    const key = `session:${sessionId}`;
    await getRedisClient().setex(key, ttl, JSON.stringify(sessionData));
    
    logger.debug('Session stored', {
      sessionId,
      ttl
    });
  } catch (error) {
    logger.error('Failed to store session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
}

export async function getSession(sessionId: string): Promise<Record<string, unknown> | null> {
  try {
    const key = `session:${sessionId}`;
    const sessionData = await getRedisClient().get(key);
    
    if (sessionData) {
      return JSON.parse(sessionData) as Record<string, unknown>;
    }
    return null;
  } catch (error) {
    logger.error('Failed to get session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const key = `session:${sessionId}`;
    await getRedisClient().del(key);
    
    logger.debug('Session deleted', {
      sessionId
    });
  } catch (error) {
    logger.error('Failed to delete session', {
      error: error instanceof Error ? error.message : 'Unknown error',
      sessionId
    });
    throw error;
  }
}

export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  try {
    const cacheKey = `cache:${key}`;
    await getRedisClient().setex(cacheKey, ttl, JSON.stringify(value));
    
    logger.debug('Cache stored', {
      key,
      ttl
    });
  } catch (error) {
    logger.error('Failed to store cache', {
      error: error instanceof Error ? error.message : 'Unknown error',
      key
    });
    throw error;
  }
}

export async function getCache(key: string): Promise<unknown | null> {
  try {
    const cacheKey = `cache:${key}`;
    const cachedData = await getRedisClient().get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData) as unknown;
    }
    return null;
  } catch (error) {
    logger.error('Failed to get cache', {
      error: error instanceof Error ? error.message : 'Unknown error',
      key
    });
    throw error;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const cacheKey = `cache:${key}`;
    await getRedisClient().del(cacheKey);
    
    logger.debug('Cache deleted', {
      key
    });
  } catch (error) {
    logger.error('Failed to delete cache', {
      error: error instanceof Error ? error.message : 'Unknown error',
      key
    });
    throw error;
  }
}

interface RateLimitResult {
  allowed: boolean;
  current: number;
  remaining: number;
  resetTime: number;
}

export async function checkRateLimit(identifier: string, limit = 100, window = 3600): Promise<RateLimitResult> {
  try {
    const key = `ratelimit:${identifier}`;
    const current = await getRedisClient().incr(key);
    
    if (current === 1) {
      await getRedisClient().expire(key, window);
    }
    
    const remaining = Math.max(0, limit - current);
    const isAllowed = current <= limit;
    
    logger.debug('Rate limit check', {
      identifier,
      current,
      limit,
      remaining,
      isAllowed
    });
    
    return {
      allowed: isAllowed,
      current,
      remaining,
      resetTime: window
    };
  } catch (error) {
    logger.error('Failed to check rate limit', {
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier
    });
    throw error;
  }
}

export async function incrementCounter(metric: string, value = 1, ttl = 3600): Promise<number> {
  try {
    const key = `counter:${metric}`;
    const newValue = await getRedisClient().incrby(key, value);
    
    if (newValue === value) {
      await getRedisClient().expire(key, ttl);
    }
    
    return newValue;
  } catch (error) {
    logger.error('Failed to increment counter', {
      error: error instanceof Error ? error.message : 'Unknown error',
      metric
    });
    throw error;
  }
}

export async function getCounter(metric: string): Promise<number> {
  try {
    const key = `counter:${metric}`;
    const value = await getRedisClient().get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    logger.error('Failed to get counter', {
      error: error instanceof Error ? error.message : 'Unknown error',
      metric
    });
    throw error;
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    redisClient.disconnect();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

process.on('SIGINT', () => {
  void closeRedisConnection();
});

process.on('SIGTERM', () => {
  void closeRedisConnection();
});