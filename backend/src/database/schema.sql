-- =============================================================================
-- OmnisecAI PostgreSQL Database Schema
-- Comprehensive cybersecurity platform database design
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- ORGANIZATIONS & USERS
-- =============================================================================

-- Organizations table for multi-tenancy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
    max_users INTEGER DEFAULT 10,
    max_models INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'analyst', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- MFA settings
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(32),
    mfa_backup_codes TEXT[],
    
    -- Account recovery
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    
    -- Login tracking
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- User sessions for JWT management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Keys for programmatic access
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    scopes TEXT[] DEFAULT '{}',
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- AI MODELS & SCANS
-- =============================================================================

-- AI/ML Models uploaded for scanning
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100),
    storage_path VARCHAR(1000) NOT NULL,
    
    -- Model metadata
    model_type VARCHAR(100), -- 'tensorflow', 'pytorch', 'onnx', 'huggingface', etc.
    framework VARCHAR(100),
    version VARCHAR(50),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Scan status
    scan_status VARCHAR(50) DEFAULT 'queued' CHECK (scan_status IN ('queued', 'scanning', 'completed', 'failed', 'quarantined')),
    scan_started_at TIMESTAMP WITH TIME ZONE,
    scan_completed_at TIMESTAMP WITH TIME ZONE,
    scan_duration_ms INTEGER,
    
    -- Results summary
    threat_level VARCHAR(20) DEFAULT 'unknown' CHECK (threat_level IN ('safe', 'low', 'medium', 'high', 'critical', 'unknown')),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    threats_detected INTEGER DEFAULT 0,
    vulnerabilities_found INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model scan results
CREATE TABLE scan_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    
    -- Scan details
    scan_type VARCHAR(100) NOT NULL, -- 'malware', 'backdoor', 'adversarial', 'privacy', 'bias', 'performance'
    scanner_name VARCHAR(100) NOT NULL,
    scanner_version VARCHAR(50),
    
    -- Results
    result_status VARCHAR(50) NOT NULL CHECK (result_status IN ('clean', 'suspicious', 'malicious', 'error')),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    severity_level VARCHAR(20) CHECK (severity_level IN ('info', 'low', 'medium', 'high', 'critical')),
    
    -- Details
    title VARCHAR(500),
    description TEXT,
    recommendation TEXT,
    details JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    
    -- Metadata
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- THREAT DETECTION & SECURITY
-- =============================================================================

-- Threat detections from various sources
CREATE TABLE threat_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Threat classification
    threat_type VARCHAR(100) NOT NULL, -- 'malware', 'backdoor', 'data_poisoning', 'model_stealing', etc.
    threat_category VARCHAR(100), -- 'evasion', 'poisoning', 'extraction', 'inference'
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('info', 'low', 'medium', 'high', 'critical')),
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Detection details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    attack_vector VARCHAR(200),
    indicators JSONB DEFAULT '{}',
    affected_components TEXT[] DEFAULT '{}',
    
    -- Response status
    status VARCHAR(50) DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'confirmed', 'resolved', 'false_positive')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Source information
    detection_source VARCHAR(100), -- 'automated_scan', 'manual_review', 'threat_intel', 'user_report'
    source_details JSONB DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security events and audit logs
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL, -- 'login', 'logout', 'failed_login', 'permission_change', etc.
    event_category VARCHAR(50), -- 'authentication', 'authorization', 'data_access', 'configuration'
    severity_level VARCHAR(20) DEFAULT 'info' CHECK (severity_level IN ('info', 'low', 'medium', 'high', 'critical')),
    
    -- Event details
    title VARCHAR(500),
    description TEXT,
    resource_type VARCHAR(100), -- 'user', 'model', 'api_key', 'organization'
    resource_id UUID,
    action VARCHAR(100), -- 'create', 'read', 'update', 'delete', 'access', 'modify'
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- COMPLIANCE & GOVERNANCE
-- =============================================================================

-- Compliance frameworks and standards
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- 'GDPR', 'CCPA', 'NIST', 'ISO27001', etc.
    version VARCHAR(50),
    description TEXT,
    requirements JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance assessments
