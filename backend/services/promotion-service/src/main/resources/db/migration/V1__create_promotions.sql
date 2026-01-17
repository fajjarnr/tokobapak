-- V1: Create promotions and vouchers tables
CREATE TYPE promo_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');
CREATE TYPE promo_status AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'DISABLED');

CREATE TABLE promotions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type promo_type NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    status promo_status DEFAULT 'DRAFT',
    applicable_products TEXT[], -- Array of product IDs
    applicable_categories TEXT[], -- Array of category IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vouchers (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    promotion_id UUID REFERENCES promotions(id),
    user_id UUID, -- NULL for public vouchers
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    order_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_user_id ON vouchers(user_id);
