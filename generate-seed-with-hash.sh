#!/bin/bash

# Generate a valid bcrypt hash and update seed.sql

echo "Generating valid bcrypt hash for 'password123'..."

# Generate hash using the auth container
HASH=$(docker exec uta-marketplace-auth node -p "require('bcrypt').hashSync('password123', 10)")

echo "Generated hash: $HASH"
echo ""
echo "Updating seed.sql with real bcrypt hash..."

# Escape the hash for sed
ESCAPED_HASH=$(echo "$HASH" | sed 's/[&/\]/\\&/g')

# Update seed.sql with the real hash (use same hash for all users for simplicity)
sed -i.bak "s/\\\$2b\\\$10\\\$K5W5W5W5W5W5W5W5W5W5WuGKqvJ9qX9qX9qX9qX9qX9qX9qX9qXe/$ESCAPED_HASH/g" database/seed.sql
sed -i.bak "s/\\\$2b\\\$10\\\$L6X6X6X6X6X6X6X6X6X6XuHLrvK0rY0rY0rY0rY0rY0rY0rY0rYf/$ESCAPED_HASH/g" database/seed.sql
sed -i.bak "s/\\\$2b\\\$10\\\$M7Y7Y7Y7Y7Y7Y7Y7Y7Y7YuIMswL1sZ1sZ1sZ1sZ1sZ1sZ1sZ1sZg/$ESCAPED_HASH/g" database/seed.sql

echo "✓ seed.sql updated with valid bcrypt hash"
echo ""
echo "Now rebuild your databases to use the new hash:"
echo "  docker compose -f docker-compose.microservices.yml down -v"
echo "  docker compose -f docker-compose.microservices.yml up -d"
echo ""
echo "  docker compose -f docker-compose.monolithic.yml down -v"
echo "  docker compose -f docker-compose.monolithic.yml up -d"
