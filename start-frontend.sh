#!/bin/bash

echo "=========================================="
echo "Starting UTA Marketplace Frontend"
echo "=========================================="
echo ""

cd frontend

echo "Starting web server on http://localhost:3000"
echo ""
echo "Make sure your backend is running:"
echo "  • Microservices: http://localhost:8080"
echo "  • Monolithic:    http://localhost:9000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

node serve.js
