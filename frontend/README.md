# UTA Marketplace Frontend

A simple, clean frontend for the UTA Marketplace distributed systems project.

## Features

- **Architecture Toggle**: Switch between Microservices (port 8080) and Monolithic (port 9000) backends
- **User Authentication**: Login with JWT token-based authentication
- **Search & Browse**: Search listings by keyword and filter by category
- **User Profile**: View your profile information
- **Favorites**: Save and manage favorite listings
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### 1. Start the Backend

**Microservices** (recommended):
```bash
cd ..
docker compose -f docker-compose.microservices.yml up -d
```

**Monolithic** (optional, for comparison):
```bash
cd ..
docker compose -f docker-compose.monolithic.yml up -d
```

### 2. Start the Frontend Server

From the project root:
```bash
./start-frontend.sh
```

Or manually:
```bash
cd frontend
node serve.js
```

### 3. Open in Browser

Navigate to: **http://localhost:3000**

## Default Users

The following test users are available:

- **Email**: alice@uta.edu | **Password**: password123
- **Email**: bob@uta.edu | **Password**: password123
- **Email**: carol@uta.edu | **Password**: password123

## Architecture Comparison

The frontend allows you to easily compare the two backend architectures:

1. **Microservices Architecture** (Port 8080)
   - 8 separate containers (6 gRPC services + API Gateway + PostgreSQL)
   - Services: Auth, Listing, Search, User, Messaging, Analytics
   - Better scalability and fault isolation

2. **Monolithic Architecture** (Port 9000)
   - 2 containers (Monolithic app + PostgreSQL)
   - All services in one codebase
   - Simpler deployment and development

**To switch**: Use the radio buttons in the header

## File Structure

```
frontend/
├── index.html      # Main HTML page
├── styles.css      # All styling
├── app.js          # Frontend logic and API calls
├── serve.js        # Simple HTTP server
└── README.md       # This file
```

## Troubleshooting

### Frontend won't load
- Make sure you're running the server: `./start-frontend.sh`
- Check that port 3000 isn't already in use

### Can't connect to backend
- Ensure Docker containers are running: `docker ps`
- Check backend health: `curl http://localhost:8080/health`

### Login fails
- Verify password hash was updated in database
- Check backend logs: `docker logs uta-marketplace-auth`

## License

Part of the UTA Marketplace distributed systems project.
