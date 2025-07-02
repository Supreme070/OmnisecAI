/**
 * Real-time scan monitoring hook
 * Provides live updates for model scanning progress and results
 */
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { scanningApi, modelsApi } from '@/lib/api';
import { toast } from 'sonner';

export interface RealTimeScan {
  id: string;
  model_id: string;
  model_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  results?: {
    threats_found: number;
    vulnerabilities: any[];
    score: number;
  };
  error?: string;
}

export interface ScanProgress {
  scanId: string;
  stage: string;
  progress: number;
  message: string;
  timestamp: string;
}

export function useRealTimeScans() {
  const [activeScans, setActiveScans] = useState<RealTimeScan[]>([]);
  const [completedScans, setCompletedScans] = useState<RealTimeScan[]>([]);
  const [scanProgress, setScanProgress] = useState<Map<string, ScanProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected, subscribe, unsubscribe, sendMessage } = useWebSocket({
    autoConnect: true
  });

  // Handle scan started
  const handleScanStarted = useCallback((data: any) => {
    const scan: RealTimeScan = {
      id: data.scanId || data.id,
      model_id: data.modelId || data.model_id,
      model_name: data.modelName || data.model_name,
      status: 'running',
      progress: 0,
      created_at: data.created_at || new Date().toISOString(),
      started_at: data.timestamp || new Date().toISOString()
    };

    setActiveScans(prev => [scan, ...prev.filter(s => s.id !== scan.id)]);

    toast.info('Scan Started', {
      description: `Security scan initiated for ${scan.model_name}`,
      duration: 3000
    });
  }, []);

  // Handle scan progress updates
  const handleScanProgress = useCallback((data: any) => {
    const progress: ScanProgress = {
      scanId: data.scanId || data.id,
      stage: data.stage || 'processing',
      progress: data.progress || 0,
      message: data.message || 'Processing...',
      timestamp: data.timestamp || new Date().toISOString()
    };

    setScanProgress(prev => new Map(prev.set(progress.scanId, progress)));

    // Update active scans with progress
    setActiveScans(prev =>
      prev.map(scan =>
        scan.id === progress.scanId
          ? { ...scan, progress: progress.progress }
          : scan
      )
    );
  }, []);

  // Handle scan completed
  const handleScanCompleted = useCallback((data: any) => {
    const scanId = data.scanId || data.id;
    const results = data.results || {};

    // Move from active to completed
    setActiveScans(prev => {
      const activeScan = prev.find(s => s.id === scanId);
      if (activeScan) {
        const completedScan: RealTimeScan = {
          ...activeScan,
          status: 'completed',
          progress: 100,
          completed_at: data.timestamp || new Date().toISOString(),
          results: {
            threats_found: results.threats_found || results.threatsFound || 0,
            vulnerabilities: results.vulnerabilities || [],
            score: results.score || results.securityScore || 0
          }
        };

        setCompletedScans(prevCompleted => [completedScan, ...prevCompleted.slice(0, 19)]);

        // Show notification based on results
        const threatsFound = completedScan.results?.threats_found || 0;
        if (threatsFound > 0) {
          toast.warning('Scan Completed - Threats Found', {
            description: `Found ${threatsFound} potential security issues in ${activeScan.model_name}`,
            action: {
              label: 'View Results',
              onClick: () => window.location.href = `/dashboard/models/${activeScan.model_id}?tab=security`
            },
            duration: 10000
          });
        } else {
          toast.success('Scan Completed - No Threats', {
            description: `${activeScan.model_name} passed security scan`,
            duration: 5000
          });
        }
      }

      return prev.filter(s => s.id !== scanId);
    });

    // Remove from progress tracking
    setScanProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(scanId);
      return newMap;
    });
  }, []);

  // Handle scan failed
  const handleScanFailed = useCallback((data: any) => {
    const scanId = data.scanId || data.id;
    const error = data.error || 'Scan failed due to unknown error';

    setActiveScans(prev =>
      prev.map(scan =>
        scan.id === scanId
          ? { ...scan, status: 'failed', error }
          : scan
      )
    );

    // Remove from progress tracking
    setScanProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(scanId);
      return newMap;
    });

    toast.error('Scan Failed', {
      description: error,
      action: {
        label: 'Retry',
        onClick: () => retryScan(scanId)
      }
    });
  }, []);

  // Handle scan cancelled
  const handleScanCancelled = useCallback((data: any) => {
    const scanId = data.scanId || data.id;

    setActiveScans(prev => prev.filter(s => s.id !== scanId));
    setScanProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(scanId);
      return newMap;
    });

    toast.info('Scan Cancelled', {
      description: 'The security scan has been cancelled'
    });
  }, []);

  // Subscribe to scan events
  useEffect(() => {
    if (isConnected) {
      subscribe('scan_started', handleScanStarted);
      subscribe('scan_progress', handleScanProgress);
      subscribe('scan_completed', handleScanCompleted);
      subscribe('scan_failed', handleScanFailed);
      subscribe('scan_cancelled', handleScanCancelled);

      // Request to join scanning room
      sendMessage('subscribe', { channel: 'scans' });

      return () => {
        unsubscribe('scan_started', handleScanStarted);
        unsubscribe('scan_progress', handleScanProgress);
        unsubscribe('scan_completed', handleScanCompleted);
        unsubscribe('scan_failed', handleScanFailed);
        unsubscribe('scan_cancelled', handleScanCancelled);
      };
    }
  }, [isConnected, subscribe, unsubscribe, sendMessage,
      handleScanStarted, handleScanProgress, handleScanCompleted,
      handleScanFailed, handleScanCancelled]);

  // Load initial scan data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const response = await scanningApi.getScans({ limit: 20 });

        if (response.success) {
          const scans = response.data.scans || [];
          const active = scans.filter((s: any) => 
            s.status === 'pending' || s.status === 'running'
          );
          const completed = scans.filter((s: any) => 
            s.status === 'completed' || s.status === 'failed'
          );

          setActiveScans(active);
          setCompletedScans(completed);
        }
      } catch (error) {
        console.error('Failed to load initial scan data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Start a new scan
  const startScan = useCallback(async (modelId: string, scanType: string = 'comprehensive') => {
    try {
      const response = await scanningApi.createScan({ modelId, scanType });
      
      if (response.success) {
        const newScan: RealTimeScan = {
          id: response.data.scan.id,
          model_id: modelId,
          model_name: response.data.scan.model_name || 'Unknown Model',
          status: 'pending',
          progress: 0,
          created_at: new Date().toISOString()
        };

        setActiveScans(prev => [newScan, ...prev]);

        toast.success('Scan Queued', {
          description: 'Security scan has been queued and will start shortly'
        });

        return response.data.scan;
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
      toast.error('Failed to start scan', {
        description: 'Please try again or contact support'
      });
      throw error;
    }
  }, []);

  // Cancel a running scan
  const cancelScan = useCallback(async (scanId: string) => {
    try {
      await scanningApi.cancelScan(scanId);
      
      setActiveScans(prev => prev.filter(s => s.id !== scanId));
      setScanProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(scanId);
        return newMap;
      });

      toast.info('Scan Cancelled', {
        description: 'The security scan has been cancelled'
      });
    } catch (error) {
      console.error('Failed to cancel scan:', error);
      toast.error('Failed to cancel scan');
    }
  }, []);

  // Retry a failed scan
  const retryScan = useCallback(async (scanId: string) => {
    try {
      const response = await scanningApi.retryScan(scanId);
      
      if (response.success) {
        const retriedScan: RealTimeScan = {
          id: response.data.scan.id,
          model_id: response.data.scan.model_id,
          model_name: response.data.scan.model_name || 'Unknown Model',
          status: 'pending',
          progress: 0,
          created_at: new Date().toISOString()
        };

        setActiveScans(prev => [retriedScan, ...prev.filter(s => s.id !== scanId)]);

        toast.success('Scan Retried', {
          description: 'Security scan has been queued for retry'
        });

        return response.data.scan;
      }
    } catch (error) {
      console.error('Failed to retry scan:', error);
      toast.error('Failed to retry scan');
      throw error;
    }
  }, []);

  // Refresh scans manually
  const refreshScans = useCallback(async () => {
    try {
      const response = await scanningApi.getScans({ limit: 20 });

      if (response.success) {
        const scans = response.data.scans || [];
        const active = scans.filter((s: any) => 
          s.status === 'pending' || s.status === 'running'
        );
        const completed = scans.filter((s: any) => 
          s.status === 'completed' || s.status === 'failed'
        );

        setActiveScans(active);
        setCompletedScans(completed);
      }
    } catch (error) {
      console.error('Failed to refresh scans:', error);
    }
  }, []);

  return {
    // State
    activeScans,
    completedScans,
    scanProgress,
    isLoading,
    isConnected,

    // Actions
    startScan,
    cancelScan,
    retryScan,
    refreshScans,

    // Helper functions
    getScanById: (id: string) => 
      [...activeScans, ...completedScans].find(s => s.id === id),
    getScansByModel: (modelId: string) =>
      [...activeScans, ...completedScans].filter(s => s.model_id === modelId),
    getProgress: (scanId: string) => scanProgress.get(scanId),

    // Statistics
    stats: {
      total: activeScans.length + completedScans.length,
      active: activeScans.length,
      completed: completedScans.filter(s => s.status === 'completed').length,
      failed: completedScans.filter(s => s.status === 'failed').length,
      avgProgress: activeScans.length > 0 
        ? activeScans.reduce((sum, s) => sum + s.progress, 0) / activeScans.length
        : 0
    }
  };
}