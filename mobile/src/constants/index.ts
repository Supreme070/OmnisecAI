// Application constants for OmnisecAI Mobile

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:8000/api/v1' 
    : 'https://api.omnisecai.com/v1',
  WS_URL: __DEV__ 
    ? 'ws://localhost:8000/ws' 
    : 'wss://api.omnisecai.com/ws',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'omnisecai_auth_token',
  REFRESH_TOKEN: 'omnisecai_refresh_token',
  USER_DATA: 'omnisecai_user_data',
  BIOMETRIC_ENABLED: 'omnisecai_biometric_enabled',
  PUSH_TOKEN: 'omnisecai_push_token',
  THEME: 'omnisecai_theme',
  OFFLINE_QUEUE: 'omnisecai_offline_queue',
  NOTIFICATIONS: 'omnisecai_notifications',
} as const;

// Theme Colors
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  yellow: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
} as const;

// Severity Colors
export const SEVERITY_COLORS = {
  low: COLORS.green[500],
  medium: COLORS.yellow[500],
  high: COLORS.yellow[600],
  critical: COLORS.red[500],
} as const;

// Status Colors
export const STATUS_COLORS = {
  active: COLORS.green[500],
  inactive: COLORS.gray[400],
  pending: COLORS.yellow[500],
  running: COLORS.primary[500],
  completed: COLORS.green[500],
  failed: COLORS.red[500],
  cancelled: COLORS.gray[500],
  detected: COLORS.red[500],
  investigating: COLORS.yellow[500],
  resolved: COLORS.green[500],
  false_positive: COLORS.gray[500],
} as const;

// Screen Names
export const SCREENS = {
  SPLASH: 'Splash',
  AUTH: 'Auth',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  MFA_SETUP: 'MFASetup',
  BIOMETRIC_SETUP: 'BiometricSetup',
  MAIN: 'Main',
  DASHBOARD: 'Dashboard',
  THREATS: 'Threats',
  THREAT_LIST: 'ThreatList',
  THREAT_DETAIL: 'ThreatDetail',
  THREAT_CREATE: 'ThreatCreate',
  MODELS: 'Models',
  MODEL_LIST: 'ModelList',
  MODEL_DETAIL: 'ModelDetail',
  MODEL_UPLOAD: 'ModelUpload',
  SCANS: 'Scans',
  SCAN_LIST: 'ScanList',
  SCAN_DETAIL: 'ScanDetail',
  SCAN_CREATE: 'ScanCreate',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SPLASH: 2000,
} as const;

// Layout Constants
export const LAYOUT = {
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
  PADDING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  FONT_WEIGHTS: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  LINE_HEIGHTS: {
    TIGHT: 1.2,
    NORMAL: 1.4,
    RELAXED: 1.6,
  },
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  THREAT_DETECTED: 'threat_detected',
  SCAN_COMPLETED: 'scan_completed',
  SCAN_FAILED: 'scan_failed',
  MODEL_UPLOADED: 'model_uploaded',
  SYSTEM_ALERT: 'system_alert',
  SECURITY_ALERT: 'security_alert',
  USER_ACTIVITY: 'user_activity',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  THREAT_DETECTED: 'threat_detected',
  THREAT_UPDATED: 'threat_updated',
  SCAN_PROGRESS: 'scan_progress',
  SCAN_COMPLETED: 'scan_completed',
  NOTIFICATION: 'notification',
  SYSTEM_ALERT: 'system_alert',
  USER_ACTIVITY: 'user_activity',
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  BIOMETRIC_ERROR: 'BIOMETRIC_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',
} as const;

// Biometric Types
export const BIOMETRIC_TYPES = {
  TOUCH_ID: 'TouchID',
  FACE_ID: 'FaceID',
  FINGERPRINT: 'Fingerprint',
  BIOMETRIC: 'Biometric',
} as const;

// Permission Types
export const PERMISSIONS = {
  CAMERA: 'camera',
  NOTIFICATIONS: 'notifications',
  BIOMETRIC: 'biometric',
  LOCATION: 'location',
} as const;

// Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  THREATS: 15000,   // 15 seconds
  SCANS: 5000,      // 5 seconds (for active scans)
  NOTIFICATIONS: 60000, // 1 minute
} as const;

// Offline Queue Constants
export const OFFLINE_QUEUE = {
  MAX_SIZE: 50,
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  CLEANUP_INTERVAL: 300000, // 5 minutes
} as const;

// Security Constants
export const SECURITY = {
  TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes
  SESSION_TIMEOUT: 3600000, // 1 hour
  BIOMETRIC_TIMEOUT: 30000, // 30 seconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  MFA_CODE_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_TYPES: [
    'application/octet-stream',
    'application/zip',
    'application/x-tar',
    'application/gzip',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  APP_OPENED: 'app_opened',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  SCREEN_VIEW: 'screen_view',
  THREAT_VIEWED: 'threat_viewed',
  MODEL_UPLOADED: 'model_uploaded',
  SCAN_STARTED: 'scan_started',
  NOTIFICATION_TAPPED: 'notification_tapped',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  ERROR_OCCURRED: 'error_occurred',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  BIOMETRIC_AUTH: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  REAL_TIME_UPDATES: true,
  ANALYTICS: true,
  CRASH_REPORTING: true,
  BETA_FEATURES: __DEV__,
} as const;

// Development Constants
export const DEV = {
  ENABLE_FLIPPER: __DEV__,
  ENABLE_DEBUG_LOGS: __DEV__,
  MOCK_API_RESPONSES: false,
  BYPASS_AUTH: false,
  SHOW_PERFORMANCE_OVERLAY: false,
} as const;