# Catalog Service

Go-based microservice for managing categories and brands.

## Technology Stack

- **Language:** Go 1.22+
- **Router:** Chi v5
- **Database:** PostgreSQL
- **Architecture:** Clean Architecture

## Project Structure

```
catalog-service/
├── cmd/server/main.go      # Application entrypoint
├── internal/
│   ├── domain/             # Business entities & interfaces
│   ├── usecase/            # Business logic
│   ├── repository/postgres/# Database layer
│   └── delivery/http/      # HTTP handlers
├── migrations/             # SQL migrations
├── docs/                   # Swagger documentation
├── Dockerfile
├── go.mod
└── go.sum
```

## Getting Started

### Prerequisites
- Go 1.22+
- PostgreSQL (or Docker)

### Configuration

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=tokobapak_catalog
NODE_ENV=development
```

### Run

```bash
# Development
go run cmd/server/main.go

# Build
go build -o server cmd/server/main.go
./server
```

### Docker

```bash
docker build -t tokobapak/catalog-service .
docker run -p 3002:3002 tokobapak/catalog-service
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/categories/:id` | Get category |
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| GET | `/api/v1/brands` | List brands |
| GET | `/api/v1/brands/:id` | Get brand |
| POST | `/api/v1/brands` | Create brand |
| PUT | `/api/v1/brands/:id` | Update brand |
| DELETE | `/api/v1/brands/:id` | Delete brand |

### Swagger UI
http://localhost:3002/swagger/index.html

## Testing

```bash
go test ./...
```

## Linting

```bash
go vet ./...
golint ./...
```
