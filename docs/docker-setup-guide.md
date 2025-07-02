# Docker Setup Guide - OmnisecAI Cyber Security Platform

## Overview
This guide provides step-by-step instructions for setting up the complete Docker development environment for the OmnisecAI Cyber Security Platform.

## Prerequisites

### Required Software
```bash
# Install Docker & Docker Compose
# MacOS (using Homebrew)
brew install docker docker-compose

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Verify installation
docker --version
docker-compose --version
```

### System Requirements
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 20GB free space minimum
- **CPU**: 4 cores minimum
- **OS**: macOS 10.15+, Ubuntu 18.04+, Windows 10 Pro+

## Project Structure Setup

### 1. Create Complete Project Structure
```bash
# Navigate to project root
cd /Users/supreme/Desktop/OmnisecAI

# Create backend structure
mkdir -p backend/{src,tests,config}
mkdir -p backend/src/{controllers,services,models,middleware,routes,utils}

# Create frontend structure (already exists, but ensure completeness)
mkdir -p frontend/src/{components,pages,hooks,services,store,types,utils}

# Create monitoring structure
mkdir -p monitoring/{src,config,tests}
mkdir -p monitoring/src/{analyzers,collectors,processors,api}

# Create infrastructure structure
mkdir -p infrastructure/{nginx,scripts}
mkdir -p scripts

# Create shared configuration
mkdir -p config/{database,security,monitoring}
```

## Docker Configuration Files

### 1. Main Docker Compose - Development
```yaml
# docker-compose.dev.yml
version: '3.8'

networks:
  omnisecai-network:
    driver: bridge

volumes:
  postgres_data:
  mongodb_data:
  valkey_data:
  uploaded_models:

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: omnisecai-postgres
    environment:
      POSTGRES_DB: omnisecai_security
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: dev_password_2024
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - omnisecai-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d omnisecai_security"]
      interval: 30s
      timeout: 10s
      retries: 5

  # MongoDB for Logs and Unstructured Data
  mongodb:
    image: mongo:6-jammy
    container_name: omnisecai-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: dev_password_2024
      MONGO_INITDB_DATABASE: omnisecai_logs
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./config/database/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js
    networks:
      - omnisecai-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Valkey for Caching and Sessions (Redis Alternative)
  valkey:
    image: valkey/valkey:7-alpine
    container_name: omnisecai-valkey
    command: valkey-server --appendonly yes --requirepass dev_password_2024
    ports:
      - "6379:6379"
    volumes:
      - valkey_data:/data
    networks:
      - omnisecai-network
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: omnisecai-backend
    ports:
      - "8000:8000"
      - "9229:9229"  # Node.js debugging port
    environment:
      - NODE_ENV=development
      - PORT=8000
      - DATABASE_URL=postgresql://admin:dev_password_2024@postgres:5432/omnisecai_security
      - MONGODB_URL=mongodb://admin:dev_password_2024@mongodb:27017/omnisecai_logs?authSource=admin
      - VALKEY_URL=redis://:dev_password_2024@valkey:6379
      - JWT_SECRET=dev_jwt_secret_key_2024
      - LOG_LEVEL=debug
    volumes:
      - ./backend/src:/app/src
      - ./backend/package.json:/app/package.json
      - ./backend/package-lock.json:/app/package-lock.json
      - uploaded_models:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      valkey:
        condition: service_healthy
    networks:
      - omnisecai-network
    command: npm run dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Frontend React Application
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend.dev
    container_name: omnisecai-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:8000
      - VITE_WS_URL=ws://localhost:8000
      - VITE_MONITORING_URL=http://localhost:9000
    volumes:
      - ./src:/app/src
      - ./public:/app/public
      - ./index.html:/app/index.html
      - ./vite.config.ts:/app/vite.config.ts
      - ./package.json:/app/package.json
      - ./package-lock.json:/app/package-lock.json
    depends_on:
      - backend
    networks:
      - omnisecai-network
    command: npm run dev -- --host 0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Monitoring and Analytics Service
  monitoring:
    build:
      context: ./monitoring
      dockerfile: Dockerfile.dev
    container_name: omnisecai-monitoring
    ports:
      - "9000:9000"
      - "5555:5555"  # Python debugging port
    environment:
      - PYTHON_ENV=development
      - DATABASE_URL=postgresql://admin:dev_password_2024@postgres:5432/omnisecai_security
      - MONGODB_URL=mongodb://admin:dev_password_2024@mongodb:27017/omnisecai_logs?authSource=admin
      - VALKEY_URL=redis://:dev_password_2024@valkey:6379
      - LOG_LEVEL=DEBUG
    volumes:
      - ./monitoring/src:/app/src
      - ./monitoring/requirements.txt:/app/requirements.txt
    depends_on:
      postgres:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      valkey:
        condition: service_healthy
    networks:
      - omnisecai-network
    command: python -m uvicorn src.main:app --host 0.0.0.0 --port 9000 --reload
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # NGINX Reverse Proxy (Optional for development)
  nginx:
    image: nginx:alpine
    container_name: omnisecai-nginx
    ports:
      - "80:80"
    volumes:
      - ./infrastructure/nginx/dev.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend
      - monitoring
    networks:
      - omnisecai-network
    profiles:
      - nginx
```

