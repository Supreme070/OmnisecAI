const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

let client;
let db;

const mongoConfig = {
  url: process.env.MONGO_URL || 'mongodb://admin:omnisecai_mongo_2024@localhost:27017/omnisecai_logs?authSource=admin',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    retryWrites: true,
    writeConcern: {
      w: 'majority'
    }
  }
};

async function connectToMongoDB() {
  try {
    client = new MongoClient(mongoConfig.url, mongoConfig.options);
    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    
    db = client.db('omnisecai_logs');
    
    logger.info('MongoDB connected successfully', {
      database: 'omnisecai_logs',
      url: mongoConfig.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials in logs
    });
    
    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      error: error.message,
      stack: error.stack,
      url: mongoConfig.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    });
    throw error;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB() first.');
  }
  return db;
}

function getClient() {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectToMongoDB() first.');
  }
  return client;
}

// Logging helper functions
async function logSecurityEvent(eventData) {
  try {
    const collection = db.collection('security_events');
    const result = await collection.insertOne({
      ...eventData,
      timestamp: new Date()
    });
    
    logger.debug('Security event logged', {
      insertedId: result.insertedId,
      eventType: eventData.event_type
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log security event', {
      error: error.message,
      eventData
    });
    throw error;
  }
}

async function logSystemEvent(logData) {
  try {
    const collection = db.collection('system_logs');
    const result = await collection.insertOne({
      ...logData,
      timestamp: new Date()
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log system event', {
      error: error.message,
      logData
    });
    throw error;
  }
}

async function logModelInteraction(interactionData) {
  try {
    const collection = db.collection('model_interactions');
    const result = await collection.insertOne({
      ...interactionData,
      timestamp: new Date()
    });
    
    logger.debug('Model interaction logged', {
      insertedId: result.insertedId,
      modelId: interactionData.model_id,
      interactionType: interactionData.interaction_type
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log model interaction', {
      error: error.message,
      interactionData
    });
    throw error;
  }
}

async function logThreatDetection(threatData) {
  try {
    const collection = db.collection('threat_detection_logs');
    const result = await collection.insertOne({
      ...threatData,
      timestamp: new Date()
    });
    
    logger.warn('Threat detection logged', {
      insertedId: result.insertedId,
      threatType: threatData.threat_type,
      severity: threatData.severity,
      modelId: threatData.model_id
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log threat detection', {
      error: error.message,
      threatData
    });
    throw error;
  }
}

async function logPerformanceMetric(metricData) {
  try {
    const collection = db.collection('performance_metrics');
    const result = await collection.insertOne({
      ...metricData,
      timestamp: new Date()
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log performance metric', {
      error: error.message,
      metricData
    });
    throw error;
  }
}

// Query helper functions
async function getSecurityEvents(filter = {}, options = {}) {
  try {
    const collection = db.collection('security_events');
    const defaultOptions = {
      sort: { timestamp: -1 },
      limit: 100
    };
    
    const events = await collection.find(filter, { ...defaultOptions, ...options }).toArray();
    return events;
  } catch (error) {
    logger.error('Failed to get security events', {
      error: error.message,
      filter
    });
    throw error;
  }
}

async function getThreatDetections(filter = {}, options = {}) {
  try {
    const collection = db.collection('threat_detection_logs');
    const defaultOptions = {
      sort: { timestamp: -1 },
      limit: 100
    };
    
    const threats = await collection.find(filter, { ...defaultOptions, ...options }).toArray();
    return threats;
  } catch (error) {
    logger.error('Failed to get threat detections', {
      error: error.message,
      filter
    });
    throw error;
  }
}

async function closeMongoConnection() {
  if (client) {
    await client.close();
    logger.info('MongoDB connection closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', closeMongoConnection);
process.on('SIGTERM', closeMongoConnection);

module.exports = {
  connectToMongoDB,
  getDatabase,
  getClient,
  closeMongoConnection,
  
  // Logging functions
  logSecurityEvent,
  logSystemEvent,
  logModelInteraction,
  logThreatDetection,
  logPerformanceMetric,
  
  // Query functions
  getSecurityEvents,
  getThreatDetections
};