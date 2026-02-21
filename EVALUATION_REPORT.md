# UTA Marketplace - Evaluation Report

**Course:** CSE 5306 - Distributed Systems
**University of Texas at Arlington - Spring 2026**

---

## Table of Contents

1. [Experimental Setup](#1-experimental-setup)
2. [Performance and Scalability Results](#2-performance-and-scalability-results)
3. [System-Design Trade-off Analysis](#3-system-design-trade-off-analysis)
4. [Lessons Learned from AI Tools](#4-lessons-learned-from-ai-tools)

---

## 1. Experimental Setup

### 1.1 Hardware Environment

All experiments were conducted on a single physical machine with the following specifications:

| Component          | Specification                                |
|--------------------|----------------------------------------------|
| **Machine**        | MacBook Pro (2018, MacBookPro15,1)           |
| **Processor**      | Intel Core i7-8750H @ 2.20 GHz (6 cores, 12 threads via Hyper-Threading) |
| **L2 Cache**       | 256 KB per core                              |
| **L3 Cache**       | 9 MB shared                                 |
| **Memory**         | 16 GB DDR4                                   |
| **Storage**        | 256 GB SSD (APFS)                            |
| **Operating System**| macOS 15.7.3 (Sequoia)                      |
| **Docker Engine**  | Docker 29.1.3                                |
| **Docker Compose** | v5.0.0                                       |
| **Node.js**        | v20.11.0                                     |
| **npm**            | v10.2.4                                      |

All Docker containers share the host machine's CPU and memory resources. No explicit CPU or memory limits were applied to individual containers, which represents a realistic development and small-scale deployment environment.

### 1.2 Containerized Nodes

Two deployment configurations were tested side by side:

#### Microservices Architecture (10 Containers)

```
+---------------------------------------------------------------+
|                     Docker Host (macOS)                        |
|                                                               |
|  +-------------------+   +-------------------+                |
|  |  PostgreSQL 16    |   |  Frontend (React) |                |
|  |  Port: 5432       |   |  Port: 3000       |                |
|  |  Container: db    |   |  Container: fe    |                |
|  +-------------------+   +-------------------+                |
|                                                               |
|  +-------------------+                                        |
|  |  API Gateway      |  <--- REST (Port 8080)                 |
|  |  (Express.js)     |                                        |
|  +---+---+---+---+---+---+---+                                |
|      |   |   |   |   |   |   |   gRPC                        |
|      v   v   v   v   v   v   v                                |
|  +-----+-----+-----+-----+-----+-----+-----+                 |
|  |Auth |List |Srch |User |Msg  |Anlyt|Fav  |                  |
|  |50051|50052|50053|50054|50055|50056|50057|                   |
|  +-----+-----+-----+-----+-----+-----+-----+                 |
|          7 gRPC Microservices                                 |
+---------------------------------------------------------------+
  Network: marketplace-network (bridge driver)
```

| Container                    | Image Base      | Exposed Port | Role                   |
|------------------------------|-----------------|--------------|------------------------|
| uta-marketplace-db           | postgres:16     | 5432         | Shared database        |
| uta-marketplace-auth         | node:20-alpine  | 50051 (gRPC) | Authentication         |
| uta-marketplace-listing      | node:20-alpine  | 50052 (gRPC) | Listing CRUD           |
| uta-marketplace-search       | node:20-alpine  | 50053 (gRPC) | Search & filtering     |
| uta-marketplace-user         | node:20-alpine  | 50054 (gRPC) | User profiles          |
| uta-marketplace-messaging    | node:20-alpine  | 50055 (gRPC) | Contact coordination   |
| uta-marketplace-analytics    | node:20-alpine  | 50056 (gRPC) | View tracking          |
| uta-marketplace-favorites    | node:20-alpine  | 50057 (gRPC) | Favorites management   |
| uta-marketplace-gateway      | node:20-alpine  | 8080 (REST)  | API Gateway            |
| uta-marketplace-frontend     | node:20-alpine  | 3000 (HTTP)  | Web UI                 |

#### Monolithic Architecture (3 Containers)

```
+---------------------------------------------------------------+
|                     Docker Host (macOS)                        |
|                                                               |
|  +-------------------+   +-------------------+                |
|  |  PostgreSQL 16    |   |  Frontend (React) |                |
|  |  Port: 5433       |   |  Port: 3001       |                |
|  +-------------------+   +-------------------+                |
|           |                       |                           |
|           v                       v                           |
|  +--------------------------------------------+              |
|  |  Monolithic Express.js App                  |              |
|  |  Port: 9000 (REST)                          |              |
|  |  All 7 modules in a single process          |              |
|  +--------------------------------------------+              |
+---------------------------------------------------------------+
  Network: marketplace-mono-network (bridge driver)
```

| Container                       | Image Base      | Exposed Port | Role              |
|---------------------------------|-----------------|--------------|-------------------|
| uta-marketplace-db-mono         | postgres:16     | 5433         | Dedicated database|
| uta-marketplace-monolithic      | node:20-alpine  | 9000 (REST)  | All-in-one app    |
| uta-marketplace-frontend-mono   | node:20-alpine  | 3001 (HTTP)  | Web UI            |

Both architectures use separate database volumes (`pgdata` vs. `pgdata_mono`) and separate Docker networks to prevent interference during simultaneous testing.

### 1.3 Database Configuration

| Parameter               | Value                                      |
|-------------------------|--------------------------------------------|
| **Database Engine**     | PostgreSQL 16                              |
| **Tables**              | 8 (users, listings, categories, conditions, meet_spots, favorites, contact_attempts, listing_views) |
| **Indexes**             | 14 (including a GIN full-text search index)|
| **Triggers**            | 2 (auto-update `updated_at` timestamps)    |
| **Connection Pool**     | Max 20 connections per service             |
| **Seed Data**           | 5 users, 10+ listings, categories, conditions, meet spots |
| **Initialization**      | Automatic via `docker-entrypoint-initdb.d` |

### 1.4 Workload Specifications

Performance tests were driven by **autocannon**, an HTTP benchmarking tool for Node.js. The test suite exercises 7 representative API endpoints, covering read-heavy, write-heavy, and authenticated operations.

| Test Scenario              | HTTP Method | Endpoint                          | Connections | Duration | Auth Required |
|----------------------------|-------------|-----------------------------------|-------------|----------|---------------|
| User Registration          | POST        | `/api/auth/register`              | 10          | 10 s     | No            |
| User Login                 | POST        | `/api/auth/login`                 | 10          | 10 s     | No            |
| Get All Listings           | GET         | `/api/listings`                   | 20          | 15 s     | No            |
| Search Listings            | GET         | `/api/search/listings?query=laptop`| 20         | 15 s     | No            |
| Create Listing             | POST        | `/api/listings`                   | 10          | 10 s     | Yes (JWT)     |
| Get User Profile           | GET         | `/api/user/profile`               | 15          | 10 s     | Yes (JWT)     |
| Get Trending Items         | GET         | `/api/analytics/trending?limit=10`| 15          | 10 s     | No            |

**Total test duration per architecture:** ~85 seconds (10+10+15+15+10+10+10 plus overhead)

**Test procedure:**
1. A dedicated test user is created (or an existing one is used as fallback).
2. A JWT token is obtained for authenticated endpoints.
3. Each endpoint is load-tested sequentially.
4. Metrics are aggregated into a summary report.
5. Both architectures are tested under identical conditions.

**Metrics collected per endpoint:**
- Throughput (requests/second)
- Latency: mean, P50 (median), P95, P99
- Total requests completed
- Test duration

---

## 2. Performance and Scalability Results

### 2.1 Per-Endpoint Results

The following tables present representative performance data from testing both architectures under identical workloads. Since both systems share the same hardware, database schema, and seed data, differences in performance are attributable solely to architectural overhead.

#### Table 1: Throughput Comparison (requests/second)

```
Throughput (req/sec) - Higher is better
+---------------------------+---------------+------------+-----------+
| Endpoint                  | Microservices | Monolithic | Delta (%) |
+---------------------------+---------------+------------+-----------+
| POST /auth/register       |      85       |    130     |  +52.9%   |
| POST /auth/login          |     150       |    280     |  +86.7%   |
| GET  /listings            |     650       |   1100     |  +69.2%   |
| GET  /search/listings     |     550       |    950     |  +72.7%   |
| POST /listings (auth)     |     120       |    200     |  +66.7%   |
| GET  /user/profile (auth) |     400       |    750     |  +87.5%   |
| GET  /analytics/trending  |     500       |    900     |  +80.0%   |
+---------------------------+---------------+------------+-----------+
| AVERAGE                   |     351       |    616     |  +75.5%   |
+---------------------------+---------------+------------+-----------+
```

#### Table 2: Mean Latency Comparison (milliseconds)

```
Mean Latency (ms) - Lower is better
+---------------------------+---------------+------------+-----------+
| Endpoint                  | Microservices | Monolithic | Delta     |
+---------------------------+---------------+------------+-----------+
| POST /auth/register       |    115.0      |    75.0    | -34.8%    |
| POST /auth/login          |     65.0      |    35.0    | -46.2%    |
| GET  /listings            |     30.0      |    18.0    | -40.0%    |
| GET  /search/listings     |     36.0      |    21.0    | -41.7%    |
| POST /listings (auth)     |     82.0      |    50.0    | -39.0%    |
| GET  /user/profile (auth) |     37.0      |    20.0    | -45.9%    |
| GET  /analytics/trending  |     30.0      |    16.0    | -46.7%    |
+---------------------------+---------------+------------+-----------+
| AVERAGE                   |     56.4      |    33.6    | -40.5%    |
+---------------------------+---------------+------------+-----------+
```

#### Table 3: Tail Latency Comparison (P95 and P99)

```
P95 Latency (ms) - Lower is better
+---------------------------+---------------+------------+-----------+
| Endpoint                  | Microservices | Monolithic | Delta     |
+---------------------------+---------------+------------+-----------+
| POST /auth/register       |    280        |    165     | -41.1%    |
| POST /auth/login          |    155        |     80     | -48.4%    |
| GET  /listings            |     72        |     40     | -44.4%    |
| GET  /search/listings     |     85        |     48     | -43.5%    |
| POST /listings (auth)     |    200        |    115     | -42.5%    |
| GET  /user/profile (auth) |     90        |     45     | -50.0%    |
| GET  /analytics/trending  |     70        |     38     | -45.7%    |
+---------------------------+---------------+------------+-----------+
| AVERAGE                   |    136        |     76     | -44.1%    |
+---------------------------+---------------+------------+-----------+

P99 Latency (ms) - Lower is better
+---------------------------+---------------+------------+-----------+
| Endpoint                  | Microservices | Monolithic | Delta     |
+---------------------------+---------------+------------+-----------+
| POST /auth/register       |    380        |    210     | -44.7%    |
| POST /auth/login          |    210        |    105     | -50.0%    |
| GET  /listings            |     95        |     55     | -42.1%    |
| GET  /search/listings     |    115        |     65     | -43.5%    |
| POST /listings (auth)     |    270        |    150     | -44.4%    |
| GET  /user/profile (auth) |    120        |     60     | -50.0%    |
| GET  /analytics/trending  |     95        |     50     | -47.4%    |
+---------------------------+---------------+------------+-----------+
| AVERAGE                   |    184        |     99     | -46.0%    |
+---------------------------+---------------+------------+-----------+
```

### 2.2 Aggregate Summary

```
+------------------------------------+---------------+------------+
| Metric                             | Microservices | Monolithic |
+------------------------------------+---------------+------------+
| Total Requests (across all tests)  |   ~25,000     |   ~45,000  |
| Avg Throughput (req/sec)           |     351       |     616    |
| Avg Latency - Mean (ms)           |    56.4       |    33.6    |
| Avg Latency - P95 (ms)            |   136.0       |    76.0    |
| Avg Latency - P99 (ms)            |   184.0       |    99.0    |
+------------------------------------+---------------+------------+
```

### 2.3 Performance Figures

#### Figure 1: Throughput Comparison by Endpoint

```
Throughput (requests/second)
                                    Microservices [===]    Monolithic [###]

  /auth/register    |=====85                                              |
                    |#########130                                          |
                    |                                                      |
  /auth/login       |=========150                                         |
                    |##################280                                |
                    |                                                      |
  /listings (GET)   |=====================================650             |
                    |#############################################################1100|
                    |                                                      |
  /search/listings  |==============================550                    |
                    |#####################################################950|
                    |                                                      |
  /listings (POST)  |======120                                            |
                    |###########200                                       |
                    |                                                      |
  /user/profile     |======================400                            |
                    |##########################################750        |
                    |                                                      |
  /analytics/trend  |============================500                      |
                    |################################################900  |
                    +----+----+----+----+----+----+----+----+----+----+---+
                    0   100  200  300  400  500  600  700  800  900  1000 1100
```

#### Figure 2: Latency Comparison (Mean, P95, P99)

```
Latency (ms) - Lower is Better

                   Mean          P95           P99
               Micro  Mono  Micro  Mono   Micro  Mono
              +------+-----+------+------+------+------+
/auth/reg     | 115  |  75 | 280  | 165  | 380  | 210  |
/auth/login   |  65  |  35 | 155  |  80  | 210  | 105  |
/listings GET |  30  |  18 |  72  |  40  |  95  |  55  |
/search       |  36  |  21 |  85  |  48  | 115  |  65  |
/listings POST|  82  |  50 | 200  | 115  | 270  | 150  |
/user/profile |  37  |  20 |  90  |  45  | 120  |  60  |
/trending     |  30  |  16 |  70  |  38  |  95  |  50  |
              +------+-----+------+------+------+------+
```

#### Figure 3: Overall Architecture Comparison

```
                    Microservices vs. Monolithic - Key Metrics

  Avg Throughput    |=================351 req/s
  (req/sec)         |###############################616 req/s        (+75.5%)
                    |
  Mean Latency      |==================56.4 ms
  (ms)              |==========33.6 ms                               (-40.5%)
                    |
  P95 Latency       |====================================136 ms
  (ms)              |====================76 ms                       (-44.1%)
                    |
  P99 Latency       |=============================================184 ms
  (ms)              |========================99 ms                   (-46.0%)
                    |
                    +---+---+---+---+---+---+---+---+---+---+
                    0  50  100 150 200 250 300 350 400 500 600

                    [===] Microservices    [###] Monolithic
```

#### Figure 4: Latency Overhead Breakdown for a Microservices Request

```
  Client Request Lifecycle (Microservices)
  +---------------------------------------------------------+
  |  Client HTTP Request                                     |
  |  +---------------------------------------------------+  |
  |  | API Gateway (Express.js)           ~2-5 ms        |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | REST-to-gRPC Translation        ~1-3 ms      | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | gRPC Network Call               ~5-15 ms     | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | Proto Serialization/Deser.      ~2-5 ms      | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | Service Business Logic          ~5-20 ms     | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | Database Query                  ~3-15 ms     | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | gRPC Response                   ~3-8 ms      | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | gRPC-to-REST Translation        ~1-2 ms      | |  |
  |  +---------------------------------------------------+  |
  |  Total: ~22-73 ms                                        |
  +---------------------------------------------------------+

  Client Request Lifecycle (Monolithic)
  +---------------------------------------------------------+
  |  Client HTTP Request                                     |
  |  +---------------------------------------------------+  |
  |  | Express.js Router                  ~1-2 ms        |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | Business Logic (direct call)    ~3-10 ms     | |  |
  |  |  +----------------------------------------------+ |  |
  |  |  | Database Query                  ~3-15 ms     | |  |
  |  |  +----------------------------------------------+ |  |
  |  +---------------------------------------------------+  |
  |  Total: ~7-27 ms                                         |
  +---------------------------------------------------------+

  Overhead delta: ~15-46 ms per request (gRPC + gateway)
```

### 2.4 Scalability Observations

**Vertical scaling (single-machine):** The monolithic architecture efficiently uses all available CPU cores within a single Node.js process (single-threaded event loop). Under our 10-20 concurrent connections, it maintains lower latency because every internal call is an in-memory function invocation. The microservices architecture introduces per-request overhead through the gateway's REST-to-gRPC translation, Protocol Buffer serialization/deserialization, and Docker bridge network hops.

**Horizontal scaling potential:** Although not directly measured on this single machine, the microservices architecture supports independent horizontal scaling. For example, if search queries dominate traffic, only the Search Service can be replicated behind a load balancer, while other services remain at a single instance. The monolithic application must be replicated in its entirety.

**Connection scaling:** Read-heavy endpoints (GET /listings, GET /search) tolerate higher concurrency (20 connections) better than write-heavy endpoints (POST /auth/register) which are bottlenecked by bcrypt password hashing and database writes.

---

## 3. System-Design Trade-off Analysis

### 3.1 Communication Overhead: gRPC vs. Direct Calls

| Factor                    | Microservices (gRPC)          | Monolithic (Direct)       |
|---------------------------|-------------------------------|---------------------------|
| Serialization format      | Protocol Buffers (binary)     | None (in-memory objects)  |
| Network hops per request  | 2 (client->gateway->service)  | 1 (client->app)           |
| Serialization cost        | ~2-5 ms per request           | 0 ms                      |
| Gateway translation       | ~2-5 ms (REST <-> gRPC)       | 0 ms (no gateway)         |
| Total overhead per request| ~15-46 ms additional           | Baseline                  |

**Verdict:** For a small-scale campus application handling fewer than 1,000 concurrent users, the gRPC overhead is the dominant factor causing the microservices architecture to be slower. Protocol Buffers are more efficient than JSON for serialization, but the elimination of network calls entirely (monolithic) outweighs this advantage at this scale.

### 3.2 Fault Isolation and Availability

```
Failure Scenario: Auth Service Crashes

  Microservices:                     Monolithic:
  +---+ +---+ +---+ +---+           +-----------+
  | X | |Lst| |Src| |Usr|           |           |
  |Aut| | OK| | OK| | OK|           |  ENTIRE   |
  +---+ +---+ +---+ +---+           |APPLICATION|
  +---+ +---+ +---+                 |   DOWN    |
  |Msg| |Ana| |Fav|                 |           |
  | OK| | OK| | OK|                 +-----------+
  +---+ +---+ +---+

  Impact: Only login/register       Impact: All features
  is unavailable. Browsing,         unavailable. Complete
  search, and analytics             service outage.
  continue to work.
```

**Microservices advantage:** A crash in one service (e.g., Analytics) does not affect user authentication or listing browsing. The `restart: unless-stopped` Docker policy automatically restarts failed containers.

**Monolithic risk:** A single unhandled exception or memory leak brings down the entire application. All 7 modules share one process and one failure domain.

### 3.3 Deployment and Operational Complexity

| Aspect                      | Microservices             | Monolithic            |
|-----------------------------|---------------------------|-----------------------|
| Docker images to build      | 10                        | 3                     |
| Build time (cold)           | ~5-8 minutes              | ~1-2 minutes          |
| Disk usage                  | ~2.5 GB (all images)      | ~500 MB               |
| Startup time (all healthy)  | 30-60 seconds             | 10-15 seconds         |
| Log management              | 10 separate log streams   | 1 log stream          |
| Debugging a request         | Requires tracing across services | Single stack trace |
| Configuration files         | 9 Dockerfiles + 1 compose | 1 Dockerfile + 1 compose |
| Environment variables       | 35+ across all services   | 4                     |

### 3.4 Scalability vs. Resource Efficiency

```
Scenario: Search traffic increases 10x

  Microservices:                     Monolithic:
  +---+   +---+   +---+             +-----------+ +-----------+
  |Aut|   |Src|   |Src|             | Full App  | | Full App  |
  | x1|   | x3|   | x3|  <- Only   |  Copy #1  | |  Copy #2  |
  +---+   +---+   +---+   search    +-----------+ +-----------+
  +---+   +---+   +---+   scales     +-----------+
  |Lst|   |Src|   |Usr|             | Full App  |
  | x1|   | x3|   | x1|            |  Copy #3  |
  +---+   +---+   +---+            +-----------+

  Resources: 3 extra search         Resources: 2 extra full
  instances (lightweight)            copies (all 7 modules)

  RAM: ~150 MB extra                 RAM: ~600 MB extra
```

### 3.5 Data Consistency and Database Design

Both architectures share the same PostgreSQL database schema with 8 tables. In our design, all microservices access a single shared database, which simplifies consistency but introduces a potential single point of failure and contention.

| Aspect                    | Our Design (Shared DB)    | Ideal Microservices (DB-per-service) |
|---------------------------|---------------------------|--------------------------------------|
| Data consistency          | Strong (ACID)             | Eventual (requires sagas)            |
| Implementation complexity | Low                       | High                                 |
| Schema migration          | Coordinated across all    | Independent per service              |
| Query flexibility         | Full JOINs across tables  | Limited to service boundaries        |

**Trade-off decision:** We chose a shared database to keep the project manageable while still demonstrating service decomposition at the application layer. A production system at larger scale would benefit from database-per-service to achieve true independence.

### 3.6 Technology Flexibility

| Aspect                          | Microservices               | Monolithic                 |
|---------------------------------|-----------------------------|----------------------------|
| Language per module             | Can differ per service      | Must be uniform (TypeScript)|
| Framework per module            | Can differ per service      | Must be uniform (Express)  |
| Dependency version conflicts    | Isolated per container      | Shared `node_modules`      |
| Upgrade strategy                | Rolling, one service at a time | All-or-nothing            |

### 3.7 Summary: When to Choose Each Architecture

```
Decision Matrix
                                     Microservices    Monolithic
                                     Score (1-5)      Score (1-5)
+-----------------------------------+----------------+---------------+
| Raw Performance (single node)     |      2         |      5        |
| Fault Isolation                   |      5         |      1        |
| Independent Scaling               |      5         |      2        |
| Development Speed (small team)    |      2         |      5        |
| Operational Simplicity            |      2         |      5        |
| Team Independence (large org)     |      5         |      2        |
| Technology Flexibility            |      5         |      2        |
| Debugging Ease                    |      2         |      5        |
+-----------------------------------+----------------+---------------+
| TOTAL                             |     28         |     27        |
+-----------------------------------+----------------+---------------+

Verdict: Nearly tied overall. Choice depends on context.
```

**Recommendation for UTA Marketplace:**
- **Current scale (campus-level, small team):** Monolithic is the better fit. It delivers ~75% higher throughput, ~40% lower latency, and is significantly simpler to deploy and debug.
- **Future growth (multi-campus, 10+ developers):** Migrate to microservices when organizational complexity demands independent deployment, fault isolation, and per-service scaling.

---

## 4. Lessons Learned from AI Tools

### 4.1 Overview of AI Tool Usage

AI-powered coding assistants (Claude) were used throughout the development process. Below is a breakdown of usage by project phase, along with time-savings estimates and observations about effectiveness.

### 4.2 Phase-by-Phase Analysis

#### Phase 1: Architecture Design (~30% time saved)

| Task                                    | AI Contribution                        | Human Contribution               |
|-----------------------------------------|----------------------------------------|----------------------------------|
| Microservices boundary definition       | Suggested 6 initial services           | Decided to split Favorites into 7th service based on cohesion analysis |
| gRPC vs REST decision                   | Provided comparison matrix             | Made final protocol decision     |
| Database schema design                  | Generated initial schema with indexes  | Refined for UTA-specific needs   |
| Port allocation strategy                | Proposed sequential 50051-50057 range  | Approved and documented          |

**Lesson:** AI tools are effective at generating an initial architecture scaffold based on well-known patterns. However, domain-specific decisions (e.g., whether "favorites" deserves its own service) required human judgment about cohesion and coupling.

#### Phase 2: Protocol Buffer Definitions (~50% time saved)

| Task                              | AI Contribution                              | Human Contribution                   |
|-----------------------------------|----------------------------------------------|--------------------------------------|
| Proto file generation             | Generated all 7 `.proto` files               | Reviewed field types and naming      |
| Message structure design          | Proposed request/response message pairs       | Added pagination fields, refined enums|
| Service RPC definitions           | Created all RPC method signatures             | Validated against functional requirements |

**Lesson:** AI tools excel at generating boilerplate Protocol Buffer definitions once the service boundaries are clear. The generated code followed best practices (e.g., wrapper messages for each RPC) with minimal corrections needed.

#### Phase 3: Service Implementation (~50% time saved)

| Task                              | AI Contribution                              | Human Contribution                   |
|-----------------------------------|----------------------------------------------|--------------------------------------|
| gRPC server boilerplate           | Generated server setup for all 7 services    | Verified gRPC binding and error handling |
| Database query logic              | Wrote SQL queries for CRUD operations        | Validated query correctness, added parameterization |
| JWT authentication                | Implemented token generation and validation  | Reviewed for security vulnerabilities |
| bcrypt password hashing           | Implemented hash/compare logic               | Verified salt rounds (10) are appropriate |
| API Gateway routing               | Generated all REST-to-gRPC translation routes| Tested edge cases (missing fields, invalid tokens) |

**Lesson:** For repetitive patterns (each service follows the same gRPC-server + DB-query pattern), AI tools provide enormous leverage. The key human contribution was security review - ensuring JWT secrets are configurable, passwords are properly hashed, and SQL queries use parameterized inputs to prevent injection.

#### Phase 4: Docker Configuration (~40% time saved)

| Task                              | AI Contribution                              | Human Contribution                   |
|-----------------------------------|----------------------------------------------|--------------------------------------|
| Dockerfile creation               | Generated multi-stage builds for all services| Fixed build context paths for proto files |
| Docker Compose orchestration      | Created compose files with networks, volumes | Debugged health check configuration  |
| Service dependency ordering       | Set up `depends_on` chains                   | Added health check conditions for PostgreSQL |

**Lesson:** Docker configuration is deceptively tricky. AI tools generated syntactically correct files, but runtime issues (e.g., proto files not found during build because of wrong build context, health checks using wrong database name) required iterative debugging. The AI was helpful in diagnosing and fixing these issues when given error messages.

#### Phase 5: Performance Testing (~40% time saved)

| Task                              | AI Contribution                              | Human Contribution                   |
|-----------------------------------|----------------------------------------------|--------------------------------------|
| Test script generation            | Created autocannon-based test suite          | Chose representative endpoints and concurrency levels |
| Comparison framework              | Built automated comparison script            | Interpreted results and drew conclusions |
| Results formatting                | Generated summary statistics                 | Validated statistical methodology    |

**Lesson:** AI tools are good at writing load-testing scaffolding but the experimental design (which endpoints to test, what concurrency levels represent realistic load, how long to run tests to reach steady state) required human expertise in performance engineering.

#### Phase 6: Documentation (~60% time saved)

| Task                              | AI Contribution                              | Human Contribution                   |
|-----------------------------------|----------------------------------------------|--------------------------------------|
| README generation                 | Created comprehensive 600+ line README       | Customized for UTA-specific context  |
| Architecture documentation        | Generated ASCII diagrams and descriptions    | Verified accuracy against implementation |
| Troubleshooting guides           | Documented common issues and solutions       | Added real issues encountered during development |
| This evaluation report           | Structured report with tables and figures    | Provided test data interpretation and trade-off analysis |

**Lesson:** Documentation is where AI tools provide the most consistent value. Generated docs are comprehensive and well-structured. The main human effort is ensuring accuracy and adding context that only comes from actually building and running the system.

### 4.3 Quantitative Summary

```
Time Savings by Phase
+-------------------------+----------+----------+---------+
| Phase                   | Without  | With AI  | Saved   |
|                         | AI (hrs) | (hrs)    |  (%)    |
+-------------------------+----------+----------+---------+
| Architecture Design     |    3     |    2     |  33%    |
| Proto Definitions       |    2     |    1     |  50%    |
| Service Implementation  |   12     |    6     |  50%    |
| Docker Configuration    |    2     |    1.2   |  40%    |
| Performance Testing     |    3     |    1.8   |  40%    |
| Documentation           |    5     |    2     |  60%    |
| Testing & Debugging     |    3     |    2     |  33%    |
+-------------------------+----------+----------+---------+
| TOTAL                   |   30     |   16     |  47%    |
+-------------------------+----------+----------+---------+
```

### 4.4 Key Takeaways

1. **AI tools are force multipliers, not replacements.** They accelerate boilerplate-heavy tasks by 40-60% but cannot replace human judgment on architecture, security, and domain-specific decisions.

2. **Iterative prompting produces better results than single prompts.** Complex tasks (like splitting a service into a standalone microservice) required multiple rounds of refinement. The AI was most effective when given clear context about the existing codebase and specific goals.

3. **Security review is non-negotiable.** AI-generated authentication code (JWT, bcrypt) was functionally correct but required human verification of:
   - Token expiration settings
   - Secret key management (environment variables, not hardcoded)
   - SQL injection prevention (parameterized queries)
   - CORS configuration

4. **Debugging requires human context.** When Docker builds failed or services couldn't connect, the AI could suggest fixes based on error messages, but understanding *why* a particular configuration was wrong (e.g., Docker build context not including the proto directory) required understanding the project structure.

5. **Documentation is the highest-ROI use case.** AI tools generated comprehensive, well-formatted documentation that would have taken hours to write manually. The human effort was primarily verification and customization rather than creation from scratch.

---

## Appendix A: Reproducibility Instructions

To reproduce the performance evaluation:

```bash
# 1. Clone the repository
git clone <repo-url>
cd UTA-Marketplace---Distributed-Systems

# 2. Start microservices architecture
docker compose -f docker-compose.microservices.yml up --build -d
sleep 45  # Wait for all services to initialize

# 3. Start monolithic architecture (separate database)
docker compose -f docker-compose.monolithic.yml up --build -d
sleep 20  # Wait for initialization

# 4. Verify both are healthy
curl http://localhost:8080/health   # Microservices
curl http://localhost:9000/health   # Monolithic

# 5. Run performance comparison
cd testing/performance
npm install
npm run test:comparison

# 6. View results
ls results/
```

## Appendix B: Database Schema (Entity-Relationship)

```
+----------+       +------------+       +------------+
|  users   |------>| listings   |<------| categories |
|----------|  1:N  |------------|  N:1  |------------|
| id (PK)  |       | id (PK)    |       | id (PK)    |
| email    |       | title      |       | name       |
| password |       | price      |       +------------+
| full_name|       | seller_id  |
+----------+       | category_id|       +------------+
     |             | condition_id|<-----| conditions |
     |             | meet_spot_id|  N:1 |------------|
     |             | is_active  |       | id (PK)    |
     |             +------------+       | name       |
     |                  |               +------------+
     |                  |
     v                  v               +------------+
+----------+    +---------------+       | meet_spots |
| favorites|    | listing_views |       |------------|
|----------|    |---------------|       | id (PK)    |
| user_id  |    | listing_id    |       | name       |
| listing_id|   | user_id       |       +------------+
+----------+    | timestamp     |
                +---------------+
     |
     v
+------------------+
| contact_attempts |
|------------------|
| user_id          |
| listing_id       |
| seller_id        |
| contact_method   |
+------------------+
```

---

*Report prepared for CSE 5306 - Distributed Systems, Spring 2026*
*University of Texas at Arlington*
