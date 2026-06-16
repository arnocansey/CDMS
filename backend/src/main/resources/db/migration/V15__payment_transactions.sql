-- V15: Payment transactions table and Paystack fields on churches

CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    paystack_reference VARCHAR(255) UNIQUE,
    paystack_access_code VARCHAR(255),
    paystack_authorization_code VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    payment_method VARCHAR(50),
    paystack_response TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_transactions_church_id ON payment_transactions(church_id);
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(paystack_reference);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

ALTER TABLE churches ADD COLUMN IF NOT EXISTS paystack_customer_code VARCHAR(255);
ALTER TABLE churches ADD COLUMN IF NOT EXISTS paystack_plan_code VARCHAR(255);
