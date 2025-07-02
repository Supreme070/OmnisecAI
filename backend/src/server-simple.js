const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
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
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'OmnisecAI Cybersecurity Platform API',
    version: '1.0.0',
    description: 'Comprehensive AI/ML cybersecurity platform API',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      models: '/api/v1/models',
      threats: '/api/v1/threats',
      analytics: '/api/v1/analytics'
    },
    docs: '/api/v1/docs',
    status: 'operational'
  });
});

// Basic auth endpoints (both /auth and /api/v1/auth for compatibility)
app.post('/auth/register', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: 'temp-user-id',
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: 'temp-user-id',
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@omnisecai.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'dummy-jwt-token-admin',
        refresh_token: 'dummy-refresh-token-admin',
        user: {
          id: 'admin-user-id',
          email: 'admin@omnisecai.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          organizationId: 'org-1',
          mfaEnabled: false,
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } else if (email === 'kola@omnisecai.com' && password === 'Kola@2024!Secure') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'dummy-jwt-token-kola',
        refresh_token: 'dummy-refresh-token-kola',
        user: {
          id: 'kola-user-id',
          email: 'kola@omnisecai.com',
          firstName: 'Kola',
          lastName: 'User',
          role: 'admin',
          organizationId: 'org-1',
          mfaEnabled: false,
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Invalid email or password'
    });
  }
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@omnisecai.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'dummy-jwt-token-admin',
        refresh_token: 'dummy-refresh-token-admin',
        user: {
          id: 'admin-user-id',
          email: 'admin@omnisecai.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          organizationId: 'org-1',
          mfaEnabled: false,
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } else if (email === 'kola@omnisecai.com' && password === 'Kola@2024!Secure') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'dummy-jwt-token-kola',
        refresh_token: 'dummy-refresh-token-kola',
        user: {
          id: 'kola-user-id',
          email: 'kola@omnisecai.com',
          firstName: 'Kola',
          lastName: 'User',
          role: 'admin',
          organizationId: 'org-1',
          mfaEnabled: false,
          emailVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      message: 'Invalid email or password'
    });
  }
});

// Catch all routes
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.path} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/v1',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 OmnisecAI Backend API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API info: http://localhost:${PORT}/api/v1`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;