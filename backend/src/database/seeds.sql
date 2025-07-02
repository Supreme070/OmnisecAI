-- =============================================================================
-- OmnisecAI Database Seeds
-- Sample data for development and testing
-- =============================================================================

-- Insert default compliance frameworks
INSERT INTO compliance_frameworks (id, name, code, version, description, requirements) VALUES
(
    uuid_generate_v4(),
    'General Data Protection Regulation',
    'GDPR',
    '2018',
    'European Union regulation on data protection and privacy',
    '{
        "data_minimization": "Process only necessary personal data",
        "consent": "Obtain clear consent for data processing",
        "right_to_erasure": "Provide ability to delete personal data",
        "data_portability": "Allow data export in machine-readable format",
        "privacy_by_design": "Implement privacy controls by default"
    }'
),
(
    uuid_generate_v4(),
    'California Consumer Privacy Act',
    'CCPA',
    '2020',
    'California state law intended to enhance privacy rights',
    '{
        "transparency": "Disclose categories of personal information collected",
        "opt_out": "Provide option to opt-out of sale of personal information",
        "deletion": "Allow consumers to request deletion of personal information",
        "non_discrimination": "Cannot discriminate against consumers exercising rights"
    }'
),
(
    uuid_generate_v4(),
    'NIST Cybersecurity Framework',
    'NIST_CSF',
    '1.1',
    'Framework for improving cybersecurity risk management',
    '{
        "identify": "Develop organizational understanding of cybersecurity risk",
        "protect": "Implement safeguards to ensure delivery of services",
        "detect": "Develop activities to identify cybersecurity events",
        "respond": "Develop activities to take action regarding detected events",
        "recover": "Develop activities to maintain resilience plans"
    }'
),
(
    uuid_generate_v4(),
    'ISO/IEC 27001',
    'ISO27001',
    '2013',
    'International standard for information security management',
    '{
        "risk_assessment": "Identify and assess information security risks",
        "security_controls": "Implement appropriate security controls",
        "monitoring": "Monitor and review information security",
        "continuous_improvement": "Continually improve the ISMS"
    }'
);

-- Insert sample organization
INSERT INTO organizations (id, name, slug, domain, settings, subscription_tier, max_users, max_models) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Acme Corporation',
    'acme-corp',
    'acme.com',
    '{
        "security_policy": "strict",
        "data_retention_days": 90,
        "auto_scan_enabled": true,
        "compliance_frameworks": ["GDPR", "NIST_CSF"],
        "notification_preferences": {
            "email_alerts": true,
            "slack_integration": true,
            "critical_only": false
        }
    }',
    'professional',
    50,
    1000
);

-- Insert sample admin user
INSERT INTO users (
    id, 
    organization_id, 
    email, 
    username, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    is_verified
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@acme.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L/RjKQJzO', -- password: admin123
    'Admin',
    'User',
    'admin',
    true,
    true
);

-- Insert sample analyst user  
INSERT INTO users (
    id,
    organization_id,
    email,
    username, 
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    is_verified
) VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'analyst@acme.com',
    'analyst',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L/RjKQJzO', -- password: admin123
    'Security',
    'Analyst',
    'analyst',
    true,
    true
);

-- Insert sample regular user
INSERT INTO users (
    id,
    organization_id,
    email,
    username,
    password_hash,
    first_name,
    last_name, 
    role,
    is_active,
    is_verified
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'user@acme.com',
    'user',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L/RjKQJzO', -- password: admin123
    'Regular',
    'User',
    'user',
    true,
    true
);

-- Insert sample API key for admin user
INSERT INTO api_keys (
    id,
    user_id,
    name,
    key_hash,
    key_prefix,
    permissions,
    scopes,
    rate_limit_per_hour
) VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    'Admin API Key',
    '$2b$12$example_hash_for_api_key_security_demo_purposes_only',
    'ak_live_demo',
    ARRAY['models:read', 'models:write', 'scans:read', 'scans:write', 'alerts:read', 'alerts:write'],
    ARRAY['admin', 'full_access'],
    5000
);

