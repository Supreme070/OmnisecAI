import { WebSocketService, NotificationData } from '@/services/WebSocketService';
import { ModelScan, ThreatDetection } from '@/types';
import logger from '@/utils/logger';
import crypto from 'crypto';

/**
 * Utility functions for sending notifications via WebSocket
 */
export class NotificationUtils {

  /**
   * Send scan completion notification
   */
  static async sendScanCompleteNotification(scan: ModelScan): Promise<void> {
    try {
      const threatCount = Array.isArray(scan.threat_detections) ? scan.threat_detections.length : 0;
      const hasThreats = threatCount > 0;
      
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'scan_complete',
        title: hasThreats ? 'Security Scan Complete - Threats Detected' : 'Security Scan Complete',
        message: hasThreats 
          ? `Scan of ${scan.filename} completed with ${threatCount} threat(s) detected.`
          : `Scan of ${scan.filename} completed successfully. No threats detected.`,
        severity: hasThreats ? 'warning' : 'info',
        data: {
          scanId: scan.id,
          filename: scan.filename,
          fileSize: scan.file_size,
          threatCount,
          scanStatus: scan.scan_status,
          scanResults: scan.scan_results
        },
        timestamp: new Date().toISOString(),
        userId: scan.user_id as string,
        requiresAction: hasThreats
      };

      await WebSocketService.sendNotificationToUser(scan.user_id as string, notification);

      logger.info('Scan completion notification sent', {
        scanId: scan.id,
        userId: scan.user_id,
        filename: scan.filename,
        threatCount,
        notificationId: notification.id
      });
    } catch (error) {
      logger.error('Failed to send scan completion notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId: scan.id,
        userId: scan.user_id
      });
    }
  }

  /**
   * Send scan failure notification
   */
  static async sendScanFailureNotification(scan: ModelScan, errorMessage?: string): Promise<void> {
    try {
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'scan_failed',
        title: 'Security Scan Failed',
        message: `Scan of ${scan.filename} failed. ${errorMessage || 'Please try uploading the file again.'}`,
        severity: 'error',
        data: {
          scanId: scan.id,
          filename: scan.filename,
          fileSize: scan.file_size,
          errorMessage,
          scanStatus: scan.scan_status
        },
        timestamp: new Date().toISOString(),
        userId: scan.user_id as string,
        requiresAction: true
      };

      await WebSocketService.sendNotificationToUser(scan.user_id as string, notification);

      logger.info('Scan failure notification sent', {
        scanId: scan.id,
        userId: scan.user_id,
        filename: scan.filename,
        errorMessage,
        notificationId: notification.id
      });
    } catch (error) {
      logger.error('Failed to send scan failure notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId: scan.id,
        userId: scan.user_id
      });
    }
  }

  /**
   * Send threat detection notification
   */
  static async sendThreatDetectedNotification(
    scan: ModelScan, 
    threat: ThreatDetection
  ): Promise<void> {
    try {
      const severity = this.mapThreatSeverity(threat.confidence_score);
      
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'threat_detected',
        title: `${threat.threat_type.toUpperCase()} Threat Detected`,
        message: `A ${threat.threat_type} threat was detected in ${scan.filename}. Confidence: ${Math.round(threat.confidence_score * 100)}%`,
        severity,
        data: {
          scanId: scan.id,
          filename: scan.filename,
          threatType: threat.threat_type,
          confidenceScore: threat.confidence_score,
          threatDescription: threat.description,
          threatId: threat.id,
          threatMetadata: threat.metadata
        },
        timestamp: new Date().toISOString(),
        userId: scan.user_id as string,
        requiresAction: severity === 'error' || severity === 'critical'
      };

      await WebSocketService.sendNotificationToUser(scan.user_id as string, notification);

      logger.warn('Threat detection notification sent', {
        scanId: scan.id,
        userId: scan.user_id,
        filename: scan.filename,
        threatType: threat.threat_type,
        confidenceScore: threat.confidence_score,
        notificationId: notification.id
      });
    } catch (error) {
      logger.error('Failed to send threat detection notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId: scan.id,
        userId: scan.user_id,
        threatId: threat.id
      });
    }
  }

  /**
   * Send security event notification
   */
  static async sendSecurityEventNotification(
    userId: string,
    eventType: string,
    description: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'warning',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'security_event',
        title: `Security Event: ${eventType}`,
        message: description,
        severity,
        data: {
          eventType,
          metadata: metadata || {}
        },
        timestamp: new Date().toISOString(),
        userId,
        requiresAction: severity === 'error' || severity === 'critical'
      };

      await WebSocketService.sendNotificationToUser(userId, notification);

      logger.info('Security event notification sent', {
        userId,
        eventType,
        severity,
        notificationId: notification.id
      });
    } catch (error) {
      logger.error('Failed to send security event notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        eventType
      });
    }
  }

  /**
   * Send system alert notification (broadcast)
   */
  static async sendSystemAlert(
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'system_alert',
        title,
        message,
        severity,
        data: metadata || {},
        timestamp: new Date().toISOString(),
        requiresAction: severity === 'error' || severity === 'critical'
      };

      await WebSocketService.broadcastSystemNotification(notification);

      logger.info('System alert broadcasted', {
        title,
        severity,
        notificationId: notification.id,
        connectedUsers: WebSocketService.getConnectedUsersCount()
      });
    } catch (error) {
      logger.error('Failed to send system alert', {
        error: error instanceof Error ? error.message : 'Unknown error',
        title,
        severity
      });
    }
  }

  /**
   * Send file quarantine notification
   */
  static async sendFileQuarantineNotification(
    scan: ModelScan,
    quarantineReason: string
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'security_event',
        title: 'File Quarantined',
        message: `File ${scan.filename} has been quarantined due to security concerns: ${quarantineReason}`,
        severity: 'critical',
        data: {
          scanId: scan.id,
          filename: scan.filename,
          quarantineReason,
          scanStatus: scan.scan_status
        },
        timestamp: new Date().toISOString(),
        userId: scan.user_id as string,
        requiresAction: true
      };

      await WebSocketService.sendNotificationToUser(scan.user_id as string, notification);

      logger.warn('File quarantine notification sent', {
        scanId: scan.id,
        userId: scan.user_id,
        filename: scan.filename,
        quarantineReason,
        notificationId: notification.id
      });
    } catch (error) {
      logger.error('Failed to send file quarantine notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId: scan.id,
        userId: scan.user_id
      });
    }
  }

  /**
   * Send authentication event notification
   */
  static async sendAuthEventNotification(
    userId: string,
    eventType: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'mfa_enabled',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const eventMessages = {
        login: 'Successful login to your account',
        logout: 'Logout from your account',
        failed_login: 'Failed login attempt detected',
        password_reset: 'Password reset completed',
        mfa_enabled: 'Multi-factor authentication enabled'
      };

      const severity: 'info' | 'warning' = eventType === 'failed_login' ? 'warning' : 'info';

      const notification: NotificationData = {
        id: crypto.randomUUID(),
        type: 'security_event',
        title: `Account Security: ${eventType.replace('_', ' ').toUpperCase()}`,
        message: eventMessages[eventType],
        severity,
        data: {
          eventType,
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        userId,
        requiresAction: eventType === 'failed_login'
      };

      await WebSocketService.sendNotificationToUser(userId, notification);

      logger.debug('Auth event notification sent', {
        userId,
        eventType,
        ipAddress,
        notificationId: notification.id
      });
    } catch (error) {
      logger.error('Failed to send auth event notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        eventType
      });
    }
  }

  /**
   * Map threat confidence score to notification severity
   */
  private static mapThreatSeverity(confidenceScore: number): 'info' | 'warning' | 'error' | 'critical' {
    if (confidenceScore >= 0.9) return 'critical';
    if (confidenceScore >= 0.7) return 'error';
    if (confidenceScore >= 0.5) return 'warning';
    return 'info';
  }

  /**
   * Check if user is connected before sending notification
   */
  static async isUserConnectedForNotification(userId: string): Promise<boolean> {
    try {
      return await WebSocketService.isUserConnected(userId);
    } catch (error) {
      logger.warn('Failed to check user connection status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return false;
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  static async sendBulkNotifications(
    userIds: string[],
    notification: Omit<NotificationData, 'id' | 'userId' | 'timestamp'>
  ): Promise<void> {
    try {
      const promises = userIds.map(async (userId) => {
        const userNotification: NotificationData = {
          ...notification,
          id: crypto.randomUUID(),
          userId,
          timestamp: new Date().toISOString()
        };

        return WebSocketService.sendNotificationToUser(userId, userNotification);
      });

      await Promise.allSettled(promises);

      logger.info('Bulk notifications sent', {
        userCount: userIds.length,
        notificationType: notification.type,
        title: notification.title
      });
    } catch (error) {
      logger.error('Failed to send bulk notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userCount: userIds.length,
        notificationType: notification.type
      });
    }
  }
}