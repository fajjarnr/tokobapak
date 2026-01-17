# Auth Service

TokoBapak Authentication Microservice built with Spring Boot 3.4 and Spring Security 6.

## Technology Stack

- **Java** 21 LTS
- **Spring Boot** 3.4.1
- **Spring Security** 6.x
- **JJWT** 0.12.6 for JWT handling
- **PostgreSQL** 16 (shared with User Service)
- **Lombok** for boilerplate reduction
- **SpringDoc OpenAPI** for API documentation

## Running Locally

### Prerequisites

- Java 21+
- Maven 3.9+
- PostgreSQL running on port 5432
- User Service database migrated (users table exists)

### Development

```bash
# Start the service
./mvnw spring-boot:run

# Or with custom configuration
DB_HOST=localhost JWT_SECRET=your-secret-key ./mvnw spring-boot:run
```

### Build

```bash
./mvnw clean package
```

### Run with Podman

```bash
# Build image
podman build -t tokobapak/auth-service -f Containerfile .

# Run container
podman run -d \
  --name auth-service \
  -p 3007:3007 \
  -e DB_HOST=host.containers.internal \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e JWT_SECRET=your-super-secret-key-minimum-32-chars \
  tokobapak/auth-service
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/validate` | Validate JWT token |
| POST | `/api/v1/auth/logout` | Logout (stateless) |

## API Documentation

Swagger UI: http://localhost:3007/swagger-ui.html

OpenAPI JSON: http://localhost:3007/api-docs

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | 3007 | Server port |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USERNAME` | postgres | Database username |
| `DB_PASSWORD` | postgres | Database password |
| `JWT_SECRET` | (required) | JWT signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRATION` | 900000 | Access token expiry (ms) - 15 min |
| `JWT_REFRESH_EXPIRATION` | 604800000 | Refresh token expiry (ms) - 7 days |

## JWT Token Structure

### Access Token Claims

```json
{
  "sub": "user@example.com",
  "userId": "uuid",
  "role": "ROLE_CUSTOMER",
  "type": "access",
  "iss": "tokobapak-auth",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token Claims

```json
{
  "sub": "user@example.com",
  "userId": "uuid",
  "type": "refresh",
  "iss": "tokobapak-auth",
  "iat": 1234567890,
  "exp": 1235172690
}
```

## Usage Examples

### Login

```bash
curl -X POST http://localhost:3007/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CUSTOMER"
  }
}
```

### Refresh Token

```bash
curl -X POST http://localhost:3007/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIs..."}'
```

### Validate Token

```bash
curl http://localhost:3007/api/v1/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```
