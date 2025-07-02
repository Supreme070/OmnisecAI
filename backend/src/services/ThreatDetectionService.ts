import { ThreatMonitorModel, ThreatMonitorRecord } from '@/models/ThreatMonitor';
import { NotificationUtils } from '@/utils/notifications';
import { WebSocketService } from '@/services/WebSocketService';
import { setCache } from '@/config/redis';
import logger from '@/utils/logger';
import { ThreatDetection, ModelScan, NotificationData } from '@/types';
import crypto from 'crypto';

export interface ThreatAlert {
  id: string;
  threatId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  actionRequired: boolean;
  alertType: 'new_threat' | 'escalation' | 'pattern_detected' | 'mass_incident';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface ThreatIntelligence {
  threatType: string;
  confidence: number;
  sources: string[];
  indicators: string[];
  recommendations: string[];
  lastUpdated: Date;
}

export class ThreatDetectionService {
  private static readonly CACHE_TTL = 30 * 60; // 30 minutes
  private static readonly MASS_INCIDENT_THRESHOLD = 5; // 5 similar threats
  private static readonly ESCALATION_TIME_WINDOW = 60 * 60 * 1000; // 1 hour
  
  private static alertQueue = new Map<string, ThreatAlert>();
  private static isProcessingAlerts = false;

  /**
   * Process threat detection from model scan
   */
  static async processThreatFromScan(
    scan: ModelScan,
    threats: ThreatDetection[]
  ): Promise<ThreatMonitorRecord[]> {
    const threatRecords: ThreatMonitorRecord[] = [];

    try {
      for (const threat of threats) {
        // Create threat monitor record
        const threatRecord = await ThreatMonitorModel.create({
          threat_id: threat.id as string,
          user_id: scan.user_id as string,
          threat_type: threat.threat_type,
          severity: this.mapConfidenceToSeverity(threat.confidence_score),
          confidence_score: threat.confidence_score,
          source_type: 'model_scan',
          source_id: scan.id as string,
          detection_method: 'AI Model Vulnerability Scanner',
          indicators: {
            filename: scan.filename,
            fileSize: scan.file_size,
            fileHash: scan.file_hash,
            scanId: scan.id,
            threatMetadata: threat.metadata
          },
          metadata: {
            scanTimestamp: new Date().toISOString(),
            modelFormat: this.getFileExtension(scan.filename),
            threatDescription: threat.description,
            detectionContext: 'automated_scan'
          }
        });

        threatRecords.push(threatRecord);

        // Generate alert if high severity
        if (threatRecord.severity === 'high' || threatRecord.severity === 'critical') {
          await this.generateThreatAlert(threatRecord);
        }

        // Check for threat patterns
        await this.analyzeForPatterns(threatRecord);

        logger.info('Threat processed from scan', {
          threatId: threatRecord.threat_id,
          scanId: scan.id,
          threatType: threat.threat_type,
          severity: threatRecord.severity,
          confidence: threat.confidence_score
        });
      }

      // Check for mass incidents
      if (threats.length > 1) {
        await this.checkMassIncident(scan.user_id as string, threatRecords);
      }

      return threatRecords;

    } catch (error) {
      logger.error('Failed to process threats from scan', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        threatCount: threats.length
      });
      return threatRecords;
    }
  }

