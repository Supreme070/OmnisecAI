#!/bin/bash

# OmnisecAI Platform Restart Script
# Usage: ./scripts/restart.sh [service_name]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

SERVICE=${1:-"all"}

echo "🔄 Restarting OmnisecAI Platform..."

if [ "$SERVICE" = "all" ]; then
    print_status "Restarting all services..."
    docker-compose restart
    print_success "All services restarted"
else
    print_status "Restarting $SERVICE..."
    docker-compose restart $SERVICE
    print_success "$SERVICE restarted"
fi

print_status "Checking service health..."
sleep 5

# Quick health check
if curl -s -f http://localhost:8000/health > /dev/null; then
    print_success "Backend API is healthy"
else
    print_warning "Backend API may still be starting..."
fi

if curl -s -f http://localhost:9000/health > /dev/null; then
    print_success "Monitoring service is healthy"
else
    print_warning "Monitoring service may still be starting..."
fi

if curl -s -f http://localhost:3000 > /dev/null; then
    print_success "Frontend is healthy"
else
    print_warning "Frontend may still be starting..."
fi

print_success "Restart completed! 🎉"