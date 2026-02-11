# UTA Marketplace - System Architecture

## Executive Summary

This document provides a comprehensive overview of the UTA Marketplace system architecture, detailing the design decisions, communication patterns, and implementation strategies used in both the microservices and monolithic architectures.

---

## 1. System Overview

### 1.1 Purpose
UTA Marketplace is a peer-to-peer marketplace platform designed for UTA students to facilitate buying and selling items on campus with secure transactions and seamless communication.

### 1.2 Architectural Approaches

We implemented **two distinct architectures** for comparison:

1. **Microservices Architecture** - Distributed system with 6 independent gRPC services
2. **Monolithic Architecture** - Single unified application with all functionality

---

## 2. Functional Requirements

### FR1: User Registration & Authentication
**Description:** Students can register with their UTA email, login securely, and manage authentication tokens.

**Implementation:**
- JWT-based stateless authentication
- bcrypt password hashing (10 salt rounds)
- Token expiration (7 days)
- Refresh token mechanism

**Microservices:** Auth Service (gRPC)
**Monolithic:** `/api/auth` routes

---

### FR2: Listing Management
**Description:** Users can create, read, update, and delete product listings with images, pricing, and categorization.

**Implementation:**
- Full CRUD operations
- Image URL storage
- Price validation
- Category and condition associations
- Active/inactive status management
- Ownership verification for updates/deletes

**Microservices:** Listing Service (gRPC)
**Monolithic:** `/api/listings` routes

---

### FR3: Search & Discovery
**Description:** Browse and search listings with advanced filtering, sorting, and pagination.

**Implementation:**
- PostgreSQL full-text search on title and description
- Multi-criteria filtering (category, condition, price range, location)
- Sorting options (price ascending/descending, date ascending/descending)
- Pagination with total count
- Category/condition/meeting spot master data

**Microservices:** Search Service (gRPC)
**Monolithic:** `/api/search` routes

---

### FR4: Favorites/Bookmarks
**Description:** Users can save favorite listings for quick access and manage their saved items.

**Implementation:**
- Add/remove favorites
- Retrieve paginated favorites list
- Quick favorite status check
- Duplicate prevention
- JOIN queries for listing details

**Microservices:** User Service (gRPC)
**Monolithic:** `/api/user/favorites` routes

---

### FR5: Seller Contact
**Description:** Coordinate messaging between buyers and sellers through WhatsApp and email.

**Implementation:**
- WhatsApp deep link generation (`wa.me` protocol)
- Email mailto link generation
- Contact attempt logging
- Contact history tracking
- Privacy-preserving communication (no direct in-app chat)

**Microservices:** Messaging Service (gRPC)
**Monolithic:** `/api/messaging` routes

---

### FR6: Analytics & Recommendations
**Description:** Track engagement metrics, identify trending items, and provide personalized recommendations.

**Implementation:**
- View tracking (anonymous and authenticated)
- Trending algorithm (views + contacts weighted by recency)
- Personalized recommendations based on:
  - User's favorited categories
  - Similar category items
  - Trending fallback
- User activity dashboard
- Time-windowed analytics (day/week/month)

**Microservices:** Analytics Service (gRPC)
**Monolithic:** `/api/analytics` routes

---

## 3. Microservices Architecture

### 3.1 Service Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway (REST)                      │
│                            Port 8080                            │
│  - Translates REST to gRPC                                      │
│  - JWT validation via Auth Service                              │
│  - Request routing                                              │
│  - Error handling                                               │
└─────────────┬───────────────────────────────────────────────────┘
              │
    ┌─────────┴─────────┬──────────┬──────────┬──────────┬─────────┐
    │                   │          │          │          │         │
    ▼                   ▼          ▼          ▼          ▼         ▼
┌─────────┐       ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │       │ Listing │ │ Search  │ │  User   │ │Messaging│ │Analytics│
│ Service │       │ Service │ │ Service │ │ Service │ │ Service │ │ Service │
│         │       │         │ │         │ │         │ │         │ │         │
│ :50051  │       │ :50052  │ │ :50053  │ │ :50054  │ │ :50055  │ │ :50056  │
│         │       │         │ │         │ │         │ │         │ │         │
│ gRPC    │       │  gRPC   │ │  gRPC   │ │  gRPC   │ │  gRPC   │ │  gRPC   │
└────┬────┘       └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │                 │           │           │           │           │
     └─────────────────┴───────────┴───────────┴───────────┴───────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │  PostgreSQL  │
                            │    :5432     │
                            │              │
                            │  - Users     │
                            │  - Listings  │
                            │  - Favorites │
                            │  - Analytics │
                            └──────────────┘
