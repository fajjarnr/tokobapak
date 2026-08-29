-- TokoBapak Database Initialization — MVP 9 services (ADR 0001)
-- Industry: database names lowercase snake_case, project_service pattern
-- MVP keep: products (merge catalog+inventory), users (auth+user share), orders, payments, shipping
-- HIDDEN 9 per ADR 0001 (enabled=false): catalog standalone, inventory standalone, sellers, promotions, reviews, chat, media, recommendation, analytics — NOT created in MVP
CREATE DATABASE tokobapak_products;
CREATE DATABASE tokobapak_users;
CREATE DATABASE tokobapak_orders;
CREATE DATABASE tokobapak_payments;
CREATE DATABASE tokobapak_shipping;

-- Grant permissions (if using different users per service in production)
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_users TO user_service;
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_products TO product_service;
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_orders TO order_service;
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_payments TO payment_service;
-- GRANT ALL PRIVILEGES ON DATABASE tokobapak_shipping TO shipping_service;
