import express from 'express';
import { FileUploadService } from '@/services/FileUploadService';
import { authenticate, requirePermission } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { validationResult } from 'express-validator';
import { body, param, query } from 'express-validator';
import { getCache } from '@/config/redis';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';
import fs from 'fs/promises';

const router = express.Router();

// Initialize file upload service
FileUploadService.initialize().catch(error => {
  logger.error('Failed to initialize FileUploadService', { error });
});

// Multer configuration for file uploads
const upload = FileUploadService.getMulterConfig();

/**
 * @route   POST /api/models/upload
 * @desc    Upload AI model file for scanning
 * @access  Private (requires models:write permission)
 */
router.post('/upload',
  authenticate,
  requirePermission('models:write'),
  authLimiter,
  upload.single('model'),
  [
    body('description')
      .optional()
      .isString()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters'),
    body('modelType')
      .optional()
      .isString()
      .isIn(['pytorch', 'tensorflow', 'sklearn', 'onnx', 'huggingface', 'custom'])
      .withMessage('Invalid model type'),
    body('framework')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Framework must be between 1 and 100 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
      .custom((tags: string[]) => {
        if (tags.length > 10) {
          throw new Error('Maximum 10 tags allowed');
        }
        return tags.every(tag => typeof tag === 'string' && tag.length <= 50);
      })
      .withMessage('Each tag must be a string with maximum 50 characters')
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

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
        code: 'FILE_REQUIRED'
      });
      return;
    }

    const userId = req.user?.id as string;
    const { description, modelType, framework, tags } = req.body;

    try {
      // Process the uploaded file
      const scanResult = await FileUploadService.processUpload(
        req.file,
        userId,
        {
          description,
          modelType,
          framework,
          tags: Array.isArray(tags) ? tags : []
        }
      );

      logger.info('Model upload successful', {
        userId,
        scanId: scanResult.id,
        filename: req.file.originalname,
        fileSize: req.file.size,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'Model uploaded successfully and queued for scanning',
        data: {
          scanId: scanResult.id,
          filename: scanResult.filename,
          fileSize: scanResult.file_size,
          status: scanResult.scan_status,
          createdAt: scanResult.created_at,
          metadata: scanResult['metadata']
        }
      });
    } catch (error) {
      logger.error('Model upload failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        filename: req.file?.originalname,
        ip: req.ip
      });

      let statusCode = 500;
      let errorCode = 'UPLOAD_FAILED';
      let message = 'Failed to upload model';

      if (error instanceof Error) {
        switch (error.message) {
          case 'UPLOAD_INIT_FAILED':
            statusCode = 500;
            message = 'Upload service initialization failed';
            errorCode = 'SERVICE_UNAVAILABLE';
            break;
          case 'HASH_CALCULATION_FAILED':
            statusCode = 500;
            message = 'File processing failed';
            errorCode = 'PROCESSING_FAILED';
            break;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: message,
        code: errorCode
      });
    }
  })
);

/**
 * @route   GET /api/models/scans
 * @desc    List user's model scans
 * @access  Private (requires models:read permission)
 */
