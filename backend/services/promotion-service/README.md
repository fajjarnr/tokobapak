# Promotion Service

Promotions & Vouchers Microservice for TokoBapak built with Spring Boot.

## Features

- **Promotions**: Create and manage promotional campaigns
- **Voucher Codes**: Generate and validate voucher codes
- **Discount Types**: Percentage, fixed amount, free shipping
- **Validation**: Min purchase, max discount, expiry dates
- **Usage Tracking**: Track voucher usage and limits

## Tech Stack

- Java 21
- Spring Boot 3.4
- Spring Data JPA
- PostgreSQL
- Flyway Migrations

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/promotions` | Create promotion |
| GET | `/api/v1/promotions` | List promotions |
| GET | `/api/v1/promotions/active` | Get active promotions |
| PATCH | `/api/v1/promotions/{id}/activate` | Activate promotion |
| POST | `/api/v1/promotions/{id}/vouchers` | Create voucher |
| POST | `/api/v1/promotions/vouchers/apply` | Apply voucher |
| GET | `/actuator/health` | Health check |

## Promotion Types

- `PERCENTAGE` - Percentage off order total
- `FIXED_AMOUNT` - Fixed amount off
- `FREE_SHIPPING` - Free shipping discount

## Running Locally

```bash
./mvnw spring-boot:run
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3018 | Service port |
| DATABASE_URL | - | PostgreSQL JDBC URL |
