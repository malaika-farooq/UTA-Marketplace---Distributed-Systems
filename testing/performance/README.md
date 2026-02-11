# UTA Marketplace - Performance Testing Suite

This directory contains comprehensive performance testing scripts to compare the **Microservices Architecture** against the **Monolithic Architecture** implementation of UTA Marketplace.

## Overview

The performance tests measure:
- **Latency** (p50, p95, p99) - Response time percentiles
- **Throughput** (req/sec) - Requests handled per second
- **Concurrency handling** - Performance under different load levels

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js** (v18 or higher)
2. **Both architectures running**:
   - Microservices gateway on port **8080**
   - Monolithic application on port **9000**
3. **PostgreSQL database** accessible and populated with test data

## Installation

```bash
cd testing/performance
npm install
```

## Running Tests

### Option 1: Test Individual Architectures

#### Test Microservices (Port 8080)
```bash
npm run test:microservices
```

#### Test Monolithic (Port 9000)
```bash
npm run test:monolithic
```

### Option 2: Run Complete Comparison (Recommended)

This will test both architectures and generate a comparison report:

```bash
npm run test:comparison
# or
bash run-comparison.sh
```

## Test Coverage

The performance tests cover the following endpoints:

### 1. Authentication Tests
- **POST /api/auth/register** - User registration
- **POST /api/auth/login** - User login

### 2. Listing Tests
- **GET /api/listings** - Get all listings (public)
- **POST /api/listings** - Create listing (authenticated)

### 3. Search Tests
- **GET /api/search/listings** - Search listings with filters

### 4. User Tests
- **GET /api/user/profile** - Get user profile (authenticated)

### 5. Analytics Tests
- **GET /api/analytics/trending** - Get trending listings

## Understanding the Results

### Key Metrics

#### Throughput (req/sec)
- **Higher is better**
- Indicates how many requests the system can handle per second
- Example: 1000 req/sec means the system processes 1000 requests every second

#### Latency (milliseconds)
- **Lower is better**
- Response time for requests
- **Mean**: Average response time across all requests
- **P50 (Median)**: 50% of requests completed faster than this
- **P95**: 95% of requests completed within this time
- **P99**: 99% of requests completed within this time

### Sample Output

```
SUMMARY REPORT:
============================================================
Total Requests Across All Tests: 15000
Average Throughput: 1250.50 req/sec
Average Latency (mean): 45.32 ms
Average Latency (p95): 120.50 ms
Average Latency (p99): 180.75 ms
============================================================
```

## Expected Differences

### Monolithic Architecture
**Advantages:**
- ✅ Lower latency (no network overhead between components)
- ✅ Simpler deployment and testing
- ✅ Direct function calls (faster than network calls)
- ✅ Single process means less memory overhead

**Typical Results:**
- Latency: 20-50ms (mean)
- Throughput: 800-1500 req/sec

### Microservices Architecture
**Advantages:**
- ✅ Better scalability (can scale services independently)
- ✅ Fault isolation (one service failure doesn't crash everything)
- ✅ Technology diversity (each service can use different tech)
- ✅ Team independence (different teams can work on different services)

**Typical Results:**
- Latency: 50-150ms (mean) - Higher due to gRPC/network calls
- Throughput: 500-1000 req/sec - Lower due to network overhead

**Trade-offs:**
- ❌ Higher latency due to network communication (gRPC calls)
- ❌ More complex infrastructure
- ❌ Network overhead between services

## Test Configuration

### Concurrency Levels
- **Auth endpoints**: 10 concurrent connections
- **Read endpoints**: 15-20 concurrent connections
- **Write endpoints**: 10 concurrent connections

### Test Duration
- Most tests run for **10 seconds**
- High-traffic endpoints (listings, search) run for **15 seconds**

### Customization

You can modify the test parameters in the JavaScript files:

```javascript
// In test-microservices.js or test-monolithic.js
await runTest('Test Name', {
  url: 'http://localhost:8080/api/endpoint',
  connections: 20,    // Number of concurrent connections
  duration: 15        // Duration in seconds
});
```

## Results Storage

All test results are saved to the `./results/` directory with timestamps:

```
results/
  ├── microservices_20240210_143022.txt
  ├── monolithic_20240210_143045.txt
  └── comparison_20240210_143045.txt
```

## Troubleshooting

### Port Not Available Error
```
❌ ERROR: Microservices gateway is not running on port 8080
```
**Solution**: Start the microservices architecture first
```bash
cd gateway
npm start
```

### Connection Refused
**Solution**: Ensure PostgreSQL is running and accessible

### Test Failures
**Solution**: Check that test data exists in the database:
- Categories
- Conditions
- Meet spots
- At least one test user

## Advanced Usage

### Custom Test Scenarios

Create your own test file:

```javascript
import autocannon from 'autocannon';

const result = await autocannon({
  url: 'http://localhost:8080/api/your-endpoint',
  connections: 50,      // Concurrent connections
  duration: 30,         // Duration in seconds
  pipelining: 1,        // HTTP pipelining
  headers: {
    'Authorization': 'Bearer your-token'
  }
});

console.log(result);
```

### Load Testing

For higher load tests, increase connections:

```javascript
connections: 100,  // High concurrency
duration: 60       // Longer duration
```

## Performance Optimization Tips

### For Microservices
1. **Enable HTTP/2** for gRPC (already done)
2. **Add caching** for frequently accessed data
3. **Use connection pooling** for gRPC clients
4. **Implement circuit breakers** for fault tolerance

### For Monolithic
1. **Optimize database queries** (indexes, query optimization)
2. **Add caching layer** (Redis)
3. **Use connection pooling** for database
4. **Enable compression** for responses

### For Both
1. **Database optimization**:
   - Add indexes on frequently queried columns
   - Use EXPLAIN ANALYZE to optimize slow queries
   - Increase connection pool size
2. **Application optimization**:
   - Reduce bcrypt rounds for development
   - Enable response compression
   - Implement pagination
3. **Infrastructure**:
   - Use faster hardware
   - Optimize Docker container resources
   - Use production-grade database configuration

## Interpreting Results

### Scenario 1: Monolithic is Faster
**Common** - This is expected for most operations due to:
- No network overhead
- Direct function calls
- Single process means less context switching

### Scenario 2: Similar Performance
**Database-bound operations** - When both architectures spend most time waiting on database:
- Complex queries
- Large result sets
- Database is the bottleneck

### Scenario 3: Microservices is Faster
**Rare** - Might happen when:
- Parallel service calls (not implemented in basic version)
- Better resource utilization under extreme load
- Individual services are optimized better

## Contributing

To add new test scenarios:

1. Add test function in `test-microservices.js` and `test-monolithic.js`
2. Update the summary calculation
3. Document the new test in this README

## License

This testing suite is part of the UTA Marketplace project.
