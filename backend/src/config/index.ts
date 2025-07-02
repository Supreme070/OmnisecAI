import dotenv from 'dotenv';
import { AppConfig } from '@/types';

dotenv.config();

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'MONGO_URL',
  'VALKEY_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: AppConfig = {
  port: parseInt(process.env['PORT'] ?? '8000', 10),
  env: (process.env['NODE_ENV'] as 'development' | 'production' | 'test') ?? 'development',
  jwt_secret: process.env['JWT_SECRET']!,
  jwt_refresh_secret: process.env['JWT_REFRESH_SECRET']!,
  jwt_expires_in: process.env['JWT_EXPIRES_IN'] ?? '15m',
  jwt_refresh_expires_in: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  cors_origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  upload_max_size: process.env['UPLOAD_MAX_SIZE'] ?? '100mb',
  
  rate_limit: {
    window_ms: parseInt(process.env['RATE_LIMIT_WINDOW'] ?? '900000', 10), // 15 minutes
    max_requests: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100', 10)
  },

  database: {
    host: process.env['DB_HOST']!,
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: process.env['DB_NAME']!,
    username: process.env['DB_USER']!,
    password: process.env['DB_PASSWORD']!,
    ssl: process.env['DB_SSL'] === 'true',
    max_connections: parseInt(process.env['DB_MAX_CONNECTIONS'] ?? '20', 10)
  },

  mongodb: {
    url: process.env['MONGO_URL']!,
    database: process.env['MONGO_DB'] ?? 'omnisecai_logs',
    options: {
      maxPoolSize: parseInt(process.env['MONGO_MAX_POOL_SIZE'] ?? '10', 10),
      serverSelectionTimeoutMS: parseInt(process.env['MONGO_TIMEOUT'] ?? '5000', 10)
    }
  },

  redis: {
    url: process.env['VALKEY_URL']!,
    password: process.env['VALKEY_PASSWORD'],
    db: parseInt(process.env['VALKEY_DB'] ?? '0', 10),
    options: {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false
    }
  },

  email: {
    host: process.env['EMAIL_HOST'] ?? 'localhost',
    port: parseInt(process.env['EMAIL_PORT'] ?? '587', 10),
    secure: process.env['EMAIL_SECURE'] === 'true',
    auth: {
      user: process.env['EMAIL_USER'] ?? '',
      pass: process.env['EMAIL_PASS'] ?? ''
    },
    from: process.env['EMAIL_FROM'] ?? 'noreply@omnisecai.com'
  }
};

export default config;