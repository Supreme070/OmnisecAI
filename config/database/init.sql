-- Create application database
CREATE DATABASE omnisecai_security;

-- Create user with appropriate permissions
CREATE USER omnisecai_user WITH PASSWORD 'secure_app_password';
GRANT ALL PRIVILEGES ON DATABASE omnisecai_security TO omnisecai_user;

-- Connect to the application database
\c omnisecai_security;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create initial tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(50) DEFAULT 'active',
    security_score DECIMAL(5,2),
    last_scan_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES ai_models(id),
    threat_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating', 'false_positive')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    remediation TEXT,
    confidence_score DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Insert sample data
INSERT INTO organizations (name, domain, industry) VALUES
('ACME Corp', 'acme.com', 'technology'),
('Healthcare Solutions Inc', 'healthsol.com', 'healthcare'),
('Financial Tech Ltd', 'fintech.com', 'financial_services');

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@acme.com', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', 'admin'),
('analyst@acme.com', crypt('analyst123', gen_salt('bf')), 'Security', 'Analyst', 'analyst'),
('engineer@acme.com', crypt('engineer123', gen_salt('bf')), 'ML', 'Engineer', 'engineer');