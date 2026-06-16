CREATE TABLE email_digests (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    digest_type VARCHAR(20) NOT NULL,
    frequency VARCHAR(20),
    last_sent_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE push_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    user_id BIGINT REFERENCES users(id),
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth VARCHAR(255) NOT NULL,
    user_agent TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
