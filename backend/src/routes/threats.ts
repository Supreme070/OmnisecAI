import express from 'express';
import { ThreatDetectionService } from '@/services/ThreatDetectionService';
import { ThreatMonitorModel } from '@/models/ThreatMonitor';
import { authenticate, requirePermission, authorize } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { validationResult } from 'express-validator';
import { body, param, query } from 'express-validator';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   GET /api/threats/dashboard
 * @desc    Get active threats dashboard
 * @access  Private (requires scans:read permission)
 */
router.get('/dashboard',
  authenticate,
  requirePermission('scans:read'),
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      const userId = req.user?.role === 'admin' ? undefined : req.user?.id as string;
      const dashboard = await ThreatDetectionService.getActiveThreatsDashboard(userId);

      res.json({
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to get threats dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get threats dashboard',
        code: 'THREATS_DASHBOARD_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/threats
 * @desc    Search and list threats with filtering
 * @access  Private (requires scans:read permission)
 */
router.get('/',
  authenticate,
  requirePermission('scans:read'),
  [
    query('q')
      .optional()
      .isString()
      .isLength({ min: 1, max: 200 })
      .withMessage('Search query must be between 1 and 200 characters'),
    query('threatType')
      .optional()
      .isIn(['malware', 'phishing', 'data_leak', 'backdoor', 'adversarial', 'privacy_violation'])
      .withMessage('Invalid threat type'),
    query('severity')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity level'),
    query('status')
      .optional()
      .isIn(['detected', 'investigating', 'resolved', 'false_positive', 'suppressed'])
      .withMessage('Invalid status'),
    query('sourceType')
      .optional()
      .isIn(['model_scan', 'behavior_analysis', 'network_monitor', 'user_report', 'external_feed'])
      .withMessage('Invalid source type'),
    query('minConfidence')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('Min confidence must be between 0 and 1'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
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

    try {
      const userId = req.user?.role === 'admin' ? undefined : req.user?.id as string;
      
      const searchParams = {
        ...(req.query['q'] ? { query: req.query['q'] as string } : {}),
        ...(userId ? { userId } : {}),
        ...(req.query['threatType'] ? { threatType: req.query['threatType'] as string } : {}),
        ...(req.query['severity'] ? { severity: req.query['severity'] as string } : {}),
        ...(req.query['status'] ? { status: req.query['status'] as string } : {}),
        ...(req.query['sourceType'] ? { sourceType: req.query['sourceType'] as string } : {}),
        ...(req.query['minConfidence'] ? { minConfidence: parseFloat(req.query['minConfidence'] as string) } : {}),
        ...(req.query['startDate'] ? { startDate: new Date(req.query['startDate'] as string) } : {}),
        ...(req.query['endDate'] ? { endDate: new Date(req.query['endDate'] as string) } : {}),
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 20
      };

      const results = await ThreatDetectionService.searchThreats(searchParams);

      res.json({
        success: true,
        data: {
          threats: results.threats,
          pagination: {
            page: results.page,
            limit: searchParams.limit,
            total: results.total,
            totalPages: results.totalPages
          }
        }
      });
    } catch (error) {
      logger.error('Failed to search threats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to search threats',
        code: 'THREATS_SEARCH_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/threats/:id
 * @desc    Get detailed threat information
 * @access  Private (requires scans:read permission)
 */
router.get('/:id',
  authenticate,
  requirePermission('scans:read'),
  [
    param('id')
      .isUUID()
      .withMessage('Threat ID must be a valid UUID')
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

    const threatId = req.params['id'] as string;
    const userId = req.user?.id as string;

    try {
      const threat = await ThreatMonitorModel.findById(threatId);

      if (!threat) {
        res.status(404).json({
          success: false,
          error: 'Threat not found',
          code: 'THREAT_NOT_FOUND'
        });
        return;
      }

      // Check access - non-admin users can only see their own threats
      if (req.user?.role !== 'admin' && threat.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied to this threat',
          code: 'THREAT_ACCESS_DENIED'
        });
        return;
      }

      res.json({
        success: true,
        data: { threat }
      });
    } catch (error) {
      logger.error('Failed to get threat details', {
        error: error instanceof Error ? error.message : 'Unknown error',
        threatId,
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get threat details',
        code: 'THREAT_DETAILS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/threats/report
 * @desc    Manually report a threat
 * @access  Private (requires scans:write permission)
 */
router.post('/report',
  authenticate,
  requirePermission('scans:write'),
  authLimiter,
  [
    body('threatType')
      .isIn(['malware', 'phishing', 'data_leak', 'backdoor', 'adversarial', 'privacy_violation'])
      .withMessage('Invalid threat type'),
    body('description')
      .isString()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('severity')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity level'),
    body('indicators')
      .isObject()
      .withMessage('Indicators must be an object'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object')
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
    const { threatType, description, severity, indicators, metadata } = req.body;

    try {
      const threat = await ThreatDetectionService.reportThreat(userId, {
        threatType,
        description,
        severity,
        indicators,
        metadata
      });

      logger.info('Manual threat reported', {
        threatId: threat.threat_id,
        userId,
        threatType,
        severity: threat.severity,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'Threat reported successfully',
        data: { threat }
      });
    } catch (error) {
      logger.error('Failed to report threat', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        threatType,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to report threat',
        code: 'THREAT_REPORT_FAILED'
      });
    }
  })
);

/**
 * @route   PUT /api/threats/:id/status
 * @desc    Update threat status (admin or assigned analyst)
 * @access  Private (Admin or Analyst)
 */
router.put('/:id/status',
  authenticate,
  authorize('admin', 'analyst'),
  authLimiter,
  [
    param('id')
      .isUUID()
      .withMessage('Threat ID must be a valid UUID'),
    body('status')
      .isIn(['detected', 'investigating', 'resolved', 'false_positive', 'suppressed'])
      .withMessage('Invalid status'),
    body('resolutionNotes')
      .optional()
      .isString()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Resolution notes must be between 1 and 1000 characters')
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

    const threatId = req.params['id'] as string;
    const { status, resolutionNotes } = req.body;
    const updatedBy = req.user?.id as string;

    try {
      const threat = await ThreatDetectionService.updateThreatStatus(
        threatId,
        status,
        updatedBy,
        resolutionNotes
      );

      if (!threat) {
        res.status(404).json({
          success: false,
          error: 'Threat not found',
          code: 'THREAT_NOT_FOUND'
        });
        return;
      }

      logger.info('Threat status updated', {
        threatId,
        newStatus: status,
        updatedBy,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Threat status updated successfully',
        data: { threat }
      });
    } catch (error) {
      logger.error('Failed to update threat status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        threatId,
        status,
        updatedBy,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to update threat status',
        code: 'THREAT_STATUS_UPDATE_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/threats/intelligence
 * @desc    Get threat intelligence report (admin only)
 * @access  Private (Admin)
 */
router.get('/intelligence',
  authenticate,
  authorize('admin'),
  [
    query('timeRange')
      .optional()
      .isIn(['day', 'week', 'month'])
      .withMessage('Time range must be day, week, or month')
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
      const timeRange = req.query['timeRange'] as 'day' | 'week' | 'month' || 'week';
      const intelligence = await ThreatDetectionService.generateThreatIntelligence(timeRange);

      res.json({
        success: true,
        data: {
          intelligence,
          timeRange,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get threat intelligence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get threat intelligence',
        code: 'THREAT_INTELLIGENCE_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/threats/stats
 * @desc    Get threat statistics
 * @access  Private (requires scans:read permission)
 */
router.get('/stats',
  authenticate,
  requirePermission('scans:read'),
  [
    query('timeRange')
      .optional()
      .isIn(['hour', 'day', 'week', 'month'])
      .withMessage('Time range must be hour, day, week, or month'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format')
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
      const userId = req.user?.role === 'admin' ? undefined : req.user?.id as string;
      const timeRange = req.query['timeRange'] as 'hour' | 'day' | 'week' | 'month';
      const startDate = req.query['startDate'] ? new Date(req.query['startDate'] as string) : undefined;
      const endDate = req.query['endDate'] ? new Date(req.query['endDate'] as string) : undefined;

      const stats = await ThreatMonitorModel.getStats({
        ...(userId ? { userId } : {}),
        ...(timeRange ? { timeRange } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {})
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get threat statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get threat statistics',
        code: 'THREAT_STATS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/threats/cleanup
 * @desc    Cleanup old resolved threats (admin only)
 * @access  Private (Admin)
 */
router.post('/cleanup',
  authenticate,
  authorize('admin'),
  authLimiter,
  [
    body('olderThanDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365')
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

    const adminUserId = req.user?.id as string;
    const olderThanDays = req.body.olderThanDays || 90;

    try {
      const deletedCount = await ThreatMonitorModel.cleanup(olderThanDays);

      logger.info('Threat cleanup performed', {
        adminUserId,
        deletedCount,
        olderThanDays,
        ip: req.ip
      });

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} old threat records`,
        data: {
          deletedCount,
          olderThanDays,
          cleanupDate: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to cleanup threats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        olderThanDays,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to cleanup threats',
        code: 'THREAT_CLEANUP_FAILED'
      });
    }
  })
);

export default router;