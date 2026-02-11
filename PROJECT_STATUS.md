# UTA Marketplace - Project Status

## ✅ Implementation Complete

All components of the distributed systems project have been implemented and tested.

---

## 📋 Assignment Requirements

### ✅ 1. Six Functional Requirements (Application Features)

The system implements 6 core functional requirements as application features:

1. **User Authentication & Authorization**
   - User registration with UTA email validation
   - Secure login with JWT tokens
   - Password hashing with bcrypt
   - Token validation and refresh

2. **Listing Management**
   - Create, read, update, delete listings
   - Category-based organization
   - Condition tracking (New, Like New, Good, Fair, Poor)
   - Price management
   - Seller information tracking

3. **Search & Discovery**
   - Full-text search across listings
   - Category filtering
   - Price range filtering
   - Condition filtering
   - Pagination support
   - Master data retrieval (categories, conditions, meet spots)

4. **User Profiles & Favorites**
   - User profile management
   - Favorite listings tracking
   - View user's own listings
   - Profile updates

5. **Messaging & Contact Coordination**
   - Contact attempt tracking
   - Message history between users
   - Meet-up spot coordination
   - Contact preferences

6. **Analytics & Recommendations**
   - View count tracking
   - Trending items identification
   - Personalized recommendations
   - Popular category tracking
   - User activity analytics

### ✅ 2. Microservices Architecture with gRPC

**8 Total Nodes:**
1. PostgreSQL Database (Shared data store)
2. Auth Service (gRPC, port 50051)
3. Listing Service (gRPC, port 50052)
4. Search Service (gRPC, port 50053)
5. User Service (gRPC, port 50054)
6. Messaging Service (gRPC, port 50055)
7. Analytics Service (gRPC, port 50056)
8. API Gateway (REST to gRPC translation, port 8080)

**Communication:**
- Inter-service: gRPC Protocol Buffers
- Client-facing: REST API via Gateway
- Database: PostgreSQL with connection pooling

### ✅ 3. Minimum 6 Containerized Nodes

**Microservices: 8 Docker Containers**
- ✅ postgres (Database)
- ✅ auth (gRPC Service)
- ✅ listing (gRPC Service)
- ✅ search (gRPC Service)
- ✅ user (gRPC Service)
- ✅ messaging (gRPC Service)
- ✅ analytics (gRPC Service)
- ✅ gateway (API Gateway)

**Monolithic: 2 Docker Containers** (for comparison)
- ✅ postgres (Database)
- ✅ monolithic (All-in-one REST API)

### ✅ 4. Docker Deployment

**Docker Compose Files:**
- `docker-compose.microservices.yml` - Microservices architecture
- `docker-compose.monolithic.yml` - Monolithic architecture

**Automated Startup Scripts:**
- `start-microservices.sh` - Launch microservices with health checks
- `start-monolithic.sh` - Launch monolithic with health checks

**Dockerfiles:**
- All 6 gRPC services have individual Dockerfiles
- API Gateway has dedicated Dockerfile
- Monolithic app has dedicated Dockerfile
- All use Node.js 20 Alpine Linux base image

### ✅ 5. Performance Evaluation

**Performance Testing Suite:**
- Location: `testing/performance/`
- Tool: Autocannon (HTTP load testing)
- Metrics: Requests/sec, Latency, Throughput, Error Rate

**Test Scenarios:**
- Health check endpoints
- Login operations
- Listing searches
- Data creation
- Concurrent user simulation

**Comparison Script:**
- `npm run test:comparison` - Runs identical tests against both architectures
- Generates comparison report with metrics
- Saves results to JSON for analysis

### ✅ 6. Monolithic Architecture for Comparison

**Monolithic Implementation:**
- Single Node.js/Express application
- All functionality in one codebase
- Direct database access (no gRPC overhead)
- Runs on port 9000
- Identical REST API endpoints as microservices
- Same database schema

**Can Run Simultaneously:**
- Microservices on port 8080
- Monolithic on port 9000
- Different database volumes (no conflicts)

---

## 🗂️ Project Structure

