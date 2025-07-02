// Core application types for OmnisecAI Mobile

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  role: 'admin' | 'analyst' | 'user' | 'viewer';
  organizationId: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
}

export interface Threat {
  id: string;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  confidenceScore: number;
  userId: string;
  modelId?: string;
  description: string;
  indicators: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface SecurityMetrics {
  threats: {
    total: number;
    active: number;
    detections24h: number;
    summary: Array<{ severity: string; count: number }>;
  };
  models: {
    total: number;
    active: number;
  };
  activity: {
    securityEvents24h: number;
    auditLogs24h: number;
  };
  lastUpdated: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  size: number;
  status: 'active' | 'inactive' | 'scanning' | 'error';
  uploadedBy: string;
  uploadedAt: string;
  lastScannedAt?: string;
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface Scan {
  id: string;
  modelId: string;
  modelName: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  completedAt?: string;
  results?: {
    vulnerabilities: Array<{
      id: string;
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    summary: {
      total: number;
      bySeverity: Record<string, number>;
    };
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'security';
  title: string;
  message: string;
  userId?: string;
  data?: Record<string, any>;
  read: boolean;
  requiresAction: boolean;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MFASetup: undefined;
  BiometricSetup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Threats: undefined;
  Models: undefined;
  Scans: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type ThreatStackParamList = {
  ThreatList: undefined;
  ThreatDetail: { threatId: string };
  ThreatCreate: undefined;
};

export type ModelStackParamList = {
  ModelList: undefined;
  ModelDetail: { modelId: string };
  ModelUpload: undefined;
};

export type ScanStackParamList = {
  ScanList: undefined;
  ScanDetail: { scanId: string };
  ScanCreate: { modelId?: string };
};

// Store types
export interface AppState {
  auth: AuthState;
  dashboard: {
    metrics: SecurityMetrics | null;
    isLoading: boolean;
    lastRefresh: Date | null;
    error: string | null;
  };
  threats: {
    items: Threat[];
    isLoading: boolean;
    error: string | null;
    pagination: {
      page: number;
      totalPages: number;
      total: number;
    };
  };
  models: {
    items: Model[];
    isLoading: boolean;
    error: string | null;
    pagination: {
      page: number;
      totalPages: number;
      total: number;
    };
  };
  scans: {
    items: Scan[];
    isLoading: boolean;
    error: string | null;
    pagination: {
      page: number;
      totalPages: number;
      total: number;
    };
  };
  notifications: {
    items: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
  };
  app: {
    isOnline: boolean;
    theme: 'light' | 'dark' | 'system';
    pushNotificationsEnabled: boolean;
    biometricEnabled: boolean;
    offlineQueue: Array<{
      id: string;
      request: any;
      timestamp: number;
      retries: number;
    }>;
  };
}

// API client types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
}

// Biometric types
export interface BiometricConfig {
  title: string;
  subtitle: string;
  description: string;
  fallbackTitle: string;
  negativeText: string;
}

// Storage types
export interface SecureStorageConfig {
  service: string;
  accessGroup?: string;
  touchID?: boolean;
  showModal?: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR';
  offline: boolean;
  retryable: boolean;
}

export interface AuthError extends AppError {
  code: 'AUTH_ERROR';
  reason: 'invalid_credentials' | 'token_expired' | 'biometric_failed' | 'mfa_required';
}

export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

// Component props types
export interface BaseScreenProps {
  navigation: any;
  route: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface RefreshableProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export interface SearchableProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
}

export interface FilterableProps<T = any> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  onClearFilters: () => void;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationSlug?: string;
  agreeToTerms: boolean;
}

export interface MFASetupForm {
  secret: string;
  qrCode: string;
  verificationCode: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  screen?: string;
}

// Push notification types
export interface PushNotificationData {
  type: 'threat' | 'scan' | 'system' | 'security';
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority: 'low' | 'normal' | 'high';
}

export interface NotificationPermissions {
  alert: boolean;
  badge: boolean;
  sound: boolean;
  critical: boolean;
}