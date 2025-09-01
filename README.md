# Billor - Projects & Notes App

A full-stack application for managing projects and notes with server-driven behaviors.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Containerization**: Docker + Docker Compose

## Getting Started

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install - frontend backend database

# Set up environment variables
# Copy .env.example to .env in root folder and configure as needed

# Bootstrap and run Docker containers
npm run bootstrap

# Run Docker instances
docker compose up -d --build
# This will start all required services
```

## Access URLs

- **Swagger API Documentation**: http://localhost:3001/api#/
- **Frontend Application**: http://localhost:3002/

## Environment Setup

The application works with default settings, but you can customize:

```bash
cp .env.example .env
# Edit the .env file as needed
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
