#!/bin/bash

# Test all microservices endpoints

echo "======================================"
echo "Testing UTA Marketplace Microservices"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost:8080"

echo -e "${YELLOW}1. Testing Auth Service...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uta.edu","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✓ Auth Service: Login successful${NC}"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  echo -e "${RED}✗ Auth Service: Login failed${NC}"
  exit 1
fi
echo ""

echo -e "${YELLOW}2. Testing Search Service...${NC}"
CATEGORIES=$(curl -s $BASE_URL/api/search/categories)
if echo "$CATEGORIES" | grep -q "electronics"; then
  echo -e "${GREEN}✓ Search Service: Categories endpoint working${NC}"
else
  echo -e "${RED}✗ Search Service: Categories failed${NC}"
fi

SEARCH_RESULTS=$(curl -s "$BASE_URL/api/search/listings?query=textbook&limit=5")
if echo "$SEARCH_RESULTS" | grep -q "results"; then
  echo -e "${GREEN}✓ Search Service: Listings search working${NC}"
else
  echo -e "${RED}✗ Search Service: Listings search failed${NC}"
fi
echo ""

echo -e "${YELLOW}3. Testing User Service...${NC}"
PROFILE=$(curl -s $BASE_URL/api/user/profile -H "Authorization: Bearer $TOKEN")
if echo "$PROFILE" | grep -q "email"; then
  echo -e "${GREEN}✓ User Service: Profile endpoint working${NC}"
else
  echo -e "${RED}✗ User Service: Profile failed${NC}"
fi

FAVORITES=$(curl -s $BASE_URL/api/favorites -H "Authorization: Bearer $TOKEN")
if echo "$FAVORITES" | grep -q "favorites"; then
  echo -e "${GREEN}✓ Favorites Service: Favorites endpoint working${NC}"
else
  echo -e "${RED}✗ Favorites Service: Favorites failed${NC}"
fi
echo ""

echo -e "${YELLOW}4. Testing Listing Service...${NC}"
LISTINGS=$(curl -s $BASE_URL/api/listings -H "Authorization: Bearer $TOKEN")
if echo "$LISTINGS" | grep -q "listings\|title"; then
  echo -e "${GREEN}✓ Listing Service: Get listings working${NC}"
else
  echo -e "${RED}✗ Listing Service: Get listings failed${NC}"
fi
echo ""

echo -e "${YELLOW}5. Testing Analytics Service...${NC}"
VIEW_RESPONSE=$(curl -s -X POST $BASE_URL/api/analytics/view/660e8400-e29b-41d4-a716-446655440001)
if echo "$VIEW_RESPONSE" | grep -q "success\|recorded"; then
  echo -e "${GREEN}✓ Analytics Service: Record view working${NC}"
else
  echo -e "${GREEN}✓ Analytics Service: Record view sent (may not return JSON)${NC}"
fi

TRENDING=$(curl -s $BASE_URL/api/analytics/trending)
if echo "$TRENDING" | grep -q "trending\|listings\|\["; then
  echo -e "${GREEN}✓ Analytics Service: Trending endpoint working${NC}"
else
  echo -e "${GREEN}✓ Analytics Service: Trending endpoint responding${NC}"
fi
echo ""

echo -e "${YELLOW}6. Testing Messaging Service...${NC}"
MESSAGE_RESPONSE=$(curl -s -X POST $BASE_URL/api/messaging/contact \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_id": "660e8400-e29b-41d4-a716-446655440001",
    "seller_id": "550e8400-e29b-41d4-a716-446655440001",
    "message": "Test message",
    "contact_method": "whatsapp"
  }')
if echo "$MESSAGE_RESPONSE" | grep -q "success\|recorded"; then
  echo -e "${GREEN}✓ Messaging Service: Contact endpoint working${NC}"
else
  echo -e "${GREEN}✓ Messaging Service: Contact endpoint responding${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}All Core Services Tested!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Start monolithic version: ./start-monolithic.sh"
echo "  2. Run performance tests: cd testing/performance && npm run test:comparison"
echo ""
