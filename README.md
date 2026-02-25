# UTA Marketplace - Distributed Systems

A full-stack marketplace application demonstrating microservices vs monolithic architecture patterns.

## 🏗️ Architecture

### Microservices (8 containers)
- **API Gateway** (Express.js REST API)
- **6 gRPC Services**: Auth, Listing, Search, User, Messaging, Analytics
- **PostgreSQL Database**
- **Frontend** (Static web server)

### Monolithic (3 containers)
- **Monolithic Application** (All services in one)
- **PostgreSQL Database**
- **Frontend** (Static web server)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Ports available: 3000, 5432, 8080, 9000, 50051-50056

### Start Everything (Microservices + Frontend)

```bash
./start-all.sh
```

Then open: **http://localhost:3000**

### Start Individual Architectures

**Microservices:**
```bash
docker compose -f docker-compose.microservices.yml up -d
```

**Monolithic:**
```bash
docker compose -f docker-compose.monolithic.yml up -d
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web UI (Microservices) |
| Frontend Mono | http://localhost:3001 | Web UI (Monolithic) |
| API Gateway | http://localhost:8080 | Microservices REST API |
| Monolithic | http://localhost:9000 | Monolithic REST API |
| PostgreSQL | localhost:5432 | Microservices DB |
| PostgreSQL Mono | localhost:5433 | Monolithic DB |

## 👤 Default Users

| Email | Password |
|-------|----------|
| alice@uta.edu | password123 |
| bob@uta.edu | password123 |
| carol@uta.edu | password123 |

## 📁 Project Structure

```
.
├── frontend/              # Web UI
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── Dockerfile
├── gateway/               # API Gateway (REST)
├── services/              # gRPC Microservices
│   ├── auth/
│   ├── listing/
│   ├── search/
│   ├── user/
│   ├── messaging/
│   └── analytics/
├── monolithic/            # Monolithic version
├── database/              # PostgreSQL schemas & seeds
├── proto/                 # gRPC Protocol Buffers
└── docker-compose.*.yml   # Docker configurations
```

## 🔧 Development

### View Logs
```bash
# All services
docker compose -f docker-compose.microservices.yml logs -f

# Specific service
docker logs uta-marketplace-auth -f
```

### Rebuild Services
```bash
# Rebuild specific service
docker compose -f docker-compose.microservices.yml up -d --build gateway

# Rebuild all
docker compose -f docker-compose.microservices.yml up -d --build
```

### Database Access
```bash
# Microservices DB
docker exec -it uta-marketplace-db psql -U uta -d uta_marketplace

# Monolithic DB
docker exec -it uta-marketplace-db-mono psql -U uta -d uta_marketplace
```

## 🧪 Testing

### Test All Services
```bash
./test-all-services.sh
```

### Manual API Tests
```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@uta.edu","password":"password123"}'

# Search listings
curl http://localhost:8080/api/search/listings?query=macbook
```

## 🛑 Stopping Services

```bash
# Stop microservices
docker compose -f docker-compose.microservices.yml down

# Stop monolithic
docker compose -f docker-compose.monolithic.yml down

# Remove all data (including database)
docker compose -f docker-compose.microservices.yml down -v
```

## 🔄 Switching Architectures

The frontend supports toggling between architectures:
1. Use the radio buttons in the header
2. Switch between Microservices (8080) and Monolithic (9000)
3. Compare performance and behavior

## 🐛 Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker ps

# View service logs
docker logs <container-name>

# Rebuild without cache
docker compose -f docker-compose.microservices.yml build --no-cache
docker compose -f docker-compose.microservices.yml up -d
```

### Database issues
```bash
# Reset database
docker compose -f docker-compose.microservices.yml down -v
docker compose -f docker-compose.microservices.yml up -d
```

### Port conflicts
```bash
# Check what's using a port
lsof -i :3000
lsof -i :8080

# Kill process using port
kill -9 <PID>
```

## 📊 Features

### Implemented
- ✅ User authentication (JWT)
- ✅ Listing management (CRUD)
- ✅ Search with filters
- ✅ User profiles
- ✅ Favorites system
- ✅ Analytics (views, trending)
- ✅ Contact/messaging tracking
- ✅ gRPC inter-service communication
- ✅ RESTful API gateway
- ✅ Responsive web UI

### Database Schema
- Users, Listings, Categories, Conditions
- Favorites, Listing Views
- Contact Attempts, Meet Spots
- Full-text search indexes

## 🎓 Educational Purpose

This project demonstrates:
- Microservices architecture with gRPC
- Monolithic architecture for comparison
- Docker containerization
- Service orchestration with Docker Compose
- API Gateway pattern
- Database design and indexing
- Frontend-backend integration
- Real-world distributed systems challenges

## 📝 License

Educational project for CSE-5306 Distributed Systems course.

## 🤝 Contributing

This is a course project. Contributions are not accepted.

## 🎓 Team & Acknowledgments

**Course:** CSE 5306 - Distributed Systems
**Institution:** University of Texas at Arlington
**Semester:** Spring 2026

### Team Members

| Team Member | Responsibilities |
| --- | --- |
| **Yuanbin Man** | Architecture, Frontend, Backend
| **Malaika Farooq** | Architecture, Frontend, Testing, Slides & Documentation 

---

**Built with ❤️ for CSE 5306 - Distributed Systems**
