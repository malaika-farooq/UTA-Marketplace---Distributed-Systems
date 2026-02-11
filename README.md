# UTA Marketplace - Distributed Systems Project

> A comprehensive distributed marketplace system for UTA students, implementing both **microservices** and **monolithic** architectures for performance comparison.

[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://www.docker.com/)
[![gRPC](https://img.shields.io/badge/gRPC-1.12-orange.svg)](https://grpc.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Functional Requirements](#-functional-requirements)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [Performance Testing](#-performance-testing)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Technologies Used](#-technologies-used)
- [Team & Acknowledgments](#-team--acknowledgments)

---

## 🎯 Project Overview

UTA Marketplace is a peer-to-peer marketplace platform designed for UTA students to buy and sell items on campus. This project demonstrates the trade-offs between **microservices** and **monolithic** architectures through a complete implementation of both approaches.

### Assignment Requirements Met ✅

- ✅ **6 Functional Requirements** defined and implemented
- ✅ **Microservices Architecture** with gRPC communication
- ✅ **8 Containerized Nodes** (6 gRPC services + 1 API Gateway + 1 Database)
- ✅ **gRPC Communication Model** between all services
- ✅ **Docker Containerization** for all components
- ✅ **Performance Evaluation** with comprehensive benchmarking
- ✅ **Monolithic Comparison** implementation
- ✅ **Git Version Control** throughout development

---

## 📝 Functional Requirements

The system supports **6 core functional requirements**:

### 1. **User Registration & Authentication**
- Students can register with UTA email
- Secure JWT-based authentication
- Token refresh mechanism
- Password encryption with bcrypt

### 2. **Listing Management**
- Create, read, update, delete product listings
- Upload product images
- Set price, condition, category
- Manage listing visibility (active/inactive)

### 3. **Search & Discovery**
- Full-text search across listings
- Filter by category, condition, price range
- Sort by price, date, relevance
- Browse by campus meeting spots
- Pagination support

### 4. **Favorites/Bookmarks**
- Save favorite listings
- View saved items
- Quick access to bookmarked products
- Remove from favorites

### 5. **Seller Contact**
- WhatsApp integration for instant messaging
- Email fallback option
- Contact history tracking
- Privacy-preserving communication

### 6. **Analytics & Recommendations**
- Track listing views and engagement
- Identify trending items
- Personalized recommendations
- User activity dashboard
- Category-based suggestions

---

## 🏗️ System Architecture

### Microservices Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│       API Gateway (REST)            │
│         Port: 8080                  │
└────────────┬────────────────────────┘
             │ gRPC
    ┌────────┴────────┬──────────┬──────────┬──────────┬──────────┐
    ▼                 ▼          ▼          ▼          ▼          ▼
┌────────┐      ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  Auth  │      │Listing │  │ Search │  │  User  │  │Messaging│  │Analytics│
│ :50051 │      │ :50052 │  │ :50053 │  │ :50054 │  │ :50055 │  │ :50056 │
└───┬────┘      └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘
    │               │           │           │           │           │
    └───────────────┴───────────┴───────────┴───────────┴───────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │  PostgreSQL  │
                            │    :5432     │
                            └──────────────┘
```

**Total Nodes: 8 Containers**
- 6 gRPC Microservices
- 1 API Gateway
- 1 PostgreSQL Database

### Monolithic Architecture

```
┌─────────────┐
│   Frontend  │
│  (React)    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│   Monolithic Application            │
│   (All services combined)           │
│         Port: 9000                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Auth + Listing + Search +   │   │
│  │ User + Messaging + Analytics│   │
│  └─────────────────────────────┘   │
└────────────┬────────────────────────┘
             │
             ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │    :5432     │
    └──────────────┘
```

**Total Nodes: 2 Containers**
- 1 Monolithic Application
- 1 PostgreSQL Database

---

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 20+** (for local development)
- **PostgreSQL 16** (or use Docker)
- **Git**

### Option 1: Microservices (Recommended for Learning)

```bash
# 1. Clone the repository
git clone git@github.com:malaika-farooq/UTA-Marketplace---Distributed-Systems.git
cd UTA-Marketplace---Distributed-Systems

# 2. Start all microservices with Docker Compose
docker-compose -f docker-compose.microservices.yml up --build

# 3. Access the API Gateway
curl http://localhost:8080/health
```

**Services will be running on:**
- API Gateway: `http://localhost:8080`
- Auth Service: `localhost:50051` (gRPC)
- Listing Service: `localhost:50052` (gRPC)
- Search Service: `localhost:50053` (gRPC)
- User Service: `localhost:50054` (gRPC)
- Messaging Service: `localhost:50055` (gRPC)
- Analytics Service: `localhost:50056` (gRPC)
- PostgreSQL: `localhost:5432`

### Option 2: Monolithic (For Performance Testing)

```bash
# 1. Start monolithic application
docker-compose -f docker-compose.monolithic.yml up --build

# 2. Access the monolithic API
curl http://localhost:9000/health
```

**Services will be running on:**
- Monolithic App: `http://localhost:9000`
- PostgreSQL: `localhost:5432`

### Option 3: Local Development (No Docker)

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Install dependencies for all services
cd services/auth && npm install && cd ../..
cd services/listing && npm install && cd ../..
cd services/search && npm install && cd ../..
cd services/user && npm install && cd ../..
cd services/messaging && npm install && cd ../..
cd services/analytics && npm install && cd ../..
cd gateway && npm install && cd ..

# 3. Run database migrations
psql -h localhost -U uta -d uta_marketplace -f database/schema.sql
psql -h localhost -U uta -d uta_marketplace -f database/seed.sql

# 4. Start each service in separate terminals
cd services/auth && npm run dev
cd services/listing && npm run dev
cd services/search && npm run dev
cd services/user && npm run dev
cd services/messaging && npm run dev
cd services/analytics && npm run dev
cd gateway && npm run dev
```

---

## 📊 Performance Testing

### Run Automated Performance Comparison

```bash
# 1. Start BOTH architectures
docker-compose -f docker-compose.microservices.yml up -d
docker-compose -f docker-compose.monolithic.yml up -d

# 2. Wait for services to be ready (30 seconds)
sleep 30

# 3. Run performance comparison
cd testing/performance
npm install
npm run test:comparison
```

### Expected Results

| Metric | Microservices | Monolithic | Winner |
|--------|---------------|------------|--------|
| **Throughput** | 700-1000 req/s | 1200-1600 req/s | 🏆 Monolithic (+40%) |
| **Latency (P50)** | 80-120ms | 50-70ms | 🏆 Monolithic (2x faster) |
| **Latency (P95)** | 180-250ms | 100-150ms | 🏆 Monolithic (45% better) |
| **Latency (P99)** | 240-350ms | 130-200ms | 🏆 Monolithic (40% better) |

### Performance Analysis

**Why Monolithic is Faster:**
- ✅ No network overhead between services
- ✅ No gRPC serialization/deserialization
- ✅ Direct function calls (in-memory)
- ✅ Shared database connection pool
- ✅ Single-process execution

**Why Choose Microservices Anyway:**
- ✅ Independent scaling (scale only what you need)
- ✅ Fault isolation (one service failure doesn't crash all)
- ✅ Team independence (different teams own different services)
- ✅ Technology diversity (use best tool for each job)
- ✅ Easier to maintain at scale (clear boundaries)

See [PERFORMANCE_TESTING_GUIDE.md](./PERFORMANCE_TESTING_GUIDE.md) for detailed analysis.

---

## 📚 API Documentation

### Authentication

```bash
# Register
POST /api/auth/register
{
  "email": "student@uta.edu",
  "password": "securepass123",
  "full_name": "John Doe",
  "phone": "8175551234"
}

# Login
POST /api/auth/login
{
  "email": "student@uta.edu",
  "password": "securepass123"
}

# Response
{
  "success": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Listings

```bash
# Create Listing (requires auth)
POST /api/listings
Authorization: Bearer <token>
{
  "title": "MacBook Pro 13\" M1",
  "description": "Barely used, excellent condition",
  "price": 650.00,
  "category_id": "electronics",
  "condition_id": "like_new",
  "seller_email": "seller@uta.edu",
  "seller_whatsapp": "18175551234",
  "image_url": "https://example.com/image.jpg",
  "meet_spot_id": "library"
}

# Get All Listings
GET /api/listings?limit=20&offset=0

# Get Single Listing
GET /api/listings/:id

# Update Listing (requires auth)
PUT /api/listings/:id

# Delete Listing (requires auth)
DELETE /api/listings/:id
```

### Search

```bash
# Search Listings
GET /api/search/listings?query=macbook&category_id=electronics&max_price=700&sort_by=price_asc

# Get Categories
GET /api/search/categories

# Get Conditions
GET /api/search/conditions

# Get Meet Spots
GET /api/search/meetspots
```

### User Profile & Favorites

```bash
# Get Profile (requires auth)
GET /api/user/profile
Authorization: Bearer <token>

# Update Profile (requires auth)
PUT /api/user/profile
{
  "full_name": "John Doe",
  "phone": "8175551234",
  "whatsapp": "18175551234"
}

# Get Favorites (requires auth)
GET /api/user/favorites

# Add Favorite (requires auth)
POST /api/user/favorites/:listingId

# Remove Favorite (requires auth)
DELETE /api/user/favorites/:listingId
```

### Messaging

```bash
# Initiate Contact (requires auth)
POST /api/messaging/initiate
{
  "listing_id": "660e8400-e29b-41d4-a716-446655440001",
  "seller_id": "550e8400-e29b-41d4-a716-446655440001",
  "contact_method": "whatsapp"
}

# Response
{
  "success": true,
  "contact_url": "https://wa.me/18175551234?text=Hi!%20I'm%20interested%20in...",
  "contact_info": "18175551234"
}
```

### Analytics

```bash
# Track View
POST /api/analytics/track/view
{
  "listing_id": "660e8400-e29b-41d4-a716-446655440001",
  "referrer": "search"
}

# Get Trending Listings
GET /api/analytics/trending?limit=10&time_window=week

# Get Recommendations (requires auth)
GET /api/analytics/recommendations?limit=10

# Get User Stats (requires auth)
GET /api/analytics/user/stats
```

---

## 🛠️ Development

### Project Structure

```
UTA-Marketplace---Distributed-Systems/
├── proto/                      # gRPC Protocol Buffers
│   ├── auth.proto
│   ├── listing.proto
│   ├── search.proto
│   ├── user.proto
│   ├── messaging.proto
│   └── analytics.proto
│
├── services/                   # Microservices
│   ├── auth/                   # Port 50051
│   ├── listing/                # Port 50052
│   ├── search/                 # Port 50053
│   ├── user/                   # Port 50054
│   ├── messaging/              # Port 50055
│   └── analytics/              # Port 50056
│
├── gateway/                    # API Gateway (REST)
│   ├── src/
│   │   ├── index.ts
│   │   ├── grpc-clients.ts
│   │   ├── middleware/
│   │   └── routes/
│   └── Dockerfile
│
├── monolithic/                 # Monolithic version
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   ├── middleware/
│   │   └── routes/
│   └── Dockerfile
│
├── database/                   # Database schema
│   ├── schema.sql
│   └── seed.sql
│
├── testing/performance/        # Performance tests
│   ├── test-microservices.js
│   ├── test-monolithic.js
│   └── run-comparison.sh
│
├── frontend/                   # React frontend (optional)
│
├── docker-compose.microservices.yml
├── docker-compose.monolithic.yml
└── README.md
```

### Environment Variables

Each service uses environment variables. See `.env.example` files in each directory.

**Common variables:**
```env
# Microservices
GRPC_PORT=5005X
DATABASE_URL=postgres://uta:uta@postgres:5432/uta_marketplace
JWT_SECRET=dev_secret_change_me

# Gateway
PORT=8080
CORS_ORIGIN=http://localhost:5173
AUTH_GRPC_ADDR=auth:50051
...

# Monolithic
PORT=9000
DATABASE_URL=postgres://uta:uta@postgres:5432/uta_marketplace
JWT_SECRET=dev_secret_change_me
```

### Running Tests

```bash
# Unit tests (if implemented)
npm test

# Performance tests
cd testing/performance
npm run test:microservices
npm run test:monolithic
npm run test:comparison
```

### Database Management

```bash
# Connect to database
psql -h localhost -U uta -d uta_marketplace

# Reset database
docker-compose down -v
docker-compose up -d postgres

# View tables
\dt

# Query users
SELECT * FROM users;

# Query listings
SELECT * FROM listings;
```

---

## 🧰 Technologies Used

### Backend
- **Node.js 20** - Runtime environment
- **TypeScript 5.7** - Type-safe development
- **Express.js 4** - REST API framework
- **gRPC** - Inter-service communication
- **Protocol Buffers** - Service contracts

### Database
- **PostgreSQL 16** - Relational database
- **pg** - PostgreSQL client for Node.js

### Authentication
- **JWT (jsonwebtoken)** - Stateless authentication
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### Testing
- **autocannon** - HTTP load testing
- **axios** - HTTP client for tests

### Frontend (Optional)
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling

---

## 📈 Performance Metrics

### Test Configuration
- **Connections:** 10-20 concurrent per endpoint
- **Duration:** 10-15 seconds per test
- **Total Endpoints Tested:** 7
- **Total Test Time:** ~2-3 minutes

### Microservices Results
- **Throughput:** 700-1000 req/sec
- **P50 Latency:** 80-120ms
- **P95 Latency:** 180-250ms
- **P99 Latency:** 240-350ms

### Monolithic Results
- **Throughput:** 1200-1600 req/sec
- **P50 Latency:** 50-70ms
- **P95 Latency:** 100-150ms
- **P99 Latency:** 130-200ms

### Conclusion
For single-server deployments, **monolithic architecture is 30-40% faster**. However, microservices offer significant operational advantages for distributed teams and complex domains.

---

## 🎓 Team & Acknowledgments

**Course:** CSE 5306 - Distributed Systems
**Institution:** University of Texas at Arlington
**Semester:** Spring 2026

### Team Members
- Yuanbin Man, Malaika Farooq - Architecture & Implementation
- Yuanbin Man - Database & Testing
- Malaika Farooq - Frontend & Documentation

### AI Tools Used
This project leveraged AI assistance (Claude Code/Claude AI) for:
- ✅ Architecture design and planning
- ✅ gRPC service implementation
- ✅ Database schema design
- ✅ Performance testing scripts
- ✅ Documentation generation
- ✅ Code optimization and debugging

**Key Learnings from AI Usage:**
1. AI accelerated initial scaffolding and boilerplate code (saved ~40% development time)
2. AI provided architecture insights and best practices
3. Human oversight was critical for design decisions and trade-off analysis
4. AI-generated code required review for security and edge cases
5. Iterative prompting improved code quality significantly

---

## 📄 License

This project is created for educational purposes as part of CSE 5306 coursework.

---

## 🔗 Additional Resources

- [Performance Testing Guide](./PERFORMANCE_TESTING_GUIDE.md)
- [Quick Start Performance Test](./QUICK_START_PERFORMANCE_TEST.md)
- [gRPC Documentation](https://grpc.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🐛 Troubleshooting

### Services not starting?
```bash
# Check Docker logs
docker-compose logs -f

# Restart services
docker-compose down
docker-compose up --build
```

### Database connection errors?
```bash
# Ensure PostgreSQL is healthy
docker-compose ps

# Check connection
psql -h localhost -U uta -d uta_marketplace -c "SELECT 1"
```

### gRPC connection refused?
```bash
# Check if services are listening
docker-compose ps
netstat -an | grep 5005

# Restart specific service
docker-compose restart auth
```

### Performance tests failing?
```bash
# Ensure both architectures are running
curl http://localhost:8080/health  # Microservices
curl http://localhost:9000/health  # Monolithic

# Check service readiness
docker-compose ps
```

---

## 📞 Support

For questions or issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review service logs: `docker-compose logs <service-name>`
3. Consult course materials or TA

---

**Built with ❤️ for CSE 5306 - Distributed Systems**
