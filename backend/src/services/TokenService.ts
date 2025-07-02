import crypto from 'crypto';
import { setCache, getCache, deleteCache } from '@/config/redis';
import logger from '@/utils/logger';

/**
 * Service for managing various types of tokens (password reset, email verification, etc.)
 */
export class TokenService {
  
  private static readonly TOKEN_EXPIRY = {
    PASSWORD_RESET: 60 * 60, // 1 hour
    EMAIL_VERIFICATION: 24 * 60 * 60, // 24 hours
    MFA_SETUP: 10 * 60, // 10 minutes
    INVITE: 7 * 24 * 60 * 60, // 7 days
  };

  /**
   * Generate a cryptographically secure token
   */
  static generateToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a URL-safe token
   */
  static generateUrlSafeToken(length = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Generate a numeric token (for SMS/phone verification)
   */
  static generateNumericToken(length = 6): string {
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Create and store a password reset token
   */
  static async createPasswordResetToken(
    userId: string,
    email: string
  ): Promise<string> {
    try {
      const token = this.generateUrlSafeToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY.PASSWORD_RESET * 1000);
      
      // Store in Redis for fast access
      await setCache(`password_reset:${token}`, {
        userId,
        email,
        type: 'password_reset',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }, this.TOKEN_EXPIRY.PASSWORD_RESET);

      // Also store a reverse lookup for cleanup
      await setCache(`user_password_reset:${userId}`, token, this.TOKEN_EXPIRY.PASSWORD_RESET);

      logger.info('Password reset token created', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'), // Mask email
        expiresAt: expiresAt.toISOString()
      });

      return token;
    } catch (error) {
      logger.error('Failed to create password reset token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        email
      });
      throw new Error('TOKEN_CREATION_FAILED');
    }
  }

  /**
   * Verify and consume a password reset token
   */
  static async verifyPasswordResetToken(token: string): Promise<{
    userId: string;
    email: string;
  }> {
    try {
      const tokenData = await getCache(`password_reset:${token}`) as Record<string, unknown> | null;
      
      if (!tokenData) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      const expiresAt = new Date(tokenData['expiresAt'] as string);
      if (new Date() > expiresAt) {
        // Clean up expired token
        await deleteCache(`password_reset:${token}`);
        throw new Error('TOKEN_EXPIRED');
      }

      const userId = tokenData['userId'] as string;
      const email = tokenData['email'] as string;

      // Consume the token (delete it so it can't be reused)
      await Promise.all([
        deleteCache(`password_reset:${token}`),
        deleteCache(`user_password_reset:${userId}`)
      ]);

      logger.info('Password reset token verified and consumed', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2')
      });

      return { userId, email };
    } catch (error) {
      logger.warn('Password reset token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 8) + '***'
      });
      throw error;
    }
  }

  /**
   * Create and store an email verification token
   */
  static async createEmailVerificationToken(
    userId: string,
    email: string
  ): Promise<string> {
    try {
      const token = this.generateUrlSafeToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY.EMAIL_VERIFICATION * 1000);
      
      await setCache(`email_verification:${token}`, {
        userId,
        email,
        type: 'email_verification',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }, this.TOKEN_EXPIRY.EMAIL_VERIFICATION);

      await setCache(`user_email_verification:${userId}`, token, this.TOKEN_EXPIRY.EMAIL_VERIFICATION);

      logger.info('Email verification token created', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        expiresAt: expiresAt.toISOString()
      });

      return token;
    } catch (error) {
      logger.error('Failed to create email verification token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        email
      });
      throw new Error('TOKEN_CREATION_FAILED');
    }
  }

  /**
   * Verify and consume an email verification token
   */
  static async verifyEmailVerificationToken(token: string): Promise<{
    userId: string;
    email: string;
  }> {
    try {
      const tokenData = await getCache(`email_verification:${token}`) as Record<string, unknown> | null;
      
      if (!tokenData) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      const expiresAt = new Date(tokenData['expiresAt'] as string);
      if (new Date() > expiresAt) {
        await deleteCache(`email_verification:${token}`);
        throw new Error('TOKEN_EXPIRED');
      }

      const userId = tokenData['userId'] as string;
      const email = tokenData['email'] as string;

      // Consume the token
      await Promise.all([
        deleteCache(`email_verification:${token}`),
        deleteCache(`user_email_verification:${userId}`)
      ]);

      logger.info('Email verification token verified and consumed', {
        userId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2')
      });

      return { userId, email };
    } catch (error) {
      logger.warn('Email verification token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 8) + '***'
      });
      throw error;
    }
  }

  /**
   * Create MFA setup token
   */
  static async createMfaSetupToken(
    userId: string,
    secret: string
  ): Promise<string> {
    try {
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY.MFA_SETUP * 1000);
      
      await setCache(`mfa_setup:${token}`, {
        userId,
        secret,
        type: 'mfa_setup',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }, this.TOKEN_EXPIRY.MFA_SETUP);

      logger.info('MFA setup token created', {
        userId,
        expiresAt: expiresAt.toISOString()
      });

      return token;
    } catch (error) {
      logger.error('Failed to create MFA setup token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw new Error('TOKEN_CREATION_FAILED');
    }
  }

  /**
   * Verify MFA setup token
   */
  static async verifyMfaSetupToken(token: string): Promise<{
    userId: string;
    secret: string;
  }> {
    try {
      const tokenData = await getCache(`mfa_setup:${token}`) as Record<string, unknown> | null;
      
      if (!tokenData) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      const expiresAt = new Date(tokenData['expiresAt'] as string);
      if (new Date() > expiresAt) {
        await deleteCache(`mfa_setup:${token}`);
        throw new Error('TOKEN_EXPIRED');
      }

      return {
        userId: tokenData['userId'] as string,
        secret: tokenData['secret'] as string
      };
    } catch (error) {
      logger.warn('MFA setup token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 8) + '***'
      });
      throw error;
    }
  }

  /**
   * Revoke MFA setup token
   */
  static async revokeMfaSetupToken(token: string): Promise<void> {
    await deleteCache(`mfa_setup:${token}`);
  }

  /**
   * Create invitation token
   */
  static async createInvitationToken(
    organizationId: string,
    email: string,
    role: string,
    invitedBy: string
  ): Promise<string> {
    try {
      const token = this.generateUrlSafeToken();
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY.INVITE * 1000);
      
      await setCache(`invitation:${token}`, {
        organizationId,
        email,
        role,
        invitedBy,
        type: 'invitation',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }, this.TOKEN_EXPIRY.INVITE);

      logger.info('Invitation token created', {
        organizationId,
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        role,
        invitedBy,
        expiresAt: expiresAt.toISOString()
      });

      return token;
    } catch (error) {
      logger.error('Failed to create invitation token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organizationId,
        email,
        role
      });
      throw new Error('TOKEN_CREATION_FAILED');
    }
  }

  /**
   * Verify invitation token
   */
  static async verifyInvitationToken(token: string): Promise<{
    organizationId: string;
    email: string;
    role: string;
    invitedBy: string;
  }> {
    try {
      const tokenData = await getCache(`invitation:${token}`) as Record<string, unknown> | null;
      
      if (!tokenData) {
        throw new Error('TOKEN_NOT_FOUND');
      }

      const expiresAt = new Date(tokenData['expiresAt'] as string);
      if (new Date() > expiresAt) {
        await deleteCache(`invitation:${token}`);
        throw new Error('TOKEN_EXPIRED');
      }

      return {
        organizationId: tokenData['organizationId'] as string,
        email: tokenData['email'] as string,
        role: tokenData['role'] as string,
        invitedBy: tokenData['invitedBy'] as string
      };
    } catch (error) {
      logger.warn('Invitation token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 8) + '***'
      });
      throw error;
    }
  }

  /**
   * Revoke invitation token
   */
  static async revokeInvitationToken(token: string): Promise<void> {
    await deleteCache(`invitation:${token}`);
  }

  /**
   * Revoke all tokens for a user
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // Get existing tokens for cleanup
      const tokenKeys = [
        `user_password_reset:${userId}`,
        `user_email_verification:${userId}`
      ];

      // Clean up reverse lookups and tokens
      for (const key of tokenKeys) {
        const token = await getCache(key) as string;
        if (token) {
          await Promise.all([
            deleteCache(key),
            deleteCache(key.includes('password') ? `password_reset:${token}` : `email_verification:${token}`)
          ]);
        }
      }

      logger.info('All user tokens revoked', { userId });
    } catch (error) {
      logger.error('Failed to revoke all user tokens', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }
  }

  /**
   * Check if a user has a pending password reset token
   */
  static async hasPendingPasswordReset(userId: string): Promise<boolean> {
    try {
      const token = await getCache(`user_password_reset:${userId}`);
      return token !== null;
    } catch {
      return false;
    }
  }

  /**
   * Check if a user has a pending email verification token
   */
  static async hasPendingEmailVerification(userId: string): Promise<boolean> {
    try {
      const token = await getCache(`user_email_verification:${userId}`);
      return token !== null;
    } catch {
      return false;
    }
  }
}