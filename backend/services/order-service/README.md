# Order Service

Order Management Microservice built with Spring Boot 3.4 and Spring Cloud Stream Kafka.

## Features

- **Order Management**: Create, view, and list orders
- **Event Driven**: Publishes `OrderCreatedEvent` to Kafka `order.created` topic
- **Database**: PostgreSQL with Flyway migrations
- **Architecture**: Domain-Driven Design (DDD) principles

## Tech Stack

- Java 21
- Spring Boot 3.4.1
- Spring Data JPA
- Spring Cloud Stream Kafka
- PostgreSQL
- Flyway
- Lombok
- SpringDoc OpenAPI

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders` | Create new order |
| GET | `/api/v1/orders/{id}` | Get order details |
| GET | `/api/v1/orders/user/{userId}` | Get user orders |

## Events

### Published Events

**Topic:** `order.created`

```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "totalAmount": 100.00,
  "status": "CREATED",
  "createdAt": "2024-01-17T10:00:00"
}
```

## Running Locally

```bash
# Start infrastructure
cd ../../../infrastructure/docker
podman-compose up -d postgres kafka zookeeper

# Run service
./mvnw spring-boot:run
```
