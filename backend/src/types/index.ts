import express from 'express';

export interface User extends Record<string, unknown> {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user' | 'analyst';
  is_active: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  mfa_secret?: string;
  last_login_at?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  email_verification_token?: string;
  email_verification_expires?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Organization extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession extends Record<string, unknown> {
  id: string;
  user_id: string;
  token_hash: string;
  refresh_token_hash: string;
  expires_at: Date;
  user_agent?: string;
  ip_address?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKey extends Record<string, unknown> {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  rate_limit_per_hour?: number;
  last_used_at?: Date;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SecurityEvent {
  id: string;
  user_id?: string;
  event_type: 'login' | 'logout' | 'failed_login' | 'password_reset' | 'mfa_enabled' | 'api_key_created' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface ThreatDetection extends Record<string, unknown> {
  id: string;
  model_id?: string;
  threat_type: 'malware' | 'phishing' | 'data_leak' | 'backdoor' | 'adversarial' | 'privacy_violation';
  confidence_score: number;
  status: 'detected' | 'analyzing' | 'resolved' | 'false_positive';
  description: string;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ModelScan extends Record<string, unknown> {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  file_hash: string;
  scan_status: 'queued' | 'scanning' | 'completed' | 'failed' | 'quarantined';
  scan_results?: Record<string, unknown>;
  threat_detections: ThreatDetection[];
  created_at: Date;
  updated_at: Date;
}

export interface NotificationData {
  id: string;
  type: 'scan_complete' | 'scan_failed' | 'threat_detected' | 'system_alert' | 'security_event';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  requiresAction?: boolean;
}

export interface AuthRequest extends express.Request {
  user?: User;
  session?: UserSession | undefined;
  apiKey?: ApiKey;
}

export interface JWTPayload {
  userId: string;
  sessionId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  max_connections?: number;
}

export interface MongoConfig {
  url: string;
  database: string;
  options?: Record<string, unknown>;
}

export interface RedisConfig {
  url: string;
  password?: string | undefined;
  db?: number;
  options?: Record<string, unknown>;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface AppConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  jwt_secret: string;
  jwt_refresh_secret: string;
  jwt_expires_in: string;
  jwt_refresh_expires_in: string;
  cors_origin: string;
  upload_max_size: string;
  rate_limit: {
    window_ms: number;
    max_requests: number;
  };
  database: DatabaseConfig;
  mongodb: MongoConfig;
  redis: RedisConfig;
  email: EmailConfig;
}