# UTA Marketplace - Monolithic Application

This is the monolithic version of the UTA Marketplace application, created for performance comparison with the microservices architecture.

## Overview

The monolithic application combines ALL functionality from the 7 microservices into a single Express.js application:

- **Auth Service** → `/api/auth` routes
- **Listing Service** → `/api/listings` routes
- **Search Service** → `/api/search` routes
- **User Service** → `/api/user` routes
- **Messaging Service** → `/api/messaging` routes
- **Analytics Service** → `/api/analytics` routes

## Architecture

```
monolithic/
├── src/
│   ├── index.ts              # Main Express application
│   ├── db.ts                 # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   └── routes/
│       ├── auth.ts           # Authentication endpoints
│       ├── listings.ts       # Listing CRUD operations
│       ├── search.ts         # Search and filters
│       ├── user.ts           # User profile and favorites
│       ├── messaging.ts      # Contact initiation
│       └── analytics.ts      # Analytics and trending
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Key Differences from Microservices

### Monolithic
- ✅ **Single process** - All code runs in one Node.js process
- ✅ **Direct function calls** - No network overhead
- ✅ **Lower latency** - No gRPC communication
- ✅ **Simpler deployment** - One Docker container
- ✅ **Easier debugging** - Single codebase
- ❌ **Harder to scale** - Must scale entire application
- ❌ **Less fault isolation** - One bug can crash everything
- ❌ **Technology lock-in** - All services use same tech stack

### Microservices
- ✅ **Independent scaling** - Scale only what you need
- ✅ **Fault isolation** - Service failures don't cascade
- ✅ **Technology diversity** - Each service can use different tech
- ✅ **Team independence** - Different teams work independently
- ❌ **Higher latency** - gRPC network calls add overhead
- ❌ **Complex deployment** - Multiple services to manage
- ❌ **Harder debugging** - Distributed tracing needed

## Prerequisites

- Node.js 18+
- PostgreSQL database (shared with microservices)
- Port 9000 available

## Installation

```bash
cd monolithic
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=9000
DATABASE_URL=postgres://uta:uta@localhost:5432/uta_marketplace
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Docker
```bash
# Build the image
docker build -t uta-marketplace-monolithic .

# Run the container
docker run -p 9000:9000 \
  -e DATABASE_URL=postgres://uta:uta@postgres:5432/uta_marketplace \
  -e JWT_SECRET=your_secret \
  uta-marketplace-monolithic
```

## API Endpoints

All endpoints are identical to the microservices architecture, just running on a single server.

### Base URL
```
http://localhost:9000
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/validate` - Validate token

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required)
- `DELETE /api/listings/:id` - Delete listing (auth required)
- `GET /api/listings/user/my-listings` - Get user's listings (auth required)

### Search
- `GET /api/search/listings` - Search listings with filters
- `GET /api/search/categories` - Get all categories
- `GET /api/search/conditions` - Get all conditions
- `GET /api/search/meet-spots` - Get all meet spots

### User
- `GET /api/user/profile` - Get user profile (auth required)
- `PUT /api/user/profile` - Update profile (auth required)
- `POST /api/user/favorites` - Add to favorites (auth required)
- `DELETE /api/user/favorites/:listing_id` - Remove from favorites (auth required)
- `GET /api/user/favorites` - Get favorites (auth required)
- `GET /api/user/favorites/:listing_id/check` - Check if favorited (auth required)

### Messaging
- `POST /api/messaging/contact` - Initiate contact (auth required)
- `GET /api/messaging/contact/:seller_id` - Get contact info
- `GET /api/messaging/history` - Get contact history (auth required)

### Analytics
- `POST /api/analytics/track-view` - Track listing view
- `GET /api/analytics/listing-views/:listing_id` - Get listing view stats
- `GET /api/analytics/trending` - Get trending listings
- `GET /api/analytics/recommendations` - Get recommendations (auth required)
- `GET /api/analytics/user-stats` - Get user analytics (auth required)

## Testing

### Health Check
```bash
curl http://localhost:9000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "monolithic-app"
}
```

### Test Registration
```bash
curl -X POST http://localhost:9000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone": "1234567890"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Performance Testing

To compare performance with microservices:

```bash
# Make sure both are running:
# - Microservices on port 8080
# - Monolithic on port 9000

cd ../testing/performance
npm install
npm run test:comparison
```

## Database Schema

The monolithic application uses the same PostgreSQL database schema as the microservices architecture. See `/database/schema.sql` for the full schema.

### Key Tables
- `users` - User accounts
- `listings` - Marketplace listings
- `categories` - Listing categories
- `conditions` - Item conditions
- `meet_spots` - Meeting locations
- `favorites` - User favorites
- `contact_attempts` - Contact tracking
- `listing_views` - View analytics

## Code Organization

### Direct Database Access
Unlike microservices that communicate via gRPC, the monolithic app directly queries PostgreSQL:

```typescript
// Microservices approach (via gRPC)
authClient.Register(request, callback);

// Monolithic approach (direct DB)
await pool.query('INSERT INTO users...');
```

### Shared Connection Pool
All routes share a single database connection pool configured in `src/db.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Maximum 20 connections
});
```

### Middleware
Authentication is handled by Express middleware:

```typescript
router.get('/profile', authenticateToken, async (req, res) => {
  // req.userId is set by authenticateToken middleware
  const userId = req.userId;
  // ...
});
```

## Advantages of This Implementation

1. **Performance**: Lower latency due to no network calls
2. **Simplicity**: Single codebase, easier to understand
3. **Development Speed**: Faster to develop new features
4. **Testing**: Easier to test (no need to mock gRPC)
5. **Deployment**: Single container to deploy

## When to Use Monolithic vs Microservices

### Use Monolithic When:
- Starting a new project (avoid premature optimization)
- Small to medium team
- Simple domain with few bounded contexts
- Performance is critical (low latency required)
- Limited DevOps resources

### Use Microservices When:
- Large team (10+ developers)
- Complex domain with clear boundaries
- Need independent deployment and scaling
- Different parts need different technologies
- Strong DevOps culture and infrastructure

## Monitoring and Logging

### Application Logs
```bash
# Development
npm run dev

# Production with PM2
pm2 start npm --name "uta-monolithic" -- start
pm2 logs uta-monolithic
```

### Database Monitoring
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 9000
lsof -i :9000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Test database connection
psql postgres://uta:uta@localhost:5432/uta_marketplace

# Check if database exists
\l

# Check tables
\dt
```

### Module Import Errors
Make sure `"type": "module"` is in `package.json` and you're using `.js` extensions in imports:

```typescript
// Correct
import pool from './db.js';

// Wrong (will fail)
import pool from './db';
```

## Deployment

### Docker Compose

Add to your `docker-compose.yml`:

```yaml
  monolithic:
    build: ./monolithic
    ports:
      - "9000:9000"
    environment:
      - DATABASE_URL=postgres://uta:uta@postgres:5432/uta_marketplace
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - postgres
```

### Production Deployment

1. **Build TypeScript**:
```bash
npm run build
```

2. **Use PM2**:
```bash
pm2 start dist/index.js --name uta-monolithic
```

3. **Set up Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## License

Part of the UTA Marketplace project.
