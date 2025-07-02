import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserSession, JWTPayload, RefreshTokenPayload } from '@/types';
import { UserModel, UserSessionModel } from '@/models/User';
import { setSession, getSession, deleteSession } from '@/config/redis';
import logger from '@/utils/logger';
import config from '@/config';

export class AuthService {
  
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  /**
   * Generate JWT access token
   */
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt_secret, {
      expiresIn: config.jwt_expires_in || this.ACCESS_TOKEN_EXPIRY,
      issuer: 'omnisecai',
      audience: 'omnisecai-api'
    } as jwt.SignOptions);
  }

  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, config.jwt_refresh_secret, {
      expiresIn: config.jwt_refresh_expires_in || this.REFRESH_TOKEN_EXPIRY,
      issuer: 'omnisecai',
      audience: 'omnisecai-refresh'
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt_secret, {
        issuer: 'omnisecai',
        audience: 'omnisecai-api'
      }) as JWTPayload;
      
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('ACCESS_TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_ACCESS_TOKEN');
      } else {
        throw new Error('TOKEN_VERIFICATION_FAILED');
      }
    }
  }

  /**
   * Verify JWT refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt_refresh_secret, {
        issuer: 'omnisecai',
        audience: 'omnisecai-refresh'
      }) as RefreshTokenPayload;
      
      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_REFRESH_TOKEN');
      } else {
        throw new Error('TOKEN_VERIFICATION_FAILED');
      }
    }
  }

  /**
   * Create authentication session
   */
  static async createSession(
    user: User, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    session: UserSession;
  }> {
    try {
      // Generate session tokens
      const sessionId = crypto.randomUUID();
      const tokenVersion = 1;
      
      const accessPayload: JWTPayload = {
        userId: user.id as string,
        sessionId,
        role: user.role as string
      };
      
      const refreshPayload: RefreshTokenPayload = {
        userId: user.id as string,
        sessionId,
        tokenVersion
      };

      const accessToken = this.generateAccessToken(accessPayload);
      const refreshToken = this.generateRefreshToken(refreshPayload);

      // Hash tokens for database storage
      const accessTokenHash = crypto
        .createHash('sha256')
        .update(accessToken)
        .digest('hex');
      
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // Calculate expiry times
      const refreshExpiry = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days

      // Create session in database
      const sessionData: { 
        user_id: string; 
        token_hash: string; 
        refresh_token_hash: string; 
        expires_at: Date;
        user_agent?: string;
        ip_address?: string;
      } = {
        user_id: user.id as string,
        token_hash: accessTokenHash,
        refresh_token_hash: refreshTokenHash,
        expires_at: refreshExpiry
      };
      
      if (userAgent) {
        sessionData.user_agent = userAgent;
      }
      
      if (ipAddress) {
        sessionData.ip_address = ipAddress;
      }
      
      const session = await UserSessionModel.create(sessionData);

      // Store session in Redis for fast access
      await setSession(`session:${sessionId}`, {
        userId: user.id as string,
        sessionId,
        role: user.role as string,
        accessTokenHash,
        refreshTokenHash,
        expiresAt: refreshExpiry.toISOString()
      }, 7 * 24 * 60 * 60); // 7 days in seconds

      // Update user last login
      await UserModel.updateLastLogin(user.id as string, ipAddress);

      logger.info('Authentication session created', {
        userId: user.id,
        sessionId,
        ipAddress,
        userAgent
      });

      return {
        accessToken,
        refreshToken,
        session
      };
    } catch (error) {
      logger.error('Failed to create authentication session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id
      });
      throw new Error('SESSION_CREATION_FAILED');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const refreshPayload = this.verifyRefreshToken(refreshToken);
      
      // Get session from database
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      
      const session = await UserSessionModel.findByRefreshTokenHash(refreshTokenHash);
      if (!session || !session.is_active) {
        throw new Error('INVALID_SESSION');
      }

      // Get user
      const user = await UserModel.findById(refreshPayload.userId);
      if (!user || !user.is_active) {
        throw new Error('USER_NOT_FOUND');
      }

      // Check if session is still valid
      if (new Date() > new Date(session.expires_at as unknown as string)) {
        await UserSessionModel.deactivate(session.id as string);
        throw new Error('SESSION_EXPIRED');
      }

      // Generate new tokens
      const newAccessPayload: JWTPayload = {
        userId: user.id as string,
        sessionId: refreshPayload.sessionId,
        role: user.role as string
      };

      const newRefreshPayload: RefreshTokenPayload = {
        userId: user.id as string,
        sessionId: refreshPayload.sessionId,
        tokenVersion: refreshPayload.tokenVersion + 1
      };

      const newAccessToken = this.generateAccessToken(newAccessPayload);
      const newRefreshToken = this.generateRefreshToken(newRefreshPayload);

      // Update session with new token hashes
      const newAccessTokenHash = crypto
        .createHash('sha256')
        .update(newAccessToken)
        .digest('hex');
      
      const newRefreshTokenHash = crypto
        .createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');

      // Update database session
      const newSessionData: { 
        user_id: string; 
        token_hash: string; 
        refresh_token_hash: string; 
        expires_at: Date;
        user_agent?: string;
        ip_address?: string;
      } = {
        user_id: user.id as string,
        token_hash: newAccessTokenHash,
        refresh_token_hash: newRefreshTokenHash,
        expires_at: session.expires_at as Date
      };
      
      if (session['user_agent']) {
        newSessionData.user_agent = session['user_agent'] as string;
      }
      
      if (ipAddress || session['ip_address']) {
        newSessionData.ip_address = ipAddress || session['ip_address'] as string;
      }
      
      await UserSessionModel.create(newSessionData);

      // Deactivate old session
      await UserSessionModel.deactivate(session.id as string);

      // Update Redis session
      await setSession(`session:${refreshPayload.sessionId}`, {
        userId: user.id as string,
        sessionId: refreshPayload.sessionId,
        role: user.role as string,
        accessTokenHash: newAccessTokenHash,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: session.expires_at
      }, 7 * 24 * 60 * 60);

      logger.info('Access token refreshed', {
        userId: user.id,
        sessionId: refreshPayload.sessionId,
        ipAddress
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Failed to refresh access token', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Validate session and get user
   */
  static async validateSession(accessToken: string): Promise<{
    user: User;
    session: UserSession | null;
  }> {
    try {
      // Verify access token
      const payload = this.verifyAccessToken(accessToken);
      
      // Check if session exists in Redis first (fast path)
      const redisSession = await getSession(`session:${payload.sessionId}`);
      if (!redisSession) {
        throw new Error('SESSION_NOT_FOUND');
      }

      // Verify token hash matches
      const accessTokenHash = crypto
        .createHash('sha256')
        .update(accessToken)
        .digest('hex');
      
      if ((redisSession as Record<string, unknown>)['accessTokenHash'] !== accessTokenHash) {
        throw new Error('INVALID_TOKEN_HASH');
      }

      // Get user
      const user = await UserModel.findById(payload.userId);
      if (!user || !user.is_active) {
        throw new Error('USER_NOT_FOUND');
      }

      // Get full session from database
      const session = await UserSessionModel.findByTokenHash(accessTokenHash);

      // Update session activity
      if (session) {
        await UserSessionModel.updateActivity(session.id as string);
      }

      return { user, session };
    } catch (error) {
      logger.debug('Session validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Revoke session (logout)
   */
  static async revokeSession(
    accessToken: string,
    userId?: string
  ): Promise<void> {
    try {
      let sessionId: string | undefined;
      
      if (accessToken) {
        const payload = this.verifyAccessToken(accessToken);
        sessionId = payload.sessionId;
        userId = payload.userId;
      } else if (!userId) {
        throw new Error('INSUFFICIENT_DATA');
      }
      
      if (!sessionId) {
        throw new Error('SESSION_ID_REQUIRED');
      }

      // Get session from Redis
      const redisSession = await getSession(`session:${sessionId}`);
      if (redisSession) {
        // Remove from Redis
        await deleteSession(`session:${sessionId}`);
        
        // Deactivate in database
        const accessTokenHash = crypto
          .createHash('sha256')
          .update(accessToken)
          .digest('hex');
        
        const session = await UserSessionModel.findByTokenHash(accessTokenHash);
        if (session) {
          await UserSessionModel.deactivate(session.id as string);
        }
      }

      logger.info('Session revoked', {
        userId,
        sessionId
      });
    } catch (error) {
      logger.error('Failed to revoke session', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Revoke all user sessions
   */
  static async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      // Deactivate all database sessions
      await UserSessionModel.deactivateAllUserSessions(userId);
      
      // Note: Redis sessions will expire naturally
      // In a production system, you'd want to track all session IDs
      // for immediate invalidation
      
      logger.info('All user sessions revoked', { userId });
    } catch (error) {
      logger.error('Failed to revoke all user sessions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Check if user account is locked
   */
  static async checkAccountLock(userId: string): Promise<boolean> {
    try {
      return await UserModel.isAccountLocked(userId);
    } catch (error) {
      logger.error('Failed to check account lock status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return false;
    }
  }

  /**
   * Handle failed login attempt
   */
  static async handleFailedLogin(userId: string): Promise<{
    attemptsRemaining: number;
    isLocked: boolean;
    lockDuration?: number;
  }> {
    try {
      await UserModel.incrementFailedAttempts(userId);
      
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const failedAttempts = user['failed_login_attempts'] as number;
      const attemptsRemaining = Math.max(0, this.MAX_FAILED_ATTEMPTS - failedAttempts);
      
      if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        await UserModel.lockAccount(userId, this.LOCKOUT_DURATION);
        
        logger.warn('User account locked due to failed login attempts', {
          userId,
          failedAttempts,
          lockDuration: this.LOCKOUT_DURATION
        });

        return {
          attemptsRemaining: 0,
          isLocked: true,
          lockDuration: this.LOCKOUT_DURATION
        };
      }

      return {
        attemptsRemaining,
        isLocked: false
      };
    } catch (error) {
      logger.error('Failed to handle failed login', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const cleanedCount = await UserSessionModel.cleanupExpiredSessions();
      
      if (cleanedCount > 0) {
        logger.info('Cleaned up expired sessions', { count: cleanedCount });
      }
      
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] || null;
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash password for storage
   */
  static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(password, hash);
  }
}