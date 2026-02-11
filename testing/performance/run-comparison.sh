#!/bin/bash

echo "============================================================"
echo "  UTA Marketplace - Architecture Performance Comparison"
echo "============================================================"
echo ""

RESULTS_DIR="./results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$RESULTS_DIR"

echo "📊 Starting performance tests..."
echo ""

echo "1️⃣  Testing Microservices Architecture (Port 8080)..."
echo "============================================================"
echo ""

if ! curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "❌ ERROR: Microservices gateway is not running on port 8080"
    echo "   Please start the microservices architecture first"
    exit 1
fi

echo "✅ Microservices gateway is running"
echo ""

node test-microservices.js > "$RESULTS_DIR/microservices_${TIMESTAMP}.txt" 2>&1
MICRO_EXIT_CODE=$?

if [ $MICRO_EXIT_CODE -ne 0 ]; then
    echo "❌ Microservices tests failed"
    cat "$RESULTS_DIR/microservices_${TIMESTAMP}.txt"
    exit 1
fi

echo "✅ Microservices tests completed"
echo ""
echo ""

echo "2️⃣  Testing Monolithic Architecture (Port 9000)..."
echo "============================================================"
echo ""

if ! curl -s http://localhost:9000/health > /dev/null 2>&1; then
    echo "❌ ERROR: Monolithic application is not running on port 9000"
    echo "   Please start the monolithic application first"
    exit 1
fi

echo "✅ Monolithic application is running"
echo ""

node test-monolithic.js > "$RESULTS_DIR/monolithic_${TIMESTAMP}.txt" 2>&1
MONO_EXIT_CODE=$?

if [ $MONO_EXIT_CODE -ne 0 ]; then
    echo "❌ Monolithic tests failed"
    cat "$RESULTS_DIR/monolithic_${TIMESTAMP}.txt"
    exit 1
fi

echo "✅ Monolithic tests completed"
echo ""
echo ""

echo "============================================================"
echo "  📊 GENERATING COMPARISON REPORT"
echo "============================================================"
echo ""

MICRO_FILE="$RESULTS_DIR/microservices_${TIMESTAMP}.txt"
MONO_FILE="$RESULTS_DIR/monolithic_${TIMESTAMP}.txt"
COMPARISON_FILE="$RESULTS_DIR/comparison_${TIMESTAMP}.txt"

cat > "$COMPARISON_FILE" << EOF
================================================================================
UTA MARKETPLACE - ARCHITECTURE PERFORMANCE COMPARISON
Generated: $(date)
================================================================================

MICROSERVICES ARCHITECTURE (Port 8080)
--------------------------------------------------------------------------------
EOF

grep -A 20 "SUMMARY REPORT:" "$MICRO_FILE" >> "$COMPARISON_FILE"

cat >> "$COMPARISON_FILE" << EOF

MONOLITHIC ARCHITECTURE (Port 9000)
--------------------------------------------------------------------------------
EOF

grep -A 20 "SUMMARY REPORT:" "$MONO_FILE" >> "$COMPARISON_FILE"

cat >> "$COMPARISON_FILE" << EOF

================================================================================
ANALYSIS
================================================================================

Compare the following metrics between architectures:

1. THROUGHPUT (req/sec) - Higher is better
   - Indicates how many requests the system can handle per second
   
2. LATENCY (ms) - Lower is better
   - Mean: Average response time
   - P95: 95% of requests completed within this time
   - P99: 99% of requests completed within this time

3. RESOURCE EFFICIENCY
   - Monolithic: Single process, direct function calls
   - Microservices: Multiple processes, network communication overhead

KEY OBSERVATIONS:
- Monolithic typically shows lower latency due to no network overhead
- Microservices show better scalability and fault isolation
- Database is shared, so DB performance affects both equally

================================================================================
FILES GENERATED:
- Microservices Results: $(basename "$MICRO_FILE")
- Monolithic Results: $(basename "$MONO_FILE")
- This Comparison: $(basename "$COMPARISON_FILE")
================================================================================
EOF

echo "✅ Comparison report generated"
echo ""
cat "$COMPARISON_FILE"
echo ""
echo "📁 Full results saved to:"
echo "   - $MICRO_FILE"
echo "   - $MONO_FILE"
echo "   - $COMPARISON_FILE"
echo ""
echo "✅ All tests completed successfully!"
