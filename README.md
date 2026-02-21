# UTA Marketplace - Distributed Systems

A full-stack marketplace application for UTA students to buy and sell items, demonstrating **microservices vs monolithic** architecture patterns using gRPC, Docker, and PostgreSQL.

## Architecture

### Microservices (10 containers)

```
                        +-------------------+
                        |    Frontend :3000  |
                        +--------+----------+
                                 |
                        +--------v----------+
                        |  API Gateway :8080 |  (REST)
                        +--------+----------+
                                 |  gRPC
        +----------+-------------+-------------+----------+
        |          |             |             |          |
   +----v---+ +---v----+ +-----v-----+ +----v---+ +----v------+
   |  Auth  | |Listing | |  Search   | |  User  | | Messaging |
   | :50051 | | :50052 | |  :50053   | | :50054 | |  :50055   |
   +--------+ +--------+ +-----------+ +--------+ +-----------+
        |          |             |             |          |
        +----------+-------------+-------------+----------+
                                 |
                        +--------v----------+     +------------+  +-----------+
                        |  PostgreSQL :5432  |     | Analytics  |  | Favorites |
                        +-------------------+     |   :50056   |  |  :50057   |
                                                  +------------+  +-----------+
```

| Container | Technology | Port | Role |
|-----------|-----------|------|------|
| Frontend | Node.js (static server) | 3000 | Web UI |
| API Gateway | Express.js | 8080 | REST to gRPC translation |
| Auth Service | Node.js + gRPC | 50051 | JWT authentication, login/register |
| Listing Service | Node.js + gRPC | 50052 | CRUD operations for listings |
| Search Service | Node.js + gRPC | 50053 | Full-text search, categories, filters |
| User Service | Node.js + gRPC | 50054 | Profile management |
| Messaging Service | Node.js + gRPC | 50055 | Seller contact info, contact history |
| Analytics Service | Node.js + gRPC | 50056 | View tracking, trending, recommendations |
| Favorites Service | Node.js + gRPC | 50057 | Favorites/bookmarks management |
| PostgreSQL | PostgreSQL 16 | 5432 | Shared database with GIN indexes |

### Monolithic (3 containers)

| Container | Port | Role |
|-----------|------|------|
| Frontend | 3001 | Web UI |
| Monolithic App | 9000 | All services in one Express.js app |
| PostgreSQL | 5433 | Database |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Ports available: 3000, 5432, 8080, 9000, 50051-50057

### Start Everything

```bash
bash ./start-all.sh
```

Then open: **http://localhost:3000**

### Start Individual Architectures

```bash
# Microservices only
docker compose -f docker-compose.microservices.yml up -d

# Monolithic only
docker compose -f docker-compose.monolithic.yml up -d
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Web UI (Microservices) |
| Frontend Mono | http://localhost:3001 | Web UI (Monolithic) |
| API Gateway | http://localhost:8080 | Microservices REST API |
| Monolithic | http://localhost:9000 | Monolithic REST API |
| PostgreSQL | localhost:5432 | Microservices DB |
| PostgreSQL Mono | localhost:5433 | Monolithic DB |

## Default Users

| Email | Password | Name |
|-------|----------|------|
| yuanbin.man@uta.edu | password123 | Yuanbin Man |
| alice@uta.edu | password123 | Alice Johnson |
| bob@uta.edu | password123 | Bob Smith |
| carol@uta.edu | password123 | Carol Williams |

## Features

### Search & Browse
- Full-text search with PostgreSQL GIN indexes
- Filter by category (Electronics, Textbooks, Furniture, Sports, Clothing)
- Listing cards with images, prices, and descriptions

### Listing Details
- Item images from Unsplash (matched to item type)
- Seller contact information (name, email, phone, WhatsApp)
- WhatsApp click-to-chat links
- Favorite toggle button (shows current state)

### Favorites
- Add/remove favorites from listing cards and detail modal
- Favorite button toggles state (green "Favorited" / gray "Favorite")
- Favorite status checked on listing detail open
- Dedicated favorites list under User tab with remove button

### User Management
- JWT-based authentication with bcrypt password hashing
- Profile view and edit (name, phone, WhatsApp)

### Messaging & Contact
- Contact sellers via email or WhatsApp
- Contact history with timestamps
- Seller info fetched from user profiles via gRPC

### Analytics
- View tracking per listing
- Trending listings (by day/week/month)
- Personalized recommendations based on favorites
- User stats dashboard (listings created, views, contacts, favorites)

### Architecture Toggle
- Switch between Microservices (port 8080) and Monolithic (port 9000) from the UI header
- Compare behavior across both architectures

## API Endpoints

### Auth Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/verify` | Verify JWT token |