### 2. Backend Dockerfile (Development)
```dockerfile
# backend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install development tools
RUN npm install -g nodemon

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 8000 9229

# Start development server with debugging
CMD ["npm", "run", "dev"]
```

### 3. Frontend Dockerfile (Development)
```dockerfile
# Dockerfile.frontend.dev
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 4. Monitoring Dockerfile (Development)
```dockerfile
# monitoring/Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install development tools
RUN pip install --no-cache-dir debugpy

# Copy source code
COPY . .

# Expose ports
EXPOSE 9000 5555

# Start development server
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]
```

## Database Configuration

### 1. PostgreSQL Initialization
```sql
-- config/database/init.sql
-- Create application database
CREATE DATABASE omnisecai_security;

-- Create user with appropriate permissions
CREATE USER omnisecai_user WITH PASSWORD 'secure_app_password';
GRANT ALL PRIVILEGES ON DATABASE omnisecai_security TO omnisecai_user;

-- Connect to the application database
\c omnisecai_security;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create initial tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(50) DEFAULT 'active',
    security_score DECIMAL(5,2),
    last_scan_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES ai_models(id),
    threat_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating', 'false_positive')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    remediation TEXT,
    confidence_score DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Insert sample data
INSERT INTO organizations (name, domain, industry) VALUES 
('ACME Corp', 'acme.com', 'technology'),
('Healthcare Solutions Inc', 'healthsol.com', 'healthcare'),
('Financial Tech Ltd', 'fintech.com', 'financial_services');

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@acme.com', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', 'admin'),
('analyst@acme.com', crypt('analyst123', gen_salt('bf')), 'Security', 'Analyst', 'analyst'),
('engineer@acme.com', crypt('engineer123', gen_salt('bf')), 'ML', 'Engineer', 'engineer');
```

### 2. MongoDB Initialization
```javascript
// config/database/mongo-init.js
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
```

## Backend Service Implementation

### 1. Package.json for Backend
```json
{
  "name": "omnisecai-backend",
  "version": "1.0.0",
  "description": "OmnisecAI Cyber Security Platform Backend",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon --inspect=0.0.0.0:9229 src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node src/utils/migrate.js",
    "seed": "node src/utils/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "mongodb": "^6.1.0",
    "redis": "^4.6.7",
    "multer": "^1.4.5",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "@types/node": "^20.5.0"
  }
}
```

### 2. Basic Server Setup
```javascript
// backend/src/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const modelRoutes = require('./routes/models');
const securityRoutes = require('./routes/security');
const llmRoutes = require('./routes/llm');

const logger = require('./utils/logger');
const { connectDatabases } = require('./utils/database');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OmnisecAI Cyber Security API',
      version: '1.0.0',
      description: 'Comprehensive AI cybersecurity platform API'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/llm', llmRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      redis: 'connected',
      mongodb: 'connected'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 8000;

// Initialize databases and start server
connectDatabases()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/docs`);
    });
  })
  .catch((error) => {
    logger.error('Failed to connect to databases:', error);
    process.exit(1);
  });

module.exports = { app, io };
```

