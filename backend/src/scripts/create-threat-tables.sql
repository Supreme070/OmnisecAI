-- Create threat_monitor table
CREATE TABLE IF NOT EXISTS threat_monitor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    threat_type VARCHAR(50) NOT NULL CHECK (threat_type IN ('malware', 'phishing', 'data_leak', 'backdoor', 'adversarial', 'privacy_violation')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(30) NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'resolved', 'false_positive', 'suppressed')),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('model_scan', 'behavior_analysis', 'network_monitor', 'user_report', 'external_feed')),
    source_id VARCHAR(255),
    detection_method VARCHAR(255) NOT NULL,
    indicators JSONB NOT NULL DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    first_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_threat_monitor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_threat_monitor_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create threat_patterns table
CREATE TABLE IF NOT EXISTS threat_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    pattern_type VARCHAR(30) NOT NULL CHECK (pattern_type IN ('signature', 'behavioral', 'statistical', 'ml_based')),
    threat_types TEXT[] NOT NULL DEFAULT '{}',
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    indicators JSONB NOT NULL DEFAULT '{}',
    detection_rules JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    false_positive_rate DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (false_positive_rate >= 0 AND false_positive_rate <= 1),
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_threat_patterns_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for threat_monitor table
CREATE INDEX IF NOT EXISTS idx_threat_monitor_user_id ON threat_monitor(user_id);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_threat_id ON threat_monitor(threat_id);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_threat_type ON threat_monitor(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_severity ON threat_monitor(severity);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_status ON threat_monitor(status);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_source_type ON threat_monitor(source_type);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_source_id ON threat_monitor(source_id);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_confidence ON threat_monitor(confidence_score);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_created_at ON threat_monitor(created_at);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_first_detected ON threat_monitor(first_detected_at);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_last_detected ON threat_monitor(last_detected_at);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_resolved_at ON threat_monitor(resolved_at);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_indicators ON threat_monitor USING GIN(indicators);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_metadata ON threat_monitor USING GIN(metadata);

-- Create indexes for threat_patterns table
CREATE INDEX IF NOT EXISTS idx_threat_patterns_name ON threat_patterns(name);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_type ON threat_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_severity ON threat_patterns(severity);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_active ON threat_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_created_by ON threat_patterns(created_by);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_threat_types ON threat_patterns USING GIN(threat_types);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_indicators ON threat_patterns USING GIN(indicators);
CREATE INDEX IF NOT EXISTS idx_threat_patterns_rules ON threat_patterns USING GIN(detection_rules);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_threat_monitor_user_status ON threat_monitor(user_id, status);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_user_type ON threat_monitor(user_id, threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_user_severity ON threat_monitor(user_id, severity);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_status_severity ON threat_monitor(status, severity);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_type_severity ON threat_monitor(threat_type, severity);
CREATE INDEX IF NOT EXISTS idx_threat_monitor_user_created ON threat_monitor(user_id, created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to threat_monitor table
DROP TRIGGER IF EXISTS update_threat_monitor_updated_at ON threat_monitor;
CREATE TRIGGER update_threat_monitor_updated_at
    BEFORE UPDATE ON threat_monitor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to threat_patterns table
DROP TRIGGER IF EXISTS update_threat_patterns_updated_at ON threat_patterns;
CREATE TRIGGER update_threat_patterns_updated_at
    BEFORE UPDATE ON threat_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default threat patterns
INSERT INTO threat_patterns (name, description, pattern_type, threat_types, severity, indicators, detection_rules, created_by)
SELECT 
    'Suspicious Import Patterns',
    'Detects suspicious import statements that could indicate malicious code',
    'signature',
    ARRAY['malware', 'backdoor'],
    'high',
    '{"patterns": ["subprocess", "os", "sys", "socket", "urllib", "requests", "pickle", "eval", "exec"]}',
    '{"regex": "import\\s+(subprocess|os|sys|socket|urllib|requests|pickle|eval|exec)", "flags": "gi"}',
    u.id
FROM users u WHERE u.role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

INSERT INTO threat_patterns (name, description, pattern_type, threat_types, severity, indicators, detection_rules, created_by)
SELECT 
    'Network Communication Patterns',
    'Detects network communication patterns that could exfiltrate data',
    'behavioral',
    ARRAY['data_leak', 'malware'],
    'medium',
    '{"patterns": ["http://", "https://", "ftp://", "tcp://", "socket.connect", "urllib.request", "requests.get", "requests.post"]}',
    '{"regex": "(http[s]?://|ftp://|tcp://|socket\\.connect|urllib\\.request|requests\\.(get|post))", "flags": "gi"}',
    u.id
FROM users u WHERE u.role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

INSERT INTO threat_patterns (name, description, pattern_type, threat_types, severity, indicators, detection_rules, created_by)
SELECT 
    'Code Execution Patterns',
    'Detects dynamic code execution patterns',
    'signature',
    ARRAY['backdoor', 'malware'],
    'critical',
    '{"patterns": ["eval(", "exec(", "compile(", "__import__(", "getattr(", "setattr("]}',
    '{"regex": "(eval\\s*\\(|exec\\s*\\(|compile\\s*\\(|__import__\\s*\\()", "flags": "gi"}',
    u.id
FROM users u WHERE u.role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

INSERT INTO threat_patterns (name, description, pattern_type, threat_types, severity, indicators, detection_rules, created_by)
SELECT 
    'Adversarial Attack Patterns',
    'Detects potential adversarial attack implementations',
    'behavioral',
    ARRAY['adversarial'],
    'medium',
    '{"patterns": ["fgsm", "pgd", "c&w", "deepfool", "adversarial", "perturbation", "gradient"]}',
    '{"regex": "(fgsm|pgd|c&w|deepfool|adversarial|perturbation|gradient.*attack)", "flags": "gi"}',
    u.id
FROM users u WHERE u.role = 'admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW active_threats AS
SELECT 
    tm.*,
    u.username,
    u.email
FROM threat_monitor tm
JOIN users u ON tm.user_id = u.id
WHERE tm.status IN ('detected', 'investigating')
ORDER BY 
    CASE tm.severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END,
    tm.confidence_score DESC,
    tm.created_at DESC;

CREATE OR REPLACE VIEW threat_summary AS
SELECT 
    date_trunc('day', created_at) as threat_date,
    threat_type,
    severity,
    status,
    COUNT(*) as threat_count,
    AVG(confidence_score) as avg_confidence,
    COUNT(DISTINCT user_id) as affected_users
FROM threat_monitor
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 
    date_trunc('day', created_at),
    threat_type,
    severity,
    status
ORDER BY threat_date DESC, threat_count DESC;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON threat_monitor TO omnisecai_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON threat_patterns TO omnisecai_app;
GRANT SELECT ON active_threats TO omnisecai_app;
GRANT SELECT ON threat_summary TO omnisecai_app;
GRANT USAGE ON SCHEMA public TO omnisecai_app;