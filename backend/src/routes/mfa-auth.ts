import express from 'express';
import { AuthService } from '@/services/AuthService';
import { MfaService } from '@/services/MfaService';
import { UserModel } from '@/models/User';
import { MfaValidators } from '@/utils/validators';
import { validationResult } from 'express-validator';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { logSecurityEvent } from '@/config/mongodb';
import logger from '@/utils/logger';

const router = express.Router();

/**
 * @route   POST /api/auth/mfa/complete-login
 * @desc    Complete login with MFA verification
 * @access  Public
 */
router.post('/mfa/complete-login',
  authLimiter,
  [
    express.json(),
    ...MfaValidators.completeLogin()
  ],
  asyncHandler(async (req: express.Request, res: express.Response): Promise<void> => {
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

    const { userId, code, backupCode, rememberMe } = req.body;

    try {
      // Get user to verify they exist and MFA is enabled
      const user = await UserModel.findById(userId);
      if (!user || !user.is_active) {
        res.status(400).json({
          success: false,
          error: 'Invalid user or user is inactive',
          code: 'INVALID_USER'
        });
        return;
      }

      if (!user.mfa_enabled) {
        res.status(400).json({
          success: false,
          error: 'MFA is not enabled for this user',
          code: 'MFA_NOT_ENABLED'
        });
        return;
      }

      let mfaVerified = false;
      let usedBackupCode = false;

      // Try TOTP code first if provided
      if (code) {
        try {
          mfaVerified = await MfaService.verifyTotpCode(userId, code, req.ip);
        } catch (error) {
          // Log but don't throw, we might try backup code
          logger.debug('TOTP verification failed, will try backup code if provided', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Try backup code if TOTP failed and backup code is provided
      if (!mfaVerified && backupCode) {
        try {
          mfaVerified = await MfaService.verifyBackupCode(userId, backupCode, req.ip);
          usedBackupCode = true;
        } catch (error) {
          logger.debug('Backup code verification failed', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      if (!mfaVerified) {
        // Log failed MFA attempt
        await logSecurityEvent({
          user_id: userId,
          event_type: 'failed_login',
          severity: 'medium',
          description: 'MFA verification failed during login',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            attempted_totp: !!code,
            attempted_backup_code: !!backupCode
          }
        });

        res.status(401).json({
          success: false,
          error: 'Invalid MFA code',
          code: 'INVALID_MFA_CODE'
        });
        return;
      }

      // MFA verified, complete login
      const { accessToken, refreshToken, session } = await AuthService.createSession(
        user,
        req.ip,
        req.get('User-Agent')
      );

      // Get backup codes remaining if backup code was used
      let backupCodesRemaining: number | undefined;
      if (usedBackupCode) {
        const mfaStatus = await MfaService.getMfaStatus(userId);
        backupCodesRemaining = mfaStatus.backupCodesRemaining;
      }

      // Log successful login with MFA
      await logSecurityEvent({
        user_id: userId,
        event_type: 'login',
        severity: 'low',
        description: 'User login successful with MFA',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          remember_me: !!rememberMe,
          used_backup_code: usedBackupCode,
          backup_codes_remaining: backupCodesRemaining
        }
      });

      logger.info('User login successful with MFA', {
        userId,
        username: user.username,
        ip: req.ip,
        sessionId: session.id,
        usedBackupCode
      });

      // Set refresh token as httpOnly cookie if rememberMe is true
      if (rememberMe) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      const responseData: Record<string, unknown> = {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          isVerified: user.is_verified,
          mfaEnabled: user.mfa_enabled,
          lastLoginAt: user.last_login_at
        },
        session: {
          id: session.id,
          expiresAt: session.expires_at
        }
      };

      // Add refresh token if not stored in cookie
      if (!rememberMe) {
        responseData['refreshToken'] = refreshToken;
      }

      // Add backup code warning if applicable
      if (usedBackupCode && backupCodesRemaining !== undefined) {
        responseData['backupCodeWarning'] = {
          used: true,
          remaining: backupCodesRemaining,
          message: backupCodesRemaining <= 2 
            ? 'You have 2 or fewer backup codes remaining. Consider generating new ones.'
            : `You have ${backupCodesRemaining} backup codes remaining.`
        };
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: responseData
      });
    } catch (error) {
      let statusCode = 500;
      let errorCode = 'MFA_LOGIN_FAILED';
      let message = 'MFA login failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'RATE_LIMIT_EXCEEDED':
            statusCode = 429;
            message = 'Too many MFA attempts. Please try again later.';
            errorCode = 'RATE_LIMIT_EXCEEDED';
            break;
          case 'MFA_NOT_ENABLED':
            statusCode = 400;
            message = 'MFA is not enabled for this account';
            errorCode = 'MFA_NOT_ENABLED';
            break;
          default:
            message = 'Login failed. Please try again.';
        }
      }

      logger.error('MFA login failed', {
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

export default router;