-- Insert sample notification channels
INSERT INTO notification_channels (
    id,
    organization_id,
    user_id,
    name,
    type,
    configuration,
    is_default
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'Security Team Email',
    'email',
    '{
        "recipients": ["security@acme.com", "admin@acme.com"],
        "subject_prefix": "[OmnisecAI Alert]",
        "include_details": true
    }',
    true
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'Slack Security Channel',
    'slack',
    '{
        "webhook_url": "https://hooks.slack.com/services/example/webhook/url",
        "channel": "#security-alerts",
        "username": "OmnisecAI",
        "icon_emoji": ":shield:"
    }',
    false
);

-- Insert sample alert rules
INSERT INTO alert_rules (
    id,
    organization_id,
    created_by,
    name,
    description,
    rule_type,
    conditions,
    severity_level,
    notification_channels
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'High Threat Detection',
    'Alert when high or critical threats are detected in models',
    'threshold',
    '{
        "metric": "threat_level",
        "operator": ">=",
        "value": "high",
        "resource_type": "model"
    }',
    'high',
    ARRAY[(SELECT id FROM notification_channels WHERE name = 'Security Team Email' LIMIT 1)]
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'Multiple Failed Logins',
    'Alert when user has multiple failed login attempts',
    'pattern',
    '{
        "event_type": "failed_login",
        "count": 5,
        "time_window": "15m",
        "group_by": "user_id"
    }',
    'medium',
    ARRAY[(SELECT id FROM notification_channels WHERE name = 'Security Team Email' LIMIT 1)]
);

-- Insert sample models
INSERT INTO models (
    id,
    user_id,
    organization_id,
    filename,
    original_filename,
    file_size,
    file_hash,
    mime_type,
    storage_path,
    model_type,
    framework,
    description,
    tags,
    scan_status,
    threat_level,
    confidence_score,
    threats_detected,
    metadata
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'image_classifier_v1.h5',
    'image_classifier_v1.h5',
    52428800, -- 50MB
    'sha256:a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    'application/octet-stream',
    '/storage/models/550e8400-e29b-41d4-a716-446655440020/image_classifier_v1.h5',
    'tensorflow',
    'keras',
    'Image classification model for detecting objects in photos',
    ARRAY['computer_vision', 'classification', 'tensorflow', 'production'],
    'completed',
    'low',
    0.95,
    1,
    '{
        "model_size": "50MB",
        "layers": 25,
        "parameters": 23587395,
        "input_shape": [224, 224, 3],
        "output_classes": 1000,
        "training_dataset": "ImageNet",
        "accuracy": 0.87
    }'
),
(
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'nlp_sentiment_model.pkl',
    'sentiment_analysis_v2.pkl',
    15728640, -- 15MB
    'sha256:b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
    'application/octet-stream',
    '/storage/models/550e8400-e29b-41d4-a716-446655440021/nlp_sentiment_model.pkl',
    'scikit-learn',
    'sklearn',
    'Sentiment analysis model for text classification',
    ARRAY['nlp', 'sentiment', 'sklearn', 'text_analysis'],
    'completed',
    'safe',
    0.98,
    0,
    '{
        "model_size": "15MB",
        "features": 50000,
        "algorithm": "Random Forest",
        "training_samples": 100000,
        "test_accuracy": 0.92,
        "languages": ["en"]
    }'
);

-- Insert sample scan results
INSERT INTO scan_results (
    id,
    model_id,
    scan_type,
    scanner_name,
    scanner_version,
    result_status,
    confidence_score,
    severity_level,
    title,
    description,
    recommendation,
    details,
    execution_time_ms
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440020',
    'malware',
    'ClamAV',
    '0.105.1',
    'clean',
    0.99,
    'info',
    'Malware Scan Complete',
    'No malware signatures detected in model file',
    'Model appears clean from known malware signatures',
    '{
        "signatures_checked": 8547329,
        "scan_duration": 1.24,
        "file_size": 52428800,
        "scan_engine": "ClamAV 0.105.1"
    }',
    1240
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440020',
    'backdoor',
    'OmnisecAI Backdoor Detector',
    '1.0.0',
    'suspicious',
    0.75,
    'low',
    'Potential Backdoor Pattern Detected',
    'Found unusual activation patterns that may indicate a backdoor',
    'Review model training data and methodology for potential data poisoning',
    '{
        "suspicious_layers": [15, 18, 22],
        "pattern_type": "unusual_activation",
        "confidence_details": "Pattern matches 75% of known backdoor signatures",
        "affected_neurons": 127
    }',
    15430
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440021',
    'privacy',
    'Privacy Guard',
    '2.1.0',
    'clean',
    0.96,
    'info',
    'Privacy Analysis Complete',
    'No privacy violations detected in model behavior',
    'Model appears to handle personal data appropriately',
    '{
        "privacy_checks": ["membership_inference", "attribute_inference", "model_inversion"],
        "pii_detection": false,
        "differential_privacy": null,
        "data_minimization": "compliant"
    }',
    8720
);

