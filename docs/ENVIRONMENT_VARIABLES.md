# TokoBapak Environment Variables

This document provides a complete reference for all environment variables used across TokoBapak microservices.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Infrastructure Services](#infrastructure-services)
3. [Backend Services](#backend-services)
4. [Frontend Application](#frontend-application)
5. [Production Considerations](#production-considerations)

---

## Quick Start

For local development, copy each `.env.example` to `.env`:

```bash
# For each service
cp backend/services/product-service/.env.example backend/services/product-service/.env
# ... repeat for other services
```

Or use the provided Docker Compose which sets all variables:

```bash
cd infrastructure/docker
podman-compose up -d
```

---

## Infrastructure Services

### PostgreSQL

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `POSTGRES_USER` | `postgres` | Yes | Database superuser |
| `POSTGRES_PASSWORD` | `postgres` | Yes | Database password |
| `POSTGRES_DB` | `tokobapak` | Yes | Default database |

**Port:** `5432`

### Redis

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `REDIS_PASSWORD` | (none) | No | Redis auth password |

**Port:** `6379`

### Kafka

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `KAFKA_BROKER_ID` | `1` | Yes | Broker identifier |
| `KAFKA_ZOOKEEPER_CONNECT` | `zookeeper:2181` | Yes | Zookeeper connection |
| `KAFKA_ADVERTISED_LISTENERS` | See below | Yes | Listener configuration |
| `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR` | `1` | Yes | Topic replication |

**Ports:** 
- Internal: `29092`
- External: `9092`

### Elasticsearch

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `discovery.type` | `single-node` | Yes | Cluster mode |
| `ES_JAVA_OPTS` | `-Xms512m -Xmx512m` | No | JVM memory |
| `xpack.security.enabled` | `false` | No | Security mode |

**Ports:**
- HTTP: `9200`
- Transport: `9300`

### Zookeeper

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `ZOOKEEPER_CLIENT_PORT` | `2181` | Yes | Client connection port |
| `ZOOKEEPER_TICK_TIME` | `2000` | Yes | Tick interval (ms) |

---

## Backend Services

### Auth Service (Java Spring Boot)

**Port:** `3005`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3005` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `JWT_SECRET` | (generated) | Yes | JWT signing secret |
| `JWT_EXPIRATION` | `3600000` | No | Access token expiry (ms) |
| `JWT_REFRESH_EXPIRATION` | `604800000` | No | Refresh token expiry (ms) |
| `CORS_ORIGIN` | `*` | No | Allowed CORS origins |

### User Service (Java Spring Boot)

**Port:** `3006`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3006` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `AUTH_SERVICE_URL` | `http://auth-service:3005` | Yes | Auth service URL |

### Product Service (NestJS)

**Port:** `3001`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3001` | Yes | Server port |
| `NODE_ENV` | `development` | Yes | Environment mode |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `DB_NAME` | `tokobapak_products` | Yes | Database name |
| `CORS_ORIGIN` | `http://localhost:3000` | No | Allowed CORS origins |

### Catalog Service (Go)

**Port:** `3002`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3002` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USER` | `postgres` | Yes | Database username |
| `DB_PASS` | `postgres` | Yes | Database password |
| `DB_NAME` | `tokobapak_catalog` | Yes | Database name |
| `REDIS_HOST` | `localhost` | No | Redis host for caching |
| `REDIS_PORT` | `6379` | No | Redis port |

### Cart Service (NestJS)

**Port:** `3003`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3003` | Yes | Server port |
| `NODE_ENV` | `development` | Yes | Environment mode |
| `REDIS_HOST` | `localhost` | Yes | Redis host |
| `REDIS_PORT` | `6379` | Yes | Redis port |
| `CORS_ORIGIN` | `http://localhost:3000` | No | Allowed CORS origins |
| `AUTH_SERVICE_URL` | `http://auth-service:3005` | Yes | Auth service URL |

### Order Service (Java Spring Boot)

**Port:** `3007`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3007` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka brokers |
| `PRODUCT_SERVICE_URL` | `http://product-service:3001` | Yes | Product service URL |
| `INVENTORY_SERVICE_URL` | `http://inventory-service:3011` | Yes | Inventory service URL |

### Payment Service (Java Spring Boot)

**Port:** `3008`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3008` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka brokers |
| `MIDTRANS_SERVER_KEY` | (secret) | Prod | Midtrans API key |
| `MIDTRANS_CLIENT_KEY` | (secret) | Prod | Midtrans client key |
| `MIDTRANS_IS_PRODUCTION` | `false` | No | Use sandbox mode |
| `PAYMENT_CALLBACK_URL` | `https://api.tokobapak.id/webhooks/payment` | Prod | Webhook URL |

### Shipping Service (Go)

**Port:** `3009`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3009` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USER` | `postgres` | Yes | Database username |
| `DB_PASS` | `postgres` | Yes | Database password |
| `DB_NAME` | `tokobapak_shipping` | Yes | Database name |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka brokers |
| `RAJAONGKIR_API_KEY` | (secret) | Prod | RajaOngkir API key |
| `JNE_API_KEY` | (secret) | Prod | JNE courier API |
| `SICEPAT_API_KEY` | (secret) | Prod | SiCepat courier API |

### Notification Service (NestJS)

**Port:** `3004`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3004` | Yes | Server port |
| `NODE_ENV` | `development` | Yes | Environment mode |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka brokers |
| `REDIS_HOST` | `localhost` | Yes | Redis for Bull queue |
| `REDIS_PORT` | `6379` | Yes | Redis port |
| `SMTP_HOST` | `smtp.gmail.com` | Prod | SMTP server |
| `SMTP_PORT` | `587` | Prod | SMTP port |
| `SMTP_USER` | (secret) | Prod | SMTP username |
| `SMTP_PASS` | (secret) | Prod | SMTP password |
| `FIREBASE_PROJECT_ID` | (secret) | Prod | Firebase for push |
| `FIREBASE_PRIVATE_KEY` | (secret) | Prod | Firebase key |

### Search Service (NestJS + Elasticsearch)

**Port:** `3010`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3010` | Yes | Server port |
| `NODE_ENV` | `development` | Yes | Environment mode |
| `ELASTICSEARCH_URL` | `http://localhost:9200` | Yes | Elasticsearch URL |
| `ELASTICSEARCH_USERNAME` | (none) | Prod | ES username |
| `ELASTICSEARCH_PASSWORD` | (none) | Prod | ES password |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka for sync |

### Seller Service (NestJS)

**Port:** `3012`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3012` | Yes | Server port |
| `NODE_ENV` | `development` | Yes | Environment mode |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `DB_NAME` | `tokobapak_sellers` | Yes | Database name |

### Promotion Service (Java Spring Boot)

**Port:** `3013`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3013` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Yes | Database username |
| `DB_PASSWORD` | `postgres` | Yes | Database password |
| `REDIS_HOST` | `localhost` | No | Redis for voucher cache |
| `REDIS_PORT` | `6379` | No | Redis port |

### Inventory Service (Go)

**Port:** `3011`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3011` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USER` | `postgres` | Yes | Database username |
| `DB_PASS` | `postgres` | Yes | Database password |
| `DB_NAME` | `tokobapak_inventory` | Yes | Database name |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka brokers |

### Review Service (Go)

**Port:** `3014`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3014` | Yes | Server port |
| `DB_HOST` | `localhost` | Yes | PostgreSQL host |
| `DB_PORT` | `5432` | Yes | PostgreSQL port |
| `DB_USER` | `postgres` | Yes | Database username |
| `DB_PASS` | `postgres` | Yes | Database password |
| `DB_NAME` | `tokobapak_reviews` | Yes | Database name |
| `KAFKA_BOOTSTRAP_SERVERS` | `kafka:29092` | Yes | Kafka brokers |

### Chat Service (NestJS + Socket.io)

**Port:** `3015`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3015` | Yes | Server port |
| `NODE_ENV` | `development` | Yes | Environment mode |
| `REDIS_HOST` | `localhost` | Yes | Redis for pub/sub |
| `REDIS_PORT` | `6379` | Yes | Redis port |
| `MONGODB_URI` | `mongodb://localhost:27017/chat` | Yes | MongoDB connection |
| `JWT_SECRET` | (from auth) | Yes | JWT verification |

### Media Service (Go)

**Port:** `3016`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3016` | Yes | Server port |
| `STORAGE_TYPE` | `local` | Yes | `local`, `s3`, `r2` |
| `STORAGE_PATH` | `/uploads` | Local | Local storage path |
| `S3_BUCKET` | (secret) | S3 | S3 bucket name |
| `S3_REGION` | `ap-southeast-1` | S3 | S3 region |
| `S3_ACCESS_KEY` | (secret) | S3 | AWS access key |
| `S3_SECRET_KEY` | (secret) | S3 | AWS secret key |
| `R2_ACCOUNT_ID` | (secret) | R2 | Cloudflare account |
| `R2_ACCESS_KEY` | (secret) | R2 | R2 access key |
| `R2_SECRET_KEY` | (secret) | R2 | R2 secret key |
| `MAX_FILE_SIZE` | `10485760` | No | Max upload (10MB) |
| `ALLOWED_TYPES` | `image/*,video/mp4` | No | Allowed MIME types |

---

## Frontend Application

### Next.js Frontend

**Port:** `3000`

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Yes | API Gateway URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3015` | No | WebSocket for chat |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | (secret) | Prod | Google OAuth |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | (secret) | Prod | Facebook OAuth |
| `NEXT_TELEMETRY_DISABLED` | `1` | No | Disable telemetry |
| `NODE_ENV` | `production` | Prod | Environment mode |

---

## API Gateway (Nginx)

**Port:** `8080`

Configuration is done in `nginx.conf`, not environment variables.

Key settings:
- Upstream services defined in config
- CORS headers configured globally
- Rate limiting enabled
- SSL termination (production)

---

## Production Considerations

### Security Checklist

1. **Never commit** `.env` files with production secrets
2. **Rotate** JWT secrets and API keys regularly
3. **Use** strong passwords (min 16 chars)
4. **Enable** HTTPS/TLS in production
5. **Restrict** CORS origins to your domain

### Secret Management

For production, use:
- **Kubernetes Secrets**
- **Docker Secrets**
- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Google Secret Manager**

### Example Production .env

```bash
# NEVER commit this file!

# Database
DB_HOST=prod-db.internal
DB_PASSWORD=<strong-random-password>

# JWT
JWT_SECRET=<256-bit-random-string>

# Payment Gateway
MIDTRANS_SERVER_KEY=<production-key>
MIDTRANS_IS_PRODUCTION=true

# Cloud Storage
S3_ACCESS_KEY=<aws-iam-key>
S3_SECRET_KEY=<aws-iam-secret>

# Email
SMTP_USER=noreply@tokobapak.id
SMTP_PASS=<app-specific-password>
```

### Port Summary

| Service | Port |
|---------|------|
| Frontend | 3000 |
| Product Service | 3001 |
| Catalog Service | 3002 |
| Cart Service | 3003 |
| Notification Service | 3004 |
| Auth Service | 3005 |
| User Service | 3006 |
| Order Service | 3007 |
| Payment Service | 3008 |
| Shipping Service | 3009 |
| Search Service | 3010 |
| Inventory Service | 3011 |
| Seller Service | 3012 |
| Promotion Service | 3013 |
| Review Service | 3014 |
| Chat Service | 3015 |
| Media Service | 3016 |
| API Gateway | 8080 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Kafka | 9092 |
| Elasticsearch | 9200 |

---

*Last Updated: January 2026*
