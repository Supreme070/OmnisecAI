#!/bin/bash

# OmnisecAI Platform Stop Script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🛑 Stopping OmnisecAI Platform..."

print_status "Stopping all services..."
docker-compose stop

print_status "Removing containers..."
docker-compose down

# Optional: Remove volumes (uncomment if you want to reset data)
# print_status "Removing volumes..."
# docker-compose down -v

print_success "OmnisecAI Platform stopped successfully! 🎉"
echo ""
echo "To start again: ./scripts/setup.sh"