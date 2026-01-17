-- TokoBapak Database Initialization
-- Creates databases for all microservices

CREATE DATABASE tokobapak_products;
CREATE DATABASE tokobapak_catalog;
CREATE DATABASE tokobapak_users;
CREATE DATABASE tokobapak_orders;
CREATE DATABASE tokobapak_payments;
CREATE DATABASE tokobapak_shipping;
CREATE DATABASE tokobapak_reviews;
CREATE DATABASE tokobapak_inventory;
CREATE DATABASE tokobapak_sellers;

-- Grant permissions (if using different users per service in production)
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_users TO user_service;
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_products TO product_service;