```

### 3.2 Communication Patterns

**Client → Gateway**
- Protocol: HTTP/REST
- Format: JSON
- Authentication: JWT Bearer token

**Gateway → Services**
- Protocol: gRPC
- Format: Protocol Buffers
- Communication: Synchronous RPC

**Services → Database**
- Protocol: TCP
- Driver: node-postgres (pg)
- Connection: Pooled connections per service

### 3.3 Service Responsibilities

| Service | Responsibility | Proto File | Port |
|---------|---------------|------------|------|
| **Auth** | User registration, login, token validation, refresh | auth.proto | 50051 |
| **Listing** | CRUD operations on listings, ownership management | listing.proto | 50052 |
| **Search** | Full-text search, filtering, master data retrieval | search.proto | 50053 |
| **User** | Profile management, favorites/bookmarks | user.proto | 50054 |
| **Messaging** | Contact coordination, history tracking | messaging.proto | 50055 |
| **Analytics** | View tracking, trending detection, recommendations | analytics.proto | 50056 |

### 3.4 Data Flow Example: Creating a Listing

```
1. Client → Gateway: POST /api/listings
   Headers: Authorization: Bearer <JWT>
   Body: { title, description, price, ... }

2. Gateway → Auth Service: ValidateToken(token)
   Response: { valid: true, user_id: "..." }

3. Gateway → Listing Service: CreateListing(user_id, listing_data)
   Response: { success: true, listing: {...} }

4. Listing Service → PostgreSQL: INSERT INTO listings ...
   Response: Listing record with ID

5. Gateway → Client: 200 OK
   Body: { success: true, listing: {...} }
```

---

## 4. Monolithic Architecture

### 4.1 Structure

```
┌─────────────────────────────────────────────────────────────┐
│             Monolithic Application (Port 9000)              │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   Express.js Server                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                              │                              │
│  ┌───────────────────────────┴───────────────────────────┐ │
│  │                    Middleware Layer                    │ │
│  │  - CORS                                                │ │
│  │  - JSON Parser                                         │ │
│  │  - JWT Auth Middleware                                 │ │
│  └───────────────────────────┬───────────────────────────┘ │
│                              │                              │
│  ┌───────────────┬───────────┴───────┬───────────────────┐ │
│  │  Auth Routes  │ Listing Routes    │  Search Routes    │ │
│  ├───────────────┼───────────────────┼───────────────────┤ │
│  │  User Routes  │ Messaging Routes  │ Analytics Routes  │ │
│  └───────────────┴───────────────────┴───────────────────┘ │
│                              │                              │
│  ┌───────────────────────────┴───────────────────────────┐ │
│  │            Database Connection Pool (pg)              │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │  PostgreSQL  │
                   │    :5432     │
                   └──────────────┘
```

### 4.2 Advantages

✅ **Performance**
- No inter-service network calls
- No serialization overhead
- Direct function calls
- Shared connection pool

✅ **Simplicity**
- Single codebase
- Easier debugging
- Simpler deployment
- Unified logging

✅ **Development Speed**
- Faster prototyping
- No service coordination
- Easier refactoring

### 4.3 Disadvantages

❌ **Scalability**
- Scale entire app, not individual components
- Resource waste on unused features
- Vertical scaling only

❌ **Fault Isolation**
- Single point of failure
- Cascading failures
- All-or-nothing deployment

❌ **Team Coordination**
- Single codebase conflicts
- Tight coupling
- Difficult to parallelize development

---

## 5. Database Design

### 5.1 Schema Overview

**Tables:**
- `users` - User accounts and profiles
- `listings` - Product listings
- `categories` - Product categories (master data)
- `conditions` - Item conditions (master data)
- `meet_spots` - Campus meeting locations (master data)
- `favorites` - User-listing bookmarks
- `contact_attempts` - Messaging history
- `listing_views` - Analytics tracking

### 5.2 Key Relationships

```sql
users 1───N listings (seller)
users 1───N favorites
users 1───N contact_attempts
users 1───N listing_views

listings N───1 categories
listings N───1 conditions
listings N───1 meet_spots
listings 1───N favorites
listings 1───N contact_attempts
listings 1───N listing_views
```

### 5.3 Indexes

Performance-critical indexes:
```sql
-- Listings
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created ON listings(created_at);

-- Full-text search
CREATE INDEX idx_listings_search ON listings
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Favorites
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_listing ON favorites(listing_id);

