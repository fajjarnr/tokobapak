# Search Service

Full-text Search Microservice for TokoBapak powered by Elasticsearch.

## Features

- **Full-text Search**: Search products with fuzzy matching
- **Faceted Search**: Filter by category, brand, price range
- **Auto-suggest**: Type-ahead suggestions for product names
- **Relevance Scoring**: Results ranked by relevance
- **Pagination**: Paginated search results

## Tech Stack

- Node.js 20+
- NestJS 10
- Elasticsearch 8.x
- @elastic/elasticsearch client

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/search/products` | Search products |
| POST | `/api/v1/search/products` | Index a product |
| DELETE | `/api/v1/search/products/:id` | Remove from index |
| GET | `/api/v1/search/suggest?q=` | Auto-suggestions |
| GET | `/health` | Health check |

## Search Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| query | string | Search query |
| category | string | Filter by category |
| brand | string | Filter by brand |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| page | number | Page number (default: 1) |
| pageSize | number | Results per page (default: 10) |

## Running Locally

```bash
npm install
npm run start:dev
```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| PORT | 3012 | Service port |
| ELASTICSEARCH_NODE | http://localhost:9200 | Elasticsearch URL |
