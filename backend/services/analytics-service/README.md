# Analytics Service

Business Analytics Microservice for TokoBapak powered by FastAPI.

## Features

- **Event Tracking**: Track page views, product views, cart adds, purchases
- **Sales Metrics**: Revenue, orders, average order value
- **Product Analytics**: Views, conversion rates, top products
- **Dashboard API**: Aggregated business metrics

## Tech Stack

- Python 3.12
- FastAPI
- Pydantic 2.x

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/analytics/track` | Track an event |
| GET | `/api/v1/analytics/dashboard` | Get dashboard metrics |
| GET | `/api/v1/analytics/sales` | Get sales metrics |
| GET | `/api/v1/analytics/products/top` | Get top products |
| GET | `/api/v1/analytics/products/{id}` | Get product analytics |
| GET | `/health` | Health check |

## Event Types

- `page_view` - General page view
- `product_view` - Product detail view
- `add_to_cart` - Add to cart action
- `purchase` - Completed purchase

## Running Locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3017
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3017 | Service port |
