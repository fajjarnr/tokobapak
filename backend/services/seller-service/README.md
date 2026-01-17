# Seller Service

Seller Management Microservice for TokoBapak.

## Features

- **Seller Registration**: Create seller accounts
- **Seller Profiles**: Store name, logo, description
- **Status Management**: PENDING, ACTIVE, SUSPENDED, REJECTED
- **Verification**: Verify sellers
- **Stats Tracking**: Total products, sales count, ratings

## Tech Stack

- Node.js 20+
- NestJS 10
- TypeORM
- PostgreSQL

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/sellers` | Register a seller |
| GET | `/api/v1/sellers` | List sellers |
| GET | `/api/v1/sellers/:id` | Get seller by ID |
| GET | `/api/v1/sellers/user/:userId` | Get seller by user ID |
| PUT | `/api/v1/sellers/:id` | Update seller |
| PATCH | `/api/v1/sellers/:id/status` | Update seller status |
| PATCH | `/api/v1/sellers/:id/verify` | Verify seller |
| GET | `/health` | Health check |

## Seller Status

- `PENDING` - Awaiting approval
- `ACTIVE` - Approved and active
- `SUSPENDED` - Temporarily suspended
- `REJECTED` - Registration rejected

## Running Locally

```bash
npm install
npm run start:dev
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3016 | Service port |
| DATABASE_URL | - | PostgreSQL connection string |