-- Insert sample threat detections
INSERT INTO threat_detections (
    id,
    organization_id,
    model_id,
    user_id,
    threat_type,
    threat_category,
    severity_level,
    confidence_score,
    title,
    description,
    attack_vector,
    indicators,
    status,
    detection_source,
    metadata
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440001',
    'backdoor',
    'poisoning',
    'low',
    0.75,
    'Potential Model Backdoor Detected',
    'Statistical analysis indicates possible backdoor insertion in neural network layers',
    'Training data poisoning',
    '{
        "suspicious_patterns": ["unusual_activation_clustering", "layer_weight_anomalies"],
        "affected_layers": [15, 18, 22],
        "trigger_pattern_likelihood": 0.75,
        "baseline_deviation": 2.3
    }',
    'investigating',
    'automated_scan',
    '{
        "scan_id": "scan_2024_001",
        "detection_algorithm": "statistical_anomaly_detection",
        "baseline_model": "imagenet_resnet50",
        "analysis_timestamp": "2024-01-15T10:30:00Z"
    }'
);

-- Insert sample security events
INSERT INTO security_events (
    id,
    organization_id,
    user_id,
    event_type,
    event_category,
    severity_level,
    title,
    description,
    resource_type,
    resource_id,
    action,
    ip_address,
    user_agent,
    metadata
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'login',
    'authentication',
    'info',
    'User Login',
    'Admin user successfully logged in',
    'user',
    '550e8400-e29b-41d4-a716-446655440001',
    'access',
    '192.168.1.100',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    '{
        "login_method": "password",
        "mfa_used": false,
        "session_duration": null,
        "location": "San Francisco, CA"
    }'
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'model_upload',
    'data_access',
    'info',
    'Model Uploaded',
    'New AI model uploaded for security scanning',
    'model',
    '550e8400-e29b-41d4-a716-446655440020',
    'create',
    '192.168.1.100',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    '{
        "file_size": 52428800,
        "file_type": "tensorflow",
        "scan_initiated": true,
        "upload_duration": 45.2
    }'
);

-- Insert sample system metrics
INSERT INTO system_metrics (
    id,
    organization_id,
    metric_name,
    metric_type,
    metric_value,
    metric_unit,
    dimensions
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    'models_scanned_total',
    'counter',
    47,
    'count',
    '{
        "scan_type": "security",
        "result": "completed"
    }'
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    'threats_detected_total',
    'counter',
    3,
    'count',
    '{
        "severity": "high",
        "status": "confirmed"
    }'
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    'scan_duration_avg',
    'gauge',
    12.5,
    'seconds',
    '{
        "scan_type": "comprehensive",
        "model_size_range": "medium"
    }'
);

-- Insert sample usage analytics
INSERT INTO usage_analytics (
    id,
    organization_id,
    user_id,
    feature,
    action,
    resource_type,
    resource_id,
    additional_data
) VALUES
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    'model_upload',
    'upload_completed',
    'model',
    '550e8400-e29b-41d4-a716-446655440020',
    '{
        "file_size": 52428800,
        "upload_time": 45.2,
        "auto_scan_triggered": true
    }'
),
(
    uuid_generate_v4(),
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    'threat_investigation',
    'investigation_started',
    'threat',
    '550e8400-e29b-41d4-a716-446655440020',
    '{
        "threat_type": "backdoor",
        "severity": "low",
        "investigation_method": "manual"
    }'
);