  /**
   * Manually report a threat
   */
  static async reportThreat(
    userId: string,
    threatData: {
      threatType: 'malware' | 'phishing' | 'data_leak' | 'backdoor' | 'adversarial' | 'privacy_violation';
      description: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      indicators: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }
  ): Promise<ThreatMonitorRecord> {
    try {
      const threatRecord = await ThreatMonitorModel.create({
        user_id: userId,
        threat_type: threatData.threatType,
        severity: threatData.severity || 'medium',
        confidence_score: 0.5, // Manual reports get medium confidence
        source_type: 'user_report',
        detection_method: 'Manual User Report',
        indicators: threatData.indicators,
        metadata: {
          ...threatData.metadata,
          reportedAt: new Date().toISOString(),
          reportType: 'manual',
          description: threatData.description
        }
      });

      // Send notification to security team
      await this.notifySecurityTeam(threatRecord, 'user_report');

      logger.info('Manual threat report created', {
        threatId: threatRecord.threat_id,
        userId,
        threatType: threatData.threatType,
        severity: threatRecord.severity
      });

      return threatRecord;

    } catch (error) {
      logger.error('Failed to create manual threat report', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        threatType: threatData.threatType
      });
      throw error;
    }
  }

  /**
   * Update threat status
   */
  static async updateThreatStatus(
    threatId: string,
    status: 'detected' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed',
    updatedBy: string,
    resolutionNotes?: string
  ): Promise<ThreatMonitorRecord | null> {
    try {
      const threatRecord = await ThreatMonitorModel.update(threatId, {
        status,
        ...(status === 'resolved' || status === 'false_positive' ? { resolved_by: updatedBy } : {}),
        ...(resolutionNotes ? { resolution_notes: resolutionNotes } : {})
      });

      if (threatRecord) {
        // Send status update notification
        await this.sendStatusUpdateNotification(threatRecord, updatedBy);

        // Update cache
        await this.cacheThreatRecord(threatRecord);

        logger.info('Threat status updated', {
          threatId,
          newStatus: status,
          updatedBy,
          previousStatus: 'unknown'
        });
      }

      return threatRecord;

    } catch (error) {
      logger.error('Failed to update threat status', {
        threatId,
        status,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get active threats dashboard
   */
  static async getActiveThreatsDashboard(userId?: string): Promise<{
    criticalThreats: ThreatMonitorRecord[];
    highThreats: ThreatMonitorRecord[];
    recentThreats: ThreatMonitorRecord[];
    statistics: {
      total: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      byStatus: Record<string, number>;
    };
    trends: Array<{ date: string; count: number; severity: string }>;
  }> {
    try {
      // Get critical and high severity threats
      const criticalThreats = await ThreatMonitorModel.getActiveThreats({
        ...(userId ? { userId } : {}),
        severity: 'critical',
        limit: 10
      });

      const highThreats = await ThreatMonitorModel.getActiveThreats({
        ...(userId ? { userId } : {}),
        severity: 'high',
        limit: 20
      });

      // Get recent threats (last 24 hours)
      const recentThreats = await ThreatMonitorModel.list({
        ...(userId ? { userId } : {}),
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      // Get statistics
      const stats = await ThreatMonitorModel.getStats({
        ...(userId ? { userId } : {}),
        timeRange: 'week'
      });

      return {
        criticalThreats,
        highThreats,
        recentThreats: recentThreats.threats,
        statistics: {
          total: stats.totalThreats,
          byType: stats.threatsByType,
          bySeverity: stats.threatsBySeverity,
          byStatus: stats.threatsByStatus
        },
        trends: stats.recentTrends
      };

    } catch (error) {
      logger.error('Failed to get active threats dashboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Search threats with advanced filtering
   */
  static async searchThreats(
    searchParams: {
      query?: string;
      userId?: string;
      threatType?: string;
      severity?: string;
      status?: string;
      sourceType?: string;
      minConfidence?: number;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    threats: ThreatMonitorRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const page = searchParams.page || 1;
      const limit = searchParams.limit || 20;
      const offset = (page - 1) * limit;

      let result;

      if (searchParams.query) {
        // Text search
        result = await ThreatMonitorModel.search(searchParams.query, {
          ...(searchParams.userId ? { userId: searchParams.userId } : {}),
          limit,
          offset
        });
      } else {
        // Filtered search
        result = await ThreatMonitorModel.list({
          ...(searchParams.userId ? { userId: searchParams.userId } : {}),
          ...(searchParams.threatType ? { threatType: searchParams.threatType } : {}),
          ...(searchParams.severity ? { severity: searchParams.severity } : {}),
          ...(searchParams.status ? { status: searchParams.status } : {}),
          ...(searchParams.sourceType ? { sourceType: searchParams.sourceType } : {}),
          ...(searchParams.minConfidence !== undefined ? { minConfidence: searchParams.minConfidence } : {}),
          ...(searchParams.startDate ? { startDate: searchParams.startDate } : {}),
          ...(searchParams.endDate ? { endDate: searchParams.endDate } : {}),
          limit,
          offset
        });
      }

      return {
        threats: result.threats,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit)
      };

    } catch (error) {
      logger.error('Failed to search threats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        searchParams
      });
      throw error;
    }
  }

  /**
   * Generate threat intelligence report
   */
  static async generateThreatIntelligence(
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<ThreatIntelligence[]> {
    try {
      const stats = await ThreatMonitorModel.getStats({ timeRange });
      const intelligence: ThreatIntelligence[] = [];

      for (const [threatType, count] of Object.entries(stats.threatsByType)) {
        if (count > 0) {
          const threatIntel: ThreatIntelligence = {
            threatType,
            confidence: Math.min(count / 10, 1.0), // Scale based on frequency
            sources: ['internal_scanning', 'user_reports'],
            indicators: await this.getThreatIndicators(threatType),
            recommendations: await this.getThreatRecommendations(threatType),
            lastUpdated: new Date()
          };

          intelligence.push(threatIntel);
        }
      }

      // Cache intelligence data
      await setCache('threat_intelligence', intelligence, this.CACHE_TTL);

      return intelligence;

    } catch (error) {
      logger.error('Failed to generate threat intelligence', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeRange
      });
      return [];
    }
  }

  /**
   * Process alert queue
   */
  static async processAlertQueue(): Promise<void> {
    if (this.isProcessingAlerts || this.alertQueue.size === 0) {
      return;
    }

    this.isProcessingAlerts = true;

    try {
      const alerts = Array.from(this.alertQueue.values());
      this.alertQueue.clear();

      for (const alert of alerts) {
        await this.sendThreatAlert(alert);
      }

      logger.debug('Processed threat alert queue', { alertCount: alerts.length });

    } catch (error) {
      logger.error('Failed to process alert queue', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      this.isProcessingAlerts = false;
    }
  }

  /**
   * Start background monitoring
   */
  static startMonitoring(): void {
    // Process alert queue every 10 seconds
    setInterval(() => {
      void this.processAlertQueue();
    }, 10000);

    // Generate threat intelligence every hour
    setInterval(() => {
      void this.generateThreatIntelligence();
    }, 60 * 60 * 1000);

    logger.info('Threat detection monitoring started');
  }

  /**
   * Map confidence score to severity
   */
  private static mapConfidenceToSeverity(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Generate threat alert
   */
  private static async generateThreatAlert(threat: ThreatMonitorRecord): Promise<void> {
    try {
      const alert: ThreatAlert = {
        id: crypto.randomUUID(),
        threatId: threat.threat_id,
        severity: threat.severity,
        title: `${threat.threat_type.toUpperCase()} Threat Detected`,
        description: `A ${threat.severity} severity ${threat.threat_type} threat has been detected with ${Math.round(threat.confidence_score * 100)}% confidence.`,
        affectedUsers: [threat.user_id],
        actionRequired: threat.severity === 'critical' || threat.severity === 'high',
        alertType: 'new_threat',
        metadata: {
          threatType: threat.threat_type,
          confidence: threat.confidence_score,
          detectionMethod: threat.detection_method,
          sourceType: threat.source_type,
          indicators: threat.indicators
        },
        createdAt: new Date()
      };

      // Add to alert queue
      this.alertQueue.set(alert.id, alert);

      logger.debug('Threat alert generated', {
        alertId: alert.id,
        threatId: threat.threat_id,
        severity: threat.severity
      });

    } catch (error) {
      logger.error('Failed to generate threat alert', {
        threatId: threat.threat_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Analyze for threat patterns
   */
  private static async analyzeForPatterns(threat: ThreatMonitorRecord): Promise<void> {
    try {
      // Check for similar threats in the last hour
      const similarThreats = await ThreatMonitorModel.list({
        threatType: threat.threat_type,
        startDate: new Date(Date.now() - this.ESCALATION_TIME_WINDOW),
        status: 'detected'
      });

      if (similarThreats.threats.length >= 3) {
        const alert: ThreatAlert = {
          id: crypto.randomUUID(),
          threatId: threat.threat_id,
          severity: 'high',
          title: 'Threat Pattern Detected',
          description: `Multiple ${threat.threat_type} threats detected in the last hour. Possible coordinated attack.`,
          affectedUsers: Array.from(new Set(similarThreats.threats.map(t => t.user_id))),
          actionRequired: true,
          alertType: 'pattern_detected',
          metadata: {
            patternType: threat.threat_type,
            count: similarThreats.threats.length,
            timeWindow: '1 hour',
            threatIds: similarThreats.threats.map(t => t.threat_id)
          },
          createdAt: new Date()
        };

        this.alertQueue.set(alert.id, alert);
      }

    } catch (error) {
      logger.error('Failed to analyze threat patterns', {
        threatId: threat.threat_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check for mass incident
   */
  private static async checkMassIncident(userId: string, threats: ThreatMonitorRecord[]): Promise<void> {
    if (threats.length < this.MASS_INCIDENT_THRESHOLD) {
      return;
    }

    try {
      const alert: ThreatAlert = {
        id: crypto.randomUUID(),
        threatId: threats[0]?.threat_id || '',
        severity: 'critical',
        title: 'Mass Security Incident',
        description: `${threats.length} threats detected simultaneously from single source. Immediate attention required.`,
        affectedUsers: [userId],
        actionRequired: true,
        alertType: 'mass_incident',
        metadata: {
          threatCount: threats.length,
          threatTypes: Array.from(new Set(threats.map(t => t.threat_type))),
          severities: Array.from(new Set(threats.map(t => t.severity))),
          threatIds: threats.map(t => t.threat_id)
        },
        createdAt: new Date()
      };

      this.alertQueue.set(alert.id, alert);

    } catch (error) {
      logger.error('Failed to check mass incident', {
        userId,
        threatCount: threats.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send threat alert via WebSocket
   */
  private static async sendThreatAlert(alert: ThreatAlert): Promise<void> {
    try {
      const notification: NotificationData = {
        id: alert.id,
        type: 'threat_detected',
        title: alert.title,
        message: alert.description,
        severity: alert.severity === 'critical' ? 'critical' : 
                  alert.severity === 'high' ? 'error' : 'warning',
        data: alert.metadata,
        timestamp: alert.createdAt.toISOString(),
        requiresAction: alert.actionRequired
      };

      // Send to affected users
      for (const userId of alert.affectedUsers) {
        notification.userId = userId;
        await WebSocketService.sendNotificationToUser(userId, notification);
      }

      // Send to security team (admin users)
      await this.notifySecurityTeam(null, 'threat_alert', notification);

      logger.info('Threat alert sent', {
        alertId: alert.id,
        threatId: alert.threatId,
        affectedUsers: alert.affectedUsers.length,
        alertType: alert.alertType
      });

    } catch (error) {
      logger.error('Failed to send threat alert', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send status update notification
   */
  private static async sendStatusUpdateNotification(
    threat: ThreatMonitorRecord, 
    updatedBy: string
  ): Promise<void> {
    try {
      await NotificationUtils.sendSecurityEventNotification(
        threat.user_id,
        'threat_status_update',
        `Threat ${threat.threat_id} status updated to ${threat.status}`,
        'info',
        {
          threatId: threat.threat_id,
          newStatus: threat.status,
          updatedBy,
          threatType: threat.threat_type
        }
      );

    } catch (error) {
      logger.error('Failed to send status update notification', {
        threatId: threat.threat_id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Notify security team
   */
  private static async notifySecurityTeam(
    threat: ThreatMonitorRecord | null,
    eventType: string,
    notification?: NotificationData
  ): Promise<void> {
    try {
      if (notification) {
        // Broadcast to all admin users
        await WebSocketService.broadcastSystemNotification(notification);
      } else if (threat) {
        await NotificationUtils.sendSystemAlert(
          `Security Alert: ${threat.threat_type}`,
          `A ${threat.severity} severity ${threat.threat_type} threat has been reported.`,
          threat.severity === 'critical' ? 'critical' : 
          threat.severity === 'high' ? 'error' : 'warning',
          {
            threatId: threat.threat_id,
            threatType: threat.threat_type,
            severity: threat.severity,
            userId: threat.user_id,
            eventType
          }
        );
      }

    } catch (error) {
      logger.error('Failed to notify security team', {
        eventType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get threat indicators for intelligence
   */
  private static async getThreatIndicators(threatType: string): Promise<string[]> {
    const indicatorMap: Record<string, string[]> = {
      malware: ['suspicious_imports', 'code_execution', 'obfuscation'],
      backdoor: ['hidden_functionality', 'remote_access', 'privilege_escalation'],
      data_leak: ['network_communication', 'data_exfiltration', 'unauthorized_access'],
      adversarial: ['model_manipulation', 'gradient_attacks', 'perturbation'],
      privacy_violation: ['credential_harvesting', 'data_mining', 'unauthorized_collection'],
      phishing: ['social_engineering', 'credential_theft', 'deceptive_content']
    };

    return indicatorMap[threatType] || ['unknown_indicators'];
  }

  /**
   * Get threat recommendations
   */
  private static async getThreatRecommendations(threatType: string): Promise<string[]> {
    const recommendationMap: Record<string, string[]> = {
      malware: ['Use safer model formats like ONNX', 'Implement sandboxing', 'Regular security scans'],
      backdoor: ['Code review before deployment', 'Monitor model behavior', 'Use trusted sources'],
      data_leak: ['Network monitoring', 'Data loss prevention', 'Access controls'],
      adversarial: ['Input validation', 'Adversarial training', 'Model robustness testing'],
      privacy_violation: ['Data anonymization', 'Privacy audits', 'Compliance checks'],
      phishing: ['User training', 'Email filtering', 'Domain monitoring']
    };

    return recommendationMap[threatType] || ['General security best practices'];
  }

  /**
   * Cache threat record
   */
  private static async cacheThreatRecord(threat: ThreatMonitorRecord): Promise<void> {
    try {
      await setCache(`threat:${threat.id}`, threat, this.CACHE_TTL);
    } catch (error) {
      logger.warn('Failed to cache threat record', {
        threatId: threat.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get file extension helper
   */
  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'unknown';
  }
}