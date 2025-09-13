#!/bin/bash

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