# Review Service

Product Reviews & Ratings Microservice built with Go and Chi Router.

## Features

- **Review Management**: Full CRUD for product reviews
- **Rating System**: 1-5 star ratings with statistics
- **Product Stats**: Aggregate ratings per product (average, count per star)
- **Helpful Votes**: Mark reviews as helpful
- **Verified Purchases**: Flag reviews from verified orders

## Tech Stack

- Go 1.22
- Chi Router
- PostgreSQL (pgx)

## API Endpoints

### Reviews

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/reviews` | Create review |
| GET | `/api/v1/reviews/{id}` | Get review by ID |
| PUT | `/api/v1/reviews/{id}` | Update review |
| DELETE | `/api/v1/reviews/{id}` | Delete review |
| POST | `/api/v1/reviews/{id}/helpful` | Mark as helpful |

### Product Reviews

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/products/{productId}/reviews` | Get product reviews |
| GET | `/api/v1/products/{productId}/reviews/stats` | Get rating statistics |

## Running Locally

```bash
# Set environment variables
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/tokobapak_reviews?sslmode=disable"
export PORT="3010"

# Run
go run cmd/server/main.go
```

## Docker

```bash
docker build -t review-service .
docker run -p 3010:3010 review-service
```
