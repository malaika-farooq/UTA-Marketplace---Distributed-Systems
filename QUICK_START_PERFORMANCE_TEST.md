# Quick Start: Performance Testing

Get performance comparison results in under 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- Ports 8080 and 9000 available

## Step 1: Start Database (30 seconds)

```bash
docker-compose up -d postgres
sleep 30  # Wait for PostgreSQL to be ready
```

## Step 2: Start Microservices Gateway (Terminal 1)

```bash
cd gateway
npm install  # First time only
npm start
```

Wait until you see: `API Gateway listening on port 8080`

## Step 3: Start Monolithic App (Terminal 2)

```bash
cd monolithic
npm install  # First time only
cp .env.example .env  # First time only
npm start
```

Wait until you see: `Monolithic application listening on port 9000`

## Step 4: Verify Both Are Running (Terminal 3)

```bash
# Test microservices
curl http://localhost:8080/health
# Should return: {"status":"healthy","service":"api-gateway"}

# Test monolithic
curl http://localhost:9000/health
# Should return: {"status":"healthy","service":"monolithic-app"}
```

## Step 5: Run Performance Tests

```bash
cd testing/performance
npm install  # First time only
npm run test:comparison
```

## Expected Output

```
============================================================
  UTA Marketplace - Architecture Performance Comparison
============================================================

1️⃣  Testing Microservices Architecture (Port 8080)...
============================================================
✅ Microservices gateway is running

🚀 MICROSERVICES ARCHITECTURE PERFORMANCE TEST
[Tests running...]

✅ All tests completed successfully!

SUMMARY REPORT:
============================================================
Total Requests Across All Tests: 15,432
Average Throughput: 987.50 req/sec
Average Latency (mean): 75.32 ms
Average Latency (p95): 185.50 ms
Average Latency (p99): 245.75 ms
============================================================


2️⃣  Testing Monolithic Architecture (Port 9000)...
============================================================
✅ Monolithic application is running

🏛️  MONOLITHIC ARCHITECTURE PERFORMANCE TEST
[Tests running...]

✅ All tests completed successfully!

SUMMARY REPORT:
============================================================
Total Requests Across All Tests: 18,765
Average Throughput: 1,234.80 req/sec
Average Latency (mean): 42.15 ms
Average Latency (p95): 98.20 ms
Average Latency (p99): 125.40 ms
============================================================

📊 GENERATING COMPARISON REPORT
[Comparison generated...]

✅ All tests completed successfully!
```

## Interpreting Results

### Key Findings (Typical)

**Monolithic is ~25-40% Faster**
- Lower latency: 40-80ms vs 70-150ms
- Higher throughput: 1000-1500 vs 700-1000 req/sec
- Reason: No network overhead between components

**But Microservices Offer:**
- Better scalability (not measured)
- Fault isolation (not measured)
- Independent deployment (not measured)

## Results Location

Check the `testing/performance/results/` folder:
- `microservices_TIMESTAMP.txt` - Full microservices results
- `monolithic_TIMESTAMP.txt` - Full monolithic results
- `comparison_TIMESTAMP.txt` - Side-by-side comparison

## Troubleshooting

### Services Not Starting?

```bash
# Check if ports are in use
lsof -i :8080
lsof -i :9000

# Kill processes using the ports
kill -9 <PID>
```

### Database Connection Issues?

```bash
# Check database is running
docker ps | grep postgres

# Check database is accessible
psql postgres://uta:uta@localhost:5432/uta_marketplace
```

### Tests Failing?

```bash
# Ensure both services are healthy
curl http://localhost:8080/health
curl http://localhost:9000/health

# Check for any error logs in the service terminals
```

## What's Next?

For detailed analysis and more testing options, see:
- `PERFORMANCE_TESTING_GUIDE.md` - Comprehensive guide
- `testing/performance/README.md` - Test suite documentation
- `monolithic/README.md` - Monolithic app documentation

## Clean Up

When done testing:

```bash
# Stop services (Ctrl+C in each terminal)

# Stop database
docker-compose down

# Or stop everything
docker-compose down
```

## One-Liner for Repeat Tests

After initial setup:

```bash
# Terminal 1
cd gateway && npm start

# Terminal 2
cd monolithic && npm start

# Terminal 3 (after both are running)
cd testing/performance && npm run test:comparison
```

That's it! You now have concrete performance data comparing both architectures.
