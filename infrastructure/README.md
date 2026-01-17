# TokoBapak Infrastructure

Local development infrastructure using Podman Compose.

## Prerequisites

- [Podman](https://podman.io/getting-started/installation) 4.0+
- [Podman Compose](https://github.com/containers/podman-compose) 1.0+

## Quick Start

```bash
cd infrastructure/docker

# Start all infrastructure (PostgreSQL + Redis)
podman-compose up -d postgres redis

# Start all services
podman-compose up -d

# View logs
podman-compose logs -f

# Stop all services
podman-compose down
```

## Services

| Service | Port | Technology | Description |
|---------|------|------------|-------------|
| PostgreSQL | 5432 | PostgreSQL 16 | Primary database |
| Redis | 6379 | Redis Alpine | Cache & sessions |
| User Service | 3006 | Spring Boot | User management |
| Auth Service | 3007 | Spring Boot | JWT authentication |
| Product Service | 3001 | NestJS | Product catalog |
| Catalog Service | 3002 | Go | Categories & brands |
| Cart Service | 3003 | NestJS | Shopping cart |

## Database Access

```bash
# Connect to PostgreSQL
podman exec -it tokobapak_postgres psql -U postgres

# List databases
\l

# Connect to users database
\c tokobapak_users
```

## Environment Variables

Create `.env` file in this directory:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT (Auth Service)
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
```

## Useful Commands

```bash
# Rebuild a specific service
podman-compose build user-service

# View service logs
podman-compose logs -f user-service

# Restart a service
podman-compose restart auth-service

# Remove volumes (CAUTION: deletes data)
podman-compose down -v
```

## Health Checks

All services expose health endpoints:

- User Service: http://localhost:3006/actuator/health
- Auth Service: http://localhost:3007/actuator/health
- Product Service: http://localhost:3001/health
- Catalog Service: http://localhost:3002/health
- Cart Service: http://localhost:3003/health

## API Documentation

| Service | Swagger UI |
|---------|------------|
| User Service | http://localhost:3006/swagger-ui.html |
| Auth Service | http://localhost:3007/swagger-ui.html |
| Product Service | http://localhost:3001/api |