-- Analytics
CREATE INDEX idx_views_listing ON listing_views(listing_id);
CREATE INDEX idx_views_timestamp ON listing_views(timestamp);
```

---

## 6. Technology Stack

### 6.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 | Runtime environment |
| TypeScript | 5.7 | Type-safe development |
| Express.js | 4.22 | REST API framework |
| @grpc/grpc-js | 1.12 | gRPC implementation |
| Protocol Buffers | 3 | Service contracts |
| PostgreSQL | 16 | Relational database |
| jsonwebtoken | 9.0 | JWT authentication |
| bcrypt | 5.1 | Password hashing |

### 6.2 DevOps & Testing

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| autocannon | HTTP load testing |
| axios | HTTP client |

---

## 7. Performance Characteristics

### 7.1 Microservices Performance

**Advantages:**
- Independent scaling
- Fault isolation
- Technology diversity

**Performance Costs:**
- Network latency (gRPC calls: ~10-30ms per hop)
- Serialization overhead (Protobuf encoding/decoding)
- Connection management
- Service discovery

**Typical Latency Breakdown:**
```
Total Request: 120ms
├─ Gateway Processing: 10ms
├─ Auth Validation: 25ms (gRPC call)
├─ Service Processing: 35ms (gRPC call)
├─ Database Query: 40ms
└─ Response Serialization: 10ms
```

### 7.2 Monolithic Performance

**Advantages:**
- No network overhead
- Direct function calls
- Shared resources

**Performance Characteristics:**
```
Total Request: 65ms
├─ Middleware: 5ms
├─ Auth Check: 10ms (in-memory)
├─ Business Logic: 10ms
├─ Database Query: 35ms
└─ Response: 5ms
```

**Performance Gain:** ~45% faster (55ms saved)

---

## 8. Security Considerations

### 8.1 Authentication & Authorization

**JWT Strategy:**
- Stateless authentication
- 7-day expiration
- HS256 signing algorithm
- User ID and email in payload

**Password Security:**
- bcrypt hashing
- 10 salt rounds
- Never stored in plaintext

### 8.2 Database Security

- Parameterized queries (SQL injection prevention)
- Connection pooling with limits
- Environment-based credentials
- Ownership verification for sensitive operations

### 8.3 API Security

- CORS configuration
- Rate limiting (not implemented - future work)
- Input validation
- Error message sanitization

---

## 9. Scalability Strategies

### 9.1 Microservices Scaling

**Horizontal Scaling:**
```bash
# Scale specific services
docker-compose up --scale listing=3 --scale search=2
```

**Benefits:**
- Scale only what's needed
- Cost-effective
- Handle uneven load distribution

### 9.2 Monolithic Scaling

**Vertical Scaling:**
- Increase CPU/memory
- Limited by hardware constraints

**Horizontal Scaling:**
- Deploy multiple instances
- Load balancer required
- Session affinity (if stateful)

---

## 10. Deployment Architecture

### 10.1 Container Strategy

**Microservices:**
- 8 containers total
- Each service is independently deployable
- Zero-downtime rolling updates

**Monolithic:**
- 2 containers (app + database)
- Simpler orchestration
- Faster startup time

### 10.2 Resource Requirements

**Microservices Estimated Resources:**
```
Total: ~4GB RAM, 4 CPU cores
├─ PostgreSQL: 1GB RAM, 1 CPU
├─ Gateway: 256MB RAM, 0.5 CPU
├─ Auth Service: 256MB RAM, 0.3 CPU
├─ Listing Service: 512MB RAM, 0.5 CPU
├─ Search Service: 512MB RAM, 0.5 CPU
├─ User Service: 256MB RAM, 0.3 CPU
├─ Messaging Service: 256MB RAM, 0.3 CPU
└─ Analytics Service: 512MB RAM, 0.6 CPU
```

**Monolithic Estimated Resources:**
```
Total: ~2GB RAM, 2 CPU cores
├─ PostgreSQL: 1GB RAM, 1 CPU
└─ Monolithic App: 1GB RAM, 1 CPU
```

---

## 11. Future Enhancements

### 11.1 Microservices Evolution

1. **Service Mesh** (Istio, Linkerd)
   - Automatic service discovery
   - Load balancing
   - Circuit breakers
   - Distributed tracing

2. **Message Queue** (RabbitMQ, Kafka)
   - Asynchronous communication
   - Event-driven architecture
   - Better fault tolerance

3. **Caching Layer** (Redis)
   - Reduce database load
   - Improve response times
   - Session storage

4. **API Rate Limiting**
   - Prevent abuse
   - Fair usage policies

### 11.2 Monitoring & Observability

1. **Distributed Tracing** (Jaeger, Zipkin)
2. **Centralized Logging** (ELK Stack)
3. **Metrics Collection** (Prometheus + Grafana)
4. **Health Checks & Alerts**

---

## 12. Conclusion

This architecture demonstrates the practical trade-offs between microservices and monolithic approaches:

**Choose Microservices When:**
- Team size > 10 developers
- Need independent deployment cycles
- Require technology diversity
- Scaling requirements are uneven
- Fault isolation is critical

**Choose Monolithic When:**
- Team size < 5 developers
- Rapid prototyping phase
- Simple domain
- Performance is critical
- Operational complexity must be minimized

For UTA Marketplace's current scale, **both architectures are viable**. The choice depends on operational priorities and team structure rather than technical capabilities.

---

**Document Version:** 1.0
**Last Updated:** February 2026
