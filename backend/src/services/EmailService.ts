import nodemailer from 'nodemailer';
import config from '@/config';
import logger from '@/utils/logger';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  /**
   * Initialize email transporter
   */
  static async initialize(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure, // true for 465, false for other ports
        auth: {
          user: config.email.auth.user,
          pass: config.email.auth.pass
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates in development
        }
      });

      // Verify connection configuration
      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.warn('Email service initialization failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // In development, continue without email service
      if (config.env === 'development') {
        logger.info('Running in development mode without email service');
      } else {
        throw error;
      }
    }
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(
    email: string,
    username: string,
    verificationToken: string
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping email verification send');
      return;
    }

    try {
      const verificationUrl = `${config.cors_origin}/verify-email/${verificationToken}`;
      
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'OmnisecAI - Email Verification',
        html: this.getEmailVerificationTemplate(username, verificationUrl)
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Email verification sent', {
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        username
      });
    } catch (error) {
      logger.error('Failed to send email verification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2')
      });
      throw new Error('EMAIL_SEND_FAILED');
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(
    email: string,
    username: string,
    resetToken: string
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping password reset send');
      return;
    }

    try {
      const resetUrl = `${config.cors_origin}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'OmnisecAI - Password Reset',
        html: this.getPasswordResetTemplate(username, resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Password reset email sent', {
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        username
      });
    } catch (error) {
      logger.error('Failed to send password reset email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2')
      });
      throw new Error('EMAIL_SEND_FAILED');
    }
  }

  /**
   * Send email change verification
   */
  static async sendEmailChangeVerification(
    email: string,
    username: string,
    verificationToken: string
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping email change verification send');
      return;
    }

    try {
      const verificationUrl = `${config.cors_origin}/verify-email-change/${verificationToken}`;
      
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'OmnisecAI - Email Change Verification',
        html: this.getEmailChangeTemplate(username, verificationUrl)
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Email change verification sent', {
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        username
      });
    } catch (error) {
      logger.error('Failed to send email change verification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2')
      });
      throw new Error('EMAIL_SEND_FAILED');
    }
  }

  /**
   * Send security alert email
   */
  static async sendSecurityAlert(
    email: string,
    username: string,
    alertType: string,
    alertDetails: Record<string, unknown>
  ): Promise<void> {
    if (!this.transporter) {
      logger.warn('Email service not available, skipping security alert send');
      return;
    }

    try {
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: `OmnisecAI - Security Alert: ${alertType}`,
        html: this.getSecurityAlertTemplate(username, alertType, alertDetails)
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Security alert email sent', {
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        username,
        alertType
      });
    } catch (error) {
      logger.error('Failed to send security alert email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: email.replace(/(.{3}).*(@.*)/, '$1***$2'),
        alertType
      });
      // Don't throw error for security alerts to avoid disrupting the main flow
    }
  }

  /**
   * Email verification template
   */
  private static getEmailVerificationTemplate(username: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - OmnisecAI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ OmnisecAI</h1>
            <h2>Email Verification</h2>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <p>Thank you for registering with OmnisecAI! To complete your registration and start securing your AI models, please verify your email address.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with OmnisecAI, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 OmnisecAI. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password reset template
   */
  private static getPasswordResetTemplate(username: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - OmnisecAI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ OmnisecAI</h1>
            <h2>Password Reset</h2>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <p>We received a request to reset your password for your OmnisecAI account.</p>
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and consider changing your password immediately.</p>
            </div>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
          </div>
          <div class="footer">
            <p>© 2024 OmnisecAI. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email change verification template
   */
  private static getEmailChangeTemplate(username: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Change Verification - OmnisecAI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #f39c12; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ OmnisecAI</h1>
            <h2>Email Change Verification</h2>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <p>You requested to change your email address for your OmnisecAI account. To complete this change, please verify this new email address.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify New Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't request this email change, please ignore this email and contact support immediately.</p>
          </div>
          <div class="footer">
            <p>© 2024 OmnisecAI. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Security alert template
   */
  private static getSecurityAlertTemplate(
    username: string, 
    alertType: string, 
    alertDetails: Record<string, unknown>
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert - OmnisecAI</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert { background: #ffebee; border: 1px solid #f8d7da; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ OmnisecAI</h1>
            <h2>🚨 Security Alert</h2>
          </div>
          <div class="content">
            <p>Hello ${username},</p>
            <div class="alert">
              <p><strong>Alert Type:</strong> ${alertType}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              ${Object.entries(alertDetails).map(([key, value]) => 
                `<p><strong>${key}:</strong> ${value}</p>`
              ).join('')}
            </div>
            <p>If this activity was not authorized by you, please:</p>
            <ul>
              <li>Change your password immediately</li>
              <li>Review your account activity</li>
              <li>Contact our support team</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 OmnisecAI. All rights reserved.</p>
            <p>This is an automated security message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}