-- V6: Add Multi-Tenancy Support

-- Churches table
CREATE TABLE churches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    logo_url VARCHAR(500),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly NUMERIC(10,2),
    price_annual NUMERIC(10,2),
    max_members INT NOT NULL DEFAULT -1,
    max_users INT NOT NULL DEFAULT -1,
    max_storage_mb INT DEFAULT 1000,
    features TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Church subscriptions
CREATE TABLE church_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL REFERENCES churches(id),
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    billing_cycle VARCHAR(20),
    start_date DATE,
    end_date DATE,
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add church_id to users
ALTER TABLE users ADD COLUMN church_id BIGINT REFERENCES churches(id);

-- Add church_id to all data tables
ALTER TABLE members ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE donations ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE tithes ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE offerings ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE expenses ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE budgets ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE funds ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE fund_transactions ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE pledges ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE financial_goals ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE receipts ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE cash_flow_entries ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE audit_logs ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE notifications ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;

-- Add church_id to other tables
ALTER TABLE departments ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE attendance ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE prayer_requests ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE events ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE announcements ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE goal_contributions ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;
ALTER TABLE pledge_payments ADD COLUMN church_id BIGINT NOT NULL DEFAULT 1;

-- Remove global uniqueness constraints (now unique per church)
ALTER TABLE funds DROP CONSTRAINT IF EXISTS funds_name_key;
ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_receipt_number_key;

-- Create default church and plans
INSERT INTO churches (name, slug, email, enabled) VALUES
('Default Church', 'default', 'admin@defaultchurch.org', true);

INSERT INTO subscription_plans (name, description, price_monthly, price_annual, max_members, max_users, features) VALUES
('Free', 'Basic plan for small churches', 0.00, 0.00, 50, 3, '["members","attendance","basic_finance"]'),
('Basic', 'Standard plan for growing churches', 29.99, 299.99, 200, 10, '["members","attendance","finance","budgets","reports"]'),
('Pro', 'Advanced plan for large churches', 79.99, 799.99, 1000, 25, '["members","attendance","finance","budgets","reports","analytics","forecasts"]'),
('Enterprise', 'Unlimited plan for mega churches', 199.99, 1999.99, -1, -1, '["all"]');

-- Assign free plan to default church
INSERT INTO church_subscriptions (church_id, plan_id, status, billing_cycle, start_date) VALUES
(1, 1, 'ACTIVE', 'MONTHLY', CURRENT_DATE);
