// OmnisecAI MongoDB Initialization Script
// This script sets up the initial database structure and collections

// Switch to the omnisecai_logs database
db = db.getSiblingDB('omnisecai_logs');

// Create collections with validation schemas

// Security Events Collection
db.createCollection('security_events', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'event_type', 'severity', 'source'],
      properties: {
        timestamp: {
          bsonType: 'date',
          description: 'Event timestamp is required'
        },
        event_type: {
          bsonType: 'string',
          enum: ['authentication', 'authorization', 'model_access', 'threat_detected', 'anomaly', 'system'],
          description: 'Event type must be one of the allowed values'
        },
        severity: {
          bsonType: 'string',
          enum: ['critical', 'high', 'medium', 'low', 'info'],
          description: 'Severity must be one of the allowed values'
        },
        source: {
          bsonType: 'string',
          description: 'Event source is required'
        },
        organization_id: {
          bsonType: 'string',
          description: 'Organization ID for multi-tenant support'
        },
        user_id: {
          bsonType: 'string',
          description: 'User ID if applicable'
        },
        model_id: {
          bsonType: 'string',
          description: 'AI Model ID if applicable'
        },
        details: {
          bsonType: 'object',
          description: 'Additional event details'
        },
        ip_address: {
          bsonType: 'string',
          description: 'Client IP address'
        },
        user_agent: {
          bsonType: 'string',
          description: 'Client user agent'
        }
      }
    }
  }
});

// System Logs Collection
db.createCollection('system_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'level', 'service', 'message'],
      properties: {
        timestamp: {
          bsonType: 'date',
          description: 'Log timestamp is required'
        },
        level: {
          bsonType: 'string',
          enum: ['error', 'warn', 'info', 'debug'],
          description: 'Log level must be one of the allowed values'
        },
        service: {
          bsonType: 'string',
          description: 'Service name is required'
        },
        message: {
          bsonType: 'string',
          description: 'Log message is required'
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional log metadata'
        },
        stack_trace: {
          bsonType: 'string',
          description: 'Stack trace for errors'
        }
      }
    }
  }
});

// AI Model Interactions Collection
db.createCollection('model_interactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'model_id', 'interaction_type'],
      properties: {
        timestamp: {
          bsonType: 'date',
          description: 'Interaction timestamp is required'
        },
        model_id: {
          bsonType: 'string',
          description: 'AI Model ID is required'
        },
        organization_id: {
          bsonType: 'string',
          description: 'Organization ID for multi-tenant support'
        },
        user_id: {
          bsonType: 'string',
          description: 'User ID if applicable'
        },
        interaction_type: {
          bsonType: 'string',
          enum: ['upload', 'scan', 'test', 'inference', 'update', 'delete'],
          description: 'Interaction type must be one of the allowed values'
        },
        input_data: {
          bsonType: 'object',
          description: 'Input data for the interaction'
        },
        output_data: {
          bsonType: 'object',
          description: 'Output data from the interaction'
        },
        performance_metrics: {
          bsonType: 'object',
          description: 'Performance metrics for the interaction'
        },
        duration_ms: {
          bsonType: 'number',
          description: 'Interaction duration in milliseconds'
        }
      }
    }
  }
});

// Threat Detection Logs Collection
db.createCollection('threat_detection_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'threat_type', 'severity', 'model_id'],
      properties: {
        timestamp: {
          bsonType: 'date',
          description: 'Detection timestamp is required'
        },
        threat_type: {
          bsonType: 'string',
          description: 'Type of threat detected'
        },
        severity: {
          bsonType: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: 'Threat severity is required'
        },
        model_id: {
          bsonType: 'string',
          description: 'Affected model ID is required'
        },
        organization_id: {
          bsonType: 'string',
          description: 'Organization ID for multi-tenant support'
        },
        detection_method: {
          bsonType: 'string',
          description: 'Method used to detect the threat'
        },
        threat_details: {
          bsonType: 'object',
          description: 'Detailed information about the threat'
        },
        mitigation_actions: {
          bsonType: 'array',
          description: 'Actions taken to mitigate the threat'
        },
        false_positive: {
          bsonType: 'bool',
          description: 'Whether this was marked as a false positive'
        }
      }
    }
  }
});

