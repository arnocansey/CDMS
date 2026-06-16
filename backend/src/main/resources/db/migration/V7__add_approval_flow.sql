-- V7: Add approval flow

-- Add account_status to users
ALTER TABLE users ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';

-- Church registration requests
CREATE TABLE church_registration_requests (
    id BIGSERIAL PRIMARY KEY,
    church_name VARCHAR(255) NOT NULL,
    church_slug VARCHAR(255) NOT NULL,
    church_email VARCHAR(255),
    church_phone VARCHAR(50),
    church_city VARCHAR(100),
    church_state VARCHAR(50),
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    requester_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by_user_id BIGINT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
