import { ThreatMonitorModel } from '@/models/ThreatMonitor';
import { ModelScanModel } from '@/models/ModelScan';
import { query } from '@/config/database';
import { setCache, getCache } from '@/config/redis';
import logger from '@/utils/logger';
import crypto from 'crypto';

export interface SecurityMetrics {
  totalScans: number;
  totalThreats: number;
  threatResolutionRate: number;
  avgThreatConfidence: number;
  scanSuccessRate: number;
  quarantineRate: number;
  falsePositiveRate: number;
  timeToResolution: number; // in hours
}

export interface ThreatTrend {
  date: string;
  threatCount: number;
  scanCount: number;
  avgSeverity: number;
  topThreatTypes: Array<{ type: string; count: number }>;
}

export interface UserActivityMetrics {
  userId: string;
  username?: string;
  email?: string;
  totalScans: number;
  threatsDetected: number;
  riskScore: number;
  lastActivity: Date;
  scanFrequency: number; // scans per week
}

export interface SecurityReport {
  id: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  description: string;
  generatedAt: Date;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  metrics: SecurityMetrics;
  trends: ThreatTrend[];
  topUsers: UserActivityMetrics[];
  recommendations: string[];
  summary: string;
  metadata: Record<string, unknown>;
}

export interface ComplianceMetrics {
  totalIncidents: number;
  resolvedIncidents: number;
  avgResolutionTime: number;
  escalatedIncidents: number;
  complianceScore: number;
  auditTrail: Array<{
    timestamp: Date;
    action: string;
    user: string;
    details: string;
  }>;
}

export class SecurityAnalyticsService {
  private static readonly CACHE_TTL = 30 * 60; // 30 minutes
  private static readonly RISK_SCORE_WEIGHTS = {
    threatCount: 0.4,
    avgConfidence: 0.3,
    scanFrequency: 0.2,
    recentActivity: 0.1
  };

