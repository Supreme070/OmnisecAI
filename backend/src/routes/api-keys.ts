import express from 'express';
import { ApiKeyService } from '@/services/ApiKeyService';
import { ApiKeyValidators, QueryValidators } from '@/utils/validators';
import { validationResult } from 'express-validator';
import { authenticate, authorize } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { logSecurityEvent } from '@/config/mongodb';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   POST /api/keys
 * @desc    Create a new API key
 * @access  Private
 */
router.post('/keys',
  authenticate,
  authLimiter,
  [
    express.json(),
    ApiKeyValidators.name(),
    ApiKeyValidators.permissions(),
    ApiKeyValidators.rateLimit(),
    ApiKeyValidators.expiresAt()
  ],
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const { name, permissions, rateLimitPerHour, expiresAt } = req.body;
    const userId = req.user?.id as string;

    try {
      // Check current API key count (limit to 10 per user)
      const currentKeyCount = await ApiKeyService.listApiKeys(userId);
      if (currentKeyCount.total >= 10) {
        res.status(400).json({
          success: false,
          error: 'Maximum number of API keys reached (10)',
          code: 'API_KEY_LIMIT_EXCEEDED'
        });
        return;
      }

      // Parse expiration date if provided
      let expirationDate: Date | undefined;
      if (expiresAt) {
        expirationDate = new Date(expiresAt);
        if (expirationDate <= new Date()) {
          res.status(400).json({
            success: false,
            error: 'Expiration date must be in the future',
            code: 'INVALID_EXPIRATION_DATE'
          });
          return;
        }
      }

      // Generate API key
      const { apiKey, keyData } = await ApiKeyService.generateApiKey(
        userId,
        name,
        permissions,
        expirationDate,
        rateLimitPerHour
      );

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'api_key_created',
        severity: 'medium',
        description: 'API key created',
        metadata: {
          key_name: name,
          permissions,
          rate_limit: rateLimitPerHour,
          expires_at: expirationDate?.toISOString(),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('API key created', {
        userId,
        keyId: keyData.id,
        name,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'API key created successfully. Store it securely as it cannot be retrieved again.',
        data: {
          apiKey, // Only returned once
          keyInfo: {
            id: keyData.id,
            name: keyData.name,
            permissions: keyData.permissions,
            rateLimitPerHour: keyData.rate_limit_per_hour,
            expiresAt: keyData.expires_at,
            createdAt: keyData.created_at
          }
        }
      });
    } catch (error) {
      logger.error('API key creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        name,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to create API key',
        code: 'API_KEY_CREATION_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/keys
 * @desc    List user's API keys
 * @access  Private
 */
router.get('/keys',
  authenticate,
  QueryValidators.pagination(),
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const userId = req.user?.id as string;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const includeInactive = req.query['includeInactive'] === 'true';

    try {
      const offset = (page - 1) * limit;
      const result = await ApiKeyService.listApiKeys(userId, {
        includeInactive,
        limit,
        offset
      });

      res.json({
        success: true,
        data: {
          keys: result.keys,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Failed to list API keys', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to list API keys',
        code: 'API_KEY_LIST_FAILED'
      });
    }
  })
);

/**
 * @route   PUT /api/keys/:id
 * @desc    Update an API key
 * @access  Private
 */
router.put('/keys/:id',
  authenticate,
  authLimiter,
  [
    express.json(),
    ApiKeyValidators.name().optional(),
    ApiKeyValidators.permissions().optional(),
    ApiKeyValidators.rateLimit().optional(),
    ApiKeyValidators.expiresAt().optional()
  ],
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    const id = req.params['id'];
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'API key ID is required',
        code: 'MISSING_KEY_ID'
      });
      return;
    }
    const { name, permissions, rateLimitPerHour, expiresAt } = req.body;
    const userId = req.user?.id as string;

    try {
      // Parse expiration date if provided
      let expirationDate: Date | null | undefined = undefined;
      if (expiresAt !== undefined) {
        if (expiresAt === null) {
          expirationDate = null; // Remove expiration
        } else {
          expirationDate = new Date(expiresAt);
          if (expirationDate <= new Date()) {
            res.status(400).json({
              success: false,
              error: 'Expiration date must be in the future',
              code: 'INVALID_EXPIRATION_DATE'
            });
            return;
          }
        }
      }

      // Build update object
      const updates: {
        name?: string;
        permissions?: string[];
        rateLimitPerHour?: number;
        expiresAt?: Date | null;
      } = {};

      if (name !== undefined) updates.name = name;
      if (permissions !== undefined) updates.permissions = permissions;
      if (rateLimitPerHour !== undefined) updates.rateLimitPerHour = rateLimitPerHour;
      if (expirationDate !== undefined) updates.expiresAt = expirationDate;

      // Update API key
      const updatedKey = await ApiKeyService.updateApiKey(id, updates, userId);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'api_key_created', // Using closest available type
        severity: 'medium',
        description: 'API key updated',
        metadata: {
          key_id: id,
          updated_fields: Object.keys(req.body),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('API key updated', {
        userId,
        keyId: id,
        updatedFields: Object.keys(req.body),
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'API key updated successfully',
        data: {
          keyInfo: {
            id: updatedKey.id,
            name: updatedKey.name,
            permissions: updatedKey.permissions,
            rateLimitPerHour: updatedKey.rate_limit_per_hour,
            expiresAt: updatedKey.expires_at,
            lastUsedAt: updatedKey.last_used_at,
            updatedAt: updatedKey.updated_at
          }
        }
      });
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'API_KEY_UPDATE_FAILED';
      let message = 'Failed to update API key';

      if (error instanceof Error) {
        switch (error.message) {
          case 'API_KEY_NOT_FOUND':
            statusCode = 404;
            message = 'API key not found';
            errorCode = 'API_KEY_NOT_FOUND';
            break;
          case 'UNAUTHORIZED':
            statusCode = 403;
            message = 'You do not own this API key';
            errorCode = 'UNAUTHORIZED';
            break;
        }
      }

      logger.warn('API key update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        keyId: id,
        ip: req.ip
      });

      res.status(statusCode).json({
        success: false,
        error: message,
        code: errorCode
      });
    }
  })
);

