#!/bin/bash

# UTA Marketplace - Microservices Startup Script
# This script starts all microservices and verifies they're running correctly

set -e  # Exit on error

echo "=================================="
echo "UTA Marketplace - Microservices"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clean up any existing containers
echo -e "${YELLOW}1. Cleaning up existing containers...${NC}"
docker compose -f docker-compose.microservices.yml down -v 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Build and start services
echo -e "${YELLOW}2. Building and starting all services...${NC}"
echo "   This may take a few minutes on first run..."
docker compose -f docker-compose.microservices.yml up -d --build

# Wait for services to be ready
echo ""
echo -e "${YELLOW}3. Waiting for services to be ready...${NC}"
echo "   Waiting 30 seconds for database initialization..."
sleep 30

# Check service health
echo ""
echo -e "${YELLOW}4. Checking service health...${NC}"

# Check database
if docker exec uta-marketplace-db pg_isready -U uta -d uta_marketplace > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL: Running${NC}"
else
    echo -e "${RED}✗ PostgreSQL: Not ready${NC}"
fi

# Check gateway
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API Gateway: Running (http://localhost:8080)${NC}"
else
    echo -e "${YELLOW}⚠ API Gateway: Not ready yet (may need more time)${NC}"
fi

# Display service status
echo ""
echo -e "${YELLOW}5. Service Status:${NC}"
docker compose -f docker-compose.microservices.yml ps

echo ""
echo "=================================="
echo -e "${GREEN}Services Started Successfully!${NC}"
echo "=================================="
echo ""
echo "Access points:"
echo "  • API Gateway:     http://localhost:8080"
echo "  • PostgreSQL:      localhost:5432"
echo "  • Auth Service:    localhost:50051 (gRPC)"
echo "  • Listing Service: localhost:50052 (gRPC)"
echo "  • Search Service:  localhost:50053 (gRPC)"
echo "  • User Service:    localhost:50054 (gRPC)"
echo "  • Messaging:       localhost:50055 (gRPC)"
echo "  • Analytics:       localhost:50056 (gRPC)"
echo ""
echo "Commands:"
echo "  • View logs:    docker-compose -f docker-compose.microservices.yml logs -f"
echo "  • Stop all:     docker-compose -f docker-compose.microservices.yml down"
echo "  • Restart:      docker-compose -f docker-compose.microservices.yml restart <service>"
echo ""
echo "Test the API:"
echo "  curl http://localhost:8080/health"
echo ""
