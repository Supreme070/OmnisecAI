import express from 'express';
import { ModelScanningService } from '@/services/ModelScanningService';
import { ScanWorkerService } from '@/services/ScanWorkerService';
import { ModelScanModel } from '@/models/ModelScan';
import { authenticate, requirePermission, authorize } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { validationResult } from 'express-validator';
import { param, query } from 'express-validator';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   GET /api/scanning/stats
 * @desc    Get scanning service statistics
 * @access  Private (requires scans:read permission)
 */
router.get('/stats',
  authenticate,
  requirePermission('scans:read'),
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      const stats = await ModelScanningService.getScanningStats();
      const workerStatus = ScanWorkerService.getStatus();

      res.json({
        success: true,
        data: {
          scanningStats: stats,
          workerService: workerStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get scanning statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get scanning statistics',
        code: 'SCANNING_STATS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/scanning/trigger
 * @desc    Manually trigger scan queue processing (admin only)
 * @access  Private (Admin)
 */
router.post('/trigger',
  authenticate,
  authorize('admin'),
  authLimiter,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const adminUserId = req.user?.id as string;

    try {
      await ScanWorkerService.triggerProcessing();

      logger.info('Scan processing manually triggered', {
        adminUserId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Scan queue processing triggered successfully',
        data: {
          triggeredAt: new Date().toISOString(),
          triggeredBy: adminUserId
        }
      });
    } catch (error) {
      logger.error('Failed to trigger scan processing', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to trigger scan processing',
        code: 'SCAN_TRIGGER_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/scanning/worker/start
 * @desc    Start scan worker service (admin only)
 * @access  Private (Admin)
 */
router.post('/worker/start',
  authenticate,
  authorize('admin'),
  authLimiter,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const adminUserId = req.user?.id as string;

    try {
      ScanWorkerService.start();

      logger.info('Scan worker service started', {
        adminUserId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Scan worker service started successfully',
        data: {
          status: ScanWorkerService.getStatus(),
          startedAt: new Date().toISOString(),
          startedBy: adminUserId
        }
      });
    } catch (error) {
      logger.error('Failed to start scan worker service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to start scan worker service',
        code: 'WORKER_START_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/scanning/worker/stop
 * @desc    Stop scan worker service (admin only)
 * @access  Private (Admin)
 */
router.post('/worker/stop',
  authenticate,
  authorize('admin'),
  authLimiter,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const adminUserId = req.user?.id as string;

    try {
      ScanWorkerService.stop();

      logger.info('Scan worker service stopped', {
        adminUserId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Scan worker service stopped successfully',
        data: {
          status: ScanWorkerService.getStatus(),
          stoppedAt: new Date().toISOString(),
          stoppedBy: adminUserId
        }
      });
    } catch (error) {
      logger.error('Failed to stop scan worker service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to stop scan worker service',
        code: 'WORKER_STOP_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/scanning/worker/status
 * @desc    Get scan worker service status (admin only)
 * @access  Private (Admin)
 */
router.get('/worker/status',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
      const status = ScanWorkerService.getStatus();

      res.json({
        success: true,
        data: {
          workerStatus: status,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get worker status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get worker status',
        code: 'WORKER_STATUS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/scanning/worker/reset
 * @desc    Reset scan worker error state (admin only)
 * @access  Private (Admin)
 */
router.post('/worker/reset',
  authenticate,
  authorize('admin'),
  authLimiter,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const adminUserId = req.user?.id as string;

    try {
      ScanWorkerService.resetErrorState();

      logger.info('Scan worker error state reset', {
        adminUserId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Scan worker error state reset successfully',
        data: {
          status: ScanWorkerService.getStatus(),
          resetAt: new Date().toISOString(),
          resetBy: adminUserId
        }
      });
    } catch (error) {
      logger.error('Failed to reset worker error state', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to reset worker error state',
        code: 'WORKER_RESET_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/scanning/queue
 * @desc    Get scan queue status (admin only)
 * @access  Private (Admin)
 */
router.get('/queue',
  authenticate,
  authorize('admin'),
  [
    query('status')
      .optional()
      .isIn(['queued', 'scanning', 'completed', 'failed', 'quarantined'])
      .withMessage('Invalid status filter'),
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
      const status = req.query['status'] as string;
      const limit = parseInt(req.query['limit'] as string) || 50;

      let queueData;
      if (status) {
        queueData = await ModelScanModel.findByStatus(status as any, limit);
      } else {
        // Get counts for all statuses
        const statuses = ['queued', 'scanning', 'completed', 'failed', 'quarantined'];
        const statusCounts: Record<string, number> = {};
        
        for (const s of statuses) {
          const scans = await ModelScanModel.findByStatus(s as any, 1000);
          statusCounts[s] = scans.length;
        }

        queueData = {
          statusCounts,
          recentScans: await ModelScanModel.getRecentScans(10)
        };
      }

      res.json({
        success: true,
        data: {
          queue: queueData,
          workerStatus: ScanWorkerService.getStatus(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get scan queue status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.id,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get scan queue status',
        code: 'QUEUE_STATUS_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/scanning/rescan/:scanId
 * @desc    Requeue scan for processing (admin only)
 * @access  Private (Admin)
 */
router.post('/rescan/:scanId',
  authenticate,
  authorize('admin'),
  authLimiter,
  [
    param('scanId')
      .isUUID()
      .withMessage('Scan ID must be a valid UUID')
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

    const scanId = req.params['scanId'] as string;
    const adminUserId = req.user?.id as string;

    try {
      // Get scan details
      const scan = await ModelScanModel.findById(scanId);
      if (!scan) {
        res.status(404).json({
          success: false,
          error: 'Scan not found',
          code: 'SCAN_NOT_FOUND'
        });
        return;
      }

      // Reset scan status to queued
      await ModelScanModel.update(scanId, {
        scan_status: 'queued',
        scan_results: {
          requeuedAt: new Date().toISOString(),
          requeuedBy: adminUserId,
          previousStatus: scan['scan_status']
        }
      });

      logger.info('Scan requeued for processing', {
        scanId,
        adminUserId,
        previousStatus: scan['scan_status'],
        filename: scan.filename,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Scan requeued for processing successfully',
        data: {
          scanId,
          previousStatus: scan['scan_status'],
          newStatus: 'queued',
          requeuedAt: new Date().toISOString(),
          requeuedBy: adminUserId
        }
      });
    } catch (error) {
      logger.error('Failed to requeue scan', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        adminUserId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to requeue scan',
        code: 'RESCAN_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/scanning/results/:scanId
 * @desc    Get detailed scan results with cached data
 * @access  Private (requires scans:read permission)
 */
router.get('/results/:scanId',
  authenticate,
  requirePermission('scans:read'),
  [
    param('scanId')
      .isUUID()
      .withMessage('Scan ID must be a valid UUID')
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

    const scanId = req.params['scanId'] as string;
    const userId = req.user?.id as string;

    try {
      // Get scan from database
      const scan = await ModelScanModel.findById(scanId);
      if (!scan) {
        res.status(404).json({
          success: false,
          error: 'Scan not found',
          code: 'SCAN_NOT_FOUND'
        });
        return;
      }

      // Check ownership (non-admin users can only see their own scans)
      if (req.user?.role !== 'admin' && scan.user_id !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied to this scan',
          code: 'SCAN_ACCESS_DENIED'
        });
        return;
      }

      // Try to get cached detailed results
      const cachedResults = await ModelScanningService.getCachedScanResults(scanId);

      res.json({
        success: true,
        data: {
          scan,
          detailedResults: cachedResults,
          hasCachedResults: Boolean(cachedResults),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to get scan results', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get scan results',
        code: 'SCAN_RESULTS_FAILED'
      });
    }
  })
);

export default router;