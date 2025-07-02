/**
 * Real-time threat monitoring hook
 * Provides live updates for threat detection and status changes
 */
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { threatsApi } from '@/lib/api';
import { toast } from 'sonner';

export interface RealTimeThreat {
  id: string;
  threat_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  confidence_score: number;
  user_id: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ThreatUpdate {
  threatId: string;
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  timestamp: string;
}

export function useRealTimeThreats() {
  const [activeThreatCount, setActiveThreatCount] = useState(0);
  const [recentThreats, setRecentThreats] = useState<RealTimeThreat[]>([]);
  const [threatUpdates, setThreatUpdates] = useState<ThreatUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected, subscribe, unsubscribe, sendMessage } = useWebSocket({
    autoConnect: true
  });

  // Handle new threat detection
  const handleThreatDetected = useCallback((data: any) => {
    const threat: RealTimeThreat = {
      id: data.threatId || data.id,
      threat_type: data.threat_type || data.threatType,
      severity: data.severity,
      status: 'detected',
      confidence_score: data.confidence_score || data.confidence,
      user_id: data.user_id || data.userId,
      created_at: data.timestamp || new Date().toISOString(),
      metadata: data.metadata
    };

    setRecentThreats(prev => [threat, ...prev.slice(0, 9)]); // Keep latest 10
    setActiveThreatCount(prev => prev + 1);

    // Show notification for high/critical threats
    if (threat.severity === 'high' || threat.severity === 'critical') {
      toast.error(`${threat.severity.toUpperCase()} Threat Detected`, {
        description: `${threat.threat_type} with ${Math.round(threat.confidence_score * 100)}% confidence`,
        action: {
          label: 'View Details',
          onClick: () => window.location.href = `/dashboard/threats/${threat.id}`
        },
        duration: 10000
      });
    }
  }, []);

  // Handle threat status updates
  const handleThreatStatusUpdate = useCallback((data: any) => {
    const update: ThreatUpdate = {
      threatId: data.threatId || data.threat_id,
      previousStatus: data.previousStatus || data.old_status,
      newStatus: data.newStatus || data.status,
      updatedBy: data.updatedBy || data.updated_by,
      timestamp: data.timestamp || new Date().toISOString()
    };

    setThreatUpdates(prev => [update, ...prev.slice(0, 19)]); // Keep latest 20

    // Update active count based on status change
    if (update.previousStatus === 'detected' && update.newStatus === 'resolved') {
      setActiveThreatCount(prev => Math.max(0, prev - 1));
    }

    // Update threats in recent list
    setRecentThreats(prev => 
      prev.map(threat => 
        threat.id === update.threatId 
          ? { ...threat, status: update.newStatus as any }
          : threat
      )
    );

    // Show success notification for resolved threats
    if (update.newStatus === 'resolved') {
      toast.success('Threat Resolved', {
        description: `Threat ${update.threatId.substring(0, 8)}... has been resolved`,
        duration: 5000
      });
    }
  }, []);

  // Handle pattern detection alerts
  const handlePatternDetected = useCallback((data: any) => {
    toast.warning('Threat Pattern Detected', {
      description: `Multiple ${data.patternType} threats detected. Possible coordinated attack.`,
      action: {
        label: 'Investigate',
        onClick: () => window.location.href = '/dashboard/threats/active?filter=pattern'
      },
      duration: 15000
    });
  }, []);

  // Handle mass incident alerts
  const handleMassIncident = useCallback((data: any) => {
    toast.error('Mass Security Incident', {
      description: `${data.threatCount} threats detected simultaneously. Immediate attention required.`,
      action: {
        label: 'Emergency Response',
        onClick: () => window.location.href = '/dashboard/threats/active?priority=critical'
      },
      duration: 0 // Persistent until manually dismissed
    });
  }, []);

  // Subscribe to threat events
  useEffect(() => {
    if (isConnected) {
      subscribe('threat_detected', handleThreatDetected);
      subscribe('threat_status_update', handleThreatStatusUpdate);
      subscribe('pattern_detected', handlePatternDetected);
      subscribe('mass_incident', handleMassIncident);

      // Request to join threat monitoring room
      sendMessage('subscribe', { channel: 'threats' });

      return () => {
        unsubscribe('threat_detected', handleThreatDetected);
        unsubscribe('threat_status_update', handleThreatStatusUpdate);
        unsubscribe('pattern_detected', handlePatternDetected);
        unsubscribe('mass_incident', handleMassIncident);
      };
    }
  }, [isConnected, subscribe, unsubscribe, sendMessage, 
      handleThreatDetected, handleThreatStatusUpdate, 
      handlePatternDetected, handleMassIncident]);

  // Load initial threat data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [dashboardData, recentData] = await Promise.all([
          threatsApi.getDashboard(),
          threatsApi.getThreats({ limit: 10, status: 'detected' })
        ]);

        if (dashboardData.success) {
          const stats = dashboardData.data.statistics;
          setActiveThreatCount(stats?.byStatus?.detected || 0);
        }

        if (recentData.success) {
          setRecentThreats(recentData.data.threats || []);
        }
      } catch (error) {
        console.error('Failed to load initial threat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Manual refresh function
  const refreshThreats = useCallback(async () => {
    try {
      const response = await threatsApi.getThreats({ 
        limit: 10, 
        status: 'detected',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (response.success) {
        setRecentThreats(response.data.threats || []);
      }
    } catch (error) {
      console.error('Failed to refresh threats:', error);
    }
  }, []);

  // Report new threat manually
  const reportThreat = useCallback(async (threatData: {
    threatType: string;
    description: string;
    severity?: string;
    indicators: Record<string, any>;
  }) => {
    try {
      const response = await threatsApi.reportThreat(threatData);
      
      if (response.success) {
        toast.success('Threat Reported', {
          description: 'Your threat report has been submitted for analysis'
        });
        
        // Add to local state immediately
        const newThreat: RealTimeThreat = {
          id: response.data.threat.id,
          threat_type: threatData.threatType,
          severity: (threatData.severity as any) || 'medium',
          status: 'detected',
          confidence_score: 0.5,
          user_id: response.data.threat.user_id,
          created_at: new Date().toISOString(),
          metadata: threatData.indicators
        };

        setRecentThreats(prev => [newThreat, ...prev.slice(0, 9)]);
        setActiveThreatCount(prev => prev + 1);

        return response.data.threat;
      }
    } catch (error) {
      console.error('Failed to report threat:', error);
      toast.error('Failed to report threat', {
        description: 'Please try again or contact support'
      });
      throw error;
    }
  }, []);

  return {
    // State
    activeThreatCount,
    recentThreats,
    threatUpdates,
    isLoading,
    isConnected,

    // Actions
    refreshThreats,
    reportThreat,

    // Helper functions
    getThreatById: (id: string) => recentThreats.find(t => t.id === id),
    getThreatsBySeverity: (severity: string) => 
      recentThreats.filter(t => t.severity === severity),
    getUnresolvedThreats: () => 
      recentThreats.filter(t => t.status !== 'resolved' && t.status !== 'false_positive'),

    // Statistics
    stats: {
      critical: recentThreats.filter(t => t.severity === 'critical').length,
      high: recentThreats.filter(t => t.severity === 'high').length,
      medium: recentThreats.filter(t => t.severity === 'medium').length,
      low: recentThreats.filter(t => t.severity === 'low').length
    }
  };
}