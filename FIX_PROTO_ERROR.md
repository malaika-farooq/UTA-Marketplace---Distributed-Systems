# Fix Proto File Error

## Problem

All microservices are failing with the error:
```
Error: ENOENT: no such file or directory, open '/proto/auth.proto'
```

## Root Cause

**Docker Layer Caching** - Docker is using cached layers from previous builds when the Dockerfiles were incorrect. Even though we fixed the Dockerfiles to correctly copy proto files, Docker is reusing old cached layers that don't have the proto files.

## Solution

We need to rebuild all services **without using cache** to ensure the proto files are actually copied into the containers.

---

## Quick Fix (Recommended)

I've created an automated script to do a complete clean rebuild:

```bash
./rebuild-clean.sh
```

This script will:
1. Stop all containers
2. Remove old images
3. Rebuild everything from scratch (no cache)
4. Start services
5. Verify they're running correctly

---

## Manual Fix (If Script Doesn't Work)

If you prefer to do it manually or the script has issues:

### Step 1: Stop and Clean
```bash
# Stop all containers and remove volumes
docker compose -f docker-compose.microservices.yml down -v

# Remove old images
docker compose -f docker-compose.microservices.yml down --rmi all

# Clean Docker system
docker system prune -f
```

### Step 2: Rebuild Without Cache
```bash
# Build all services from scratch (no cache)
docker compose -f docker-compose.microservices.yml build --no-cache

# This will take 5-10 minutes on first run
# You should see it downloading packages and building each service
```

### Step 3: Start Services
```bash
# Start all services
docker compose -f docker-compose.microservices.yml up -d

# Wait for initialization (60 seconds)
sleep 60
```

### Step 4: Verify
```bash
# Check container status
docker compose -f docker-compose.microservices.yml ps

# Check for errors in logs
docker compose -f docker-compose.microservices.yml logs --tail=50

# Test API Gateway
curl http://localhost:8080/health
```

---

## What Was Fixed in the Dockerfiles

Before (WRONG):
```dockerfile
# Build context was ./services/auth
# Couldn't access parent directory
COPY ../../proto /proto
```

After (CORRECT):
```dockerfile
# Build context is now . (project root)
# Can access proto directory
COPY proto /proto
```

### All Fixed Dockerfiles

✅ `services/auth/Dockerfile`
✅ `services/listing/Dockerfile`
✅ `services/search/Dockerfile`
✅ `services/user/Dockerfile`
✅ `services/messaging/Dockerfile`
✅ `services/analytics/Dockerfile`
✅ `gateway/Dockerfile`

### docker-compose.microservices.yml

All services now use:
```yaml
build:
  context: .              # Project root
  dockerfile: services/auth/Dockerfile
```

---

## How to Verify It's Fixed

### 1. No Error Messages

The logs should NOT contain:
```
❌ ENOENT: no such file or directory, open '/proto/*.proto'
```

### 2. Services Start Successfully

You should see:
```
✅ Auth Service listening on port 50051
✅ Listing Service listening on port 50052
✅ Search Service listening on port 50053
✅ User Service listening on port 50054
✅ Messaging Service listening on port 50055
✅ Analytics Service listening on port 50056
✅ API Gateway started on port 8080
```

### 3. API Gateway Responds

```bash
curl http://localhost:8080/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "auth": "connected",
    "listing": "connected",
    "search": "connected",
    "user": "connected",
    "messaging": "connected",
    "analytics": "connected"
  }
}
```

---

## Troubleshooting

### Still Getting Proto Errors After Rebuild?

1. **Verify proto files exist locally:**
   ```bash
   ls -la proto/
   # Should show: auth.proto, listing.proto, search.proto, user.proto, messaging.proto, analytics.proto
   ```

2. **Check Docker disk space:**
   ```bash
   docker system df
   # If low on space, run: docker system prune -a --volumes
   ```

3. **Verify build context in docker-compose.microservices.yml:**
   ```bash
   grep -A 2 "build:" docker-compose.microservices.yml
   # Each service should have:
   #   build:
   #     context: .
   #     dockerfile: services/*/Dockerfile
   ```

4. **Try building one service manually to see detailed output:**
   ```bash
   docker compose -f docker-compose.microservices.yml build --no-cache auth
   # Watch for any errors during the build
   ```

### Container Starts Then Immediately Exits

Check the logs for that specific service:
```bash
docker compose -f docker-compose.microservices.yml logs auth
docker compose -f docker-compose.microservices.yml logs listing
```

### Database Connection Issues

Ensure database is ready before services start:
```bash
docker compose -f docker-compose.microservices.yml logs postgres
# Should show: "database system is ready to accept connections"
```

### Port Conflicts

If you see "port already in use":
```bash
# Find what's using the port
lsof -i :8080
lsof -i :50051

# Kill the process or change the port in docker-compose.yml
```

---

## Understanding the Fix

### Why This Happened

1. **Original Dockerfiles** tried to copy `../../proto` but the build context was the service directory
2. **Docker COPY** can only access files within the build context
3. **We fixed it** by changing build context to project root
4. **But Docker cached** the old layers where the COPY failed
5. **Solution:** Rebuild without cache to force Docker to re-execute all COPY commands

### Docker Layer Caching Explained

Docker caches each layer of the build:
- If a Dockerfile command hasn't changed, Docker reuses the cached layer
- Even though we fixed the Dockerfile, if the COPY command text is the same, Docker might use the old cached result
- `--no-cache` forces Docker to rebuild every layer from scratch

---

## After It's Working

Once all services start successfully:

### Test Basic Functionality
```bash
# Get categories
curl http://localhost:8080/api/search/categories

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uta.edu","password":"password123"}'

# Search listings
curl "http://localhost:8080/api/search/listings?query=textbook&page=1&limit=10"
```

### Run Performance Tests
```bash
cd testing/performance
npm install
npm run test:comparison
```

### Start Monolithic Version
```bash
./start-monolithic.sh
```

---

## Summary

**Issue:** Proto files not found due to Docker caching old incorrect builds
**Fix:** Clean rebuild without cache using `./rebuild-clean.sh`
**Expected Result:** All 8 services start successfully and API Gateway responds

---

**Need more help?** Check:
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [DOCKER_FIX_SUMMARY.md](DOCKER_FIX_SUMMARY.md) - Docker configuration details

---

**Created:** February 10, 2026
