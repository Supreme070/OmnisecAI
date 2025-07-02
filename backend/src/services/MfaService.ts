import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { UserModel } from '@/models/User';
import { TokenService } from '@/services/TokenService';
import { setCache, getCache, deleteCache } from '@/config/redis';
import logger from '@/utils/logger';
import config from '@/config';

export class MfaService {
  private static readonly TOTP_WINDOW = 1; // Allow 1 time step before/after current
  private static readonly BACKUP_CODE_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;
  private static readonly MFA_SETUP_EXPIRY = 10 * 60; // 10 minutes
  private static readonly RATE_LIMIT_WINDOW = 15 * 60; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;

  /**
   * Generate MFA secret and setup data for a user
   */
  static async generateMfaSetup(userId: string, userEmail: string): Promise<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
    setupToken: string;
  }> {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${userEmail} (OmnisecAI)`,
        issuer: 'OmnisecAI',
        length: 32
      });

      if (!secret.base32) {
        throw new Error('Failed to generate MFA secret');
      }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');

      // Create setup token for temporary storage
      const setupToken = await TokenService.createMfaSetupToken(userId, secret.base32);

      // Store backup codes temporarily
      await setCache(`mfa_backup_codes:${setupToken}`, backupCodes, this.MFA_SETUP_EXPIRY);

      logger.info('MFA setup generated', {
        userId,
        email: userEmail.replace(/(.{3}).*(@.*)/, '$1***$2')
      });

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        setupToken
      };
    } catch (error) {
      logger.error('Failed to generate MFA setup', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw new Error('MFA_SETUP_GENERATION_FAILED');
    }
  }

  /**
   * Verify MFA setup with TOTP code
   */
  static async verifyMfaSetup(
    setupToken: string,
    totpCode: string,
    userId: string
  ): Promise<{ backupCodes: string[] }> {
    try {
      // Verify setup token
      const { userId: tokenUserId, secret } = await TokenService.verifyMfaSetupToken(setupToken);
      
      if (tokenUserId !== userId) {
        throw new Error('INVALID_SETUP_TOKEN');
      }

      // Verify TOTP code
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: totpCode,
        window: this.TOTP_WINDOW
      });

      if (!isValid) {
        throw new Error('INVALID_TOTP_CODE');
      }

      // Get backup codes
      const backupCodes = await getCache(`mfa_backup_codes:${setupToken}`) as string[];
      if (!backupCodes) {
        throw new Error('BACKUP_CODES_NOT_FOUND');
      }

      // Enable MFA for user
      await UserModel.enableMFA(userId, secret, backupCodes);

      // Clean up temporary data
      await Promise.all([
        TokenService.revokeMfaSetupToken(setupToken),
        deleteCache(`mfa_backup_codes:${setupToken}`)
      ]);

      logger.info('MFA enabled successfully', { userId });

      return { backupCodes };
    } catch (error) {
      logger.warn('MFA setup verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        setupToken: setupToken.substring(0, 8) + '***'
      });
      throw error;
    }
  }

  /**
   * Verify TOTP code for authentication
   */
  static async verifyTotpCode(userId: string, totpCode: string, ipAddress?: string): Promise<boolean> {
    try {
      // Check rate limiting
      const rateLimitKey = `mfa_attempts:${userId}:${ipAddress || 'unknown'}`;
      const attempts = await this.getRateLimitAttempts(rateLimitKey);
      
      if (attempts >= this.MAX_ATTEMPTS) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Get user MFA secret
      const user = await UserModel.findById(userId);
      if (!user || !user.mfa_enabled || !user.mfa_secret) {
        throw new Error('MFA_NOT_ENABLED');
      }

      // Verify TOTP code
      const isValid = speakeasy.totp.verify({
        secret: user.mfa_secret as string,
        encoding: 'base32',
        token: totpCode,
        window: this.TOTP_WINDOW
      });

      if (isValid) {
        // Clear rate limiting on success
        await deleteCache(rateLimitKey);
        
        logger.info('TOTP verification successful', {
          userId,
          ipAddress
        });
        
        return true;
      } else {
        // Increment failed attempts
        await this.incrementRateLimitAttempts(rateLimitKey);
        
        logger.warn('TOTP verification failed', {
          userId,
          ipAddress,
          attempts: attempts + 1
        });
        
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'RATE_LIMIT_EXCEEDED' && error.message !== 'MFA_NOT_ENABLED') {
        // Increment attempts for other errors too
        const rateLimitKey = `mfa_attempts:${userId}:${ipAddress || 'unknown'}`;
        await this.incrementRateLimitAttempts(rateLimitKey);
      }
      
      logger.error('TOTP verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ipAddress
      });
      
      throw error;
    }
  }

  /**
   * Verify backup code for authentication
   */
  static async verifyBackupCode(userId: string, backupCode: string, ipAddress?: string): Promise<boolean> {
    try {
      // Check rate limiting
      const rateLimitKey = `mfa_backup_attempts:${userId}:${ipAddress || 'unknown'}`;
      const attempts = await this.getRateLimitAttempts(rateLimitKey);
      
      if (attempts >= this.MAX_ATTEMPTS) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      // Get user backup codes
      const user = await UserModel.findById(userId);
      if (!user || !user.mfa_enabled) {
        throw new Error('MFA_NOT_ENABLED');
      }

      const backupCodes = user['mfa_backup_codes'] as string[] || [];
      
      // Check if backup code exists and hasn't been used
      const codeIndex = backupCodes.indexOf(backupCode.toUpperCase());
      if (codeIndex === -1) {
        // Increment failed attempts
        await this.incrementRateLimitAttempts(rateLimitKey);
        
        logger.warn('Backup code verification failed', {
          userId,
          ipAddress,
          attempts: attempts + 1
        });
        
        return false;
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await UserModel.enableMFA(userId, user.mfa_secret as string, backupCodes);

      // Clear rate limiting on success
      await deleteCache(rateLimitKey);

      logger.info('Backup code verification successful', {
        userId,
        ipAddress,
        remainingCodes: backupCodes.length
      });

      return true;
    } catch (error) {
      if (error instanceof Error && error.message !== 'RATE_LIMIT_EXCEEDED' && error.message !== 'MFA_NOT_ENABLED') {
        // Increment attempts for other errors too
        const rateLimitKey = `mfa_backup_attempts:${userId}:${ipAddress || 'unknown'}`;
        await this.incrementRateLimitAttempts(rateLimitKey);
      }
      
      logger.error('Backup code verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        ipAddress
      });
      
      throw error;
    }
  }

  /**
   * Disable MFA for user
   */
  static async disableMfa(userId: string, totpCode: string): Promise<void> {
    try {
      // Verify current TOTP code to ensure user has access
      const isValid = await this.verifyTotpCode(userId, totpCode);
      if (!isValid) {
        throw new Error('INVALID_TOTP_CODE');
      }

      // Disable MFA
      await UserModel.disableMFA(userId);

      // Clear any MFA-related cache
      // Note: In a production Redis setup, you'd want to use SCAN with patterns
      // to find and delete all keys matching mfa_attempts:${userId}:* and 
      // mfa_backup_attempts:${userId}:* patterns
      
      logger.info('MFA disabled successfully', { userId });
    } catch (error) {
      logger.error('Failed to disable MFA', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId: string, totpCode: string): Promise<string[]> {
    try {
      // Verify current TOTP code
      const isValid = await this.verifyTotpCode(userId, totpCode);
      if (!isValid) {
        throw new Error('INVALID_TOTP_CODE');
      }

      // Get user
      const user = await UserModel.findById(userId);
      if (!user || !user.mfa_enabled) {
        throw new Error('MFA_NOT_ENABLED');
      }

      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes();

      // Update user with new backup codes
      await UserModel.enableMFA(userId, user.mfa_secret as string, newBackupCodes);

      logger.info('New backup codes generated', { userId });

      return newBackupCodes;
    } catch (error) {
      logger.error('Failed to generate new backup codes', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Get MFA status for user
   */
  static async getMfaStatus(userId: string): Promise<{
    enabled: boolean;
    backupCodesRemaining: number;
  }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const backupCodes = user['mfa_backup_codes'] as string[] || [];

      return {
        enabled: user.mfa_enabled || false,
        backupCodesRemaining: backupCodes.length
      };
    } catch (error) {
      logger.error('Failed to get MFA status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      // Generate a random code with letters and numbers
      const code = crypto.randomBytes(this.BACKUP_CODE_LENGTH / 2).toString('hex').toUpperCase();
      // Format as XXXX-XXXX
      const formattedCode = `${code.substring(0, 4)}-${code.substring(4, 8)}`;
      codes.push(formattedCode);
    }
    
    return codes;
  }

  /**
   * Get rate limit attempts for a key
   */
  private static async getRateLimitAttempts(key: string): Promise<number> {
    try {
      const attempts = await getCache(key) as number;
      return attempts || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Increment rate limit attempts
   */
  private static async incrementRateLimitAttempts(key: string): Promise<void> {
    try {
      const current = await this.getRateLimitAttempts(key);
      await setCache(key, current + 1, this.RATE_LIMIT_WINDOW);
    } catch (error) {
      logger.error('Failed to increment rate limit attempts', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      });
    }
  }

  /**
   * Check if user requires MFA verification
   */
  static async requiresMfaVerification(userId: string): Promise<boolean> {
    try {
      const user = await UserModel.findById(userId);
      return user?.mfa_enabled || false;
    } catch {
      return false;
    }
  }

  /**
   * Generate current TOTP for testing (development only)
   */
  static async generateCurrentTotp(userId: string): Promise<string> {
    if (config.env !== 'development') {
      throw new Error('TOTP generation only available in development');
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user || !user.mfa_enabled || !user.mfa_secret) {
        throw new Error('MFA_NOT_ENABLED');
      }

      const token = speakeasy.totp({
        secret: user.mfa_secret as string,
        encoding: 'base32'
      });

      return token;
    } catch (error) {
      logger.error('Failed to generate current TOTP', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }
}