/**
 * @route   DELETE /api/keys/:id
 * @desc    Revoke an API key
 * @access  Private
 */
router.delete('/keys/:id',
  authenticate,
  authLimiter,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'API key ID is required',
        code: 'MISSING_KEY_ID'
      });
      return;
    }
    const userId = req.user?.id as string;

    try {
      await ApiKeyService.revokeApiKey(id, userId);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'api_key_created', // Using closest available type
        severity: 'medium',
        description: 'API key revoked',
        metadata: {
          key_id: id,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('API key revoked', {
        userId,
        keyId: id,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'API key revoked successfully'
      });
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'API_KEY_REVOKE_FAILED';
      let message = 'Failed to revoke API key';

      if (error instanceof Error) {
        switch (error.message) {
          case 'API_KEY_NOT_FOUND':
            statusCode = 404;
            message = 'API key not found';
            errorCode = 'API_KEY_NOT_FOUND';
            break;
          case 'UNAUTHORIZED':
            statusCode = 403;
            message = 'You do not own this API key';
            errorCode = 'UNAUTHORIZED';
            break;
        }
      }

      logger.warn('API key revoke failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        keyId: id,
        ip: req.ip
      });

      res.status(statusCode).json({
        success: false,
        error: message,
        code: errorCode
      });
    }
  })
);

/**
 * @route   GET /api/keys/:id/usage
 * @desc    Get API key usage statistics
 * @access  Private
 */
router.get('/keys/:id/usage',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'API key ID is required',
        code: 'MISSING_KEY_ID'
      });
      return;
    }
    const timeframe = req.query['timeframe'] as 'hour' | 'day' | 'week' | 'month' || 'day';
    const userId = req.user?.id as string;

    try {
      // Verify ownership by trying to update (this checks ownership)
      await ApiKeyService.updateApiKey(id, {}, userId);
      
      const usageStats = await ApiKeyService.getUsageStats(id, timeframe);

      res.json({
        success: true,
        data: usageStats
      });
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'USAGE_STATS_FAILED';
      let message = 'Failed to get usage statistics';

      if (error instanceof Error) {
        switch (error.message) {
          case 'API_KEY_NOT_FOUND':
            statusCode = 404;
            message = 'API key not found';
            errorCode = 'API_KEY_NOT_FOUND';
            break;
          case 'UNAUTHORIZED':
            statusCode = 403;
            message = 'You do not own this API key';
            errorCode = 'UNAUTHORIZED';
            break;
        }
      }

      logger.warn('Usage stats request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        keyId: id,
        ip: req.ip
      });

      res.status(statusCode).json({
        success: false,
        error: message,
        code: errorCode
      });
    }
  })
);

/**
 * @route   POST /api/keys/cleanup
 * @desc    Cleanup expired API keys (admin only)
 * @access  Private (Admin)
 */
router.post('/keys/cleanup',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id as string;

    try {
      const count = await ApiKeyService.cleanupExpiredKeys();

      logger.info('API key cleanup performed', {
        userId,
        cleanedCount: count,
        ip: req.ip
      });

      res.json({
        success: true,
        message: `Cleaned up ${count} expired API keys`,
        data: { cleanedCount: count }
      });
    } catch (error) {
      logger.error('API key cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to cleanup expired API keys',
        code: 'CLEANUP_FAILED'
      });
    }
  })
);

export default router;