```
UTA-Marketplace---Distributed-Systems/
├── proto/                          # gRPC Protocol Buffer definitions
│   ├── auth.proto                  # Authentication service
│   ├── listing.proto               # Listing management
│   ├── search.proto                # Search & filtering
│   ├── user.proto                  # User profiles & favorites
│   ├── messaging.proto             # Contact coordination
│   └── analytics.proto             # View tracking & recommendations
│
├── services/                       # Microservices
│   ├── auth/                       # Port 50051
│   │   ├── src/service.ts          # gRPC service implementation
│   │   ├── src/server.ts           # Server startup
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── listing/                    # Port 50052
│   ├── search/                     # Port 50053
│   ├── user/                       # Port 50054
│   ├── messaging/                  # Port 50055
│   └── analytics/                  # Port 50056
│
├── gateway/                        # API Gateway (Port 8080)
│   ├── src/
│   │   ├── grpc-clients.ts         # gRPC client connections
│   │   ├── routes/                 # REST API routes
│   │   ├── middleware/auth.ts      # JWT validation
│   │   └── server.ts               # Express server
│   ├── package.json
│   └── Dockerfile
│
├── monolithic/                     # Monolithic Version (Port 9000)
│   ├── src/
│   │   ├── routes/                 # All REST routes
│   │   ├── middleware/             # Auth middleware
│   │   └── server.ts               # Express server
│   ├── package.json
│   └── Dockerfile
│
├── database/                       # Database Configuration
│   ├── schema.sql                  # Table definitions, indexes, triggers
│   └── seed.sql                    # Sample data
│
├── testing/                        # Performance Testing
│   └── performance/
│       ├── test-comparison.js      # Comparison script
│       ├── package.json
│       └── results/                # Test results output
│
├── docker-compose.microservices.yml # Microservices orchestration
├── docker-compose.monolithic.yml   # Monolithic orchestration
├── start-microservices.sh          # Automated startup
├── start-monolithic.sh             # Automated startup
│
└── Documentation/
    ├── README.md                   # Main documentation (600+ lines)
    ├── ARCHITECTURE.md             # System architecture details
    ├── PROJECT_SUMMARY.md          # Implementation overview
    ├── TROUBLESHOOTING.md          # Common issues & solutions
    ├── DOCKER_FIX_SUMMARY.md       # Docker configuration fixes
    ├── QUICKSTART.md               # Quick start guide
    └── PROJECT_STATUS.md           # This file
```

---

## 🛠️ Technology Stack

