# TokoBapak API Reference

Complete API documentation for all backend microservices.

---

## Base URLs

| Environment | Product Service | Catalog Service | Cart Service |
|-------------|-----------------|-----------------|--------------|
| Development | `http://localhost:3001` | `http://localhost:3002` | `http://localhost:3003` |
| Production | `https://api.tokobapak.id/products` | `https://api.tokobapak.id/catalog` | `https://api.tokobapak.id/cart` |

---

## Authentication

> ⚠️ **Note**: Authentication is not yet implemented in MVP. All endpoints are currently public.

Future implementation will use:
- **Bearer Token**: JWT in `Authorization` header
- **Format**: `Authorization: Bearer <token>`

---

## Common Response Formats

### Success Response
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-01-16T10:00:00.000Z",
  "path": "/api/v1/products"
}
```

### Pagination Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 12
}
```

---

# Product Service API

Base Path: `/api/v1/products`

## Endpoints

### GET /api/v1/products

List all products with pagination and filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 12 | Items per page |
| `categoryId` | uuid | - | Filter by category |
| `status` | enum | ACTIVE | Product status filter |

**Status Values:** `DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/products?page=1&limit=10&status=ACTIVE"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sellerId": "seller-001",
      "name": "iPhone 15 Pro Max",
      "slug": "iphone-15-pro-max-abc123",
      "description": "Latest iPhone with A17 Pro chip",
      "price": 24999000,
      "discountPrice": 23999000,
      "categoryId": "electronics-001",
      "brandId": "apple-001",
      "status": "ACTIVE",
      "weight": 0.22,
      "viewCount": 1500,
      "rating": 4.8,
      "reviewCount": 250,
      "media": [
        {
          "id": "media-001",
          "url": "https://storage.tokobapak.id/products/iphone15.jpg",
          "type": "IMAGE",
          "order": 0
        }
      ],
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-16T08:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

---

### GET /api/v1/products/:id

Get a single product by ID. Also increments view count.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Product ID |

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/products/550e8400-e29b-41d4-a716-446655440000"
```

**Response:** Full product object with variants and media.

---

### GET /api/v1/products/slug/:slug

Get a product by its URL-friendly slug.

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/products/slug/iphone-15-pro-max-abc123"
```

---

### POST /api/v1/products

Create a new product.

**Request Body:**

```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "Flagship Samsung smartphone with S Pen",
  "price": 21999000,
  "discountPrice": 20999000,
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "brandId": "550e8400-e29b-41d4-a716-446655440002",
  "status": "DRAFT",
  "weight": 0.23,
  "dimensions": {
    "length": 16.2,
    "width": 7.9,
    "height": 0.86
  },
  "attributes": {
    "color": "Titanium Gray",
    "storage": "256GB",
    "ram": "12GB"
  }
}
```

**Validation Rules:**

| Field | Required | Validation |
|-------|----------|------------|
| `name` | Yes | Max 255 chars |
| `description` | Yes | Text |
| `price` | Yes | Min 0 |
| `categoryId` | Yes | Valid UUID |
| `brandId` | No | Valid UUID |
| `status` | No | Enum value |
| `weight` | No | Min 0 |

**Example Request:**
```bash
curl -X POST "http://localhost:3001/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test","price":10000,"categoryId":"uuid"}'
```

**Response:** Created product object with generated ID and slug.

---

### PUT /api/v1/products/:id

Update an existing product.

**Request Body:** Same as POST (all fields optional)

**Example Request:**
```bash
curl -X PUT "http://localhost:3001/api/v1/products/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"price":22999000,"status":"ACTIVE"}'
```

---

### DELETE /api/v1/products/:id

Delete a product.

**Response:** `204 No Content`

**Example Request:**
```bash
curl -X DELETE "http://localhost:3001/api/v1/products/550e8400-e29b-41d4-a716-446655440000"
```

---

# Catalog Service API

## Categories

Base Path: `/api/v1/categories`

### GET /api/v1/categories

List categories with cursor-based pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cursor` | string | "" | Pagination cursor (RFC3339 timestamp) |
| `num` | integer | 10 | Number of items |

