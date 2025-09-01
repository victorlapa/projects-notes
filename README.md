# Billor - Projects & Notes App

A full-stack application for managing projects and notes with server-driven behaviors.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Containerization**: Docker + Docker Compose

## 🚀 First Time Setup (Fresh Clone)

For a completely fresh installation from a clean clone:

```bash
# Clone the repository
git clone <repository-url>
cd bilor

# Bootstrap the entire application (database + services)
npm run bootstrap
```

This single command will:
- Remove any existing containers and volumes
- Build all Docker images from scratch
- Start PostgreSQL database with fresh schema
- Seed database with sample data (2 users, 2 projects, 5 notes)
- Start backend API server
- Start frontend React application

**Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

## Quick Start (Subsequent Runs)

After initial setup, use these commands:

```bash
# Start all services
npm run dev

# Stop all services
npm run stop

# Clean everything (remove containers and volumes)
npm run clean
```

## Environment Setup (Optional)

The application works with default settings, but you can customize:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
# Edit the .env files as needed
```

## Local Development

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
Set up PostgreSQL locally or use the Docker PostgreSQL service:
```bash
docker-compose up postgres -d
```

## Features

- Project and note management
- Search and pagination
- Idempotency with ETags
- Cursor-based pagination
- RESTful API with Swagger documentation
- Responsive React frontend

## Documentation

- [Docker Setup Guide](README.Docker.md) - Detailed Docker instructions
- [API Documentation](http://localhost:3001/api) - Available when backend is running