router.get('/scans',
  authenticate,
  requirePermission('models:read'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['queued', 'scanning', 'completed', 'failed', 'quarantined'])
      .withMessage('Invalid status'),
    query('sortBy')
      .optional()
      .isIn(['created_at', 'updated_at', 'filename', 'file_size', 'scan_status'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
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
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const status = req.query['status'] as string;
    const sortBy = req.query['sortBy'] as string;
    const sortOrder = req.query['sortOrder'] as 'asc' | 'desc';

    try {
      const offset = (page - 1) * limit;
      const result = await FileUploadService.listUserScans(userId, {
        status,
        limit,
        offset,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        data: {
          scans: result.scans,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Failed to list model scans', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to list model scans',
        code: 'SCAN_LIST_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/models/scans/:id
 * @desc    Get model scan details and results
 * @access  Private (requires models:read permission)
 */
router.get('/scans/:id',
  authenticate,
  requirePermission('models:read'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid scan ID format')
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

    const scanId = req.params['id'] as string;
    const userId = req.user?.id as string;

    try {
      const scan = await FileUploadService.getScanResults(scanId, userId);

      if (!scan) {
        res.status(404).json({
          success: false,
          error: 'Scan not found',
          code: 'SCAN_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          scan
        }
      });
    } catch (error) {
      logger.error('Failed to get scan details', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get scan details',
        code: 'SCAN_DETAILS_FAILED'
      });
    }
  })
);

/**
 * @route   DELETE /api/models/scans/:id
 * @desc    Delete model scan and associated file
 * @access  Private (requires models:write permission)
 */
router.delete('/scans/:id',
  authenticate,
  requirePermission('models:write'),
  authLimiter,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid scan ID format')
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

    const scanId = req.params['id'] as string;
    const userId = req.user?.id as string;

    try {
      await FileUploadService.deleteScan(scanId, userId);

      logger.info('Model scan deleted', {
        scanId,
        userId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Scan deleted successfully'
      });
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'SCAN_DELETE_FAILED';
      let message = 'Failed to delete scan';

      if (error instanceof Error) {
        switch (error.message) {
          case 'SCAN_NOT_FOUND':
            statusCode = 404;
            message = 'Scan not found';
            errorCode = 'SCAN_NOT_FOUND';
            break;
          case 'UNAUTHORIZED':
            statusCode = 403;
            message = 'You do not own this scan';
            errorCode = 'UNAUTHORIZED';
            break;
        }
      }

      logger.warn('Scan deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId,
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
 * @route   GET /api/models/download/:token
 * @desc    Download model file using temporary token
 * @access  Public (with valid token)
 */
router.get('/download/:token',
  [
    param('token')
      .isAlphanumeric()
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid download token')
  ],
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Invalid download token',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    const token = req.params['token'] as string;

    try {
      // Get download permission from cache
      const downloadData = await getCache(`download:${token}`) as {
        scanId: string;
        userId: string;
        expiresAt: string;
      } | null;

      if (!downloadData) {
        res.status(404).json({
          success: false,
          error: 'Download token not found or expired',
          code: 'TOKEN_NOT_FOUND'
        });
        return;
      }

      // Check expiration
      if (new Date() > new Date(downloadData.expiresAt)) {
        res.status(410).json({
          success: false,
          error: 'Download token expired',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }

      // Get scan details
      const scan = await FileUploadService.getScanResults(downloadData.scanId);
      if (!scan || !scan['file_path']) {
        res.status(404).json({
          success: false,
          error: 'File not found',
          code: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Security check - ensure file is safe to download
      if (scan['scan_status'] === 'quarantined') {
        res.status(403).json({
          success: false,
          error: 'File is quarantined and cannot be downloaded',
          code: 'FILE_QUARANTINED'
        });
        return;
      }

      // Check if file exists
      const filePath = scan['file_path'] as string;
      try {
        await fs.access(filePath);
      } catch {
        res.status(404).json({
          success: false,
          error: 'File not found on disk',
          code: 'FILE_NOT_FOUND'
        });
        return;
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${scan.filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Stream the file
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);

      logger.info('File downloaded', {
        scanId: downloadData.scanId,
        userId: downloadData.userId,
        filename: scan.filename,
        ip: req.ip
      });
    } catch (error) {
      logger.error('File download failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 8) + '***',
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Download failed',
        code: 'DOWNLOAD_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/models/scans/:id/download
 * @desc    Generate download URL for model file
 * @access  Private (requires models:read permission)
 */
router.post('/scans/:id/download',
  authenticate,
  requirePermission('models:read'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid scan ID format')
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

    const scanId = req.params['id'] as string;
    const userId = req.user?.id as string;

    try {
      const downloadInfo = await FileUploadService.getDownloadUrl(scanId, userId);

      res.json({
        success: true,
        message: 'Download URL generated successfully',
        data: downloadInfo
      });
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'DOWNLOAD_URL_FAILED';
      let message = 'Failed to generate download URL';

      if (error instanceof Error) {
        switch (error.message) {
          case 'SCAN_NOT_FOUND':
            statusCode = 404;
            message = 'Scan not found';
            errorCode = 'SCAN_NOT_FOUND';
            break;
          case 'FILE_QUARANTINED':
            statusCode = 403;
            message = 'File is quarantined and cannot be downloaded';
            errorCode = 'FILE_QUARANTINED';
            break;
          case 'SCAN_NOT_COMPLETED':
            statusCode = 400;
            message = 'Scan is not completed yet';
            errorCode = 'SCAN_NOT_COMPLETED';
            break;
          case 'HIGH_THREAT_DETECTED':
            statusCode = 403;
            message = 'High-risk threats detected, download blocked';
            errorCode = 'HIGH_THREAT_DETECTED';
            break;
        }
      }

      logger.warn('Download URL generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId,
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

export default router;