**Example Request:**
```bash
curl -X GET "http://localhost:3002/api/v1/categories?num=10"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "cat-001",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices and gadgets",
      "parentId": null,
      "imageUrl": "https://storage.tokobapak.id/categories/electronics.jpg",
      "iconUrl": "https://storage.tokobapak.id/icons/electronics.svg",
      "displayOrder": 1,
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "nextCursor": "2026-01-01T00:00:00Z"
}
```

---

### GET /api/v1/categories/:id

Get category by ID.

---

### POST /api/v1/categories

Create a new category.

**Request Body:**
```json
{
  "name": "Smartphones",
  "slug": "smartphones",
  "description": "Mobile phones and accessories",
  "parentId": "cat-001",
  "imageUrl": "https://example.com/image.jpg",
  "displayOrder": 1,
  "isActive": true
}
```

---

### PUT /api/v1/categories/:id

Update a category.

---

### DELETE /api/v1/categories/:id

Delete a category.

---

## Brands

Base Path: `/api/v1/brands`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/brands` | List all brands |
| GET | `/api/v1/brands/:id` | Get brand by ID |
| POST | `/api/v1/brands` | Create brand |
| PUT | `/api/v1/brands/:id` | Update brand |
| DELETE | `/api/v1/brands/:id` | Delete brand |

### Brand Schema

```json
{
  "id": "brand-001",
  "name": "Apple",
  "slug": "apple",
  "logoUrl": "https://storage.tokobapak.id/brands/apple.png",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

# Cart Service API

Base Path: `/api/v1/cart`

> **Note**: User identification is done via `userId` query parameter. In production, this will be extracted from JWT token.

### GET /api/v1/cart

Get the current user's cart.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier |

**Example Request:**
```bash
curl -X GET "http://localhost:3003/api/v1/cart?userId=user-123"
```

**Example Response:**
```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "variantId": "variant-001",
      "quantity": 2,
      "price": 24999000,
      "addedAt": "2026-01-16T09:00:00.000Z"
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 1,
      "price": 5999000,
      "addedAt": "2026-01-16T09:30:00.000Z"
    }
  ],
  "updatedAt": "2026-01-16T09:30:00.000Z"
}
```

---

### POST /api/v1/cart/items

Add an item to the cart.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | Yes |

**Request Body:**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "variantId": "variant-001",
  "quantity": 1,
  "price": 24999000
}
```

**Validation Rules:**

| Field | Required | Validation |
|-------|----------|------------|
| `productId` | Yes | Valid UUID |
| `variantId` | No | String |
| `quantity` | Yes | Min 1 |
| `price` | Yes | Min 0 |

**Example Request:**
```bash
curl -X POST "http://localhost:3003/api/v1/cart/items?userId=user-123" \
  -H "Content-Type: application/json" \
  -d '{"productId":"uuid","quantity":1,"price":24999000}'
```

**Behavior:**
- If item already exists (same productId + variantId), quantity is **added**
- If item is new, it's added to the cart

---

### PUT /api/v1/cart/items/:productId

Update item quantity.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | uuid | Product to update |

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | Yes |

**Request Body:**
```json
{
  "quantity": 3
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:3003/api/v1/cart/items/uuid?userId=user-123" \
  -H "Content-Type: application/json" \
  -d '{"quantity":3}'
```

---

### DELETE /api/v1/cart/items/:productId

Remove an item from the cart.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier |
| `variantId` | string | No | Specific variant to remove |

**Example Request:**
```bash
curl -X DELETE "http://localhost:3003/api/v1/cart/items/uuid?userId=user-123"
```

---

### DELETE /api/v1/cart

Clear the entire cart.

**Query Parameters:**

| Parameter | Type | Required |
|-----------|------|----------|
| `userId` | string | Yes |

**Example Request:**
```bash
curl -X DELETE "http://localhost:3003/api/v1/cart?userId=user-123"
```

**Response:** `204 No Content`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error |

---

## Rate Limiting

> **Note**: Rate limiting is not implemented in MVP.

Production limits (planned):
- **Anonymous**: 100 requests/minute
- **Authenticated**: 1000 requests/minute

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-16 | Initial MVP release |

---

*Generated: January 2026*
