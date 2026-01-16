# Cart Service

NestJS-based microservice for managing user shopping carts with high-performance Redis storage.

## Technology Stack

- **Framework:** NestJS 11
- **Storage:** Redis
- **Client:** ioredis
- **Validation:** class-validator

## Project Structure

```
cart-service/
├── src/
│   ├── cart/
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── interfaces/        # Domain interfaces
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── cart.module.ts
│   ├── common/                # Shared logic (filters, etc.)
│   ├── config/                # Configuration
│   └── main.ts                # Entrypoint
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 22+
- Redis (or Docker)

### Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3003
REDIS_HOST=localhost
REDIS_PORT=6379
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
docker build -t tokobapak/cart-service .
docker run -p 3003:3003 tokobapak/cart-service
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/cart` | Get current cart |
| POST | `/api/v1/cart/items` | Add item to cart |
| PUT | `/api/v1/cart/items/:id` | Update item quantity |
| DELETE | `/api/v1/cart/items/:id` | Remove item from cart |
| DELETE | `/api/v1/cart` | Clear entire cart |

### Swagger UI
http://localhost:3003/api/docs

## Cache Policy
- Cart data is stored in Redis as JSON.
- Carts have a TTL (Time-To-Live) of 30 days of inactivity.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```
