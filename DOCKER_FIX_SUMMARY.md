# Docker Build Context Fix - Summary

## Issues Fixed

### 1. Proto Files Not Found Error
**Error:** `ENOENT: no such file or directory, open '/proto/*.proto'`

**Root Cause:** The Dockerfiles were trying to copy proto files using relative paths (`../../proto`) but the Docker build context was set to the service directory, which prevented access to parent directories.

**Solution Applied:**
- Updated `docker-compose.microservices.yml` to use project root (`.`) as build context for all services
- Updated all Dockerfiles to use correct paths relative to project root

### 2. Files Modified

#### docker-compose.microservices.yml
Changed all service build configurations from:
```yaml
build: ./services/auth
```

To:
```yaml
build:
  context: .
  dockerfile: services/auth/Dockerfile
```

This change was applied to all 7 services:
- auth (port 50051)
- listing (port 50052)
- search (port 50053)
- user (port 50054)
- messaging (port 50055)
- analytics (port 50056)
- gateway (port 8080)

#### All Service Dockerfiles
Updated COPY commands to use project-root-relative paths:

**Before:**
```dockerfile
COPY ../../proto /proto
COPY package*.json ./
COPY . .
```

**After:**
```dockerfile
# Copy proto files from project root
COPY proto /proto

# Copy service-specific files
COPY services/auth/package*.json ./
RUN npm install

COPY services/auth .
RUN npm run build
```

**Services Updated:**
- `/services/auth/Dockerfile`
- `/services/listing/Dockerfile`
- `/services/search/Dockerfile`
- `/services/user/Dockerfile`
- `/services/messaging/Dockerfile`
- `/services/analytics/Dockerfile`
- `/gateway/Dockerfile`

### 3. Database Health Check Fix
**Error:** `FATAL: database "uta" does not exist`

