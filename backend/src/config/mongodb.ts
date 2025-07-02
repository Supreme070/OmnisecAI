import { MongoClient, Db, Collection, InsertOneResult, FindOptions } from 'mongodb';
import logger from '@/utils/logger';
import config from '@/config';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  try {
    client = new MongoClient(config.mongodb.url, {
      maxPoolSize: config.mongodb.options?.['maxPoolSize'] as number ?? 10,
      serverSelectionTimeoutMS: config.mongodb.options?.['serverSelectionTimeoutMS'] as number ?? 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      writeConcern: {
        w: 'majority'
      }
    });
    
    await client.connect();
    await client.db().admin().ping();
    
    db = client.db(config.mongodb.database);
    
    logger.info('MongoDB connected successfully', {
      database: config.mongodb.database,
      url: config.mongodb.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    });
    
    return db;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: config.mongodb.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    });
    throw error;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB() first.');
  }
  return db;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectToMongoDB() first.');
  }
  return client;
}

interface SecurityEventData {
  user_id?: string;
  event_type: string;
  severity: string;
  description: string;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

interface SystemLogData {
  level: string;
  message: string;
  service: string;
  metadata?: Record<string, unknown>;
}

interface ModelInteractionData {
  user_id: string;
  model_id: string;
  interaction_type: string;
  input_data?: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
}

interface ThreatDetectionData {
  model_id?: string;
  threat_type: string;
  severity: string;
  confidence_score: number;
  description: string;
  metadata: Record<string, unknown>;
}

interface PerformanceMetricData {
  service: string;
  metric_name: string;
  metric_value: number;
  metadata?: Record<string, unknown>;
}

export async function logSecurityEvent(eventData: SecurityEventData): Promise<InsertOneResult> {
  try {
    const collection: Collection = getDatabase().collection('security_events');
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
      error: error instanceof Error ? error.message : 'Unknown error',
      eventData
    });
    throw error;
  }
}

export async function logSystemEvent(logData: SystemLogData): Promise<InsertOneResult> {
  try {
    const collection: Collection = getDatabase().collection('system_logs');
    const result = await collection.insertOne({
      ...logData,
      timestamp: new Date()
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log system event', {
      error: error instanceof Error ? error.message : 'Unknown error',
      logData
    });
    throw error;
  }
}

export async function logModelInteraction(interactionData: ModelInteractionData): Promise<InsertOneResult> {
  try {
    const collection: Collection = getDatabase().collection('model_interactions');
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
      error: error instanceof Error ? error.message : 'Unknown error',
      interactionData
    });
    throw error;
  }
}

export async function logThreatDetection(threatData: ThreatDetectionData): Promise<InsertOneResult> {
  try {
    const collection: Collection = getDatabase().collection('threat_detection_logs');
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
      error: error instanceof Error ? error.message : 'Unknown error',
      threatData
    });
    throw error;
  }
}

export async function logPerformanceMetric(metricData: PerformanceMetricData): Promise<InsertOneResult> {
  try {
    const collection: Collection = getDatabase().collection('performance_metrics');
    const result = await collection.insertOne({
      ...metricData,
      timestamp: new Date()
    });
    
    return result;
  } catch (error) {
    logger.error('Failed to log performance metric', {
      error: error instanceof Error ? error.message : 'Unknown error',
      metricData
    });
    throw error;
  }
}

export async function getSecurityEvents(
  filter: Record<string, unknown> = {}, 
  options: FindOptions = {}
): Promise<unknown[]> {
  try {
    const collection: Collection = getDatabase().collection('security_events');
    const defaultOptions: FindOptions = {
      sort: { timestamp: -1 },
      limit: 100
    };
    
    const events = await collection.find(filter, { ...defaultOptions, ...options }).toArray();
    return events;
  } catch (error) {
    logger.error('Failed to get security events', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filter
    });
    throw error;
  }
}

export async function getThreatDetections(
  filter: Record<string, unknown> = {}, 
  options: FindOptions = {}
): Promise<unknown[]> {
  try {
    const collection: Collection = getDatabase().collection('threat_detection_logs');
    const defaultOptions: FindOptions = {
      sort: { timestamp: -1 },
      limit: 100
    };
    
    const threats = await collection.find(filter, { ...defaultOptions, ...options }).toArray();
    return threats;
  } catch (error) {
    logger.error('Failed to get threat detections', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filter
    });
    throw error;
  }
}

export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
}

process.on('SIGINT', () => {
  void closeMongoConnection();
});

process.on('SIGTERM', () => {
  void closeMongoConnection();
});