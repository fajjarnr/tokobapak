# TokoBapak Infrastructure

Local development infrastructure using Podman Compose.

## Prerequisites

- [Podman](https://podman.io/getting-started/installation) 4.0+
- [Podman Compose](https://github.com/containers/podman-compose) 1.0+

## Quick Start

```bash
cd infrastructure/local

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

| Service | Port | Technology | Description | Status |
|---------|------|------------|-------------|--------|
| PostgreSQL | 5432 | postgres:18-alpine | Primary DB (RDS t4g.micro di AWS) | infra |
| Redis | 6379 | redis:alpine | Cache (ElastiCache t4g.micro) | infra |
| Kafka + Zookeeper | 9092 | cp-kafka:7.5.0 1 broker | Event bus (self-host Strimzi) | infra |
| Elasticsearch | 9200 | elasticsearch:8.17.0 | Search index `products` | infra |
| Auth Service | 3007 | Go 1.27 | JWT BFF | MVP keep |
| User Service | 3006 | Go 1.27 | Users role SELLER | MVP keep |
| Product Service | 3001 | Go 1.27 | Products merge catalog+inventory | MVP keep |
| Cart Service | 3003 | Go 1.27 + go-redis | Cart TTL 7 hari | MVP keep |
| Order Service | 3004 | Go 1.27 Saga | Order reserve | MVP keep |
| Payment Service | 3005 | Go 1.27 → PayU SNAP-BI | Thin adapter PayU | MVP keep |
| Shipping Service | 3008 | Go 1.27 | Mock flat | MVP keep |
| Search Service | 3010 | Go 1.27 + go-elasticsearch | Search | MVP keep |
| Notification Service | 3009 | Go 1.27 | Kafka consumer | MVP keep |
| Traefik | 8080 | traefik:v3.3 | ALB→Traefik (cloud) | MVP |

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
