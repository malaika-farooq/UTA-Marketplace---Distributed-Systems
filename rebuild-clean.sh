#!/bin/bash

# UTA Marketplace - Clean Rebuild Script
# This script performs a complete clean rebuild without using Docker cache

set -e

echo "=========================================="
echo "UTA Marketplace - Clean Rebuild"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Stopping all containers...${NC}"
docker compose -f docker-compose.microservices.yml down -v 2>/dev/null || true
docker compose -f docker-compose.monolithic.yml down -v 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}2. Removing old images...${NC}"
docker compose -f docker-compose.microservices.yml down --rmi all 2>/dev/null || true
echo -e "${GREEN}✓ Old images removed${NC}"
echo ""

echo -e "${YELLOW}3. Pruning Docker system...${NC}"
docker system prune -f
echo -e "${GREEN}✓ Docker system pruned${NC}"
echo ""

echo -e "${YELLOW}4. Building microservices from scratch (no cache)...${NC}"
echo "   This will take several minutes..."
docker compose -f docker-compose.microservices.yml build --no-cache --progress=plain
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${YELLOW}5. Starting services...${NC}"
docker compose -f docker-compose.microservices.yml up -d
echo -e "${GREEN}✓ Services starting${NC}"
echo ""

echo -e "${YELLOW}6. Waiting for services to initialize (60 seconds)...${NC}"
sleep 60
echo ""

echo -e "${YELLOW}7. Checking service status...${NC}"
docker compose -f docker-compose.microservices.yml ps
echo ""

echo -e "${YELLOW}8. Checking for proto file errors in logs...${NC}"
if docker compose -f docker-compose.microservices.yml logs --tail=50 | grep -i "ENOENT.*proto" > /dev/null 2>&1; then
    echo -e "${RED}✗ Still seeing proto file errors!${NC}"
    echo ""
    echo "Showing recent logs:"
    docker compose -f docker-compose.microservices.yml logs --tail=20
else
    echo -e "${GREEN}✓ No proto file errors detected!${NC}"
fi
echo ""

echo -e "${YELLOW}9. Testing API Gateway...${NC}"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API Gateway is responding!${NC}"
    curl -s http://localhost:8080/health | jq '.' 2>/dev/null || curl -s http://localhost:8080/health
else
    echo -e "${RED}✗ API Gateway not responding yet${NC}"
    echo "   It may need more time to start up"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Rebuild Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  • View logs:     docker compose -f docker-compose.microservices.yml logs -f"
echo "  • Check specific service: docker compose -f docker-compose.microservices.yml logs auth"
echo "  • Test endpoint: curl http://localhost:8080/health"
echo ""