## Monitoring Service Implementation

### 1. Requirements.txt for Monitoring
```txt
# monitoring/requirements.txt
fastapi==0.103.1
uvicorn[standard]==0.23.2
pydantic==2.3.0
python-multipart==0.0.6
aiofiles==23.2.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
sqlalchemy==2.0.20
psycopg2-binary==2.9.7
pymongo==4.5.0
redis==4.6.0
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.0
tensorflow==2.13.0
torch==2.0.1
transformers==4.33.2
matplotlib==3.7.2
seaborn==0.12.2
plotly==5.16.1
websockets==11.0.3
```

### 2. Basic FastAPI Setup
```python
# monitoring/src/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any

from .database import DatabaseManager
from .analyzers import ThreatAnalyzer, ModelAnalyzer, LLMAnalyzer
from .collectors import MetricsCollector
from .api import monitoring_router, analytics_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="OmnisecAI Monitoring Service",
    description="Real-time monitoring and analytics for AI security",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
db_manager = DatabaseManager()
threat_analyzer = ThreatAnalyzer()
model_analyzer = ModelAnalyzer()
llm_analyzer = LLMAnalyzer()
metrics_collector = MetricsCollector()

# WebSocket connections
active_connections: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await db_manager.connect()
    await metrics_collector.start()
    logger.info("Monitoring service started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await db_manager.disconnect()
    await metrics_collector.stop()
    logger.info("Monitoring service stopped")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "analyzers": "running",
            "collectors": "active"
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Send real-time metrics
            metrics = await metrics_collector.get_latest_metrics()
            await websocket.send_json(metrics)
            await asyncio.sleep(5)  # Update every 5 seconds
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info("WebSocket client disconnected")

async def broadcast_alert(alert: Dict[str, Any]):
    """Broadcast alert to all connected clients"""
    if active_connections:
        for connection in active_connections:
            try:
                await connection.send_json({
                    "type": "alert",
                    "data": alert
                })
            except:
                # Remove dead connections
                active_connections.remove(connection)

# Include routers
app.include_router(monitoring_router, prefix="/api/monitoring")
app.include_router(analytics_router, prefix="/api/analytics")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,
        log_level="info"
    )
```

## Environment Files

### 1. Development Environment
```bash
# .env.dev
# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=omnisecai_security
POSTGRES_USER=admin
POSTGRES_PASSWORD=dev_password_2024

MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_DB=omnisecai_logs

VALKEY_HOST=valkey
VALKEY_PORT=6379
VALKEY_PASSWORD=dev_password_2024

# Application Configuration
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
MONITORING_URL=http://localhost:9000

# Security
JWT_SECRET=dev_jwt_secret_key_2024_change_in_production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# External Services (Development)
AWS_ACCESS_KEY_ID=dev_aws_key
AWS_SECRET_ACCESS_KEY=dev_aws_secret
AWS_REGION=us-east-1

# Monitoring
LOG_LEVEL=debug
ENABLE_METRICS=true
METRICS_RETENTION_DAYS=30

# Development Flags
ENABLE_SWAGGER=true
ENABLE_DEBUG=true
ENABLE_CORS=true
```

## Setup Scripts

### 1. Main Setup Script
```bash
#!/bin/bash
# scripts/setup.sh

set -e

echo "🚀 Setting up OmnisecAI Cyber Security Platform..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create directories
echo "📁 Creating project directories..."
mkdir -p backend/{src,tests,config}
mkdir -p backend/src/{controllers,services,models,middleware,routes,utils}
mkdir -p monitoring/{src,config,tests}
mkdir -p monitoring/src/{analyzers,collectors,processors,api}
mkdir -p infrastructure/{nginx,scripts}
mkdir -p config/{database,security,monitoring}
mkdir -p uploads/models

# Set permissions
chmod 755 uploads/models

# Copy environment file
if [ ! -f .env ]; then
    cp .env.dev .env
    echo "📝 Created .env file from .env.dev"
fi

# Build and start services
echo "🐳 Building Docker containers..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
curl -f http://localhost:8000/health || echo "❌ Backend not ready"
curl -f http://localhost:9000/health || echo "❌ Monitoring not ready"
curl -f http://localhost:3000 || echo "❌ Frontend not ready"

echo "✅ Setup complete!"
echo ""
echo "🌐 Services available at:"
echo "   Frontend:   http://localhost:3000"
echo "   Backend:    http://localhost:8000"
echo "   Monitoring: http://localhost:9000"
echo "   API Docs:   http://localhost:8000/docs"
echo ""
echo "🗄️ Database connections:"
echo "   PostgreSQL: localhost:5432"
echo "   MongoDB:    localhost:27017"
echo "   Redis:      localhost:6379"
echo ""
echo "📋 Next steps:"
echo "   1. Visit http://localhost:3000 to see the application"
echo "   2. Check logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   3. Stop services: docker-compose -f docker-compose.dev.yml down"
```

