db = db.getSiblingDB('omnisecai_logs');

// Create collections
db.createCollection('security_events');
db.createCollection('model_activity_logs');
db.createCollection('llm_test_results');
db.createCollection('system_metrics');

// Create indexes for performance
db.security_events.createIndex({ "timestamp": 1 });
db.security_events.createIndex({ "severity": 1, "status": 1 });
db.security_events.createIndex({ "model_id": 1, "timestamp": -1 });

db.model_activity_logs.createIndex({ "model_id": 1, "timestamp": -1 });
db.model_activity_logs.createIndex({ "timestamp": 1 });

db.llm_test_results.createIndex({ "model_id": 1, "test_type": 1 });
db.llm_test_results.createIndex({ "timestamp": -1 });

db.system_metrics.createIndex({ "timestamp": 1 });
db.system_metrics.createIndex({ "service": 1, "timestamp": -1 });

// Insert sample data
db.security_events.insertMany([
    {
        model_id: "sample-model-001",
        event_type: "prompt_injection_detected",
        severity: "high",
        status: "active",
        title: "Prompt Injection Attempt Detected",
        description: "Suspicious prompt pattern detected in user input",
        metadata: {
            user_input: "Ignore previous instructions and...",
            confidence: 0.95,
            detection_method: "pattern_matching"
        },
        timestamp: new Date()
    },
    {
        model_id: "sample-model-002",
        event_type: "adversarial_attack",
        severity: "critical",
        status: "investigating",
        title: "Adversarial Attack on Computer Vision Model",
        description: "Input image modified to cause misclassification",
        metadata: {
            original_prediction: "cat",
            adversarial_prediction: "dog",
            confidence_drop: 0.87
        },
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    }
]);

print('MongoDB initialization completed');