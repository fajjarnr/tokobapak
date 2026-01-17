# Payment Service

Payment Microservice built with Spring Boot 3.4 and Spring Cloud Stream Kafka.

## Features

- **Payment Processing**: Execute payments via simulated gateway
- **Event Driven**: 
  - Listens to `order.created` for initial payment record creation
  - Publishes `payment.processed` on successful payment
- **Database**: PostgreSQL with Flyway migrations
- **Architecture**: Idempotent design for safe retries

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
| POST | `/api/v1/payments/process` | Process payment for order |

## Events

### Consumed Events

**Topic:** `order.created`

### Published Events

**Topic:** `payment.events`

```json
{
  "paymentId": "uuid",
  "orderId": "uuid",
  "status": "COMPLETED",
  "transactionId": "tx-123",
  "amount": 100.00
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
