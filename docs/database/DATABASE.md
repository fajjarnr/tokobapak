# TokoBapak Database Documentation

This document provides comprehensive database documentation including ERD, schema details, and data dictionary for all microservices.

## Table of Contents

1. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram)
2. [Service-wise Database Schema](#service-wise-database-schema)
3. [Data Dictionary](#data-dictionary)
4. [Cross-Service Relationships](#cross-service-relationships)

---

## Entity Relationship Diagram

### Complete System ERD (Mermaid)

```mermaid
erDiagram
    %% ============================================
    %% USER SERVICE (auth-service)
    %% ============================================
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string name
        string phone
        string avatar_url
        enum role "CUSTOMER, SELLER, ADMIN"
        boolean is_verified
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% CATALOG SERVICE
    %% ============================================
    CATEGORIES {
        uuid id PK
        string name
        string slug UK
        text description
        uuid parent_id FK
        string image_url
        string icon_url
        int display_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    BRANDS {
        uuid id PK
        string name
        string slug UK
        string logo_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% PRODUCT SERVICE
    %% ============================================
    PRODUCTS {
        uuid id PK
        uuid seller_id FK
        string name
        string slug UK
        text description
        decimal price
        decimal discount_price
        uuid category_id FK
        uuid brand_id FK
        enum status "DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK"
        jsonb attributes
        decimal weight
        jsonb dimensions
        int view_count
        decimal rating
        int review_count
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        string sku UK
        string name
        decimal price
        int stock
        jsonb attributes
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_MEDIA {
        uuid id PK
        uuid product_id FK
        string url
        enum type "IMAGE, VIDEO"
        int order
        string alt
        timestamp created_at
    }

    %% ============================================
    %% SELLER SERVICE
    %% ============================================
    SELLERS {
        uuid id PK
        uuid user_id FK UK
        string store_name
        text store_description
        string logo_url
        string banner_url
        string email
        string phone
        string address
        string city
        string province
        string postal_code
        enum status "PENDING, ACTIVE, SUSPENDED, REJECTED"
        decimal rating
        int total_products
        int total_sales
        boolean verified
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% ORDER SERVICE
    %% ============================================
    ORDERS {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        enum status "PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED"
        text shipping_address
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        string product_id FK
        string product_name
        int quantity
        decimal price
        decimal subtotal
    }

    %% ============================================
    %% PAYMENT SERVICE
    %% ============================================
    PAYMENTS {
        uuid id PK
        uuid order_id FK UK
        uuid user_id FK
        decimal amount
        enum status "PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED"
        string payment_method
        string transaction_id
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% PROMOTION SERVICE
    %% ============================================
    PROMOTIONS {
        uuid id PK
        string name
        text description
        enum type "PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING"
        decimal discount_value
        decimal min_purchase
        decimal max_discount
        timestamp start_date
        timestamp end_date
        int usage_limit
        int used_count
        enum status "DRAFT, ACTIVE, EXPIRED, DISABLED"
        timestamp created_at
        timestamp updated_at
    }

    VOUCHERS {
        uuid id PK
        uuid promotion_id FK
        string code UK
        uuid user_id FK
        boolean is_used
        timestamp used_at
        timestamp created_at
    }

    %% ============================================
    %% CART SERVICE (Redis-based, shown for reference)
    %% ============================================
    CARTS {
        string user_id PK
        jsonb items
        decimal total_price
        int total_items
        timestamp updated_at
    }

    CART_ITEMS {
        uuid id PK
        string cart_id FK
        uuid product_id FK
        uuid variant_id FK
        int quantity
        decimal price
        timestamp added_at
    }

    %% ============================================
    %% REVIEW SERVICE
    %% ============================================
    REVIEWS {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        uuid order_id FK
        int rating
        text comment
        jsonb images
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% SHIPPING SERVICE
    %% ============================================
    SHIPMENTS {
        uuid id PK
        uuid order_id FK UK
        string courier_code
        string courier_name
        string service_type
        string tracking_number
        enum status "PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, RETURNED"
        decimal shipping_cost
        text origin_address
        text destination_address
        timestamp estimated_delivery
        timestamp actual_delivery
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================
    
    %% User relationships
    USERS ||--o{ ORDERS : "places"
    USERS ||--o| SELLERS : "becomes"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ PAYMENTS : "makes"
    USERS ||--o{ VOUCHERS : "receives"
    
    %% Category relationships
    CATEGORIES ||--o{ CATEGORIES : "has subcategories"
    CATEGORIES ||--o{ PRODUCTS : "contains"
    
    %% Brand relationships
    BRANDS ||--o{ PRODUCTS : "manufactures"
    
    %% Seller relationships
    SELLERS ||--o{ PRODUCTS : "sells"
    
    %% Product relationships
    PRODUCTS ||--o{ PRODUCT_VARIANTS : "has"
    PRODUCTS ||--o{ PRODUCT_MEDIA : "has"
    PRODUCTS ||--o{ REVIEWS : "receives"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    
    %% Order relationships
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o| PAYMENTS : "paid by"
    ORDERS ||--o| SHIPMENTS : "shipped via"
    ORDERS ||--o{ REVIEWS : "triggers"
    
    %% Promotion relationships
    PROMOTIONS ||--o{ VOUCHERS : "generates"
    
    %% Cart relationships
    CARTS ||--o{ CART_ITEMS : "contains"
```

---

## Service-wise Database Schema

### 1. Auth Service (PostgreSQL: `tokobapak_users`)

#### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, AUTO | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| name | VARCHAR(100) | NOT NULL | Full name |
| phone | VARCHAR(20) | NULL | Phone number |
| avatar_url | VARCHAR(500) | NULL | Profile picture URL |
| role | ENUM | NOT NULL, DEFAULT 'CUSTOMER' | User role |
| is_verified | BOOLEAN | NOT NULL, DEFAULT false | Email verified |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Account active |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**
- `idx_users_email` (email)
- `idx_users_role` (role)

---

### 2. Catalog Service (PostgreSQL: `tokobapak_catalog`)

#### Table: `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Category name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly slug |
| description | TEXT | NULL | Category description |
| parent_id | UUID | FK → categories(id), NULL | Parent category |
| image_url | VARCHAR(500) | NULL | Category image |
| icon_url | VARCHAR(500) | NULL | Category icon |
| display_order | INTEGER | DEFAULT 0 | Sort order |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### Table: `brands`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Brand name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly slug |
| logo_url | VARCHAR(500) | NULL | Brand logo |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

---

### 3. Product Service (PostgreSQL: `tokobapak_products`)

#### Table: `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| seller_id | UUID | NOT NULL, INDEX | Seller reference |
| name | VARCHAR(255) | NOT NULL | Product name |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| description | TEXT | NOT NULL | Product description |
| price | DECIMAL(15,2) | NOT NULL | Base price in IDR |
| discount_price | DECIMAL(15,2) | NULL | Discounted price |
| category_id | UUID | NOT NULL, INDEX | Category reference |
| brand_id | UUID | NULL | Brand reference |
| status | ENUM | NOT NULL, DEFAULT 'DRAFT' | Product status |
| attributes | JSONB | NULL | Custom attributes |
| weight | DECIMAL(8,2) | DEFAULT 0 | Weight in kg |
| dimensions | JSONB | NULL | L x W x H in cm |
| view_count | INTEGER | DEFAULT 0 | View statistics |
| rating | DECIMAL(3,2) | DEFAULT 0 | Average rating |
| review_count | INTEGER | DEFAULT 0 | Total reviews |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Indexes:**
- `idx_products_seller` (seller_id)
- `idx_products_category` (category_id)
- `idx_products_status` (status)
- `idx_products_slug` (slug)

#### Table: `product_variants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK → products(id), NOT NULL | Parent product |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Stock keeping unit |
| name | VARCHAR(100) | NOT NULL | Variant name |
| price | DECIMAL(15,2) | NULL | Override price |
| stock | INTEGER | DEFAULT 0 | Available stock |
| attributes | JSONB | NULL | Variant attributes |
| is_active | BOOLEAN | DEFAULT true | Active status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

#### Table: `product_media`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK → products(id), NOT NULL | Parent product |
| url | VARCHAR(500) | NOT NULL | Media URL |
| type | ENUM | DEFAULT 'IMAGE' | IMAGE or VIDEO |
| order | INTEGER | DEFAULT 0 | Display order |
| alt | TEXT | NULL | Alt text |
| created_at | TIMESTAMP | NOT NULL | Creation time |

---

### 4. Seller Service (PostgreSQL: `tokobapak_sellers`)

#### Table: `sellers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | UNIQUE, NOT NULL | User reference |
| store_name | VARCHAR(100) | NOT NULL | Store name |
| store_description | TEXT | NULL | Store description |
| logo_url | VARCHAR(500) | NULL | Store logo |
| banner_url | VARCHAR(500) | NULL | Store banner |
| email | VARCHAR(255) | NOT NULL | Business email |
| phone | VARCHAR(20) | NOT NULL | Business phone |
| address | TEXT | NULL | Full address |
| city | VARCHAR(100) | NULL | City |
| province | VARCHAR(100) | NULL | Province |
| postal_code | VARCHAR(10) | NULL | Postal code |
| status | ENUM | DEFAULT 'PENDING' | Seller status |
| rating | DECIMAL(3,2) | DEFAULT 0 | Average rating |
| total_products | INTEGER | DEFAULT 0 | Product count |
| total_sales | INTEGER | DEFAULT 0 | Sales count |
| verified | BOOLEAN | DEFAULT false | Verified seller |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

---

### 5. Order Service (PostgreSQL: `tokobapak_orders`)

#### Table: `orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | NOT NULL, INDEX | User reference |
| total_amount | DECIMAL(15,2) | NOT NULL | Order total in IDR |
| status | ENUM | NOT NULL | Order status |
| shipping_address | TEXT | NOT NULL | Delivery address |
| created_at | TIMESTAMP | NOT NULL | Order time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Status Values:** `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

#### Table: `order_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | FK → orders(id), NOT NULL | Parent order |
| product_id | VARCHAR(36) | NOT NULL | Product reference |
| product_name | VARCHAR(255) | NOT NULL | Product name snapshot |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| price | DECIMAL(15,2) | NOT NULL | Unit price snapshot |
| subtotal | DECIMAL(15,2) | NOT NULL | Line total |

---

### 6. Payment Service (PostgreSQL: `tokobapak_payments`)

#### Table: `payments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | UNIQUE, NOT NULL | Order reference |
| user_id | UUID | NOT NULL, INDEX | User reference |
| amount | DECIMAL(15,2) | NOT NULL | Payment amount |
| status | ENUM | NOT NULL | Payment status |
| payment_method | VARCHAR(50) | NULL | Payment method |
| transaction_id | VARCHAR(100) | NULL | Gateway transaction ID |
| created_at | TIMESTAMP | NOT NULL | Payment time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Status Values:** `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `REFUNDED`

---

### 7. Promotion Service (PostgreSQL: `tokobapak_promotions`)

#### Table: `promotions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Promotion name |
| description | TEXT | NULL | Description |
| type | ENUM | NOT NULL | Discount type |
| discount_value | DECIMAL(15,2) | NOT NULL | Discount value |
| min_purchase | DECIMAL(15,2) | DEFAULT 0 | Minimum purchase |
| max_discount | DECIMAL(15,2) | NULL | Maximum discount |
| start_date | TIMESTAMP | NOT NULL | Start time |
| end_date | TIMESTAMP | NOT NULL | End time |
| usage_limit | INTEGER | NULL | Max usage |
| used_count | INTEGER | DEFAULT 0 | Current usage |
| status | ENUM | DEFAULT 'DRAFT' | Promotion status |
| created_at | TIMESTAMP | NOT NULL | Creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Type Values:** `PERCENTAGE`, `FIXED_AMOUNT`, `FREE_SHIPPING`

#### Table: `vouchers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| promotion_id | UUID | FK → promotions(id), NOT NULL | Parent promotion |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Voucher code |
| user_id | UUID | NULL | Assigned user |
| is_used | BOOLEAN | DEFAULT false | Usage status |
| used_at | TIMESTAMP | NULL | Usage time |
| created_at | TIMESTAMP | NOT NULL | Creation time |

---

### 8. Cart Service (Redis)

**Key Pattern:** `cart:{userId}`

```json
{
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "variantId": "uuid|null",
      "name": "Product Name",
      "price": 150000,
      "quantity": 2,
      "image": "url"
    }
  ],
  "totalPrice": 300000,
  "totalItems": 2,
  "updatedAt": "2026-01-17T10:00:00Z"
}
```

---

## Data Dictionary

### Enum Types

#### UserRole
| Value | Description |
|-------|-------------|
| CUSTOMER | Regular buyer |
| SELLER | Store owner |
| ADMIN | Platform administrator |

#### ProductStatus
| Value | Description |
|-------|-------------|
| DRAFT | Not published yet |
| ACTIVE | Available for sale |
| INACTIVE | Temporarily hidden |
| OUT_OF_STOCK | No stock available |

#### OrderStatus
| Value | Description |
|-------|-------------|
| PENDING | Waiting for payment |
| CONFIRMED | Payment received |
| PROCESSING | Being prepared |
| SHIPPED | In transit |
| DELIVERED | Successfully delivered |
| CANCELLED | Order cancelled |

#### PaymentStatus
| Value | Description |
|-------|-------------|
| PENDING | Waiting for payment |
| PROCESSING | Payment being processed |
| COMPLETED | Payment successful |
| FAILED | Payment failed |
| REFUNDED | Money returned |

#### SellerStatus
| Value | Description |
|-------|-------------|
| PENDING | Application review |
| ACTIVE | Approved seller |
| SUSPENDED | Temporarily disabled |
| REJECTED | Application rejected |

---

## Cross-Service Relationships

Since TokoBapak uses microservices architecture, relationships between services are **eventually consistent** and linked by UUID references.

### Reference Mapping

| Service A | Field | References | Service B |
|-----------|-------|------------|-----------|
| product-service | seller_id | → | seller-service.sellers.id |
| product-service | category_id | → | catalog-service.categories.id |
| product-service | brand_id | → | catalog-service.brands.id |
| order-service | user_id | → | auth-service.users.id |
| order-service | product_id | → | product-service.products.id |
| payment-service | order_id | → | order-service.orders.id |
| seller-service | user_id | → | auth-service.users.id |

### Event-Driven Sync

Data consistency is maintained through Kafka events:

```
order.created → payment-service (create pending payment)
payment.completed → order-service (update order status)
order.confirmed → inventory-service (reserve stock)
order.shipped → notification-service (send tracking)
```

---

## Database Diagram Visualization

To view the ERD diagram:

1. **GitHub**: Copy the Mermaid code block and paste in any `.md` file
2. **VS Code**: Install "Mermaid Preview" extension
3. **Online**: Use [Mermaid Live Editor](https://mermaid.live/)

---

*Last Updated: January 2026*
