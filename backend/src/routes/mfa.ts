import express from 'express';
import { MfaService } from '@/services/MfaService';
import { MfaValidators } from '@/utils/validators';
import { validationResult } from 'express-validator';
import { authenticate } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { logSecurityEvent } from '@/config/mongodb';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   POST /api/auth/mfa/setup
 * @desc    Start MFA setup process
 * @access  Private
 */
router.post('/mfa/setup',
  authenticate,
  authLimiter, // 5 requests per 15 minutes
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id as string;
    const userEmail = req.user?.email as string;

    try {
      // Check if MFA is already enabled
      if (req.user?.mfa_enabled) {
        res.status(400).json({
          success: false,
          error: 'MFA is already enabled for this account',
          code: 'MFA_ALREADY_ENABLED'
        });
        return;
      }

      // Generate MFA setup data
      const setupData = await MfaService.generateMfaSetup(userId, userEmail);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'mfa_enabled',
        severity: 'medium',
        description: 'MFA setup initiated',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('MFA setup initiated', {
        userId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'MFA setup initiated. Scan the QR code with your authenticator app.',
        data: {
          qrCode: setupData.qrCodeUrl,
          setupToken: setupData.setupToken,
          backupCodes: setupData.backupCodes
        }
      });
    } catch (error) {
      logger.error('MFA setup initiation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to initiate MFA setup',
        code: 'MFA_SETUP_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/auth/mfa/verify-setup
 * @desc    Complete MFA setup by verifying TOTP code
 * @access  Private
 */
router.post('/mfa/verify-setup',
  authenticate,
  authLimiter,
  [
    express.json(),
    MfaValidators.totpCode(),
    ...MfaValidators.verifySetup()
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

    const { setupToken, code } = req.body;
    const userId = req.user?.id as string;

    try {
      // Verify MFA setup
      const { backupCodes } = await MfaService.verifyMfaSetup(setupToken, code, userId);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'mfa_enabled',
        severity: 'high',
        description: 'MFA enabled successfully',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('MFA enabled successfully', {
        userId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'MFA has been enabled successfully. Save your backup codes in a secure location.',
        data: {
          backupCodes,
          enabled: true
        }
      });
    } catch (error) {
      let statusCode = 400;
      let errorCode = 'MFA_VERIFICATION_FAILED';
      let message = 'MFA verification failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_SETUP_TOKEN':
            message = 'Invalid or expired setup token';
            errorCode = 'INVALID_SETUP_TOKEN';
            break;
          case 'INVALID_TOTP_CODE':
            message = 'Invalid authentication code';
            errorCode = 'INVALID_CODE';
            break;
          case 'BACKUP_CODES_NOT_FOUND':
            message = 'Setup session expired, please restart MFA setup';
            errorCode = 'SETUP_EXPIRED';
            break;
          default:
            statusCode = 500;
            message = 'MFA setup failed. Please try again.';
        }
      }

      logger.warn('MFA setup verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
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
 * @route   POST /api/auth/mfa/verify
 * @desc    Verify MFA code for authentication
 * @access  Private
 */
router.post('/mfa/verify',
  authenticate,
  authLimiter,
  MfaValidators.totpCode(),
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

    const { code } = req.body;
    const userId = req.user?.id as string;

    try {
      // Verify TOTP code
      const isValid = await MfaService.verifyTotpCode(userId, code, req.ip);

      if (isValid) {
        // Log successful verification
        await logSecurityEvent({
          user_id: userId,
          event_type: 'login',
          severity: 'low',
          description: 'MFA verification successful',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.json({
          success: true,
          message: 'MFA verification successful'
        });
      } else {
        // Log failed verification
        await logSecurityEvent({
          user_id: userId,
          event_type: 'failed_login',
          severity: 'medium',
          description: 'MFA verification failed',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            reason: 'invalid_totp_code'
          }
        });

        res.status(401).json({
          success: false,
          error: 'Invalid authentication code',
          code: 'INVALID_CODE'
        });
      }
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'MFA_VERIFICATION_FAILED';
      let message = 'MFA verification failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'MFA_NOT_ENABLED':
            statusCode = 400;
            message = 'MFA is not enabled for this account';
            errorCode = 'MFA_NOT_ENABLED';
            break;
          case 'RATE_LIMIT_EXCEEDED':
            statusCode = 429;
            message = 'Too many MFA attempts. Please try again later.';
            errorCode = 'RATE_LIMIT_EXCEEDED';
            break;
        }
      }

      logger.warn('MFA verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
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
 * @route   POST /api/auth/mfa/verify-backup
 * @desc    Verify backup code for authentication
 * @access  Private
 */
router.post('/mfa/verify-backup',
  authenticate,
  authLimiter,
  MfaValidators.backupCode(),
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

    const { backupCode } = req.body;
    const userId = req.user?.id as string;

    try {
      // Verify backup code
      const isValid = await MfaService.verifyBackupCode(userId, backupCode, req.ip);

      if (isValid) {
        // Get remaining backup codes count
        const { backupCodesRemaining } = await MfaService.getMfaStatus(userId);

        // Log successful verification
        await logSecurityEvent({
          user_id: userId,
          event_type: 'login',
          severity: 'medium',
          description: 'Backup code verification successful',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            remaining_backup_codes: backupCodesRemaining
          }
        });

        res.json({
          success: true,
          message: 'Backup code verification successful',
          data: {
            backupCodesRemaining,
            warning: backupCodesRemaining <= 2 ? 'You have 2 or fewer backup codes remaining. Consider generating new ones.' : undefined
          }
        });
      } else {
        // Log failed verification
        await logSecurityEvent({
          user_id: userId,
          event_type: 'failed_login',
          severity: 'medium',
          description: 'Backup code verification failed',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            reason: 'invalid_backup_code'
          }
        });

        res.status(401).json({
          success: false,
          error: 'Invalid backup code',
          code: 'INVALID_BACKUP_CODE'
        });
      }
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'BACKUP_CODE_VERIFICATION_FAILED';
      let message = 'Backup code verification failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'MFA_NOT_ENABLED':
            statusCode = 400;
            message = 'MFA is not enabled for this account';
            errorCode = 'MFA_NOT_ENABLED';
            break;
          case 'RATE_LIMIT_EXCEEDED':
            statusCode = 429;
            message = 'Too many backup code attempts. Please try again later.';
            errorCode = 'RATE_LIMIT_EXCEEDED';
            break;
        }
      }

      logger.warn('Backup code verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
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
 * @route   POST /api/auth/mfa/disable
 * @desc    Disable MFA for user
 * @access  Private
 */
router.post('/mfa/disable',
  authenticate,
  authLimiter,
  MfaValidators.totpCode(),
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

    const { code } = req.body;
    const userId = req.user?.id as string;

    try {
      // Disable MFA (this also verifies the TOTP code)
      await MfaService.disableMfa(userId, code);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'mfa_enabled', // Using the closest available type
        severity: 'high',
        description: 'MFA disabled',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('MFA disabled', {
        userId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'MFA has been disabled for your account'
      });
    } catch (error) {
      let statusCode = 400;
      let errorCode = 'MFA_DISABLE_FAILED';
      let message = 'Failed to disable MFA';

      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_TOTP_CODE':
            message = 'Invalid authentication code';
            errorCode = 'INVALID_CODE';
            break;
          case 'MFA_NOT_ENABLED':
            message = 'MFA is not enabled for this account';
            errorCode = 'MFA_NOT_ENABLED';
            break;
          default:
            statusCode = 500;
            message = 'Failed to disable MFA. Please try again.';
        }
      }

      logger.warn('MFA disable failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
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
 * @route   POST /api/auth/mfa/backup-codes/regenerate
 * @desc    Generate new backup codes
 * @access  Private
 */
router.post('/mfa/backup-codes/regenerate',
  authenticate,
  authLimiter,
  MfaValidators.totpCode(),
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

    const { code } = req.body;
    const userId = req.user?.id as string;

    try {
      // Generate new backup codes
      const newBackupCodes = await MfaService.generateNewBackupCodes(userId, code);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'mfa_enabled',
        severity: 'medium',
        description: 'Backup codes regenerated',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('Backup codes regenerated', {
        userId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'New backup codes have been generated. Save them in a secure location.',
        data: {
          backupCodes: newBackupCodes
        }
      });
    } catch (error) {
      let statusCode = 400;
      let errorCode = 'BACKUP_CODE_GENERATION_FAILED';
      let message = 'Failed to generate new backup codes';

      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_TOTP_CODE':
            message = 'Invalid authentication code';
            errorCode = 'INVALID_CODE';
            break;
          case 'MFA_NOT_ENABLED':
            message = 'MFA is not enabled for this account';
            errorCode = 'MFA_NOT_ENABLED';
            break;
          default:
            statusCode = 500;
            message = 'Failed to generate new backup codes. Please try again.';
        }
      }

      logger.warn('Backup code generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
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
 * @route   GET /api/auth/mfa/status
 * @desc    Get MFA status for user
 * @access  Private
 */
router.get('/mfa/status',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id as string;

    try {
      const status = await MfaService.getMfaStatus(userId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Failed to get MFA status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get MFA status',
        code: 'MFA_STATUS_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/auth/mfa/generate-test-code
 * @desc    Generate current TOTP for testing (development only)
 * @access  Private
 */
router.get('/mfa/generate-test-code',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id as string;

    try {
      const testCode = await MfaService.generateCurrentTotp(userId);

      res.json({
        success: true,
        message: 'Test TOTP code generated (development only)',
        data: {
          code: testCode,
          warning: 'This endpoint is only available in development mode'
        }
      });
    } catch (error) {
      let statusCode = 400;
      let errorCode = 'TEST_CODE_GENERATION_FAILED';
      let message = 'Failed to generate test code';

      if (error instanceof Error) {
        switch (error.message) {
          case 'TOTP generation only available in development':
            statusCode = 403;
            message = 'Test code generation is only available in development mode';
            errorCode = 'NOT_AVAILABLE_IN_PRODUCTION';
            break;
          case 'MFA_NOT_ENABLED':
            message = 'MFA is not enabled for this account';
            errorCode = 'MFA_NOT_ENABLED';
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

export default router;