### 2. Database Migration Script
```bash
#!/bin/bash
# scripts/migrate.sh

echo "🗄️ Running database migrations..."

# Run PostgreSQL migrations
docker-compose -f docker-compose.dev.yml exec backend npm run migrate

# Check MongoDB collections
docker-compose -f docker-compose.dev.yml exec mongodb mongosh omnisecai_logs --eval "db.getCollectionNames()"

echo "✅ Migrations complete!"
```

### 3. Development Helper Script
```bash
#!/bin/bash
# scripts/dev.sh

case "$1" in
    start)
        echo "🚀 Starting development environment..."
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    stop)
        echo "🛑 Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    restart)
        echo "🔄 Restarting development environment..."
        docker-compose -f docker-compose.dev.yml restart
        ;;
    logs)
        echo "📋 Showing logs for all services..."
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    logs-backend)
        echo "📋 Showing backend logs..."
        docker-compose -f docker-compose.dev.yml logs -f backend
        ;;
    logs-frontend)
        echo "📋 Showing frontend logs..."
        docker-compose -f docker-compose.dev.yml logs -f frontend
        ;;
    logs-monitoring)
        echo "📋 Showing monitoring logs..."
        docker-compose -f docker-compose.dev.yml logs -f monitoring
        ;;
    shell-backend)
        echo "🐚 Opening backend shell..."
        docker-compose -f docker-compose.dev.yml exec backend sh
        ;;
    shell-db)
        echo "🐚 Opening database shell..."
        docker-compose -f docker-compose.dev.yml exec postgres psql -U admin -d omnisecai_security
        ;;
    reset)
        echo "🗑️ Resetting all data (THIS WILL DELETE ALL DATA)..."
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f docker-compose.dev.yml down -v
            docker-compose -f docker-compose.dev.yml up -d
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|logs-backend|logs-frontend|logs-monitoring|shell-backend|shell-db|reset}"
        echo ""
        echo "Commands:"
        echo "  start          Start all development services"
        echo "  stop           Stop all development services"
        echo "  restart        Restart all development services"
        echo "  logs           Show logs for all services"
        echo "  logs-backend   Show logs for backend service only"
        echo "  logs-frontend  Show logs for frontend service only"
        echo "  logs-monitoring Show logs for monitoring service only"
        echo "  shell-backend  Open shell in backend container"
        echo "  shell-db       Open PostgreSQL shell"
        echo "  reset          Reset all data (WARNING: destructive)"
        ;;
esac
```

## Quick Start Instructions

### 1. Initial Setup
```bash
# Navigate to project
cd /Users/supreme/Desktop/OmnisecAI

# Make scripts executable
chmod +x scripts/*.sh

# Run setup
./scripts/setup.sh
```

### 2. Daily Development
```bash
# Start development environment
./scripts/dev.sh start

# View logs
./scripts/dev.sh logs

# Stop when done
./scripts/dev.sh stop
```

### 3. Troubleshooting
```bash
# Check container status
docker-compose -f docker-compose.dev.yml ps

# Restart specific service
docker-compose -f docker-compose.dev.yml restart backend

# View specific logs
docker-compose -f docker-compose.dev.yml logs backend

# Reset everything (nuclear option)
./scripts/dev.sh reset
```

This Docker setup provides a complete development environment with all services properly configured and interconnected. The setup is designed to be production-like while maintaining development convenience with hot reloading and debugging capabilities.