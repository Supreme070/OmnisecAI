const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectToDatabase } = require('./config/database');
const { connectToMongoDB } = require('./config/mongodb');
const { connectToValkey } = require('./config/valkey');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const modelRoutes = require('./routes/models');
const securityRoutes = require('./routes/security');
const llmRoutes = require('./routes/llm');
const monitoringRoutes = require('./routes/monitoring');

const app = express();
const PORT = process.env.PORT || 8000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://omnisecai.com', 'https://www.omnisecai.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected', // Will be updated after DB connection
      mongodb: 'connected',
      valkey: 'connected'
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticate, userRoutes);
app.use('/api/v1/models', authenticate, modelRoutes);
app.use('/api/v1/security', authenticate, securityRoutes);
app.use('/api/v1/llm', authenticate, llmRoutes);
app.use('/api/v1/monitoring', authenticate, monitoringRoutes);

// API documentation
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'OmnisecAI Cybersecurity Platform API',
    version: '1.0.0',
    description: 'Comprehensive AI/ML cybersecurity platform API',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      models: '/api/v1/models',
      security: '/api/v1/security',
      llm: '/api/v1/llm',
      monitoring: '/api/v1/monitoring'
    },
    documentation: '/docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  const server = app.listen(PORT, () => {
    logger.info(`OmnisecAI Backend API server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api/v1`);
    logger.info(`Health Check: http://localhost:${PORT}/health`);
  });

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Initialize database connections
async function initializeServices() {
  try {
    logger.info('Initializing database connections...');
    
    await connectToDatabase();
    logger.info('PostgreSQL connected successfully');
    
    await connectToMongoDB();
    logger.info('MongoDB connected successfully');
    
    await connectToValkey();
    logger.info('Valkey connected successfully');
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
if (require.main === module) {
  initializeServices().then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 OmnisecAI Backend API server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
    });

    // Handle server startup errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server startup error:', error);
      }
      process.exit(1);
    });
  });
}

module.exports = app;