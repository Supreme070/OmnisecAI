const Redis = require('ioredis');
const logger = require('../utils/logger');

let valkeyClient;

const valkeyConfig = {
  host: process.env.VALKEY_HOST || 'localhost',
  port: process.env.VALKEY_PORT || 6379,
  password: process.env.VALKEY_PASSWORD || undefined,
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  keyPrefix: 'omnisecai:'
};

async function connectToValkey() {
  try {
    valkeyClient = new Redis(valkeyConfig);
    
    // Set up event listeners
    valkeyClient.on('connect', () => {
      logger.info('Valkey client connected');
    });
    
    valkeyClient.on('ready', () => {
      logger.info('Valkey client ready');
    });
    
    valkeyClient.on('error', (err) => {
      logger.error('Valkey client error', {
        error: err.message,
        stack: err.stack
      });
    });
    
    valkeyClient.on('close', () => {
      logger.info('Valkey connection closed');
    });
    
    valkeyClient.on('reconnecting', () => {
      logger.info('Valkey client reconnecting');
    });
    
    // Test the connection
    await valkeyClient.ping();
    
    logger.info('Valkey connected successfully', {
      host: valkeyConfig.host,
      port: valkeyConfig.port,
      db: valkeyConfig.db
    });
    
    return valkeyClient;
  } catch (error) {
    logger.error('Failed to connect to Valkey', {
      error: error.message,
      stack: error.stack,
      config: {
        host: valkeyConfig.host,
        port: valkeyConfig.port,
        db: valkeyConfig.db
      }
    });
    throw error;
  }
}

function getValkeyClient() {
  if (!valkeyClient) {
    throw new Error('Valkey not connected. Call connectToValkey() first.');
  }
  return valkeyClient;
}

// Session management functions
async function setSession(sessionId, sessionData, ttl = 3600) {
  try {
    const key = `session:${sessionId}`;
    await valkeyClient.setex(key, ttl, JSON.stringify(sessionData));
    
    logger.debug('Session stored', {
      sessionId,
      ttl
    });
  } catch (error) {
    logger.error('Failed to store session', {
      error: error.message,
      sessionId
    });
    throw error;
  }
}

async function getSession(sessionId) {
  try {
    const key = `session:${sessionId}`;
    const sessionData = await valkeyClient.get(key);
    
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  } catch (error) {
    logger.error('Failed to get session', {
      error: error.message,
      sessionId
    });
    throw error;
  }
}

async function deleteSession(sessionId) {
  try {
    const key = `session:${sessionId}`;
    await valkeyClient.del(key);
    
    logger.debug('Session deleted', {
      sessionId
    });
  } catch (error) {
    logger.error('Failed to delete session', {
      error: error.message,
      sessionId
    });
    throw error;
  }
}

// Cache management functions
async function setCache(key, value, ttl = 300) {
  try {
    const cacheKey = `cache:${key}`;
    await valkeyClient.setex(cacheKey, ttl, JSON.stringify(value));
    
    logger.debug('Cache stored', {
      key,
      ttl
    });
  } catch (error) {
    logger.error('Failed to store cache', {
      error: error.message,
      key
    });
    throw error;
  }
}

async function getCache(key) {
  try {
    const cacheKey = `cache:${key}`;
    const cachedData = await valkeyClient.get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    logger.error('Failed to get cache', {
      error: error.message,
      key
    });
    throw error;
  }
}

async function deleteCache(key) {
  try {
    const cacheKey = `cache:${key}`;
    await valkeyClient.del(cacheKey);
    
    logger.debug('Cache deleted', {
      key
    });
  } catch (error) {
    logger.error('Failed to delete cache', {
      error: error.message,
      key
    });
    throw error;
  }
}

// Rate limiting functions
async function checkRateLimit(identifier, limit = 100, window = 3600) {
  try {
    const key = `ratelimit:${identifier}`;
    const current = await valkeyClient.incr(key);
    
    if (current === 1) {
      await valkeyClient.expire(key, window);
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
      error: error.message,
      identifier
    });
    throw error;
  }
}

// Real-time analytics functions
async function incrementCounter(metric, value = 1, ttl = 3600) {
  try {
    const key = `counter:${metric}`;
    const newValue = await valkeyClient.incrby(key, value);
    
    if (newValue === value) {
      await valkeyClient.expire(key, ttl);
    }
    
    return newValue;
  } catch (error) {
    logger.error('Failed to increment counter', {
      error: error.message,
      metric
    });
    throw error;
  }
}

async function getCounter(metric) {
  try {
    const key = `counter:${metric}`;
    const value = await valkeyClient.get(key);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    logger.error('Failed to get counter', {
      error: error.message,
      metric
    });
    throw error;
  }
}

async function closeValkeyConnection() {
  if (valkeyClient) {
    valkeyClient.disconnect();
    logger.info('Valkey connection closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', closeValkeyConnection);
process.on('SIGTERM', closeValkeyConnection);

module.exports = {
  connectToValkey,
  getValkeyClient,
  closeValkeyConnection,
  
  // Session functions
  setSession,
  getSession,
  deleteSession,
  
  // Cache functions
  setCache,
  getCache,
  deleteCache,
  
  // Rate limiting functions
  checkRateLimit,
  
  // Analytics functions
  incrementCounter,
  getCounter
};