import { create } from 'zustand';
import { securityApi, monitoringApi } from '@/lib/api';

export interface SecurityMetrics {
  threats: {
    total: number;
    active: number;
    detections_24h: number;
    summary: Array<{ severity: string; count: number }>;
    recent: any[];
  };
  models: {
    total: number;
    active: number;
  };
  activity: {
    security_events_24h: number;
    audit_logs_24h: number;
  };
  events: any[];
  lastUpdated: string;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage_percent: number;
    count: number;
    load_average?: number[];
  };
  memory: {
    total_gb: number;
    available_gb: number;
    used_percent: number;
    free_gb: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    used_percent: number;
  };
  network: {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
  };
}

interface DashboardState {
  // Security data
  securityMetrics: SecurityMetrics | null;
  systemMetrics: SystemMetrics | null;
  isLoadingSecurityMetrics: boolean;
  isLoadingSystemMetrics: boolean;
  lastRefresh: Date | null;
  
  // Real-time updates
  realtimeEnabled: boolean;
  refreshInterval: number; // in seconds
  
  // Error states
  securityError: string | null;
  systemError: string | null;
  
  // Actions
  fetchSecurityMetrics: () => Promise<void>;
  fetchSystemMetrics: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  setRealtimeEnabled: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  clearErrors: () => void;
  
  // Real-time data updates
  updateSecurityMetrics: (metrics: Partial<SecurityMetrics>) => void;
  updateSystemMetrics: (metrics: Partial<SystemMetrics>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  securityMetrics: null,
  systemMetrics: null,
  isLoadingSecurityMetrics: false,
  isLoadingSystemMetrics: false,
  lastRefresh: null,
  realtimeEnabled: true,
  refreshInterval: 30, // 30 seconds default
  securityError: null,
  systemError: null,

  // Actions
  fetchSecurityMetrics: async () => {
    set({ isLoadingSecurityMetrics: true, securityError: null });
    
    try {
      const response = await securityApi.getDashboard();
      
      if (response.success && response.data) {
        set({
          securityMetrics: response.data,
          isLoadingSecurityMetrics: false,
          lastRefresh: new Date(),
        });
      } else {
        throw new Error(response.error || 'Failed to fetch security metrics');
      }
    } catch (error: any) {
      console.error('Security metrics fetch error:', error);
      set({
        securityError: error.message || 'Failed to fetch security metrics',
        isLoadingSecurityMetrics: false,
      });
    }
  },

  fetchSystemMetrics: async () => {
    set({ isLoadingSystemMetrics: true, systemError: null });
    
    try {
      const response = await monitoringApi.getMetrics();
      
      if (response.success && response.data) {
        set({
          systemMetrics: response.data.metrics,
          isLoadingSystemMetrics: false,
          lastRefresh: new Date(),
        });
      } else {
        throw new Error(response.error || 'Failed to fetch system metrics');
      }
    } catch (error: any) {
      console.error('System metrics fetch error:', error);
      set({
        systemError: error.message || 'Failed to fetch system metrics',
        isLoadingSystemMetrics: false,
      });
    }
  },

  refreshDashboard: async () => {
    const { fetchSecurityMetrics, fetchSystemMetrics } = get();
    await Promise.all([
      fetchSecurityMetrics(),
      fetchSystemMetrics(),
    ]);
  },

  setRealtimeEnabled: (enabled) => {
    set({ realtimeEnabled: enabled });
  },

  setRefreshInterval: (interval) => {
    set({ refreshInterval: interval });
  },

  clearErrors: () => {
    set({ securityError: null, systemError: null });
  },

  updateSecurityMetrics: (metrics) => {
    const current = get().securityMetrics;
    if (current) {
      set({
        securityMetrics: { ...current, ...metrics },
        lastRefresh: new Date(),
      });
    }
  },

  updateSystemMetrics: (metrics) => {
    const current = get().systemMetrics;
    if (current) {
      set({
        systemMetrics: { ...current, ...metrics },
        lastRefresh: new Date(),
      });
    }
  },
}));

// Selectors
export const useSecurityMetrics = () => useDashboardStore((state) => ({
  metrics: state.securityMetrics,
  isLoading: state.isLoadingSecurityMetrics,
  error: state.securityError,
}));

export const useSystemMetrics = () => useDashboardStore((state) => ({
  metrics: state.systemMetrics,
  isLoading: state.isLoadingSystemMetrics,
  error: state.systemError,
}));

export const useDashboardSettings = () => useDashboardStore((state) => ({
  realtimeEnabled: state.realtimeEnabled,
  refreshInterval: state.refreshInterval,
  lastRefresh: state.lastRefresh,
  setRealtimeEnabled: state.setRealtimeEnabled,
  setRefreshInterval: state.setRefreshInterval,
}));