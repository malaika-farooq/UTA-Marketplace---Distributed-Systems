# Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Error: "database 'uta' does not exist"

**Problem:** PostgreSQL health check fails with database error.

**Solution:**
The database is named `uta_marketplace`, not `uta`. This has been fixed in the docker-compose files.

```bash
# Clean restart
docker-compose -f docker-compose.microservices.yml down -v
docker-compose -f docker-compose.microservices.yml up --build
```

---

### 2. Services Won't Start

**Problem:** Docker containers fail to start or immediately exit.

**Solution:**

```bash
# Check logs for specific service
docker-compose -f docker-compose.microservices.yml logs <service-name>

# Examples:
docker-compose -f docker-compose.microservices.yml logs postgres
docker-compose -f docker-compose.microservices.yml logs auth
docker-compose -f docker-compose.microservices.yml logs gateway

# Complete restart
docker-compose -f docker-compose.microservices.yml down -v
docker system prune -f
docker-compose -f docker-compose.microservices.yml up --build
```

---

### 3. Port Already in Use

**Problem:** Error message like "port 8080 is already allocated"

**Solution:**

```bash
# Find what's using the port (on macOS/Linux)
lsof -i :8080
lsof -i :9000
lsof -i :5432

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use different ports in docker-compose.yml
# Change "8080:8080" to "8081:8080"
```

---

### 4. Database Schema Not Created

**Problem:** Tables don't exist or seed data missing.

**Solution:**

```bash
# Restart with volume cleanup (this will delete all data!)
docker-compose -f docker-compose.microservices.yml down -v
docker-compose -f docker-compose.microservices.yml up --build

# Manually run schema
docker exec -i uta-marketplace-db psql -U uta -d uta_marketplace < database/schema.sql
docker exec -i uta-marketplace-db psql -U uta -d uta_marketplace < database/seed.sql
```

---

### 5. gRPC Connection Refused

**Problem:** Gateway can't connect to gRPC services.

**Solution:**

```bash
# Check if services are running
docker-compose -f docker-compose.microservices.yml ps

# Check if services are listening on correct ports
docker exec uta-marketplace-auth netstat -tulpn | grep 50051
docker exec uta-marketplace-listing netstat -tulpn | grep 50052

# Restart specific service
docker-compose -f docker-compose.microservices.yml restart auth
docker-compose -f docker-compose.microservices.yml restart gateway
```

---

### 6. Performance Tests Failing

**Problem:** Tests can't connect to services.

**Solution:**

```bash
# Ensure both architectures are running
curl http://localhost:8080/health  # Should return {"status":"healthy"...}
curl http://localhost:9000/health  # Should return {"status":"healthy"...}

# Check if services are actually listening
docker-compose -f docker-compose.microservices.yml ps
docker-compose -f docker-compose.monolithic.yml ps

# Wait longer for services to be ready (60 seconds)
sleep 60

# Run tests again
cd testing/performance
npm run test:comparison
```

---

### 7. Out of Memory / Build Fails

**Problem:** Docker build fails with out of memory error.

**Solution:**

```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory (set to 4GB+)

# Clean up Docker resources
docker system prune -a --volumes

# Build services one at a time
docker-compose -f docker-compose.microservices.yml build postgres
docker-compose -f docker-compose.microservices.yml build auth
docker-compose -f docker-compose.microservices.yml build listing
# ... etc
```

---

### 8. TypeScript Compilation Errors

**Problem:** Services fail with TypeScript errors.

**Solution:**

```bash
# Rebuild with clean cache
docker-compose -f docker-compose.microservices.yml build --no-cache

# Or install dependencies locally and check errors
cd services/auth
npm install
npm run build

# If you see module resolution errors, ensure package.json has:
# "type": "module"
# And tsconfig.json has:
# "module": "NodeNext"
# "moduleResolution": "NodeNext"
```

---

### 9. "Cannot find module" Errors

**Problem:** Node.js can't find imported modules.

**Solution:**

```bash
# Ensure all imports have .js extension (for ES modules)
# Correct:   import { something } from './file.js'
# Incorrect: import { something } from './file'

# Check package.json has "type": "module"

# Reinstall dependencies
cd services/auth
rm -rf node_modules package-lock.json
npm install
```

---

### 10. Services Start But Don't Respond

**Problem:** Services running but API calls timeout.

**Solution:**

```bash
# Check service logs for errors
docker-compose -f docker-compose.microservices.yml logs -f

# Verify network connectivity
docker network ls
docker network inspect uta-marketplace-network

# Restart all services
docker-compose -f docker-compose.microservices.yml restart

# If still not working, rebuild everything
docker-compose -f docker-compose.microservices.yml down -v
docker-compose -f docker-compose.microservices.yml up --build
```

---

## Quick Diagnostic Commands

```bash
# Check all containers status
docker ps -a

# Check specific service logs
docker logs uta-marketplace-auth
docker logs uta-marketplace-gateway
docker logs uta-marketplace-db

# Interactive shell into container
docker exec -it uta-marketplace-db bash
docker exec -it uta-marketplace-auth sh

# Check database
docker exec -it uta-marketplace-db psql -U uta -d uta_marketplace

# Inside psql:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;
SELECT * FROM listings;

# Test API endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/search/categories
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uta.edu","password":"password123"}'
```

---

## Performance Issues

### Slow Startup

**Problem:** Services take long time to start.

**Causes:**
- First time building images (5-10 minutes normal)
- Slow internet connection (downloading images)
- Low system resources

**Solutions:**
```bash
# Use pre-built base images
# Increase Docker resources (CPU/Memory)
# Be patient on first run - subsequent runs are faster

# Skip building some services for testing
docker-compose -f docker-compose.microservices.yml up postgres gateway auth listing search
```

### Slow Performance

**Problem:** API responses are slow.

**Solutions:**
```bash
# Increase Docker resources
# Check database indexes exist
docker exec -it uta-marketplace-db psql -U uta -d uta_marketplace -c "\di"

# Add connection pooling if not present
# Check for N+1 query problems
# Enable query logging to find slow queries
```

---

## Environment-Specific Issues

### macOS Silicon (M1/M2)

**Problem:** Some Docker images fail to build.

**Solution:**
```bash
# Add platform specification to docker-compose.yml
# Under each service:
platform: linux/amd64

# Or build for ARM64 if images support it
platform: linux/arm64
```

### Windows

**Problem:** Line ending issues or permission errors.

**Solution:**
```bash
# Ensure Git uses Unix line endings
git config --global core.autocrlf input

# Clone the repo again
git clone <repo-url>

# Or convert line endings
dos2unix start-microservices.sh
dos2unix start-monolithic.sh
```

---

## Still Having Issues?

1. **Check the logs first:**
   ```bash
   docker-compose -f docker-compose.microservices.yml logs -f
   ```

2. **Google the error message** - Many Docker/Node.js errors are common

3. **Clean slate restart:**
   ```bash
   docker-compose down -v
   docker system prune -a
   docker volume prune
   docker-compose up --build
   ```

4. **Check system requirements:**
   - Docker: 20.10+
   - Docker Compose: 2.0+
   - Available RAM: 4GB+
   - Available Disk: 10GB+

5. **Verify file permissions:**
   ```bash
   chmod +x start-microservices.sh
   chmod +x start-monolithic.sh
   ```

---

## Getting Help

If you're still stuck:

1. Create an issue with:
   - Full error message
   - Output of `docker-compose ps`
   - Output of `docker-compose logs <service>`
   - Your OS and Docker version

2. Include steps to reproduce the problem

3. Share relevant configuration files

---

**Last Updated:** February 2026
