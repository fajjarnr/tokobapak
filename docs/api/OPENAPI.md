# OpenAPI Documentation

The following endpoints are available across the microservices.

## 1. Product Service
**Base URL:** `http://localhost:3001`
**Swagger UI:** `http://localhost:3001/api/docs`

### Endpoints
- `GET /api/v1/products` - List products with pagination, filtering
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/slug/:slug` - Get product by slug
- `POST /api/v1/products` - Create new product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

## 2. Catalog Service
**Base URL:** `http://localhost:3002`

### Endpoints
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/:id` - Get category details
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category
- `GET /api/v1/brands` - List brands
- `POST /api/v1/brands` - Create brand
- ... (Standard CRUD for Brands)

## 3. Cart Service
**Base URL:** `http://localhost:3003`
**Swagger UI:** `http://localhost:3003/api/docs`

### Endpoints
- `GET /api/v1/cart?userId={id}` - Get user cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/:productId` - Update item quantity
- `DELETE /api/v1/cart/items/:productId` - Remove item
- `DELETE /api/v1/cart` - Clear entire cart
