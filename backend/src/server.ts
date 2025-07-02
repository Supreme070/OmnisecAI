import express from 'express';
import dotenv from 'dotenv';
import { Server } from 'http';

import logger from '@/utils/logger';
import config from '@/config';
import { connectToDatabase } from '@/config/database';
import { connectToMongoDB } from '@/config/mongodb';
import { connectToRedis } from '@/config/redis';
import { EmailService } from '@/services/EmailService';
import { WebSocketService } from '@/services/WebSocketService';
import { ScanWorkerService } from '@/services/ScanWorkerService';
import { ThreatDetectionService } from '@/services/ThreatDetectionService';

import { 
  corsOptions, 
  helmetConfig, 
  requestId, 
  requestLogger, 
  securityHeaders,
  compressionConfig,
  validateIP,
  validateRequestSize
} from '@/middleware/security';
import { apiLimiter } from '@/middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(requestId);
app.use(helmetConfig);
app.use(require('cors')(corsOptions));
app.use(compressionConfig);
app.use(validateIP);
app.use(validateRequestSize());
app.use(securityHeaders);

// Rate limiting
app.use(apiLimiter);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
    environment: config.env,
    services: {
      database: 'connected',
      mongodb: 'connected',
      redis: 'connected'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    uptime: Math.round(process.uptime())
  });
});

// API info endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    name: 'OmnisecAI Cybersecurity Platform API',
    version: '1.0.0',
    description: 'Comprehensive AI/ML cybersecurity platform API',
    endpoints: {
      auth: '/api/v1/auth',
      models: '/api/v1/models',
      scanning: '/api/v1/scanning',
      threats: '/api/v1/threats',
      analytics: '/api/v1/analytics',
      websocket: '/api/v1/websocket',
      keys: '/api/v1/keys'
    },
    documentation: '/docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// API routes
import authRoutes from '@/routes/auth';
import passwordRoutes from '@/routes/password';
import emailRoutes from '@/routes/email';
import mfaRoutes from '@/routes/mfa';
import mfaAuthRoutes from '@/routes/mfa-auth';
import apiKeyRoutes from '@/routes/api-keys';
import modelRoutes from '@/routes/models';
import websocketRoutes from '@/routes/websocket';
import scanningRoutes from '@/routes/scanning';
import threatRoutes from '@/routes/threats';
import analyticsRoutes from '@/routes/analytics';

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', passwordRoutes);
app.use('/api/v1/auth', passwordRoutes);
app.use('/api/auth', emailRoutes);
app.use('/api/v1/auth', emailRoutes);
app.use('/api/auth', mfaRoutes);
app.use('/api/v1/auth', mfaRoutes);
app.use('/api/auth', mfaAuthRoutes);
app.use('/api/v1/auth', mfaAuthRoutes);
app.use('/api', apiKeyRoutes);
app.use('/api/v1', apiKeyRoutes);
app.use('/api', modelRoutes);
app.use('/api/v1', modelRoutes);
app.use('/api', websocketRoutes);
app.use('/api/v1', websocketRoutes);
app.use('/api', scanningRoutes);
app.use('/api/v1', scanningRoutes);
app.use('/api', threatRoutes);
app.use('/api/v1', threatRoutes);
app.use('/api', analyticsRoutes);
app.use('/api/v1', analyticsRoutes);

// 404 handler
app.use('*', notFoundHandler);

// Error handling middleware  
app.use(errorHandler as express.ErrorRequestHandler);

// Initialize database connections
async function initializeServices(): Promise<void> {
  try {
    logger.info('Initializing database connections...');
    
    await connectToDatabase();
    logger.info('PostgreSQL connected successfully');
    
    await connectToMongoDB();
    logger.info('MongoDB connected successfully');
    
    await connectToRedis();
    logger.info('Redis connected successfully');
    
    await EmailService.initialize();
    logger.info('Email service initialized');
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Graceful shutdown handler
function gracefulShutdown(signal: string, server: Server): void {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  // Shutdown services in order
  ScanWorkerService.stop();
  logger.info('Scan worker service stopped');
  
  WebSocketService.shutdown().then(() => {
    logger.info('WebSocket service shutdown completed');
    
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  }).catch(error => {
    logger.error('Error during WebSocket shutdown', { error });
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(1);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
async function startServer(): Promise<void> {
  try {
    await initializeServices();
    
    const server = app.listen(config.port, '0.0.0.0', () => {
      logger.info(`🚀 OmnisecAI Backend API server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.env}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api/v1`);
      logger.info(`💚 Health Check: http://localhost:${config.port}/health`);
      
      // Initialize WebSocket service after HTTP server starts
      WebSocketService.initialize(server);
      logger.info(`🔌 WebSocket server initialized`);
      
      // Start scan worker service
      ScanWorkerService.start();
      logger.info(`🔍 Scan worker service started`);
      
      // Start threat detection monitoring
      ThreatDetectionService.startMonitoring();
      logger.info(`🛡️ Threat detection monitoring started`);
    });

    // Handle server startup errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error('Server startup error:', {
          error: error.message,
          stack: error.stack,
          code: error.code
        });
      }
      process.exit(1);
    });

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
    process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
    
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  void startServer();
}

export default app;