import { connectToDatabase, closeConnection } from '@/config/database';
import { connectToMongoDB, closeMongoConnection } from '@/config/mongodb';
import { connectToRedis, closeRedisConnection } from '@/config/redis';

beforeAll(async () => {
  // Set test environment
  process.env['NODE_ENV'] = 'test';
  process.env['DB_NAME'] = 'omnisecai_test';
  process.env['MONGO_DB'] = 'omnisecai_test_logs';
  process.env['VALKEY_DB'] = '1'; // Use different Redis DB for testing
  
  // Connect to test databases
  await connectToDatabase();
  await connectToMongoDB();
  await connectToRedis();
});

afterAll(async () => {
  // Close all connections
  await closeConnection();
  await closeMongoConnection();
  await closeRedisConnection();
});

// Global test timeout
jest.setTimeout(30000);