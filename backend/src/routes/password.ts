import express from 'express';
import { AuthService } from '@/services/AuthService';
import { TokenService } from '@/services/TokenService';
import { UserModel } from '@/models/User';
import { AuthValidators } from '@/utils/validators';
import { validationResult } from 'express-validator';
import { authenticate } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { passwordResetLimiter } from '@/middleware/rateLimiter';
import { logSecurityEvent } from '@/config/mongodb';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  passwordResetLimiter, // 5 requests per hour
  AuthValidators.forgotPassword(),
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

    const { email } = req.body;

    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);
      
      // Always return success to prevent email enumeration
      // But only send email if user exists
      if (user) {
        // Check if user already has a pending reset token
        const hasPendingReset = await TokenService.hasPendingPasswordReset(user.id as string);
        
        if (hasPendingReset) {
          await logSecurityEvent({
            user_id: user.id as string,
            event_type: 'password_reset',
            severity: 'low',
            description: 'Duplicate password reset request blocked',
            metadata: {
              email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
              ip_address: req.ip,
              user_agent: req.get('User-Agent')
            }
          });

          res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
          });
          return;
        }

        // Generate password reset token
        const resetToken = await TokenService.createPasswordResetToken(
          user.id as string,
          email
        );

        // Log security event
        await logSecurityEvent({
          user_id: user.id as string,
          event_type: 'password_reset',
          severity: 'medium',
          description: 'Password reset requested',
          metadata: {
            email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        logger.info('Password reset token created', {
          userId: user.id,
          email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
          ip: req.ip
        });

        // In production, this would send an email
        // For development, we return the token
        const responseData: { token?: string } = {};
        if (process.env['NODE_ENV'] === 'development') {
          responseData.token = resetToken;
        }

        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
          ...(process.env['NODE_ENV'] === 'development' && { data: responseData })
        });
      } else {
        // Log failed attempt
        await logSecurityEvent({
          event_type: 'password_reset',
          severity: 'low',
          description: 'Password reset request for non-existent email',
          metadata: {
            email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        // Still return success to prevent email enumeration
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }
    } catch (error) {
      logger.error('Password reset request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to process password reset request',
        code: 'PASSWORD_RESET_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password',
  passwordResetLimiter, // 5 requests per hour
  AuthValidators.resetPassword(),
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

    const { token, password } = req.body;

    try {
      // Verify and consume the password reset token
      const { userId, email } = await TokenService.verifyPasswordResetToken(token);

      // Get user to verify they still exist and are active
      const user = await UserModel.findById(userId);
      if (!user || !user.is_active) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      // Hash new password
      const passwordHash = await AuthService.hashPassword(password);

      // Update password
      const success = await UserModel.updatePassword(userId, passwordHash);
      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to update password',
          code: 'PASSWORD_UPDATE_FAILED'
        });
        return;
      }

      // Revoke all existing sessions for security
      await AuthService.revokeAllUserSessions(userId);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'password_reset',
        severity: 'medium',
        description: 'Password reset completed successfully',
        metadata: {
          email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('Password reset completed', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.'
      });
    } catch (error) {
      let statusCode = 400;
      let errorCode = 'PASSWORD_RESET_FAILED';
      let message = 'Password reset failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'TOKEN_NOT_FOUND':
            message = 'Invalid or expired reset token';
            errorCode = 'INVALID_TOKEN';
            break;
          case 'TOKEN_EXPIRED':
            message = 'Reset token has expired';
            errorCode = 'TOKEN_EXPIRED';
            break;
          default:
            statusCode = 500;
            message = 'Password reset failed. Please try again.';
        }
      }

      logger.warn('Password reset failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token?.substring(0, 8) + '***',
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
 * @route   POST /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.post('/change-password',
  authenticate,
  AuthValidators.changePassword(),
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

    const { currentPassword, password } = req.body;
    const userId = req.user?.id as string;

    try {
      // Verify current password
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      const isValidPassword = await AuthService.verifyPassword(
        currentPassword,
        user.password_hash as string
      );

      if (!isValidPassword) {
        // Log failed attempt
        await logSecurityEvent({
          user_id: userId,
          event_type: 'failed_login',
          severity: 'medium',
          description: 'Password change attempt with invalid current password',
          metadata: {
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_PASSWORD'
        });
        return;
      }

      // Check if new password is different from current
      const isSamePassword = await AuthService.verifyPassword(
        password,
        user.password_hash as string
      );

      if (isSamePassword) {
        res.status(400).json({
          success: false,
          error: 'New password must be different from current password',
          code: 'SAME_PASSWORD'
        });
        return;
      }

      // Hash new password
      const passwordHash = await AuthService.hashPassword(password);

      // Update password
      const success = await UserModel.updatePassword(userId, passwordHash);
      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to update password',
          code: 'PASSWORD_UPDATE_FAILED'
        });
        return;
      }

      // Revoke all other sessions for security (keep current session)
      await AuthService.revokeAllUserSessions(userId);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'password_reset',
        severity: 'medium',
        description: 'Password changed successfully',
        metadata: {
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('Password changed successfully', {
        userId,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Password has been changed successfully. You have been logged out from other devices.'
      });
    } catch (error) {
      logger.error('Password change failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to change password',
        code: 'PASSWORD_CHANGE_FAILED'
      });
    }
  })
);

export default router;