**Solution:** Updated health check command in both docker-compose files:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U uta -d uta_marketplace"]
```

## How to Run

### Microservices Architecture

1. **Start all services:**
   ```bash
   ./start-microservices.sh
   ```

   Or manually:
   ```bash
   docker compose -f docker-compose.microservices.yml down -v
   docker compose -f docker-compose.microservices.yml up --build
   ```

2. **Wait for services to be ready** (30-60 seconds)

3. **Verify services are running:**
   ```bash
   # Check all containers
   docker compose -f docker-compose.microservices.yml ps

   # Test API Gateway
   curl http://localhost:8080/health

   # Should return:
   # {"status":"healthy","timestamp":"...","services":{"auth":"connected","listing":"connected",...}}
   ```

4. **Access Points:**
   - API Gateway: http://localhost:8080
   - PostgreSQL: localhost:5432
   - Auth Service (gRPC): localhost:50051
   - Listing Service (gRPC): localhost:50052
   - Search Service (gRPC): localhost:50053
   - User Service (gRPC): localhost:50054
   - Messaging Service (gRPC): localhost:50055
   - Analytics Service (gRPC): localhost:50056

### Monolithic Architecture

1. **Start monolithic app:**
   ```bash
   ./start-monolithic.sh
   ```

   Or manually:
   ```bash
   docker compose -f docker-compose.monolithic.yml down -v
   docker compose -f docker-compose.monolithic.yml up --build
   ```

2. **Verify it's running:**
   ```bash
   curl http://localhost:9000/health
   ```

3. **Access Point:**
   - Monolithic API: http://localhost:9000

## Expected Behavior

### Successful Startup

When services start successfully, you should see:

```
✓ PostgreSQL: Running
✓ Auth Service: Started
✓ Listing Service: Started
✓ Search Service: Started
✓ User Service: Started
✓ Messaging Service: Started
✓ Analytics Service: Started
✓ API Gateway: Running (http://localhost:8080)
```

### Logs to Check

```bash
# View all logs
docker compose -f docker-compose.microservices.yml logs -f

# View specific service logs
docker compose -f docker-compose.microservices.yml logs -f auth
docker compose -f docker-compose.microservices.yml logs -f gateway
docker compose -f docker-compose.microservices.yml logs -f postgres
```

### What Should NOT Appear in Logs

❌ `ENOENT: no such file or directory, open '/proto/*.proto'`
❌ `Cannot find module '/proto/auth.proto'`
❌ `database "uta" does not exist`
❌ `Error loading proto file`

### What SHOULD Appear in Logs

✅ `gRPC server listening on 0.0.0.0:50051` (and other ports)
✅ `Successfully connected to database`
✅ `Proto file loaded: /proto/auth.proto`
✅ `API Gateway started on port 8080`

## Testing the System

### 1. Health Check
```bash
curl http://localhost:8080/health
```

### 2. Get Categories
```bash
curl http://localhost:8080/api/search/categories
```

### 3. Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@uta.edu",
    "password": "password123",
    "full_name": "Test User",
    "student_id": "100000000"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@uta.edu",
    "password": "password123"
  }'
```

### 5. Search Listings
```bash
curl "http://localhost:8080/api/search/listings?query=textbook&page=1&limit=10"
```

## Performance Testing

Once both architectures are running:

```bash
cd testing/performance
npm install
npm run test:comparison
```

This will:
- Test both microservices (port 8080) and monolithic (port 9000)
- Generate performance comparison report
- Save results to `results/comparison-TIMESTAMP.json`

## Troubleshooting

### Services Won't Start

```bash
# Clean restart
docker compose -f docker-compose.microservices.yml down -v
docker system prune -f
docker compose -f docker-compose.microservices.yml up --build
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :8080
lsof -i :9000

# Kill the process
kill -9 <PID>
```

### Database Issues

```bash
# Check database logs
docker compose -f docker-compose.microservices.yml logs postgres

# Connect to database
docker exec -it uta-marketplace-db psql -U uta -d uta_marketplace

# Inside psql, check tables:
\dt
SELECT * FROM users;
SELECT * FROM listings;
```

### Still Getting Proto Errors?

If you still see proto file errors after applying these fixes:

1. **Ensure you have the latest code:**
   ```bash
   git status
   git diff docker-compose.microservices.yml
   ```

2. **Force rebuild without cache:**
   ```bash
   docker compose -f docker-compose.microservices.yml build --no-cache
   docker compose -f docker-compose.microservices.yml up
   ```

3. **Check proto files exist:**
   ```bash
   ls -la proto/
   # Should show: auth.proto, listing.proto, search.proto, user.proto, messaging.proto, analytics.proto
   ```

## Architecture Overview

### Microservices (8 Nodes)

1. **PostgreSQL** - Shared database
2. **Auth Service** (gRPC) - User authentication
3. **Listing Service** (gRPC) - Item management
4. **Search Service** (gRPC) - Search & filtering
5. **User Service** (gRPC) - User profiles
6. **Messaging Service** (gRPC) - Contact coordination
7. **Analytics Service** (gRPC) - View tracking & recommendations
8. **API Gateway** (REST) - REST to gRPC translation

### Monolithic (2 Nodes)

1. **PostgreSQL** - Database
2. **Monolithic App** (REST) - All functionality in one service

## What's Next

1. **Start both architectures** (they use different ports, can run simultaneously)
2. **Test all endpoints** to ensure functionality works
3. **Run performance tests** to compare architectures
4. **Review the results** in the generated comparison report
5. **Document findings** for your assignment submission

## Files Modified Summary

✅ `docker-compose.microservices.yml` - Updated build contexts
✅ `services/auth/Dockerfile` - Fixed proto and source paths
✅ `services/listing/Dockerfile` - Fixed proto and source paths
✅ `services/search/Dockerfile` - Fixed proto and source paths
✅ `services/user/Dockerfile` - Fixed proto and source paths
✅ `services/messaging/Dockerfile` - Fixed proto and source paths
✅ `services/analytics/Dockerfile` - Fixed proto and source paths
✅ `gateway/Dockerfile` - Fixed proto and source paths

## Previous Fixes Applied

✅ Database health check - Using correct database name
✅ TypeScript compilation errors - Fixed type annotations
✅ Service implementations - All 6 gRPC services complete
✅ API Gateway routes - All REST endpoints implemented
✅ Database schema - Tables, indexes, triggers created
✅ Seed data - Sample data for testing

---

**Status:** All fixes applied. Ready to run!

**Last Updated:** February 10, 2026
