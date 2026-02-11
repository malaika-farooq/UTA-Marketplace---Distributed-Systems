# UTA Marketplace - Performance Testing Guide

This guide provides complete instructions for running performance tests comparing the **Microservices** and **Monolithic** architectures.

## Overview

Two architectures have been implemented:

### 1. Microservices Architecture (Port 8080)
- 6 independent services communicating via gRPC
- API Gateway aggregates services and exposes REST API
- Located in: `gateway/` and `services/`

### 2. Monolithic Architecture (Port 9000)
- Single Express.js application
- All functionality in one process
- Located in: `monolithic/`

## Quick Start

### Step 1: Start Both Architectures

#### Terminal 1: Start Microservices (Port 8080)
```bash
# Make sure Docker is running
docker-compose up -d postgres

# Wait for database to be ready
sleep 5

# Start all microservices and gateway
cd gateway
npm install
npm start
```

#### Terminal 2: Start Monolithic (Port 9000)
```bash
cd monolithic
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgres://uta:uta@localhost:5432/uta_marketplace

npm start
```

### Step 2: Verify Both Are Running

```bash
# Check microservices
curl http://localhost:8080/health
# Expected: {"status":"healthy","service":"api-gateway"}

# Check monolithic
curl http://localhost:9000/health
# Expected: {"status":"healthy","service":"monolithic-app"}
```

### Step 3: Run Performance Tests

```bash
cd testing/performance
npm install
npm run test:comparison
```

## What Gets Tested

The performance test suite measures:

### Endpoints Tested (7 total)
1. **POST /api/auth/register** - User registration with password hashing
2. **POST /api/auth/login** - User login with password verification
3. **GET /api/listings** - Fetch all listings (paginated)
4. **GET /api/search/listings** - Search with query parameters
5. **POST /api/listings** - Create listing (authenticated)
6. **GET /api/user/profile** - Get user profile (authenticated)
7. **GET /api/analytics/trending** - Get trending listings

### Metrics Collected
- **Throughput**: Requests per second (req/sec)
- **Latency (Mean)**: Average response time
- **Latency (P50)**: Median response time
- **Latency (P95)**: 95th percentile response time
- **Latency (P99)**: 99th percentile response time
- **Total Requests**: Total requests completed
- **Duration**: Test duration in seconds

### Load Configuration
- **Concurrency**: 10-20 concurrent connections per endpoint
- **Duration**: 10-15 seconds per test
- **Total Test Time**: ~2-3 minutes for complete suite

## Understanding Results

### Sample Output

```
MICROSERVICES ARCHITECTURE (Port 8080)
------------------------------------------------------------
Total Requests Across All Tests: 15,432
Average Throughput: 987.50 req/sec
Average Latency (mean): 75.32 ms
Average Latency (p95): 185.50 ms
Average Latency (p99): 245.75 ms

MONOLITHIC ARCHITECTURE (Port 9000)
------------------------------------------------------------
Total Requests Across All Tests: 18,765
Average Throughput: 1,234.80 req/sec
Average Latency (mean): 42.15 ms
Average Latency (p95): 98.20 ms
Average Latency (p99): 125.40 ms
```

### Interpreting Metrics

#### Throughput (Higher is Better)
- **Microservices**: 500-1,000 req/sec (typical)
- **Monolithic**: 800-1,500 req/sec (typical)
- **Why**: Monolithic avoids network overhead of gRPC calls

#### Latency (Lower is Better)
- **Microservices**: 50-150ms mean latency
  - Includes gRPC serialization/deserialization
  - Network communication between services
  - Multiple processes involved
- **Monolithic**: 20-80ms mean latency
  - Direct function calls (no network)
  - Single process
  - No serialization overhead

#### P95/P99 Latency
- Measures "tail latency" - worst-case scenarios
- Important for user experience
- **Good**: P95 < 200ms
- **Acceptable**: P95 < 500ms
- **Poor**: P95 > 1000ms

## Expected Results

### Monolithic Advantages
✅ **Lower Latency** (20-50% faster)
- No network overhead
- Direct function calls
- Single process = less context switching

✅ **Higher Throughput** (15-30% more requests/sec)
- Less overhead per request
- Efficient resource utilization

### Microservices Advantages
✅ **Better Scalability** (not measured in these tests)
- Can scale individual services
- Handle specific bottlenecks

✅ **Fault Isolation** (not measured in these tests)
- Service failures don't cascade
- More resilient to partial failures

### Why Monolithic is Faster

1. **No Network Calls**
   ```
   Microservices: Gateway → gRPC → Service → Database
                  [HTTP]   [gRPC]   [SQL]
   
   Monolithic:    Client → Single App → Database
                  [HTTP]   [Direct]   [SQL]
   ```

2. **No Serialization**
   - Microservices: JSON ↔ Protobuf ↔ JSON
   - Monolithic: Direct JavaScript objects

3. **Single Process**
   - Microservices: Context switching between processes
   - Monolithic: All in-memory

## Advanced Testing

### Custom Test Scenarios

Edit test files to modify parameters:

```javascript
// In test-microservices.js or test-monolithic.js

// Increase load
connections: 50,      // Default: 10-20
duration: 60,         // Default: 10-15

// Add warmup period
warmup: [
  { connections: 10, duration: 5 },  // Warm up cache
  { connections: 50, duration: 30 }  // Real test
]
```

