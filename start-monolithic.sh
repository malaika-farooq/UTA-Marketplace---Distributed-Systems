#!/bin/bash

# UTA Marketplace - Monolithic Startup Script
# This script starts the monolithic application and verifies it's running correctly

set -e  # Exit on error

echo "=================================="
echo "UTA Marketplace - Monolithic"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clean up any existing containers
echo -e "${YELLOW}1. Cleaning up existing containers...${NC}"
docker compose -f docker-compose.monolithic.yml down -v 2>/dev/null || true
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Build and start services
echo -e "${YELLOW}2. Building and starting monolithic application...${NC}"
echo "   This may take a few minutes on first run..."
docker compose -f docker-compose.monolithic.yml up -d --build

# Wait for services to be ready
echo ""
echo -e "${YELLOW}3. Waiting for services to be ready...${NC}"
echo "   Waiting 30 seconds for database initialization..."
sleep 30

# Check service health
echo ""
echo -e "${YELLOW}4. Checking service health...${NC}"

# Check database
if docker exec uta-marketplace-db-mono pg_isready -U uta -d uta_marketplace > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL: Running${NC}"
else
    echo -e "${RED}✗ PostgreSQL: Not ready${NC}"
fi

# Check monolithic app
if curl -s http://localhost:9000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Monolithic App: Running (http://localhost:9000)${NC}"
else
    echo -e "${YELLOW}⚠ Monolithic App: Not ready yet (may need more time)${NC}"
fi

# Display service status
echo ""
echo -e "${YELLOW}5. Service Status:${NC}"
docker compose -f docker-compose.monolithic.yml ps

echo ""
echo "=================================="
echo -e "${GREEN}Services Started Successfully!${NC}"
echo "=================================="
echo ""
echo "Access points:"
echo "  • Monolithic API: http://localhost:9000"
echo "  • PostgreSQL:     localhost:5432"
echo ""
echo "Commands:"
echo "  • View logs:    docker compose -f docker-compose.monolithic.yml logs -f"
echo "  • Stop all:     docker compose -f docker-compose.monolithic.yml down"
echo "  • Restart:      docker compose -f docker-compose.monolithic.yml restart"
echo ""
echo "Test the API:"
echo "  curl http://localhost:9000/health"
echo ""