  /**
   * Generate comprehensive security metrics
   */
  static async generateSecurityMetrics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SecurityMetrics> {
    try {
      const cacheKey = `security_metrics:${startDate.toISOString()}:${endDate.toISOString()}:${userId || 'all'}`;
      const cached = await getCache(cacheKey) as SecurityMetrics | null;
      
      if (cached) {
        return cached;
      }

      // Get scan statistics
      const scanStats = await this.getScanStatistics(startDate, endDate, userId);
      
      // Get threat statistics
      const threatStats = await ThreatMonitorModel.getStats({
        ...(userId ? { userId } : {}),
        startDate,
        endDate
      });

      // Calculate threat resolution rate
      const resolvedThreats = threatStats.threatsByStatus['resolved'] || 0;
      const totalActiveThreats = Object.values(threatStats.threatsByStatus)
        .filter((_, index) => ['detected', 'investigating', 'resolved'].includes(Object.keys(threatStats.threatsByStatus)[index] || ''))
        .reduce((sum, count) => sum + count, 0);
      
      const threatResolutionRate = totalActiveThreats > 0 ? (resolvedThreats / totalActiveThreats) * 100 : 0;

      // Calculate false positive rate
      const falsePositives = threatStats.threatsByStatus['false_positive'] || 0;
      const falsePositiveRate = threatStats.totalThreats > 0 ? (falsePositives / threatStats.totalThreats) * 100 : 0;

      // Calculate quarantine rate
      const quarantinedScans = scanStats.scansByStatus['quarantined'] || 0;
      const quarantineRate = scanStats.totalScans > 0 ? (quarantinedScans / scanStats.totalScans) * 100 : 0;

      // Calculate scan success rate
      const completedScans = scanStats.scansByStatus['completed'] || 0;
      const scanSuccessRate = scanStats.totalScans > 0 ? (completedScans / scanStats.totalScans) * 100 : 0;

      // Calculate average time to resolution
      const timeToResolution = await this.calculateAvgTimeToResolution(startDate, endDate, userId);

      const metrics: SecurityMetrics = {
        totalScans: scanStats.totalScans,
        totalThreats: threatStats.totalThreats,
        threatResolutionRate,
        avgThreatConfidence: threatStats.avgConfidenceScore,
        scanSuccessRate,
        quarantineRate,
        falsePositiveRate,
        timeToResolution
      };

      // Cache results
      await setCache(cacheKey, metrics, this.CACHE_TTL);

      return metrics;

    } catch (error) {
      logger.error('Failed to generate security metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        startDate,
        endDate,
        userId
      });
      throw error;
    }
  }

  /**
   * Generate threat trends over time
   */
  static async generateThreatTrends(
    startDate: Date,
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' = 'day',
    userId?: string
  ): Promise<ThreatTrend[]> {
    try {
      const cacheKey = `threat_trends:${startDate.toISOString()}:${endDate.toISOString()}:${granularity}:${userId || 'all'}`;
      const cached = await getCache(cacheKey) as ThreatTrend[] | null;
      
      if (cached) {
        return cached;
      }

      let dateFormat: string;
      let intervalMs: number;

      switch (granularity) {
        case 'hour':
          dateFormat = 'YYYY-MM-DD HH24:00:00';
          intervalMs = 60 * 60 * 1000;
          break;
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          intervalMs = 24 * 60 * 60 * 1000;
          break;
        case 'week':
          dateFormat = 'YYYY-"W"WW';
          intervalMs = 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          dateFormat = 'YYYY-MM-DD';
          intervalMs = 24 * 60 * 60 * 1000;
      }

      // Generate threat trends
      const threatTrendQuery = `
        SELECT 
          TO_CHAR(DATE_TRUNC('${granularity}', created_at), '${dateFormat}') as date,
          COUNT(*) as threat_count,
          AVG(
            CASE severity 
              WHEN 'critical' THEN 4 
              WHEN 'high' THEN 3 
              WHEN 'medium' THEN 2 
              WHEN 'low' THEN 1 
            END
          ) as avg_severity,
          threat_type,
          COUNT(*) as type_count
        FROM threat_monitor 
        WHERE created_at >= $1 AND created_at <= $2
        ${userId ? 'AND user_id = $3' : ''}
        GROUP BY DATE_TRUNC('${granularity}', created_at), threat_type
        ORDER BY DATE_TRUNC('${granularity}', created_at)
      `;

      const threatParams = userId ? [startDate, endDate, userId] : [startDate, endDate];
      const threatResult = await query<{
        date: string;
        threat_count: string;
        avg_severity: string;
        threat_type: string;
        type_count: string;
      }>(threatTrendQuery, threatParams);

      // Generate scan trends
      const scanTrendQuery = `
        SELECT 
          TO_CHAR(DATE_TRUNC('${granularity}', created_at), '${dateFormat}') as date,
          COUNT(*) as scan_count
        FROM model_scans 
        WHERE created_at >= $1 AND created_at <= $2
        ${userId ? 'AND user_id = $3' : ''}
        GROUP BY DATE_TRUNC('${granularity}', created_at)
        ORDER BY DATE_TRUNC('${granularity}', created_at)
      `;

      const scanResult = await query<{
        date: string;
        scan_count: string;
      }>(scanTrendQuery, threatParams);

      // Combine data by date
      const trendsMap = new Map<string, ThreatTrend>();

      // Initialize with scan data
      for (const row of scanResult.rows) {
        trendsMap.set(row.date, {
          date: row.date,
          threatCount: 0,
          scanCount: parseInt(row.scan_count, 10),
          avgSeverity: 0,
          topThreatTypes: []
        });
      }

      // Add threat data
      const threatTypeMap = new Map<string, Map<string, number>>();
      
      for (const row of threatResult.rows) {
        const existing = trendsMap.get(row.date) || {
          date: row.date,
          threatCount: 0,
          scanCount: 0,
          avgSeverity: 0,
          topThreatTypes: []
        };

        existing.threatCount += parseInt(row.type_count, 10);
        existing.avgSeverity = parseFloat(row.avg_severity);

        // Track threat types for this date
        if (!threatTypeMap.has(row.date)) {
          threatTypeMap.set(row.date, new Map());
        }
        threatTypeMap.get(row.date)!.set(row.threat_type, parseInt(row.type_count, 10));

        trendsMap.set(row.date, existing);
      }

      // Generate top threat types for each date
      for (const [date, trend] of trendsMap.entries()) {
        const typeMap = threatTypeMap.get(date);
        if (typeMap) {
          trend.topThreatTypes = Array.from(typeMap.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
      }

      const trends = Array.from(trendsMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Fill gaps in timeline
      const filledTrends = this.fillTimelineGaps(trends, startDate, endDate, intervalMs, granularity);

      // Cache results
      await setCache(cacheKey, filledTrends, this.CACHE_TTL);

      return filledTrends;

    } catch (error) {
      logger.error('Failed to generate threat trends', {
        error: error instanceof Error ? error.message : 'Unknown error',
        startDate,
        endDate,
        granularity,
        userId
      });
      throw error;
    }
  }

  /**
   * Generate user activity metrics and risk scores
   */
  static async generateUserActivityMetrics(
    startDate: Date,
    endDate: Date,
    limit: number = 50
  ): Promise<UserActivityMetrics[]> {
    try {
      const cacheKey = `user_metrics:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
      const cached = await getCache(cacheKey) as UserActivityMetrics[] | null;
      
      if (cached) {
        return cached;
      }

      const userMetricsQuery = `
        SELECT 
          u.id as user_id,
          u.username,
          u.email,
          COALESCE(scan_stats.total_scans, 0) as total_scans,
          COALESCE(threat_stats.threats_detected, 0) as threats_detected,
          COALESCE(scan_stats.last_activity, u.created_at) as last_activity,
          COALESCE(scan_stats.scan_frequency, 0) as scan_frequency,
          COALESCE(threat_stats.avg_confidence, 0) as avg_confidence
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as total_scans,
            MAX(created_at) as last_activity,
            COUNT(*) / EXTRACT(EPOCH FROM ($2 - $1)) * 604800 as scan_frequency
          FROM model_scans 
          WHERE created_at >= $1 AND created_at <= $2
          GROUP BY user_id
        ) scan_stats ON u.id = scan_stats.user_id
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as threats_detected,
            AVG(confidence_score) as avg_confidence
          FROM threat_monitor 
          WHERE created_at >= $1 AND created_at <= $2
          GROUP BY user_id
        ) threat_stats ON u.id = threat_stats.user_id
        WHERE u.is_active = true
        ORDER BY total_scans DESC, threats_detected DESC
        LIMIT $3
      `;

      const result = await query<{
        user_id: string;
        username: string;
        email: string;
        total_scans: string;
        threats_detected: string;
        last_activity: Date;
        scan_frequency: string;
        avg_confidence: string;
      }>(userMetricsQuery, [startDate, endDate, limit]);

      const userMetrics: UserActivityMetrics[] = result.rows.map(row => {
        const totalScans = parseInt(row.total_scans, 10);
        const threatsDetected = parseInt(row.threats_detected, 10);
        const scanFrequency = parseFloat(row.scan_frequency);
        const avgConfidence = parseFloat(row.avg_confidence);

        // Calculate risk score
        const riskScore = this.calculateUserRiskScore({
          threatCount: threatsDetected,
          avgConfidence,
          scanFrequency,
          lastActivity: row.last_activity
        });

        return {
          userId: row.user_id,
          username: row.username,
          email: row.email,
          totalScans,
          threatsDetected,
          riskScore,
          lastActivity: row.last_activity,
          scanFrequency
        };
      });

      // Cache results
      await setCache(cacheKey, userMetrics, this.CACHE_TTL);

      return userMetrics;

    } catch (error) {
      logger.error('Failed to generate user activity metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        startDate,
        endDate,
        limit
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive security report
   */
  static async generateSecurityReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<SecurityReport> {
    try {
      const reportId = crypto.randomUUID();
      
      logger.info('Generating security report', {
        reportId,
        reportType,
        startDate,
        endDate,
        userId
      });

      // Generate core metrics
      const metrics = await this.generateSecurityMetrics(startDate, endDate, userId);
      
      // Generate trends
      const trends = await this.generateThreatTrends(startDate, endDate, 'day', userId);
      
      // Generate user metrics (only for admin reports)
      const topUsers = userId ? [] : await this.generateUserActivityMetrics(startDate, endDate, 10);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(metrics, trends);

      // Generate summary
      const summary = this.generateReportSummary(metrics, trends, reportType);

      const report: SecurityReport = {
        id: reportId,
        reportType,
        title: `Security ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        description: `Comprehensive security analytics report for ${startDate.toDateString()} to ${endDate.toDateString()}`,
        generatedAt: new Date(),
        timeRange: { startDate, endDate },
        metrics,
        trends,
        topUsers,
        recommendations,
        summary,
        metadata: {
          generatedBy: 'SecurityAnalyticsService',
          version: '1.0.0',
          includeUserMetrics: !userId,
          reportScope: userId ? 'user' : 'organization'
        }
      };

      // Cache report for 24 hours
      await setCache(`security_report:${reportId}`, report, 24 * 60 * 60);

      logger.info('Security report generated successfully', {
        reportId,
        metricsCount: Object.keys(metrics).length,
        trendsCount: trends.length,
        usersCount: topUsers.length
      });

      return report;

    } catch (error) {
      logger.error('Failed to generate security report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reportType,
        startDate,
        endDate,
        userId
      });
      throw error;
    }
  }

  /**
   * Generate compliance metrics
   */
  static async generateComplianceMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceMetrics> {
    try {
      const cacheKey = `compliance_metrics:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await getCache(cacheKey) as ComplianceMetrics | null;
      
      if (cached) {
        return cached;
      }

      // Get incident statistics
      const incidentStats = await ThreatMonitorModel.getStats({
        startDate,
        endDate
      });

      const totalIncidents = incidentStats.totalThreats;
      const resolvedIncidents = incidentStats.threatsByStatus['resolved'] || 0;
      const escalatedIncidents = incidentStats.threatsBySeverity['critical'] || 0;

      // Calculate average resolution time
      const avgResolutionTime = await this.calculateAvgTimeToResolution(startDate, endDate);

      // Calculate compliance score (0-100)
      const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) : 1;
      const escalationRate = totalIncidents > 0 ? (escalatedIncidents / totalIncidents) : 0;
      const timelinessScore = avgResolutionTime <= 24 ? 1 : Math.max(0, 1 - (avgResolutionTime - 24) / 72);
      
      const complianceScore = Math.round(
        (resolutionRate * 0.4 + (1 - escalationRate) * 0.3 + timelinessScore * 0.3) * 100
      );

      // Get audit trail (simplified)
      const auditTrail = await this.getAuditTrail(startDate, endDate);

      const compliance: ComplianceMetrics = {
        totalIncidents,
        resolvedIncidents,
        avgResolutionTime,
        escalatedIncidents,
        complianceScore,
        auditTrail
      };

      // Cache results
      await setCache(cacheKey, compliance, this.CACHE_TTL);

      return compliance;

    } catch (error) {
      logger.error('Failed to generate compliance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        startDate,
        endDate
      });
      throw error;
    }
  }

  /**
   * Get cached report by ID
   */
  static async getCachedReport(reportId: string): Promise<SecurityReport | null> {
    try {
      return await getCache(`security_report:${reportId}`) as SecurityReport | null;
    } catch {
      return null;
    }
  }

  /**
   * Export report data in various formats
   */
  static async exportReport(
    report: SecurityReport,
    format: 'json' | 'csv' | 'pdf'
  ): Promise<{ data: string; mimeType: string; filename: string }> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (format) {
        case 'json':
          return {
            data: JSON.stringify(report, null, 2),
            mimeType: 'application/json',
            filename: `security_report_${timestamp}.json`
          };
          
        case 'csv': {
          const csvData = this.convertReportToCSV(report);
          return {
            data: csvData,
            mimeType: 'text/csv',
            filename: `security_report_${timestamp}.csv`
          };
        }
          
        case 'pdf': {
          // For PDF generation, you would typically use a library like puppeteer or jsPDF
          // This is a placeholder implementation
          const pdfData = this.convertReportToPDF(report);
          return {
            data: pdfData,
            mimeType: 'application/pdf',
            filename: `security_report_${timestamp}.pdf`
          };
        }
          
        default:
          throw new Error('Unsupported export format');
      }

    } catch (error) {
      logger.error('Failed to export report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reportId: report.id,
        format
      });
      throw error;
    }
  }

  /**
   * Get scan statistics
   */
  private static async getScanStatistics(
    _startDate: Date,
    _endDate: Date,
    _userId?: string
  ): Promise<{
    totalScans: number;
    scansByStatus: Record<string, number>;
    avgFileSize: number;
  }> {
    const stats = await ModelScanModel.getScanStats();
    
    // Filter by date range and user if needed (simplified)
    // In a real implementation, you'd query with date/user filters
    return {
      totalScans: stats.totalScans,
      scansByStatus: stats.scansByStatus,
      avgFileSize: stats.avgFileSize
    };
  }

  /**
   * Calculate average time to resolution
   */
  private static async calculateAvgTimeToResolution(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<number> {
    try {
      const resolutionQuery = `
        SELECT AVG(
          EXTRACT(EPOCH FROM (resolved_at - first_detected_at)) / 3600
        ) as avg_hours
        FROM threat_monitor 
        WHERE resolved_at IS NOT NULL 
        AND first_detected_at >= $1 
        AND first_detected_at <= $2
        ${userId ? 'AND user_id = $3' : ''}
      `;

      const params = userId ? [startDate, endDate, userId] : [startDate, endDate];
      const result = await query<{ avg_hours: string }>(resolutionQuery, params);
      
      return parseFloat(result.rows[0]?.avg_hours || '0');

    } catch (error) {
      logger.warn('Failed to calculate average resolution time', { error });
      return 0;
    }
  }

  /**
   * Calculate user risk score
   */
  private static calculateUserRiskScore(factors: {
    threatCount: number;
    avgConfidence: number;
    scanFrequency: number;
    lastActivity: Date;
  }): number {
    const weights = this.RISK_SCORE_WEIGHTS;
    
    // Normalize factors to 0-1 scale
    const threatScore = Math.min(factors.threatCount / 10, 1);
    const confidenceScore = factors.avgConfidence;
    const frequencyScore = Math.min(factors.scanFrequency / 10, 1);
    
    // Recent activity score (higher is better, so invert)
    const daysSinceActivity = (Date.now() - factors.lastActivity.getTime()) / (24 * 60 * 60 * 1000);
    const activityScore = 1 - Math.min(daysSinceActivity / 30, 1);

    const riskScore = (
      threatScore * weights.threatCount +
      confidenceScore * weights.avgConfidence +
      frequencyScore * weights.scanFrequency +
      activityScore * weights.recentActivity
    );

    return Math.round(riskScore * 100);
  }

  /**
   * Fill gaps in timeline
   */
  private static fillTimelineGaps(
    trends: ThreatTrend[],
    startDate: Date,
    endDate: Date,
    intervalMs: number,
    granularity: string
  ): ThreatTrend[] {
    const filled: ThreatTrend[] = [];
    const existingMap = new Map(trends.map(t => [t.date, t]));
    
    for (let current = new Date(startDate); current <= endDate; current = new Date(current.getTime() + intervalMs)) {
      let dateKey: string;
      
      switch (granularity) {
        case 'hour':
          dateKey = current.toISOString().slice(0, 13) + ':00:00';
          break;
        case 'day':
          dateKey = current.toISOString().slice(0, 10);
          break;
        case 'week': {
          const year = current.getFullYear();
          const week = this.getWeekNumber(current);
          dateKey = `${year}-W${week.toString().padStart(2, '0')}`;
          break;
        }
        default:
          dateKey = current.toISOString().slice(0, 10);
      }

      const existing = existingMap.get(dateKey);
      filled.push(existing || {
        date: dateKey,
        threatCount: 0,
        scanCount: 0,
        avgSeverity: 0,
        topThreatTypes: []
      });
    }
    
    return filled;
  }

  /**
   * Get week number
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Generate recommendations based on metrics
   */
  private static async generateRecommendations(
    metrics: SecurityMetrics,
    trends: ThreatTrend[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Threat resolution rate recommendations
    if (metrics.threatResolutionRate < 80) {
      recommendations.push('Improve threat resolution processes - current resolution rate is below recommended 80%');
    }

    // False positive rate recommendations
    if (metrics.falsePositiveRate > 15) {
      recommendations.push('Review and tune threat detection rules to reduce false positive rate');
    }

    // Scan success rate recommendations
    if (metrics.scanSuccessRate < 90) {
      recommendations.push('Investigate scan failures and improve file processing reliability');
    }

    // Time to resolution recommendations
    if (metrics.timeToResolution > 48) {
      recommendations.push('Implement faster incident response procedures to reduce time to resolution');
    }

    // Trend-based recommendations
    const recentTrends = trends.slice(-7); // Last 7 periods
    const avgThreatCount = recentTrends.reduce((sum, t) => sum + t.threatCount, 0) / recentTrends.length;
    
    if (avgThreatCount > 10) {
      recommendations.push('Consider implementing additional preventive security measures due to high threat volume');
    }

    // Quarantine rate recommendations
    if (metrics.quarantineRate > 10) {
      recommendations.push('High quarantine rate detected - review file sources and implement additional pre-screening');
    }

    return recommendations;
  }

  /**
   * Generate report summary
   */
  private static generateReportSummary(
    metrics: SecurityMetrics,
    trends: ThreatTrend[],
    reportType: string
  ): string {
    const totalThreats = metrics.totalThreats;
    const totalScans = metrics.totalScans;
    const threatRate = totalScans > 0 ? ((totalThreats / totalScans) * 100).toFixed(1) : '0';
    
    const recentTrends = trends.slice(-7);
    const avgThreatCount = recentTrends.reduce((sum, t) => sum + t.threatCount, 0) / recentTrends.length;
    const trendDirection = avgThreatCount > (metrics.totalThreats / trends.length) ? 'increasing' : 'stable';

    return `This ${reportType} security report covers ${totalScans} scans with ${totalThreats} threats detected (${threatRate}% threat rate). ` +
           `Threat resolution rate is ${metrics.threatResolutionRate.toFixed(1)}% with an average resolution time of ${metrics.timeToResolution.toFixed(1)} hours. ` +
           `Threat activity appears to be ${trendDirection} based on recent trends. ` +
           `System security posture: ${metrics.threatResolutionRate > 80 ? 'Good' : 'Needs Attention'}.`;
  }

  /**
   * Get audit trail (simplified)
   */
  private static async getAuditTrail(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ timestamp: Date; action: string; user: string; details: string }>> {
    try {
      const auditQuery = `
        SELECT 
          tm.updated_at as timestamp,
          'Threat Status Update' as action,
          COALESCE(u.username, 'System') as user,
          CONCAT('Threat ', tm.threat_id, ' status changed to ', tm.status) as details
        FROM threat_monitor tm
        LEFT JOIN users u ON tm.resolved_by = u.id
        WHERE tm.updated_at >= $1 AND tm.updated_at <= $2
        AND tm.status IN ('resolved', 'false_positive', 'suppressed')
        ORDER BY tm.updated_at DESC
        LIMIT 100
      `;

      const result = await query<{
        timestamp: Date;
        action: string;
        user: string;
        details: string;
      }>(auditQuery, [startDate, endDate]);

      return result.rows;

    } catch (error) {
      logger.warn('Failed to get audit trail', { error });
      return [];
    }
  }

  /**
   * Convert report to CSV format
   */
  private static convertReportToCSV(report: SecurityReport): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Security Report CSV Export');
    lines.push(`Report ID,${report.id}`);
    lines.push(`Generated At,${report.generatedAt.toISOString()}`);
    lines.push(`Time Range,${report.timeRange.startDate.toISOString()} to ${report.timeRange.endDate.toISOString()}`);
    lines.push('');
    
    // Metrics
    lines.push('Metrics');
    lines.push('Metric,Value');
    lines.push(`Total Scans,${report.metrics.totalScans}`);
    lines.push(`Total Threats,${report.metrics.totalThreats}`);
    lines.push(`Threat Resolution Rate,${report.metrics.threatResolutionRate.toFixed(2)}%`);
    lines.push(`Average Threat Confidence,${report.metrics.avgThreatConfidence.toFixed(2)}`);
    lines.push(`Scan Success Rate,${report.metrics.scanSuccessRate.toFixed(2)}%`);
    lines.push(`Quarantine Rate,${report.metrics.quarantineRate.toFixed(2)}%`);
    lines.push(`False Positive Rate,${report.metrics.falsePositiveRate.toFixed(2)}%`);
    lines.push(`Time to Resolution (hours),${report.metrics.timeToResolution.toFixed(2)}`);
    lines.push('');
    
    // Trends
    lines.push('Trends');
    lines.push('Date,Threat Count,Scan Count,Average Severity');
    for (const trend of report.trends) {
      lines.push(`${trend.date},${trend.threatCount},${trend.scanCount},${trend.avgSeverity.toFixed(2)}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Convert report to PDF format (placeholder)
   */
  private static convertReportToPDF(report: SecurityReport): string {
    // This is a placeholder - in a real implementation you would use a PDF library
    return `PDF Report for ${report.title} - Generated ${report.generatedAt.toISOString()}`;
  }
}