### Listing Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings/:id` | Get listing details |
| POST | `/api/listings` | Create new listing |
| PUT | `/api/listings/:id` | Update listing |
| DELETE | `/api/listings/:id` | Delete listing |

### Search Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/listings` | Search with query, category_id, filters |
| GET | `/api/search/categories` | Get all categories |
| GET | `/api/search/conditions` | Get all conditions |
| GET | `/api/search/meetspots` | Get all meet spots |

### User Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| PUT | `/api/user/profile` | Update profile |

### Favorites Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites/:id` | Add to favorites |
| DELETE | `/api/favorites/:id` | Remove from favorites |
| GET | `/api/favorites/:id/check` | Check if favorited |

### Messaging Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messaging/initiate` | Contact a seller |
| GET | `/api/messaging/contact/:sellerId/:listingId` | Get seller contact info |
| GET | `/api/messaging/history` | Get contact history |

### Analytics Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/track/view` | Track listing view |
| GET | `/api/analytics/trending` | Get trending listings |
| GET | `/api/analytics/recommendations` | Get personalized recommendations |
| GET | `/api/analytics/user/stats` | Get user analytics |

## Project Structure

```
.
├── frontend/                  # Web UI
│   ├── index.html             # Tab-based SPA (Search, User, Messaging, Analytics)
│   ├── styles.css             # Responsive styles with modal, tabs, stats grid
│   ├── app.js                 # All frontend logic and API integration
│   ├── serve.js               # Static file server (ES module)
│   ├── package.json
│   └── Dockerfile
├── gateway/                   # API Gateway (REST → gRPC)
│   └── src/
│       ├── index.ts           # Express server setup
│       ├── grpc-clients.ts    # gRPC client connections
│       ├── middleware/auth.ts  # JWT auth middleware
│       └── routes/            # REST route handlers
│           ├── auth.routes.ts
│           ├── listings.routes.ts
│           ├── search.routes.ts
│           ├── user.routes.ts
│           ├── favorites.routes.ts
│           ├── messaging.routes.ts
│           └── analytics.routes.ts
├── services/                  # gRPC Microservices
│   ├── auth/src/              # Authentication (JWT + bcrypt)
│   ├── listing/src/           # Listing CRUD
│   ├── search/src/            # Full-text search with GIN indexes
│   ├── user/src/              # User profiles
│   ├── favorites/src/         # Favorites/bookmarks management
│   ├── messaging/src/         # Contact info & history
│   └── analytics/src/         # Views, trending, recommendations
├── monolithic/                # Monolithic version (all routes in one app)
│   └── src/routes/
├── proto/                     # gRPC Protocol Buffer definitions
│   ├── auth.proto
│   ├── listing.proto
│   ├── search.proto
│   ├── user.proto
│   ├── favorites.proto
│   ├── messaging.proto
│   └── analytics.proto
├── database/
│   ├── schema.sql             # Table definitions & indexes
│   └── seed.sql               # Sample data (users, listings, views)
├── docker-compose.microservices.yml
├── docker-compose.monolithic.yml
├── start-all.sh               # One-command startup script
└── README.md
```

