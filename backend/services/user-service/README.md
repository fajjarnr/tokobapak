# User Service

TokoBapak User Management Microservice built with Spring Boot 3.4.

## Technology Stack

- **Java** 21 LTS
- **Spring Boot** 3.4.1
- **Spring Data JPA** with Hibernate
- **PostgreSQL** 16
- **Flyway** for database migrations
- **Lombok** for boilerplate reduction
- **SpringDoc OpenAPI** for API documentation

## Running Locally

### Prerequisites

- Java 21+
- Maven 3.9+
- PostgreSQL running on port 5432

### Development

```bash
# Start the service
./mvnw spring-boot:run

# Or with custom database
DB_HOST=localhost DB_PORT=5432 ./mvnw spring-boot:run
```

### Build

```bash
./mvnw clean package
```

### Run with Podman

```bash
# Build image
podman build -t tokobapak/user-service -f Containerfile .

# Run container
podman run -d \
  --name user-service \
  -p 3006:3006 \
  -e DB_HOST=host.containers.internal \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  tokobapak/user-service
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Create new user |
| GET | `/api/v1/users/{id}` | Get user by ID |
| GET | `/api/v1/users/email/{email}` | Get user by email |
| GET | `/api/v1/users` | List all users (paginated) |
| PUT | `/api/v1/users/{id}` | Update user |
| DELETE | `/api/v1/users/{id}` | Soft delete user |
| POST | `/api/v1/users/{id}/verify` | Verify user |
| GET | `/api/v1/users/exists?email=` | Check email exists |

## API Documentation

Swagger UI: http://localhost:3006/swagger-ui.html

OpenAPI JSON: http://localhost:3006/api-docs

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | 3006 | Server port |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USERNAME` | postgres | Database username |
| `DB_PASSWORD` | postgres | Database password |

## Database Schema

The service uses Flyway migrations located in `src/main/resources/db/migration/`.

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email |
| password_hash | VARCHAR(255) | BCrypt hashed password |
| name | VARCHAR(100) | User's full name |
| phone | VARCHAR(20) | Phone number |
| avatar_url | TEXT | Profile picture URL |
| role | ENUM | CUSTOMER, SELLER, ADMIN |
| is_verified | BOOLEAN | Email verified flag |
| is_active | BOOLEAN | Soft delete flag |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |
