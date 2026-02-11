# Quick Start Guide

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- 4GB+ available RAM
- 10GB+ available disk space

## Option 1: Automated Startup (Recommended)

### Start Microservices Architecture
```bash
chmod +x start-microservices.sh
./start-microservices.sh
```

### Start Monolithic Architecture
```bash
chmod +x start-monolithic.sh
./start-monolithic.sh
```

**Note:** Both can run simultaneously (different ports).

## Option 2: Manual Startup

### Microservices
```bash
# Clean start
docker compose -f docker-compose.microservices.yml down -v
docker compose -f docker-compose.microservices.yml up --build

# Or run in background
docker compose -f docker-compose.microservices.yml up --build -d

# View logs
docker compose -f docker-compose.microservices.yml logs -f
```

### Monolithic
```bash
# Clean start
docker compose -f docker-compose.monolithic.yml down -v
docker compose -f docker-compose.monolithic.yml up --build

# Or run in background
docker compose -f docker-compose.monolithic.yml up --build -d

# View logs
docker compose -f docker-compose.monolithic.yml logs -f
```

## Verify Services Are Running

### Microservices (8 nodes)
```bash
# Check all containers
docker compose -f docker-compose.microservices.yml ps

# Test API Gateway
curl http://localhost:8080/health

# Should return JSON with status "healthy"
```

### Monolithic (2 nodes)
```bash
# Check containers
docker compose -f docker-compose.monolithic.yml ps

# Test monolithic app
curl http://localhost:9000/health

# Should return JSON with status "healthy"
```

## Test Basic Functionality

### 1. Get Categories
```bash
curl http://localhost:8080/api/search/categories
```

### 2. Login as Sample User
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uta.edu","password":"password123"}'
```

Copy the `token` from the response for authenticated requests.

### 3. Get Listings
```bash
curl "http://localhost:8080/api/search/listings?page=1&limit=10"
```

### 4. Create Listing (Authenticated)
```bash
# Replace YOUR_TOKEN_HERE with the token from login
curl -X POST http://localhost:8080/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Book",
    "description": "Test description",
    "category_id": 1,
    "price": 25.00,
    "condition_id": 1,
    "meet_spot_id": 1
  }'
```

## Run Performance Tests

```bash
# Install test dependencies
cd testing/performance
npm install

# Run comparison tests
npm run test:comparison

# View results
cat results/comparison-*.json | jq
```

## Common Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.microservices.yml logs -f

# Specific service
docker compose -f docker-compose.microservices.yml logs -f auth
docker compose -f docker-compose.microservices.yml logs -f gateway
docker compose -f docker-compose.microservices.yml logs -f postgres
```

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.microservices.yml restart

# Restart specific service
docker compose -f docker-compose.microservices.yml restart auth
```

### Stop Services
```bash
# Stop microservices
docker compose -f docker-compose.microservices.yml down

# Stop and remove volumes (deletes database data)
docker compose -f docker-compose.microservices.yml down -v

# Stop monolithic
docker compose -f docker-compose.monolithic.yml down
```

### Access Database
```bash
# Connect to microservices database
docker exec -it uta-marketplace-db psql -U uta -d uta_marketplace

# Connect to monolithic database
docker exec -it uta-marketplace-db-mono psql -U uta -d uta_marketplace

# Inside psql:
\dt                           # List tables
\d users                      # Describe users table
SELECT * FROM users;          # Query users
SELECT * FROM listings;       # Query listings
\q                            # Quit
```

## Service Ports

### Microservices
- **API Gateway (REST):** http://localhost:8080
- **Auth gRPC:** localhost:50051
- **Listing gRPC:** localhost:50052
- **Search gRPC:** localhost:50053
- **User gRPC:** localhost:50054
- **Messaging gRPC:** localhost:50055
- **Analytics gRPC:** localhost:50056
- **PostgreSQL:** localhost:5432

### Monolithic
- **Monolithic API (REST):** http://localhost:9000
- **PostgreSQL:** localhost:5432 (different volume)

## Troubleshooting

### "Port already in use"
```bash
# Find process using port
lsof -i :8080
lsof -i :9000

# Kill process
kill -9 <PID>
```

### "Proto file not found"
This should be fixed. If you still see this:
```bash
# Verify proto files exist
ls -la proto/

# Force clean rebuild
docker compose -f docker-compose.microservices.yml down -v
docker system prune -f
docker compose -f docker-compose.microservices.yml build --no-cache
docker compose -f docker-compose.microservices.yml up
```

### Services not ready
Wait 30-60 seconds after startup for:
- Database initialization
- Schema and seed data loading
- gRPC services to start
- API Gateway to connect to all services

### Database connection issues
```bash
# Check database is running
docker compose -f docker-compose.microservices.yml logs postgres

# Restart database
docker compose -f docker-compose.microservices.yml restart postgres
```

## API Documentation

Full API documentation is available in:
- [README.md](README.md) - Main documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed troubleshooting

## Sample Test Data

The system comes pre-loaded with:
- 5 sample users (alice@uta.edu, bob@uta.edu, etc.)
- Password for all: `password123`
- 10+ sample listings
- Multiple categories and conditions
- Campus meet-up spots

## Next Steps

1. ✅ Start both architectures
2. ✅ Test basic functionality
3. ✅ Run performance comparison
4. ✅ Review architecture documentation
5. ✅ Prepare assignment submission

---

**Need Help?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [DOCKER_FIX_SUMMARY.md](DOCKER_FIX_SUMMARY.md)
