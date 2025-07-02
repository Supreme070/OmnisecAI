import express from 'express';
import { TokenService } from '@/services/TokenService';
import { UserModel } from '@/models/User';
import { AuthValidators } from '@/utils/validators';
import { validationResult } from 'express-validator';
import { authenticate } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/errorHandler';
import { authLimiter } from '@/middleware/rateLimiter';
import { logSecurityEvent } from '@/config/mongodb';
import logger from '@/utils/logger';
import { AuthRequest } from '@/types';

const router = express.Router();

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address using token
 * @access  Public
 */
router.get('/verify-email/:token',
  AuthValidators.verifyEmail(),
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

    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Verification token is required',
        code: 'TOKEN_REQUIRED'
      });
      return;
    }

    try {
      // Verify and consume the email verification token
      const { userId, email } = await TokenService.verifyEmailVerificationToken(token);

      // Get user to verify they still exist
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired verification token',
          code: 'INVALID_TOKEN'
        });
        return;
      }

      // Check if email is already verified
      if (user.is_verified) {
        res.json({
          success: true,
          message: 'Email address is already verified'
        });
        return;
      }

      // Get the user again to return updated data
      const updatedUser = await UserModel.findById(userId);
      if (!updatedUser) {
        res.status(500).json({
          success: false,
          error: 'Failed to verify email',
          code: 'VERIFICATION_FAILED'
        });
        return;
      }

      // Update is_verified status directly in database
      const verifiedUser = await UserModel.verifyEmail(token);
      if (!verifiedUser) {
        res.status(500).json({
          success: false,
          error: 'Failed to verify email',
          code: 'VERIFICATION_FAILED'
        });
        return;
      }

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'login', // Using login as closest match for email verification
        severity: 'low',
        description: 'Email address verified successfully',
        metadata: {
          email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('Email verification completed', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Email address has been verified successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            isVerified: true
          }
        }
      });
    } catch (error) {
      let statusCode = 400;
      let errorCode = 'EMAIL_VERIFICATION_FAILED';
      let message = 'Email verification failed';

      if (error instanceof Error) {
        switch (error.message) {
          case 'TOKEN_NOT_FOUND':
            message = 'Invalid or expired verification token';
            errorCode = 'INVALID_TOKEN';
            break;
          case 'TOKEN_EXPIRED':
            message = 'Verification token has expired';
            errorCode = 'TOKEN_EXPIRED';
            break;
          default:
            statusCode = 500;
            message = 'Email verification failed. Please try again.';
        }
      }

      logger.warn('Email verification failed', {
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
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification',
  authenticate,
  authLimiter, // 5 requests per 15 minutes
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id as string;
    const email = req.user?.email as string;

    try {
      // Check if user is already verified
      if (req.user?.is_verified) {
        res.json({
          success: true,
          message: 'Email address is already verified'
        });
        return;
      }

      // Check if user already has a pending verification token
      const hasPendingVerification = await TokenService.hasPendingEmailVerification(userId);
      
      if (hasPendingVerification) {
        await logSecurityEvent({
          user_id: userId,
          event_type: 'login',
          severity: 'low',
          description: 'Duplicate email verification request blocked',
          metadata: {
            email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          }
        });

        res.json({
          success: true,
          message: 'A verification email has already been sent. Please check your inbox.'
        });
        return;
      }

      // Generate new verification token
      const verificationToken = await TokenService.createEmailVerificationToken(userId, email);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'login',
        severity: 'low',
        description: 'Email verification resent',
        metadata: {
          email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('Email verification resent', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        ip: req.ip
      });

      // In production, this would send an email
      // For development, we return the token
      const responseData: { token?: string } = {};
      if (process.env['NODE_ENV'] === 'development') {
        responseData.token = verificationToken;
      }

      res.json({
        success: true,
        message: 'A new verification email has been sent. Please check your inbox.',
        ...(process.env['NODE_ENV'] === 'development' && { data: responseData })
      });
    } catch (error) {
      logger.error('Resend verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to resend verification email',
        code: 'RESEND_VERIFICATION_FAILED'
      });
    }
  })
);

/**
 * @route   POST /api/auth/request-email-change
 * @desc    Request email address change
 * @access  Private
 */
router.post('/request-email-change',
  authenticate,
  authLimiter, // 5 requests per 15 minutes
  [
    express.json(),
    ...AuthValidators.forgotPassword() // Reuse email validation
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

    const { email: newEmail } = req.body;
    const userId = req.user?.id as string;
    const currentEmail = req.user?.email as string;

    try {
      // Check if new email is the same as current
      if (newEmail === currentEmail) {
        res.status(400).json({
          success: false,
          error: 'New email must be different from current email',
          code: 'SAME_EMAIL'
        });
        return;
      }

      // Check if new email is already in use
      const existingUser = await UserModel.findByEmail(newEmail);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'Email address is already in use',
          code: 'EMAIL_IN_USE'
        });
        return;
      }

      // Generate email change verification token
      const verificationToken = await TokenService.createEmailVerificationToken(userId, newEmail);

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'login',
        severity: 'medium',
        description: 'Email change requested',
        metadata: {
          current_email: currentEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
          new_email: newEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

      logger.info('Email change requested', {
        userId,
        currentEmail: currentEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
        newEmail: newEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
        ip: req.ip
      });

      // In production, this would send an email to the new address
      // For development, we return the token
      const responseData: { token?: string } = {};
      if (process.env['NODE_ENV'] === 'development') {
        responseData.token = verificationToken;
      }

      res.json({
        success: true,
        message: 'A verification email has been sent to your new email address.',
        ...(process.env['NODE_ENV'] === 'development' && { data: responseData })
      });
    } catch (error) {
      logger.error('Email change request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        newEmail,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to process email change request',
        code: 'EMAIL_CHANGE_REQUEST_FAILED'
      });
    }
  })
);

/**
 * @route   GET /api/auth/email-status
 * @desc    Get email verification status
 * @access  Private
 */
router.get('/email-status',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: express.Response): Promise<void> => {
    const userId = req.user?.id as string;

    try {
      // Check for pending email verification
      const hasPendingVerification = await TokenService.hasPendingEmailVerification(userId);

      res.json({
        success: true,
        data: {
          email: req.user?.email,
          isVerified: req.user?.is_verified,
          hasPendingVerification
        }
      });
    } catch (error) {
      logger.error('Failed to get email status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get email status',
        code: 'EMAIL_STATUS_FAILED'
      });
    }
  })
);

export default router;