#!/bin/bash

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