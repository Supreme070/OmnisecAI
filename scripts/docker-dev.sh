#!/bin/bash

# =============================================================================
# OmnisecAI Docker Development Helper Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}❌ ${1}${NC}"
}

print_header() {
    echo
    echo -e "${BLUE}=== ${1} ===${NC}"
    echo
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_success ".env file created. Please review and update the configuration."
    fi
}

# Function to start all services
start_all() {
    print_header "Starting OmnisecAI Development Environment"
    check_docker
    check_env
    
    print_info "Building and starting all services..."
    docker-compose up -d --build
    
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    show_status
    show_urls
}

# Function to start core services only
start_core() {
    print_header "Starting Core Services Only"
    check_docker
    check_env
    
    print_info "Starting core services (postgres, mongodb, valkey, backend, frontend)..."
    docker-compose up -d postgres mongodb valkey backend frontend
    
    sleep 5
    show_status
}

# Function to start with development tools
start_dev() {
    print_header "Starting Development Environment with Tools"
    check_docker
    check_env
    
    print_info "Starting services with development tools..."
    docker-compose --profile dev up -d --build
    
    sleep 10
    show_status
    show_urls
}

# Function to stop all services
stop_all() {
    print_header "Stopping All Services"
    print_info "Stopping all running containers..."
    docker-compose down
    print_success "All services stopped."
}

# Function to restart services
restart() {
    print_header "Restarting Services"
    stop_all
    sleep 2
    start_all
}

# Function to show service status
show_status() {
    print_header "Service Status"
    echo "Container Status:"
    docker-compose ps
    echo
    
    echo "Health Checks:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

# Function to show access URLs
show_urls() {
    print_header "Access URLs"
    print_info "🌐 Frontend:          http://localhost:3000"
    print_info "🔧 Backend API:       http://localhost:8000"
    print_info "📊 Monitoring:        http://localhost:9000"
    print_info "📧 MailHog UI:        http://localhost:8025"
    print_info "🗄️  Adminer:          http://localhost:8080"
    print_info "🐘 pgAdmin:           http://localhost:5050"
    print_info "🏗️  Nginx (if enabled): http://localhost:80"
    echo
    print_info "Database Connections:"
    print_info "   PostgreSQL: localhost:5432 (omnisecai_security/admin)"
    print_info "   MongoDB:    localhost:27017 (omnisecai_logs/admin)" 
    print_info "   Valkey:     localhost:6379"
}

# Function to view logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_info "Available services:"
        docker-compose config --services
        echo
        print_info "Usage: $0 logs <service-name>"
        print_info "Example: $0 logs backend"
        return
    fi
    
    print_header "Logs for $service"
    docker-compose logs -f "$service"
}

# Function to access container shell
shell() {
    local service=${1:-"backend"}
    print_header "Accessing $service shell"
    docker-compose exec "$service" sh
}

# Function to run database migrations
migrate() {
    print_header "Running Database Migrations"
    print_info "Running PostgreSQL migrations..."
    docker-compose exec backend npm run migrate
    print_success "Migrations completed."
}

# Function to seed database
seed() {
    print_header "Seeding Database"
    print_info "Seeding database with initial data..."
    docker-compose exec backend npm run seed
    print_success "Database seeded."
}

# Function to reset database
reset_db() {
    print_warning "This will completely reset the database. All data will be lost!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stopping services..."
        docker-compose down
        print_info "Removing database volumes..."
        docker volume rm omnisecai_postgres_data omnisecai_mongodb_data 2>/dev/null || true
        print_info "Restarting services..."
        start_all
        sleep 10
        migrate
        seed
        print_success "Database reset completed."
    else
        print_info "Database reset cancelled."
    fi
}

# Function to clean up Docker resources
cleanup() {
    print_header "Cleaning Up Docker Resources"
    print_info "Stopping all services..."
    docker-compose down
    
    print_info "Removing unused Docker resources..."
    docker system prune -f
    docker volume prune -f
    
    print_success "Cleanup completed."
}

# Function to update dependencies
update() {
    print_header "Updating Dependencies"
    print_info "Rebuilding containers with latest dependencies..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Dependencies updated."
}

# Function to run tests
test() {
    print_header "Running Tests"
    print_info "Running backend tests..."
    docker-compose exec backend npm test
    
    print_info "Running frontend tests..."
    docker-compose exec frontend npm test
}

# Function to show help
show_help() {
    echo "OmnisecAI Docker Development Helper"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  start          Start all services"
    echo "  start-core     Start core services only (no dev tools)"
    echo "  start-dev      Start with development tools"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  status         Show service status"
    echo "  urls           Show access URLs"
    echo "  logs [service] Show logs for service"
    echo "  shell [service] Access container shell"
    echo "  migrate        Run database migrations"
    echo "  seed           Seed database with test data"
    echo "  reset-db       Reset database (WARNING: destroys data)"
    echo "  cleanup        Clean up Docker resources"
    echo "  update         Update and rebuild containers"
    echo "  test           Run all tests"
    echo "  help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0 start-dev    # Start with development tools"
    echo "  $0 logs backend # Show backend logs"
    echo "  $0 shell backend # Access backend container"
}

# Main script logic
main() {
    case "${1:-help}" in
        "start")
            start_all
            ;;
        "start-core")
            start_core
            ;;
        "start-dev")
            start_dev
            ;;
        "stop")
            stop_all
            ;;
        "restart")
            restart
            ;;
        "status")
            show_status
            ;;
        "urls")
            show_urls
            ;;
        "logs")
            show_logs "$2"
            ;;
        "shell")
            shell "$2"
            ;;
        "migrate")
            migrate
            ;;
        "seed")
            seed
            ;;
        "reset-db")
            reset_db
            ;;
        "cleanup")
            cleanup
            ;;
        "update")
            update
            ;;
        "test")
            test
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"