/**
 * Dashboard store for OmnisecAI Mobile
 * Manages dashboard metrics and real-time data
 */
import { create } from 'zustand';
import { SecurityMetrics } from '@/types';
import { dashboardApi } from '@/services/api';

interface DashboardStore {
  // State
  metrics: SecurityMetrics | null;
  systemHealth: any | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastRefresh: Date | null;

  // Actions
  fetchMetrics: () => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  metrics: null,
  systemHealth: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastRefresh: null,

  // Actions
  fetchMetrics: async () => {
    const currentState = get();
    
    // Don't set loading if we're refreshing (to show cached data)
    if (!currentState.isRefreshing) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await dashboardApi.getMetrics();
      const dashboardData = response.data;

      // Transform backend data to match mobile interface
      const metrics: SecurityMetrics = {
        threats: {
          total: dashboardData.statistics?.total || 0,
          active: (dashboardData.criticalThreats?.length || 0) + 
                  (dashboardData.highThreats?.length || 0),
          detections24h: dashboardData.recentThreats?.length || 0,
          summary: [
            { severity: 'critical', count: dashboardData.criticalThreats?.length || 0 },
            { severity: 'high', count: dashboardData.highThreats?.length || 0 },
            { severity: 'medium', count: dashboardData.mediumThreats?.length || 0 },
            { severity: 'low', count: dashboardData.lowThreats?.length || 0 },
          ],
        },
        models: {
          total: dashboardData.models?.total || 0,
          active: dashboardData.models?.active || 0,
        },
        activity: {
          securityEvents24h: dashboardData.activity?.securityEvents24h || 0,
          auditLogs24h: dashboardData.activity?.auditLogs24h || 0,
        },
        lastUpdated: new Date().toISOString(),
      };

      set({
        metrics,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastRefresh: new Date(),
      });

      console.log('✅ Dashboard metrics updated');
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard metrics:', error);
      set({
        isLoading: false,
        isRefreshing: false,
        error: error.message || 'Failed to load dashboard data',
      });
    }
  },

  fetchSystemHealth: async () => {
    try {
      const response = await dashboardApi.getSystemHealth();
      set({ systemHealth: response.data });
      console.log('✅ System health updated');
    } catch (error: any) {
      console.error('❌ Failed to fetch system health:', error);
      // Don't set error for system health failures as it's not critical
    }
  },

  refreshDashboard: async () => {
    set({ isRefreshing: true, error: null });
    
    try {
      await Promise.all([
        get().fetchMetrics(),
        get().fetchSystemHealth(),
      ]);
    } catch (error) {
      // Errors are handled in individual fetch methods
    } finally {
      set({ isRefreshing: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      metrics: null,
      systemHealth: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastRefresh: null,
    });
  },
}));