#!/bin/bash

# OmnisecAI Platform Logs Viewer
# Usage: ./scripts/logs.sh [service_name] [options]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_usage() {
    echo "Usage: $0 [service] [options]"
    echo ""
    echo "Services:"
    echo "  all        - All services (default)"
    echo "  backend    - Backend API service"
    echo "  frontend   - Frontend React service"
    echo "  monitoring - Monitoring service"
    echo "  postgres   - PostgreSQL database"
    echo "  mongodb    - MongoDB database"
    echo "  valkey     - Valkey cache"
    echo "  nginx      - Nginx reverse proxy"
    echo ""
    echo "Options:"
    echo "  -f, --follow   Follow log output"
    echo "  -t, --tail N   Show last N lines (default: 100)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show all logs"
    echo "  $0 backend -f         # Follow backend logs"
    echo "  $0 frontend -t 50     # Show last 50 lines of frontend"
}

# Default values
SERVICE="all"
FOLLOW=""
TAIL="100"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            print_usage
            exit 0
            ;;
        -f|--follow)
            FOLLOW="-f"
            shift
            ;;
        -t|--tail)
            TAIL="$2"
            shift 2
            ;;
        backend|frontend|monitoring|postgres|mongodb|valkey|nginx|all)
            SERVICE="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 Viewing logs for: ${GREEN}$SERVICE${NC}"
echo "Press Ctrl+C to exit"
echo ""

if [ "$SERVICE" = "all" ]; then
    docker-compose logs $FOLLOW --tail=$TAIL
else
    docker-compose logs $FOLLOW --tail=$TAIL $SERVICE
fi