### Backend Services
- **Runtime:** Node.js 20
- **Language:** TypeScript 5.7
- **Module System:** ES Modules
- **gRPC Framework:** @grpc/grpc-js, @grpc/proto-loader
- **REST Framework:** Express.js
- **Authentication:** JSON Web Tokens (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Database Driver:** pg (PostgreSQL)

### Database
- **Database:** PostgreSQL 16
- **Schema:** 8 tables with relationships
- **Features:** Indexes, triggers, constraints
- **Initialization:** Automatic via docker-entrypoint-initdb.d

### DevOps
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Base Image:** node:20-alpine
- **Networking:** Bridge network
- **Health Checks:** PostgreSQL pg_isready

### Testing
- **Load Testing:** Autocannon
- **Metrics:** Throughput, latency, error rates
- **Reporting:** JSON results with analysis

---

## 📊 Database Schema

### Tables (8)
1. **users** - User accounts and authentication
2. **listings** - Marketplace items
3. **categories** - Item categories
4. **conditions** - Item conditions
5. **meet_spots** - Campus meet-up locations
6. **favorites** - User favorite listings
7. **contact_attempts** - Contact coordination
8. **listing_views** - Analytics tracking

### Key Features
- Foreign key constraints
- Indexes on frequently queried fields
- Triggers for timestamp updates
- Sample data for testing

---

## 🔧 Recent Fixes Applied

### 1. Docker Build Context Fix
**Issue:** Proto files not accessible during Docker build
**Solution:** Changed build context to project root, updated all COPY paths

### 2. Database Health Check
**Issue:** Wrong database name in health check
**Solution:** Updated to use `uta_marketplace` database name

### 3. TypeScript Compilation
**Issue:** Type errors in analytics and user services
**Solution:** Added type annotations and null checks

### 4. Dockerfile Optimization
**Issue:** Services copying entire project root
**Solution:** Updated to copy only service-specific files

---

## 🚀 How to Run

### Quick Start
```bash
# Microservices
./start-microservices.sh

# Monolithic
./start-monolithic.sh
```

### Manual Start
```bash
# Microservices
docker compose -f docker-compose.microservices.yml up --build

# Monolithic
docker compose -f docker-compose.monolithic.yml up --build
```

### Verify Running
```bash
# Test microservices
curl http://localhost:8080/health

# Test monolithic
curl http://localhost:9000/health
```

### Run Performance Tests
```bash
cd testing/performance
npm install
npm run test:comparison
```

---

## 📈 Expected Performance Characteristics

### Microservices Architecture
**Advantages:**
- Independent scaling of services
- Fault isolation (one service failure doesn't crash everything)
- Technology flexibility per service
- Easier to maintain and update individual services

**Trade-offs:**
- Network overhead (gRPC calls between services)
- Slightly higher latency due to gateway translation
- More complex deployment and monitoring

### Monolithic Architecture
**Advantages:**
- Lower latency (direct function calls)
- Simpler deployment (single container)
- No network overhead for internal operations
- Easier to debug and trace requests

**Trade-offs:**
- All features scale together (can't scale just one)
- Single point of failure (if it crashes, everything is down)
- Harder to make changes without affecting other features
- Can become large and unwieldy

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/validate` - Validate token

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required)
- `DELETE /api/listings/:id` - Delete listing (auth required)

### Search
- `GET /api/search/listings` - Search with filters
- `GET /api/search/categories` - Get categories
- `GET /api/search/conditions` - Get conditions
- `GET /api/search/meet-spots` - Get meet-up spots

### User
- `GET /api/users/profile` - Get own profile (auth required)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)
- `POST /api/users/favorites/:id` - Add favorite (auth required)
- `DELETE /api/users/favorites/:id` - Remove favorite (auth required)

### Messaging
- `POST /api/messaging/contact` - Record contact attempt
- `GET /api/messaging/history` - Get message history (auth required)

### Analytics
- `POST /api/analytics/view/:id` - Record listing view
- `GET /api/analytics/trending` - Get trending items
- `GET /api/analytics/recommendations` - Get recommendations (auth required)

---

## ✅ Testing Checklist

- [x] All 6 gRPC services start successfully
- [x] API Gateway connects to all services
- [x] Database initializes with schema and seed data
- [x] User registration works
- [x] User login returns valid JWT
- [x] Authenticated requests work with JWT
- [x] Search and filtering works
- [x] Listing CRUD operations work
- [x] User favorites work
- [x] Contact attempts recorded
- [x] Analytics tracking works
- [x] Health checks pass
- [x] Monolithic version works identically
- [x] Performance tests run successfully
- [x] Both architectures can run simultaneously

---

## 📚 Documentation

1. **README.md** - Comprehensive project documentation (600+ lines)
2. **ARCHITECTURE.md** - Architecture details and design decisions
3. **QUICKSTART.md** - Quick start guide for running the system
4. **TROUBLESHOOTING.md** - Common issues and solutions
5. **DOCKER_FIX_SUMMARY.md** - Docker configuration fixes applied
6. **PROJECT_SUMMARY.md** - High-level implementation summary
7. **PROJECT_STATUS.md** - This file - current status and checklist

---

## 🎯 Ready for Submission

The project is **COMPLETE** and ready for:
- ✅ Deployment and testing
- ✅ Performance evaluation
- ✅ Architecture comparison
- ✅ Assignment submission

All assignment requirements have been met and documented.

---

## 📞 Support Resources

- **Quick Start:** See [QUICKSTART.md](QUICKSTART.md)
- **Issues:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Docker Fixes:** See [DOCKER_FIX_SUMMARY.md](DOCKER_FIX_SUMMARY.md)

---

**Status:** ✅ **READY TO RUN**

**Last Updated:** February 10, 2026
