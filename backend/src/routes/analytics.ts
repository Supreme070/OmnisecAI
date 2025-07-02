import express from 'express';
import { SecurityAnalyticsService } from '@/services/SecurityAnalyticsService';
import { authenticate, requirePermission, authorize } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { validationResult } from 'express-validator';
import { query, body, param } from 'express-validator';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   GET /api/analytics/metrics
 * @desc    Get security metrics for specified time range
 * @access  Private (requires scans:read permission)
 */
router.get('/metrics',
  authenticate,
  requirePermission('scans:read'),
  [
    query('startDate')
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
    query('userId')
      .optional()
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

    try {
      const startDate = new Date(req.query['startDate'] as string);
      const endDate = new Date(req.query['endDate'] as string);
      let userId = req.query['userId'] as string;

      // Non-admin users can only view their own metrics
      if (req.user?.role !== 'admin') {
        userId = req.user?.id as string;
      }

      // Validate date range
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE'
        });
        return;
      }

      // Limit to 1 year max
      const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in ms
      if (endDate.getTime() - startDate.getTime() > maxRange) {
        res.status(400).json({
          success: false,
          error: 'Date range cannot exceed 1 year',
          code: 'DATE_RANGE_TOO_LARGE'
        });
        return;
      }

      const metrics = await SecurityAnalyticsService.generateSecurityMetrics(
        startDate,
        endDate,
        userId
      );

      res.json({
        success: true,
        data: {
          metrics,
          timeRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          scope: userId ? 'user' : 'organization'
        }
      });

    } catch (error) {
      logger.error('Failed to get security metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate security metrics',
        code: 'METRICS_GENERATION_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get threat trends over time
 * @access  Private (requires scans:read permission)
 */
router.get('/trends',
  authenticate,
  requirePermission('scans:read'),
  [
    query('startDate')
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
    query('granularity')
      .optional()
      .isIn(['hour', 'day', 'week'])
      .withMessage('Granularity must be hour, day, or week'),
    query('userId')
      .optional()
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

    try {
      const startDate = new Date(req.query['startDate'] as string);
      const endDate = new Date(req.query['endDate'] as string);
      const granularity = req.query['granularity'] as 'hour' | 'day' | 'week' || 'day';
      let userId = req.query['userId'] as string;

      // Non-admin users can only view their own trends
      if (req.user?.role !== 'admin') {
        userId = req.user?.id as string;
      }

      // Validate date range
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE'
        });
        return;
      }

      const trends = await SecurityAnalyticsService.generateThreatTrends(
        startDate,
        endDate,
        granularity,
        userId
      );

      res.json({
        success: true,
        data: {
          trends,
          timeRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          granularity,
          scope: userId ? 'user' : 'organization'
        }
      });

    } catch (error) {
      logger.error('Failed to get threat trends', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate threat trends',
        code: 'TRENDS_GENERATION_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/analytics/users
 * @desc    Get user activity metrics (admin only)
 * @access  Private (Admin)
 */
router.get('/users',
  authenticate,
  authorize('admin'),
  [
    query('startDate')
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
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
      const startDate = new Date(req.query['startDate'] as string);
      const endDate = new Date(req.query['endDate'] as string);
      const limit = parseInt(req.query['limit'] as string) || 50;

      // Validate date range
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE'
        });
        return;
      }

      const userMetrics = await SecurityAnalyticsService.generateUserActivityMetrics(
        startDate,
        endDate,
        limit
      );

      res.json({
        success: true,
        data: {
          userMetrics,
          timeRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          totalUsers: userMetrics.length
        }
      });

    } catch (error) {
      logger.error('Failed to get user activity metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate user activity metrics',
        code: 'USER_METRICS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/analytics/reports
 * @desc    Generate comprehensive security report
 * @access  Private (Admin or Analyst)
 */
router.post('/reports',
  authenticate,
  authorize('admin', 'analyst'),
  authLimiter,
  [
    body('reportType')
      .isIn(['daily', 'weekly', 'monthly', 'custom'])
      .withMessage('Invalid report type'),
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    body('endDate')
      .isISO8601()
      .withMessage('End date must be valid ISO8601 format'),
    body('userId')
      .optional()
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

    try {
      const { reportType, startDate: startDateStr, endDate: endDateStr, userId } = req.body;
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const generatedBy = req.user?.id as string;

      // Validate date range
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE'
        });
        return;
      }

      // Non-admin users can only generate reports for themselves
      let reportUserId = userId;
      if (req.user?.role !== 'admin') {
        reportUserId = req.user?.id as string;
      }

      const report = await SecurityAnalyticsService.generateSecurityReport(
        reportType,
        startDate,
        endDate,
        reportUserId
      );

      logger.info('Security report generated', {
        reportId: report.id,
        reportType,
        generatedBy,
        scope: reportUserId ? 'user' : 'organization',
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'Security report generated successfully',
        data: { report }
      });

    } catch (error) {
      logger.error('Failed to generate security report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate security report',
        code: 'REPORT_GENERATION_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/analytics/reports/:id
 * @desc    Get cached security report by ID
 * @access  Private (Admin or Analyst)
 */
router.get('/reports/:id',
  authenticate,
  authorize('admin', 'analyst'),
  [
    param('id')
      .isUUID()
      .withMessage('Report ID must be a valid UUID')
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
      const reportId = req.params['id'] as string;
      const report = await SecurityAnalyticsService.getCachedReport(reportId);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found or expired',
          code: 'REPORT_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: { report }
      });

    } catch (error) {
      logger.error('Failed to get cached report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reportId: req.params['id'],
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve report',
        code: 'REPORT_RETRIEVAL_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/analytics/reports/:id/export
 * @desc    Export security report in various formats
 * @access  Private (Admin or Analyst)
 */
router.get('/reports/:id/export',
  authenticate,
  authorize('admin', 'analyst'),
  [
    param('id')
      .isUUID()
      .withMessage('Report ID must be a valid UUID'),
    query('format')
      .isIn(['json', 'csv', 'pdf'])
      .withMessage('Format must be json, csv, or pdf')
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
      const reportId = req.params['id'] as string;
      const format = req.query['format'] as 'json' | 'csv' | 'pdf';

      const report = await SecurityAnalyticsService.getCachedReport(reportId);
      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found or expired',
          code: 'REPORT_NOT_FOUND'
        });
        return;
      }

      const exportData = await SecurityAnalyticsService.exportReport(report, format);

      // Set appropriate headers
      res.setHeader('Content-Type', exportData.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);

      if (format === 'json') {
        res.json(JSON.parse(exportData.data));
      } else {
        res.send(exportData.data);
      }

      logger.info('Security report exported', {
        reportId,
        format,
        filename: exportData.filename,
        userId: req.user?.id,
        ip: req.ip
      });

    } catch (error) {
      logger.error('Failed to export report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reportId: req.params['id'],
        format: req.query['format'],
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to export report',
        code: 'REPORT_EXPORT_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/analytics/compliance
 * @desc    Get compliance metrics (admin only)
 * @access  Private (Admin)
 */
router.get('/compliance',
  authenticate,
  authorize('admin'),
  [
    query('startDate')
      .isISO8601()
      .withMessage('Start date must be valid ISO8601 format'),
    query('endDate')
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
      const startDate = new Date(req.query['startDate'] as string);
      const endDate = new Date(req.query['endDate'] as string);

      // Validate date range
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE'
        });
        return;
      }

      const compliance = await SecurityAnalyticsService.generateComplianceMetrics(
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: {
          compliance,
          timeRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get compliance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate compliance metrics',
        code: 'COMPLIANCE_METRICS_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get analytics dashboard summary
 * @access  Private (requires scans:read permission)
 */
router.get('/dashboard',
  authenticate,
  requirePermission('scans:read'),
  [
    query('timeRange')
      .optional()
      .isIn(['24h', '7d', '30d', '90d'])
      .withMessage('Time range must be 24h, 7d, 30d, or 90d')
  ],
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      const timeRange = req.query['timeRange'] as string || '7d';
      const userId = req.user?.role === 'admin' ? undefined : req.user?.id as string;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Generate dashboard data
      const [metrics, trends] = await Promise.all([
        SecurityAnalyticsService.generateSecurityMetrics(startDate, endDate, userId),
        SecurityAnalyticsService.generateThreatTrends(startDate, endDate, 'day', userId)
      ]);

      res.json({
        success: true,
        data: {
          metrics,
          trends: trends.slice(-14), // Last 14 days for dashboard
          timeRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            range: timeRange
          },
          scope: userId ? 'user' : 'organization'
        }
      });

    } catch (error) {
      logger.error('Failed to get analytics dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate analytics dashboard',
        code: 'DASHBOARD_FAILED'
      });
    }
  })
);

export default router;