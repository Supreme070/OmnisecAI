-- Simple seeds for testing
INSERT INTO organizations (id, name, slug, subscription_tier) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Acme Corporation', 'acme-corp', 'professional');

INSERT INTO users (id, organization_id, email, username, password_hash, first_name, last_name, role, is_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@acme.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3L/RjKQJzO', 'Admin', 'User', 'admin', true);

INSERT INTO compliance_frameworks (name, code, description) VALUES 
('GDPR', 'GDPR', 'European Union regulation on data protection and privacy'),
('NIST Framework', 'NIST_CSF', 'Framework for improving cybersecurity risk management');