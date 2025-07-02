#!/bin/bash

# OmnisecAI Platform Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up OmnisecAI Cybersecurity Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Create environment file
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please review and update the .env file with your specific values"
    else
        print_warning ".env file already exists, skipping..."
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs/{backend,frontend,monitoring,nginx}
    mkdir -p uploads/{models,reports,temp}
    mkdir -p data/{postgres,mongodb,valkey}
    mkdir -p backend/logs
    mkdir -p monitoring/logs
    
    print_success "Directories created"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Pull base images
    print_status "Pulling base Docker images..."
    docker-compose pull postgres mongodb valkey nginx
    
    # Build custom services
    print_status "Building backend service..."
    docker-compose build backend
    
    print_status "Building monitoring service..."
    docker-compose build monitoring
    
    print_status "Building frontend service..."
    docker-compose build frontend
    
    # Start all services
    print_status "Starting all services..."
    docker-compose up -d
    
    print_success "All services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for databases
    print_status "Waiting for PostgreSQL..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U admin -d omnisecai_security; do sleep 2; done'
    
    print_status "Waiting for MongoDB..."
    timeout 60 bash -c 'until docker-compose exec -T mongodb mongosh --eval "db.adminCommand(\"ping\")" --quiet; do sleep 2; done'
    
    print_status "Waiting for Valkey..."
    timeout 60 bash -c 'until docker-compose exec -T valkey valkey-cli ping; do sleep 2; done'
    
    # Wait for backend API
    print_status "Waiting for Backend API..."
    timeout 120 bash -c 'until curl -f http://localhost:8000/health; do sleep 5; done'
    
    # Wait for monitoring service
    print_status "Waiting for Monitoring Service..."
    timeout 120 bash -c 'until curl -f http://localhost:9000/health; do sleep 5; done'
    
    # Wait for frontend
    print_status "Waiting for Frontend..."
    timeout 120 bash -c 'until curl -f http://localhost:3000; do sleep 5; done'
    
    print_success "All services are ready!"
}

# Display service status
show_status() {
    print_status "Service Status:"
    echo ""
    docker-compose ps
    echo ""
    
    print_success "🎉 OmnisecAI Platform is now running!"
    echo ""
    echo "Service URLs:"
    echo "  📱 Frontend:    http://localhost:3000"
    echo "  🔧 Backend API: http://localhost:8000"
    echo "  📊 Monitoring:  http://localhost:9000"
    echo "  🗄️ PostgreSQL:  localhost:5432"
    echo "  📝 MongoDB:     localhost:27017"
    echo "  ⚡ Valkey:      localhost:6379"
    echo ""
    echo "API Documentation:"
    echo "  📚 Backend:     http://localhost:8000/api/v1"
    echo "  📊 Monitoring:  http://localhost:9000/docs"
    echo ""
    echo "Default Login:"
    echo "  📧 Email:       admin@omnisecai.com"
    echo "  🔑 Password:    admin123!"
    echo ""
    print_warning "Please change the default password after first login!"
    echo ""
    echo "To stop the platform: ./scripts/stop.sh"
    echo "To view logs: ./scripts/logs.sh"
    echo "To restart: ./scripts/restart.sh"
}

# Main setup process
main() {
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                    OmnisecAI Cybersecurity Platform Setup                   ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_docker
    setup_environment
    create_directories
    start_services
    wait_for_services
    show_status
    
    print_success "Setup completed successfully! 🎉"
}

# Handle script interruption
trap 'print_error "Setup interrupted! Run docker-compose down to clean up."; exit 1' INT TERM

# Run main function
main