## Database Schema

```
┌──────────┐    ┌──────────┐    ┌────────────┐
│  users   │    │ listings │    │ categories │
├──────────┤    ├──────────┤    ├────────────┤
│ id (PK)  │◄───│seller_id │    │ id (PK)    │
│ email    │    │ title    │───►│ name       │
│ password │    │ price    │    └────────────┘
│ full_name│    │category_id│
│ phone    │    │condition_id│   ┌────────────┐
│ whatsapp │    │ image_url │   │ conditions │
└──────────┘    └──────────┘   ├────────────┤
      │               │        │ id (PK)    │
      │               │        │ name       │
      ▼               ▼        └────────────┘
┌──────────────┐  ┌──────────────┐
│  favorites   │  │listing_views │  ┌────────────────┐
├──────────────┤  ├──────────────┤  │contact_attempts│
│user_id (PK)  │  │ id (PK)      │  ├────────────────┤
│listing_id(PK)│  │ listing_id   │  │ id (PK)        │
│ favorited_at │  │ user_id      │  │ user_id        │
└──────────────┘  │ timestamp    │  │ listing_id     │
                  └──────────────┘  │ seller_id      │
                                    │ contact_method │
                                    │ timestamp      │
                                    └────────────────┘
```

## Development

### View Logs
```bash
# All services
docker compose -f docker-compose.microservices.yml logs -f

# Specific service
docker logs uta-marketplace-gateway -f
docker logs uta-marketplace-favorites -f
```

### Rebuild Services
```bash
# Rebuild all
docker compose -f docker-compose.microservices.yml up -d --build

# Rebuild specific service
docker compose -f docker-compose.microservices.yml up -d --build gateway
```

### Database Access
```bash
# Microservices DB
docker exec -it uta-marketplace-db psql -U uta -d uta_marketplace

# Monolithic DB
docker exec -it uta-marketplace-db-mono psql -U uta -d uta_marketplace
```

## Testing

### Manual API Tests
```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yuanbin.man@uta.edu","password":"password123"}'

# Search listings
curl "http://localhost:8080/api/search/listings?query=macbook"

# Search by category
curl "http://localhost:8080/api/search/listings?category_id=electronics"

# Get categories
curl http://localhost:8080/api/search/categories
```

## Stopping Services

```bash
# Stop microservices
docker compose -f docker-compose.microservices.yml down

# Stop monolithic
docker compose -f docker-compose.monolithic.yml down

# Remove all data (including database volumes)
docker compose -f docker-compose.microservices.yml down -v
```

## Troubleshooting

### Services won't start
```bash
docker ps                    # Check running containers
docker logs <container-name> # View specific logs
```

### Database issues
```bash
# Full reset (drops all data)
docker compose -f docker-compose.microservices.yml down -v
docker compose -f docker-compose.microservices.yml up -d
```

### Port conflicts
```bash
lsof -i :3000    # Check what's using a port
lsof -i :8080
kill -9 <PID>    # Kill the process
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS |
| API Gateway | Express.js (TypeScript) |
| Microservices | Node.js + gRPC (TypeScript) |
| Protocol Buffers | .proto definitions for all services |
| Database | PostgreSQL 16 with GIN full-text search indexes |
| Authentication | JWT + bcrypt |
| Containerization | Docker + Docker Compose |
| Images | Unsplash (free, no API key required) |

## Team & Acknowledgments

**Course:** CSE 5306 - Distributed Systems
**Institution:** University of Texas at Arlington
**Semester:** Spring 2026

### Team Members

| Team Member | Responsibilities |
| --- | --- |
| **Yuanbin Man** | Architecture & Backend (100%) & Frontend (80%), Database & Testing (80%) & Documentation |
| **Malaika Farooq** | Testing, Frontend (20%) & Documentation |

---

**Built for CSE 5306 - Distributed Systems at UTA**
