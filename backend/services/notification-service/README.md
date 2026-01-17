# Notification Service

Notification Microservice for TokoBapak - Email, SMS, and Push Notifications powered by NestJS and BullMQ.

## Features

- **Email Notifications**: Send transactional emails (order confirmation, payment success)
- **SMS Notifications**: Send SMS alerts to customers
- **Push Notifications**: Send push notifications to mobile apps
- **Job Queues**: Background job processing with BullMQ and Redis
- **Event-Driven**: Consumes events from Kafka (order, payment, shipment)

## Tech Stack

- Node.js 20+
- NestJS 10
- BullMQ (Redis-based queue)
- KafkaJS
- Nodemailer (for email)

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/notifications/email` | Send email notification |
| POST | `/api/v1/notifications/sms` | Send SMS notification |
| POST | `/api/v1/notifications/push` | Send push notification |
| GET | `/health` | Health check |

## Kafka Topics Consumed

- `order.created` - Triggers order confirmation email
- `payment.events` - Triggers payment success/failure notification
- `shipment.events` - Triggers shipment status updates

## Running Locally

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3009 | Service port |
| REDIS_HOST | localhost | Redis host for BullMQ |
| REDIS_PORT | 6379 | Redis port |
| KAFKA_BROKERS | localhost:9092 | Kafka brokers |