// Performance Metrics Collection
db.createCollection('performance_metrics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'metric_type', 'value'],
      properties: {
        timestamp: {
          bsonType: 'date',
          description: 'Metric timestamp is required'
        },
        metric_type: {
          bsonType: 'string',
          enum: ['cpu_usage', 'memory_usage', 'disk_usage', 'network_io', 'response_time', 'throughput', 'error_rate'],
          description: 'Metric type must be one of the allowed values'
        },
        value: {
          bsonType: 'number',
          description: 'Metric value is required'
        },
        service: {
          bsonType: 'string',
          description: 'Service that generated the metric'
        },
        organization_id: {
          bsonType: 'string',
          description: 'Organization ID for multi-tenant support'
        },
        tags: {
          bsonType: 'object',
          description: 'Additional tags for the metric'
        }
      }
    }
  }
});

// Create indexes for better performance

// Security Events indexes
db.security_events.createIndex({ 'timestamp': -1 });
db.security_events.createIndex({ 'organization_id': 1, 'timestamp': -1 });
db.security_events.createIndex({ 'event_type': 1, 'severity': 1 });
db.security_events.createIndex({ 'model_id': 1, 'timestamp': -1 });
db.security_events.createIndex({ 'user_id': 1, 'timestamp': -1 });

// System Logs indexes
db.system_logs.createIndex({ 'timestamp': -1 });
db.system_logs.createIndex({ 'service': 1, 'level': 1, 'timestamp': -1 });

// Model Interactions indexes
db.model_interactions.createIndex({ 'timestamp': -1 });
db.model_interactions.createIndex({ 'model_id': 1, 'timestamp': -1 });
db.model_interactions.createIndex({ 'organization_id': 1, 'timestamp': -1 });
db.model_interactions.createIndex({ 'interaction_type': 1, 'timestamp': -1 });

// Threat Detection Logs indexes
db.threat_detection_logs.createIndex({ 'timestamp': -1 });
db.threat_detection_logs.createIndex({ 'model_id': 1, 'timestamp': -1 });
db.threat_detection_logs.createIndex({ 'organization_id': 1, 'severity': 1, 'timestamp': -1 });
db.threat_detection_logs.createIndex({ 'threat_type': 1, 'severity': 1 });

// Performance Metrics indexes
db.performance_metrics.createIndex({ 'timestamp': -1 });
db.performance_metrics.createIndex({ 'service': 1, 'metric_type': 1, 'timestamp': -1 });
db.performance_metrics.createIndex({ 'organization_id': 1, 'timestamp': -1 });

// Insert sample data for testing
print('Inserting sample data...');

// Sample security event
db.security_events.insertOne({
  timestamp: new Date(),
  event_type: 'authentication',
  severity: 'info',
  source: 'auth_service',
  organization_id: 'demo-org-id',
  user_id: 'admin-user-id',
  details: {
    action: 'user_login',
    success: true,
    method: 'email_password'
  },
  ip_address: '127.0.0.1',
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
});

// Sample system log
db.system_logs.insertOne({
  timestamp: new Date(),
  level: 'info',
  service: 'backend_api',
  message: 'Database initialization completed successfully',
  metadata: {
    component: 'database',
    operation: 'init'
  }
});

// Sample performance metric
db.performance_metrics.insertOne({
  timestamp: new Date(),
  metric_type: 'response_time',
  value: 150,
  service: 'backend_api',
  organization_id: 'demo-org-id',
  tags: {
    endpoint: '/api/v1/health',
    method: 'GET'
  }
});

print('MongoDB initialization completed successfully!');
print('Collections created: security_events, system_logs, model_interactions, threat_detection_logs, performance_metrics');
print('Indexes created for optimal performance');
print('Sample data inserted for testing');