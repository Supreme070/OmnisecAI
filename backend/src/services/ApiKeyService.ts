import crypto from 'crypto';
import { ApiKeyModel } from '@/models/ApiKey';
import { UserModel } from '@/models/User';
import { setCache, getCache, deleteCache } from '@/config/redis';
import logger from '@/utils/logger';
import { ApiKey } from '@/types';

export class ApiKeyService {
  private static readonly API_KEY_PREFIX = 'oa_'; // OmnisecAI prefix
  private static readonly KEY_LENGTH = 32;
  private static readonly HASH_ALGORITHM = 'sha256';
  private static readonly CACHE_TTL = 60 * 60; // 1 hour cache
  private static readonly RATE_LIMIT_WINDOW = 60 * 60; // 1 hour
  private static readonly DEFAULT_RATE_LIMIT = 1000; // requests per hour

  /**
   * Generate a new API key
   */
  static async generateApiKey(
    userId: string,
    name: string,
    permissions: string[],
    expiresAt?: Date,
    rateLimitPerHour?: number
  ): Promise<{
    apiKey: string;
    keyData: ApiKey;
  }> {
    try {
      // Verify user exists and is active
      const user = await UserModel.findById(userId);
      if (!user || !user.is_active) {
        throw new Error('USER_NOT_FOUND');
      }

      // Generate raw API key
      const rawKey = this.generateRawApiKey();
      const apiKey = `${this.API_KEY_PREFIX}${rawKey}`;

      // Hash the API key for storage
      const keyHash = this.hashApiKey(apiKey);

      // Create API key record
      const createData: {
        user_id: string;
        name: string;
        key_hash: string;
        permissions: string[];
        rate_limit_per_hour?: number;
        expires_at?: Date;
        is_active?: boolean;
      } = {
        user_id: userId,
        name,
        key_hash: keyHash,
        permissions,
        rate_limit_per_hour: rateLimitPerHour || this.DEFAULT_RATE_LIMIT,
        is_active: true
      };

      if (expiresAt) {
        createData.expires_at = expiresAt;
      }

      const keyData = await ApiKeyModel.create(createData);

      // Cache the key data for fast lookup
      await this.cacheApiKeyData(keyHash, keyData);

      logger.info('API key generated', {
        userId,
        keyId: keyData.id,
        name,
        permissions,
        rateLimitPerHour: rateLimitPerHour || this.DEFAULT_RATE_LIMIT
      });

      return {
        apiKey,
        keyData
      };
    } catch (error) {
      logger.error('Failed to generate API key', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        name
      });
      throw error;
    }
  }

  /**
   * Validate and get API key data
   */
  static async validateApiKey(apiKey: string): Promise<{
    keyData: ApiKey;
    user: unknown;
    isValid: boolean;
  }> {
    try {
      // Check format
      if (!apiKey.startsWith(this.API_KEY_PREFIX)) {
        throw new Error('INVALID_API_KEY_FORMAT');
      }

      const keyHash = this.hashApiKey(apiKey);

      // Try cache first
      let keyData = await this.getCachedApiKeyData(keyHash);
      
      if (!keyData) {
        // Fallback to database
        keyData = await ApiKeyModel.findByKeyHash(keyHash);
        if (!keyData) {
          throw new Error('API_KEY_NOT_FOUND');
        }

        // Cache for future requests
        await this.cacheApiKeyData(keyHash, keyData);
      }

      // Check if key is active
      if (!keyData.is_active) {
        throw new Error('API_KEY_INACTIVE');
      }

      // Check expiration
      if (keyData.expires_at && new Date() > new Date(keyData.expires_at as unknown as string)) {
        // Deactivate expired key
        await ApiKeyModel.deactivate(keyData.id as string);
        await this.removeCachedApiKeyData(keyHash);
        throw new Error('API_KEY_EXPIRED');
      }

      // Get user
      const user = await UserModel.findById(keyData.user_id as string);
      if (!user || !user.is_active) {
        throw new Error('USER_NOT_FOUND');
      }

      // Update last used timestamp
      await ApiKeyModel.updateLastUsed(keyData.id as string);

      return {
        keyData,
        user,
        isValid: true
      };
    } catch (error) {
      logger.debug('API key validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyPrefix: apiKey.substring(0, 8) + '***'
      });

      return {
        keyData: {} as ApiKey,
        user: null as unknown,
        isValid: false
      };
    }
  }

  /**
   * Check rate limit for API key
   */
  static async checkRateLimit(keyData: ApiKey, ipAddress?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const rateLimitKey = `api_rate_limit:${keyData.id}:${ipAddress || 'unknown'}`;
      const windowStart = Math.floor(Date.now() / (this.RATE_LIMIT_WINDOW * 1000)) * this.RATE_LIMIT_WINDOW;
      const windowKey = `${rateLimitKey}:${windowStart}`;

      // Get current usage
      const currentUsage = await getCache(windowKey) as number || 0;
      const limit = keyData.rate_limit_per_hour as number || this.DEFAULT_RATE_LIMIT;

      if (currentUsage >= limit) {
        const resetTime = new Date((windowStart + this.RATE_LIMIT_WINDOW) * 1000);
        return {
          allowed: false,
          remaining: 0,
          resetTime
        };
      }

      // Increment usage
      await setCache(windowKey, currentUsage + 1, this.RATE_LIMIT_WINDOW);

      const resetTime = new Date((windowStart + this.RATE_LIMIT_WINDOW) * 1000);
      return {
        allowed: true,
        remaining: limit - currentUsage - 1,
        resetTime
      };
    } catch (error) {
      logger.error('Rate limit check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId: keyData.id
      });

      // Allow request on error to avoid blocking
      return {
        allowed: true,
        remaining: 0,
        resetTime: new Date(Date.now() + this.RATE_LIMIT_WINDOW * 1000)
      };
    }
  }

  /**
   * Check if API key has permission
   */
  static hasPermission(keyData: ApiKey, requiredPermission: string): boolean {
    const permissions = keyData.permissions as string[] || [];
    
    // Check for wildcard permission
    if (permissions.includes('*')) {
      return true;
    }

    // Check for exact permission
    if (permissions.includes(requiredPermission)) {
      return true;
    }

    // Check for namespace permissions (e.g., 'models:*' covers 'models:read')
    const [namespace] = requiredPermission.split(':');
    if (permissions.includes(`${namespace}:*`)) {
      return true;
    }

    return false;
  }

  /**
   * List API keys for user
   */
  static async listApiKeys(
    userId: string,
    options: {
      includeInactive?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    keys: Omit<ApiKey, 'key_hash'>[];
    total: number;
  }> {
    try {
      const { includeInactive = false, limit = 50, offset = 0 } = options;

      const result = await ApiKeyModel.list(userId, {
        includeInactive,
        limit,
        offset
      });

      // Remove sensitive data
      const keys = result.keys.map(key => {
        const { key_hash, ...safeKey } = key;
        return safeKey;
      });

      return {
        keys,
        total: result.total
      };
    } catch (error) {
      logger.error('Failed to list API keys', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Revoke API key
   */
  static async revokeApiKey(keyId: string, userId?: string): Promise<void> {
    try {
      // Get key data to validate ownership
      const keyData = await ApiKeyModel.findById(keyId);
      if (!keyData) {
        throw new Error('API_KEY_NOT_FOUND');
      }

      // Check ownership if userId provided
      if (userId && keyData.user_id !== userId) {
        throw new Error('UNAUTHORIZED');
      }

      // Deactivate key
      await ApiKeyModel.deactivate(keyId);

      // Remove from cache
      await this.removeCachedApiKeyData(keyData.key_hash as string);

      logger.info('API key revoked', {
        keyId,
        userId: keyData.user_id,
        name: keyData.name
      });
    } catch (error) {
      logger.error('Failed to revoke API key', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId,
        userId
      });
      throw error;
    }
  }

  /**
   * Update API key
   */
  static async updateApiKey(
    keyId: string,
    updates: {
      name?: string;
      permissions?: string[];
      rateLimitPerHour?: number;
      expiresAt?: Date | null;
    },
    userId?: string
  ): Promise<ApiKey> {
    try {
      // Get current key data
      const currentKeyData = await ApiKeyModel.findById(keyId);
      if (!currentKeyData) {
        throw new Error('API_KEY_NOT_FOUND');
      }

      // Check ownership if userId provided
      if (userId && currentKeyData.user_id !== userId) {
        throw new Error('UNAUTHORIZED');
      }

      // Update key
      const updatedKey = await ApiKeyModel.update(keyId, updates);
      if (!updatedKey) {
        throw new Error('UPDATE_FAILED');
      }

      // Update cache
      await this.removeCachedApiKeyData(currentKeyData.key_hash as string);
      await this.cacheApiKeyData(updatedKey.key_hash as string, updatedKey);

      logger.info('API key updated', {
        keyId,
        userId: updatedKey.user_id,
        updates: Object.keys(updates)
      });

      return updatedKey;
    } catch (error) {
      logger.error('Failed to update API key', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId,
        userId
      });
      throw error;
    }
  }

  /**
   * Cleanup expired API keys
   */
  static async cleanupExpiredKeys(): Promise<number> {
    try {
      const count = await ApiKeyModel.cleanupExpired();
      
      if (count > 0) {
        logger.info('Cleaned up expired API keys', { count });
      }

      return count;
    } catch (error) {
      logger.error('Failed to cleanup expired API keys', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Get API key usage statistics
   */
  static async getUsageStats(
    keyId: string,
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    totalRequests: number;
    timeframe: string;
    data: Array<{ timestamp: string; requests: number }>;
  }> {
    try {
      // This would typically query usage logs from database or analytics service
      // For now, return placeholder data structure
      const now = new Date();
      const data: Array<{ timestamp: string; requests: number }> = [];

      let intervals: number;
      let intervalMs: number;

      switch (timeframe) {
        case 'hour':
          intervals = 60; // 60 minutes
          intervalMs = 60 * 1000;
          break;
        case 'day':
          intervals = 24; // 24 hours
          intervalMs = 60 * 60 * 1000;
          break;
        case 'week':
          intervals = 7; // 7 days
          intervalMs = 24 * 60 * 60 * 1000;
          break;
        case 'month':
          intervals = 30; // 30 days
          intervalMs = 24 * 60 * 60 * 1000;
          break;
        default:
          intervals = 24;
          intervalMs = 60 * 60 * 1000;
      }

      for (let i = intervals - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * intervalMs));
        data.push({
          timestamp: timestamp.toISOString(),
          requests: 0 // Would be populated from actual usage data
        });
      }

      return {
        totalRequests: 0,
        timeframe,
        data
      };
    } catch (error) {
      logger.error('Failed to get usage stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId,
        timeframe
      });
      throw error;
    }
  }

  /**
   * Generate raw API key
   */
  private static generateRawApiKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  /**
   * Hash API key for storage
   */
  private static hashApiKey(apiKey: string): string {
    return crypto.createHash(this.HASH_ALGORITHM).update(apiKey).digest('hex');
  }

  /**
   * Cache API key data
   */
  private static async cacheApiKeyData(keyHash: string, keyData: ApiKey): Promise<void> {
    try {
      await setCache(`api_key:${keyHash}`, keyData, this.CACHE_TTL);
    } catch (error) {
      logger.warn('Failed to cache API key data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keyId: keyData.id
      });
    }
  }

  /**
   * Get cached API key data
   */
  private static async getCachedApiKeyData(keyHash: string): Promise<ApiKey | null> {
    try {
      return await getCache(`api_key:${keyHash}`) as ApiKey | null;
    } catch {
      return null;
    }
  }

  /**
   * Remove cached API key data
   */
  private static async removeCachedApiKeyData(keyHash: string): Promise<void> {
    try {
      await deleteCache(`api_key:${keyHash}`);
    } catch (error) {
      logger.warn('Failed to remove cached API key data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}