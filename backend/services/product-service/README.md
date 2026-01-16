# Product Service

NestJS-based microservice for managing the product catalog, variants, and media.

## Technology Stack

- **Framework:** NestJS 11
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Documentation:** Swagger/OpenAPI

## Project Structure

```
product-service/
├── src/
│   ├── modules/
│   │   └── products/           # Core product logic
│   │       ├── dto/           # Data Transfer Objects
│   │       ├── entities/      # TypeORM entities
│   │       ├── products.controller.ts
│   │       ├── products.service.ts
│   │       └── products.module.ts
│   ├── common/                # Shared logic (filters, etc.)
│   ├── config/                # App & Database configuration
│   └── main.ts                # Entrypoint
├── test/                      # E2E tests
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL (or Docker)

### Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tokobapak_products
CORS_ORIGIN=http://localhost:3000
```

### Run

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod
```

### Docker

```bash
docker build -t tokobapak/product-service .
docker run -p 3001:3001 tokobapak/product-service
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/products` | List products with pagination |
| GET | `/api/v1/products/:id` | Get product details |
| GET | `/api/v1/products/slug/:slug` | Get product by slug |
| POST | `/api/v1/products` | Create product |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |

### Swagger UI
http://localhost:3001/api/docs

## Development

### Global Validation
Uses `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.

### Error Handling
Uses a global `HttpExceptionFilter` to standardize error responses and hide internal details in production.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