### Test Individual Endpoints

```bash
# Test only microservices
npm run test:microservices

# Test only monolithic
npm run test:monolithic
```

### Stress Testing

For higher loads (100+ concurrent connections):

```javascript
results.highLoad = await runTest('High Load Test', {
  url: `${BASE_URL}/api/listings`,
  connections: 100,     // High concurrency
  duration: 60,         // Longer duration
  pipelining: 1         // HTTP pipelining
});
```

## Troubleshooting

### Issue: "Port already in use"

```bash
# Check what's using port 8080 or 9000
lsof -i :8080
lsof -i :9000

# Kill the process
kill -9 <PID>
```

### Issue: "Cannot connect to database"

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database connection
psql postgres://uta:uta@localhost:5432/uta_marketplace

# Restart database
docker-compose restart postgres
```

### Issue: "Tests timing out"

```bash
# Increase connection pool size in .env
DATABASE_POOL_MAX=50

# Or reduce test concurrency
connections: 5,  # Lower concurrency
```

### Issue: "Rate limiting errors"

Add delays between tests:

```javascript
await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
```

## Performance Optimization

### For Microservices

1. **gRPC Optimization**
   ```javascript
   // Enable keepalive
   'grpc.keepalive_time_ms': 10000,
   'grpc.keepalive_timeout_ms': 5000
   ```

2. **Connection Pooling**
   ```javascript
   // Increase pool size
   grpc.credentials.createInsecure({
     maxConnectionAge: 60000,
     maxConnectionIdle: 30000
   });
   ```

3. **Caching**
   - Add Redis for frequently accessed data
   - Cache categories, conditions, meet spots

### For Monolithic

1. **Database Optimization**
   ```sql
   -- Add indexes
   CREATE INDEX idx_listings_title ON listings(title);
   CREATE INDEX idx_listings_price ON listings(price);
   
   -- Analyze queries
   EXPLAIN ANALYZE SELECT * FROM listings WHERE title ILIKE '%laptop%';
   ```

2. **Connection Pooling**
   ```javascript
   const pool = new Pool({
     max: 50,              // Increase pool size
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   ```

3. **Response Compression**
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

### For Both Architectures

1. **Reduce bcrypt rounds** (development only)
   ```javascript
   const SALT_ROUNDS = 4; // Instead of 10
   ```

2. **Enable query logging**
   ```javascript
   pool.on('query', (query) => {
     console.log('Query:', query);
   });
   ```

3. **Add monitoring**
   ```javascript
   import prometheus from 'prom-client';
   // Track request duration, database queries, etc.
   ```

## Results Storage

All test results are saved with timestamps:

```
testing/performance/results/
├── microservices_20240210_143022.txt
├── monolithic_20240210_143045.txt
└── comparison_20240210_143045.txt
```

## Continuous Performance Testing

### Set up automated tests

```bash
#!/bin/bash
# run-nightly-tests.sh

cd /path/to/project

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Run tests
cd testing/performance
npm run test:comparison > "results/nightly_$(date +%Y%m%d).txt"

# Stop services
docker-compose down
```

### Add to cron

```bash
# Run every night at 2 AM
0 2 * * * /path/to/run-nightly-tests.sh
```

## Real-World Considerations

### Production Deployment

In production, you would typically choose ONE architecture:

**Choose Monolithic If:**
- Small team (< 10 developers)
- Simple domain
- Performance critical
- Limited DevOps resources

**Choose Microservices If:**
- Large team (10+ developers)
- Complex domain with clear boundaries
- Need independent scaling
- Strong DevOps culture

### Hybrid Approach

You can also start monolithic and extract microservices later:

```
Phase 1: Monolithic (MVP)
  └─> All features in one app

Phase 2: Extract Critical Services
  ├─> Analytics → Microservice (high load)
  ├─> Search → Microservice (specialized needs)
  └─> Core App → Monolithic

Phase 3: Full Microservices (if needed)
  └─> Split into 6+ services
```

## Additional Resources

### Documentation
- `/monolithic/README.md` - Monolithic app documentation
- `/testing/performance/README.md` - Detailed testing guide
- `/database/schema.sql` - Database schema

### Tools Used
- **autocannon** - HTTP benchmarking tool
- **axios** - HTTP client for setup
- **chalk** - Terminal colors
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **gRPC** - Service communication (microservices)

## Questions and Support

### Common Questions

**Q: Why is monolithic faster?**
A: No network overhead, direct function calls, single process.

**Q: Should I use monolithic or microservices?**
A: Start monolithic. Only go microservices when team/domain complexity requires it.

**Q: Can I deploy both?**
A: Yes, but in production choose one. This is for comparison only.

**Q: What about serverless?**
A: Serverless (AWS Lambda, etc.) has different trade-offs. Consider it for specific use cases.

## Conclusion

Both architectures have their place:

- **Monolithic**: Simpler, faster, better for most projects
- **Microservices**: Complex but scalable, better for large organizations

The performance tests prove that **monolithic is objectively faster** for single-server deployments, but microservices offer **operational benefits** that may outweigh the performance cost in large-scale systems.

Choose based on your team size, domain complexity, and operational requirements, not just on performance metrics.
