# Docker Setup for Billor

This document provides instructions for running the Billor application using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd bilor
   ```

2. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

3. **Start the application**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Swagger Documentation: http://localhost:3001/api
   - PostgreSQL: localhost:5432

## Configuration

### Environment Variables

Edit the `.env` file to customize your setup:

```bash
# Database Configuration
POSTGRES_DB=bilor
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Application Ports
BACKEND_PORT=3001
FRONTEND_PORT=3000
```

### Frontend Configuration

Edit `frontend/.env` for frontend-specific settings:

```bash
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Billor
VITE_APP_VERSION=1.0.0
```

## Development vs Production

The current setup is optimized for production deployment. For development:

1. **Development with hot reload** (backend only):
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```

2. **Frontend development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Docker Commands

### Starting Services
```bash
# Start all services in background
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up postgres backend
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes your database)
docker-compose down -v
```

### Viewing Logs
```bash
# View all logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f backend

# View logs for all services with timestamps
docker-compose logs -t
```

### Database Operations
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d bilor

# View database logs
docker-compose logs postgres

# Backup database
docker-compose exec postgres pg_dump -U postgres bilor > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d bilor < backup.sql
```

## Health Checks

The services include health checks:

- **PostgreSQL**: Checks database connectivity
- **Backend**: Checks HTTP endpoint health (when implemented)

Check service health:
```bash
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000, 3001, or 5432 are in use, modify the ports in `.env`

2. **Database connection issues**: 
   - Ensure PostgreSQL is healthy: `docker-compose ps`
   - Check backend logs: `docker-compose logs backend`

3. **Build failures**:
   ```bash
   # Rebuild services
   docker-compose build --no-cache
   
   # Rebuild specific service
   docker-compose build --no-cache backend
   ```

4. **Database persists after `down`**: Data persists in Docker volumes
   ```bash
   # Remove volumes to start fresh
   docker-compose down -v
   ```

### Reset Everything
```bash
# Stop services, remove containers, and volumes
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Start fresh
docker-compose up -d
```

## Production Deployment

For production deployment:

1. **Update environment variables** with production values
2. **Use external database** by modifying `DATABASE_HOST` in backend service
3. **Add reverse proxy** (nginx/traefik) for HTTPS termination
4. **Set up monitoring** and log aggregation
5. **Configure backups** for PostgreSQL data

## Architecture

The Docker setup includes:

- **Frontend**: React app served by nginx
- **Backend**: NestJS API server
- **Database**: PostgreSQL 15
- **Network**: Isolated Docker network for service communication
- **Volumes**: Persistent storage for PostgreSQL data