CREATE TABLE compliance_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    
    -- Assessment details
    assessment_type VARCHAR(50), -- 'automated', 'manual', 'hybrid'
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Results
    passed_requirements INTEGER DEFAULT 0,
    failed_requirements INTEGER DEFAULT 0,
    not_applicable INTEGER DEFAULT 0,
    findings JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '{}',
    
    -- Metadata
    assessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MONITORING & ANALYTICS
-- =============================================================================

-- System metrics and monitoring
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Metric details
    metric_name VARCHAR(200) NOT NULL,
    metric_type VARCHAR(50), -- 'counter', 'gauge', 'histogram', 'timer'
    metric_value DECIMAL(20,6),
    metric_unit VARCHAR(50),
    
    -- Dimensions/tags
    dimensions JSONB DEFAULT '{}',
    
    -- Metadata
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Usage tracking
    feature VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    
    -- Metadata
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    additional_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- NOTIFICATIONS & ALERTS
-- =============================================================================

-- Notification channels
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Channel details
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'slack', 'webhook', 'sms', 'teams')),
    configuration JSONB NOT NULL DEFAULT '{}',
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alert rules and configurations
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rule definition
    name VARCHAR(200) NOT NULL,
    description TEXT,
    rule_type VARCHAR(100) NOT NULL, -- 'threshold', 'anomaly', 'pattern', 'compliance'
    conditions JSONB NOT NULL DEFAULT '{}',
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('info', 'low', 'medium', 'high', 'critical')),
    
    -- Actions
    notification_channels UUID[] DEFAULT '{}',
    auto_actions JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alert instances
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
    
    -- Alert details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('info', 'low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'suppressed')),
    
    -- Context
    source_type VARCHAR(100), -- 'threat_detection', 'compliance_violation', 'system_metric', 'manual'
    source_id UUID,
    affected_resources JSONB DEFAULT '{}',
    
    -- Response tracking
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_role ON users(role);

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- API Keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Models indexes
CREATE INDEX idx_models_user_id ON models(user_id);
CREATE INDEX idx_models_organization_id ON models(organization_id);
CREATE INDEX idx_models_scan_status ON models(scan_status);
CREATE INDEX idx_models_threat_level ON models(threat_level);
CREATE INDEX idx_models_file_hash ON models(file_hash);
CREATE INDEX idx_models_created_at ON models(created_at);

-- Scan results indexes
CREATE INDEX idx_scan_results_model_id ON scan_results(model_id);
CREATE INDEX idx_scan_results_scan_type ON scan_results(scan_type);
CREATE INDEX idx_scan_results_result_status ON scan_results(result_status);

-- Threat detections indexes
CREATE INDEX idx_threat_detections_organization_id ON threat_detections(organization_id);
CREATE INDEX idx_threat_detections_model_id ON threat_detections(model_id);
CREATE INDEX idx_threat_detections_threat_type ON threat_detections(threat_type);
CREATE INDEX idx_threat_detections_severity_level ON threat_detections(severity_level);
CREATE INDEX idx_threat_detections_status ON threat_detections(status);
CREATE INDEX idx_threat_detections_created_at ON threat_detections(created_at);

-- Security events indexes
CREATE INDEX idx_security_events_organization_id ON security_events(organization_id);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity_level ON security_events(severity_level);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);

-- Alerts indexes
CREATE INDEX idx_alerts_organization_id ON alerts(organization_id);
CREATE INDEX idx_alerts_severity_level ON alerts(severity_level);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- Analytics indexes
CREATE INDEX idx_usage_analytics_organization_id ON usage_analytics(organization_id);
CREATE INDEX idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_feature ON usage_analytics(feature);
CREATE INDEX idx_usage_analytics_created_at ON usage_analytics(created_at);

-- System metrics indexes
CREATE INDEX idx_system_metrics_organization_id ON system_metrics(organization_id);
CREATE INDEX idx_system_metrics_metric_name ON system_metrics(metric_name);
CREATE INDEX idx_system_metrics_collected_at ON system_metrics(collected_at);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables with updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threat_detections_updated_at BEFORE UPDATE ON threat_detections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_frameworks_updated_at BEFORE UPDATE ON compliance_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_assessments_updated_at BEFORE UPDATE ON compliance_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_channels_updated_at BEFORE UPDATE ON notification_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();