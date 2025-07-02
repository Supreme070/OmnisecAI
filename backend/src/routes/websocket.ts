import express from 'express';
import { WebSocketService } from '@/services/WebSocketService';
import { authenticate, requirePermission } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { validationResult } from 'express-validator';
import { body, param, query } from 'express-validator';
import logger from '@/utils/logger';
import { AuthRequest, NotificationData } from '@/types';
import crypto from 'crypto';

const router = express.Router();

/**
 * @route   GET /api/websocket/status
 * @desc    Get WebSocket service status
 * @access  Private
 */
router.get('/status',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const connectionInfo = WebSocketService.getUserConnectionInfo(userId);
      
      res.json({
        success: true,
        data: {
          service: 'online',
          userConnected: connectionInfo.connected,
          userSocketCount: connectionInfo.socketCount,
          totalConnectedUsers: WebSocketService.getConnectedUsersCount(),
          totalConnections: WebSocketService.getTotalConnectionsCount(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get WebSocket status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get WebSocket status',
        code: 'WEBSOCKET_STATUS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/websocket/notify
 * @desc    Send notification to specific user (admin only)
 * @access  Private (Admin)
 */
router.post('/notify',
  authenticate,
  requirePermission('admin:*'),
  authLimiter,
  [
    body('targetUserId')
      .isUUID()
      .withMessage('Target user ID must be a valid UUID'),
    body('type')
      .isIn(['scan_complete', 'scan_failed', 'threat_detected', 'system_alert', 'security_event'])
      .withMessage('Invalid notification type'),
    body('title')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('message')
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Message must be between 1 and 500 characters'),
    body('severity')
      .isIn(['info', 'warning', 'error', 'critical'])
      .withMessage('Invalid severity level'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object'),
    body('requiresAction')
      .optional()
      .isBoolean()
      .withMessage('RequiresAction must be a boolean')
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

    const { targetUserId, type, title, message, severity, data, requiresAction } = req.body;
    const adminUserId = req.user?.id as string;

    try {
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type,
        title,
        message,
        severity,
        data: data || {},
        timestamp: new Date().toISOString(),
        userId: targetUserId,
        requiresAction: requiresAction || false
      };

      await WebSocketService.sendNotificationToUser(targetUserId, notification);

      logger.info('Admin notification sent', {
        adminUserId,
        targetUserId,
        notificationId: notification.id,
        type,
        severity,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Notification sent successfully',
        data: {
          notificationId: notification.id,
          sentAt: notification.timestamp
        }
      });
    } catch (error) {
      logger.error('Failed to send admin notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        targetUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to send notification',
        code: 'NOTIFICATION_SEND_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/websocket/broadcast
 * @desc    Broadcast system notification (admin only)
 * @access  Private (Admin)
 */
router.post('/broadcast',
  authenticate,
  requirePermission('admin:*'),
  authLimiter,
  [
    body('type')
      .isIn(['system_alert', 'security_event'])
      .withMessage('Invalid broadcast notification type'),
    body('title')
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('message')
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Message must be between 1 and 500 characters'),
    body('severity')
      .isIn(['info', 'warning', 'error', 'critical'])
      .withMessage('Invalid severity level'),
    body('data')
      .optional()
      .isObject()
      .withMessage('Data must be an object'),
    body('requiresAction')
      .optional()
      .isBoolean()
      .withMessage('RequiresAction must be a boolean')
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

    const { type, title, message, severity, data, requiresAction } = req.body;
    const adminUserId = req.user?.id as string;

    try {
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type,
        title,
        message,
        severity,
        data: data || {},
        timestamp: new Date().toISOString(),
        requiresAction: requiresAction || false
      };

      await WebSocketService.broadcastSystemNotification(notification);

      logger.info('System notification broadcasted', {
        adminUserId,
        notificationId: notification.id,
        type,
        severity,
        connectedUsers: WebSocketService.getConnectedUsersCount(),
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'System notification broadcasted successfully',
        data: {
          notificationId: notification.id,
          sentAt: notification.timestamp,
          connectedUsers: WebSocketService.getConnectedUsersCount()
        }
      });
    } catch (error) {
      logger.error('Failed to broadcast system notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to broadcast notification',
        code: 'BROADCAST_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/websocket/disconnect/:userId
 * @desc    Disconnect specific user (admin only)
 * @access  Private (Admin)
 */
router.post('/disconnect/:userId',
  authenticate,
  requirePermission('admin:*'),
  authLimiter,
  [
    param('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
    body('reason')
      .optional()
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Reason must be between 1 and 200 characters')
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

    const userId = req.params['userId'] as string;
    const { reason = 'Session terminated by administrator' } = req.body;
    const adminUserId = req.user?.id as string;

    try {
      const connectionInfo = WebSocketService.getUserConnectionInfo(userId);
      
      if (!connectionInfo.connected) {
        res.status(404).json({
          success: false,
          error: 'User is not connected',
          code: 'USER_NOT_CONNECTED'
        });
        return;
      }

      await WebSocketService.disconnectUser(userId, reason);

      logger.warn('User disconnected by admin', {
        adminUserId,
        disconnectedUserId: userId,
        reason,
        previousSocketCount: connectionInfo.socketCount,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'User disconnected successfully',
        data: {
          disconnectedUserId: userId,
          reason,
          previousSocketCount: connectionInfo.socketCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to disconnect user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        targetUserId: userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to disconnect user',
        code: 'DISCONNECT_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/websocket/connections
 * @desc    Get WebSocket connection statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/connections',
  authenticate,
  requirePermission('admin:*'),
  [
    query('details')
      .optional()
      .isBoolean()
      .withMessage('Details must be a boolean')
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

    try {
      const statistics = {
        totalConnections: WebSocketService.getTotalConnectionsCount(),
        connectedUsers: WebSocketService.getConnectedUsersCount(),
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Failed to get connection statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get connection statistics',
        code: 'STATISTICS_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/websocket/user/:userId/status
 * @desc    Check if specific user is connected (admin only)
 * @access  Private (Admin)
 */
router.get('/user/:userId/status',
  authenticate,
  requirePermission('admin:*'),
  [
    param('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID')
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

    const userId = req.params['userId'] as string;

    try {
      const connectionInfo = WebSocketService.getUserConnectionInfo(userId);
      const isConnected = await WebSocketService.isUserConnected(userId);

      res.json({
        success: true,
        data: {
          userId,
          connected: isConnected,
          socketCount: connectionInfo.socketCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get user connection status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        targetUserId: userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get user connection status',
        code: 'USER_STATUS_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/websocket/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/notifications',
  authenticate,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
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

    const userId = req.user?.id as string;

    try {
      // This would typically fetch from a database or cache
      // For now, we'll return a placeholder response
      res.json({
        success: true,
        data: {
          notifications: [],
          total: 0,
          unread: 0,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get user notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get notifications',
        code: 'NOTIFICATIONS_FAILED'
      });
    }
  })
);

export default router;