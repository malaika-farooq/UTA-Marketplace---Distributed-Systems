# 🚀 Complete Deployment Guide

## What's New - Frontend Integration

The frontend is now fully containerized and integrated with Docker Compose!

## 📦 Complete Stack

### Microservices (9 containers total)
```
┌─────────────────────────────────────────────┐
│         Frontend (localhost:3000)           │
│              Static Web UI                  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      API Gateway (localhost:8080)           │
│          Express.js REST API                │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │   gRPC Services       │
      │   (50051-50056)       │
      ├───────────────────────┤
      │ • Auth                │
      │ • Listing             │
      │ • Search              │
      │ • User                │
      │ • Messaging           │
      │ • Analytics           │
      └───────────┬───────────┘
                  │
      ┌───────────▼───────────┐
      │   PostgreSQL:5432     │
      └───────────────────────┘
```

## 🎯 Quick Start Options

### Option 1: Start Everything with One Command

```bash
./start-all.sh
```

This starts:
- ✅ All 6 microservices (gRPC)
- ✅ API Gateway (REST)
- ✅ PostgreSQL database
- ✅ Frontend web server

Then visit: **http://localhost:3000**

### Option 2: Manual Docker Compose

```bash
# Start microservices + frontend
docker compose -f docker-compose.microservices.yml up -d

# Start monolithic + frontend (on port 3001)
docker compose -f docker-compose.monolithic.yml up -d
```

### Option 3: Frontend Only (No Docker)

If you prefer to run frontend outside Docker:

```bash
cd frontend
node serve.js
# Visit http://localhost:3000
```

## 🌐 Access Points

| Service | Microservices | Monolithic |
|---------|--------------|------------|
| Frontend | http://localhost:3000 | http://localhost:3001 |
| Backend API | http://localhost:8080 | http://localhost:9000 |
| Database | localhost:5432 | localhost:5433 |

## 📋 Pre-Flight Checklist

Before starting, ensure:

- [ ] Docker Desktop is running
- [ ] No services using ports: 3000, 3001, 5432, 5433, 8080, 9000, 50051-50056
- [ ] At least 4GB RAM available for Docker
- [ ] Internet connection (for pulling images)

## 🔧 First-Time Setup

### 1. Check Docker
```bash
docker --version
docker compose version
```

### 2. Start Services
```bash
./start-all.sh
```

### 3. Verify Services
```bash
# Check all containers are running
docker ps

# Should see 9 containers:
# - uta-marketplace-frontend
# - uta-marketplace-gateway
# - uta-marketplace-auth
# - uta-marketplace-listing
# - uta-marketplace-search
# - uta-marketplace-user
# - uta-marketplace-messaging
# - uta-marketplace-analytics
# - uta-marketplace-db
```

### 4. Test Frontend
```bash
# Open in browser
open http://localhost:3000

# Or use curl
curl http://localhost:3000
```

### 5. Login
- Email: **alice@uta.edu**
- Password: **password123**

## 🐛 Troubleshooting

### Docker Credential Error

If you see: `docker-credential-desktop: executable file not found`

**Solution 1:** Update Docker config
```bash
# Edit ~/.docker/config.json
# Remove or change: "credsStore": "desktop"
# To: "credsStore": ""
```

**Solution 2:** Use cached images
If images were already built, just start them:
```bash
docker compose -f docker-compose.microservices.yml up -d
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Reset everything
docker compose -f docker-compose.microservices.yml down -v
docker compose -f docker-compose.microservices.yml up -d

# Wait 10 seconds for database to initialize
sleep 10
```

### Frontend Won't Load

```bash
# Check frontend container logs
docker logs uta-marketplace-frontend

# Restart frontend
docker restart uta-marketplace-frontend
```

## 📊 Monitoring

### View All Logs
```bash
docker compose -f docker-compose.microservices.yml logs -f
```

### View Specific Service
```bash
docker logs -f uta-marketplace-frontend
docker logs -f uta-marketplace-gateway
docker logs -f uta-marketplace-auth
```

### Check Resource Usage
```bash
docker stats
```

## 🔄 Updates & Rebuilds

### Rebuild Single Service
```bash
# Rebuild frontend after changes
docker compose -f docker-compose.microservices.yml up -d --build frontend

# Rebuild gateway
docker compose -f docker-compose.microservices.yml up -d --build gateway
```

### Rebuild Everything
```bash
docker compose -f docker-compose.microservices.yml build --no-cache
docker compose -f docker-compose.microservices.yml up -d
```

### Update Code Without Rebuild

For frontend (since it's just static files):
```bash
# Stop frontend
docker stop uta-marketplace-frontend

# Run standalone
cd frontend && node serve.js
```

## 🧪 Testing the Stack

### 1. Test Frontend
```bash
curl http://localhost:3000
# Should return HTML
```

### 2. Test API Gateway
```bash
curl http://localhost:8080/health
# Should return: {"status":"healthy","service":"api-gateway"}
```

### 3. Test Login Flow
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uta.edu","password":"password123"}'
# Should return token
```

### 4. Test Search
```bash
curl "http://localhost:8080/api/search/listings?query=macbook"
# Should return listings
```

## 📈 Performance Comparison

To compare microservices vs monolithic:

1. Start microservices:
   ```bash
   docker compose -f docker-compose.microservices.yml up -d
   ```

2. Open frontend: http://localhost:3000

3. Use the application, note performance

4. Stop microservices:
   ```bash
   docker compose -f docker-compose.microservices.yml down
   ```

5. Start monolithic:
   ```bash
   docker compose -f docker-compose.monolithic.yml up -d
   ```

6. Open frontend: http://localhost:3001

7. Toggle to monolithic in UI, compare performance

## 🛑 Cleanup

### Stop All Services
```bash
# Microservices
docker compose -f docker-compose.microservices.yml down

# Monolithic
docker compose -f docker-compose.monolithic.yml down
```

### Remove All Data
```bash
# Remove volumes (database data)
docker compose -f docker-compose.microservices.yml down -v
docker compose -f docker-compose.monolithic.yml down -v
```

### Complete Cleanup
```bash
# Remove everything including images
docker compose -f docker-compose.microservices.yml down -v --rmi all
docker compose -f docker-compose.monolithic.yml down -v --rmi all
```

## ✅ Success Criteria

Your deployment is successful when:

- [ ] All 9 containers are running (`docker ps`)
- [ ] Frontend loads at http://localhost:3000
- [ ] You can login with test credentials
- [ ] Search returns results with images
- [ ] Profile page shows user data
- [ ] Favorites can be added/removed
- [ ] No errors in browser console
- [ ] No errors in docker logs

## 📚 Additional Resources

- **Main README**: [README.md](README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Test Script**: `./test-all-services.sh`
- **Startup Script**: `./start-all.sh`

## 🎓 Architecture Notes

**Microservices Advantages:**
- Independent scaling
- Technology diversity
- Fault isolation
- Parallel development

**Microservices Challenges:**
- Complex deployment
- Network overhead
- Data consistency
- More resource usage

**Monolithic Advantages:**
- Simple deployment
- Better performance (no network calls)
- Easier debugging
- Lower resource usage

**Monolithic Challenges:**
- Tight coupling
- Difficult to scale
- Technology lock-in
- Large codebase

---

**Need Help?** Check container logs: `docker logs <container-name>`
