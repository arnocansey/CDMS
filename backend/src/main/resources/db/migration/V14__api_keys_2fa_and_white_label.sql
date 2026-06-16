CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(36) NOT NULL UNIQUE,
    secret_key VARCHAR(36) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at DATE,
    expires_at DATE,
    permissions VARCHAR(255),
    rate_limit INTEGER NOT NULL DEFAULT 1000,
    usage_count BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE two_factor_auth (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) UNIQUE,
    secret_key VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    backup_codes TEXT,
    last_used_code VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE churches ADD COLUMN primary_color VARCHAR(7) DEFAULT '#2563eb';
ALTER TABLE churches ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#1e40af';
ALTER TABLE churches ADD COLUMN custom_css TEXT;
ALTER TABLE churches ADD COLUMN logo_dark_url VARCHAR(500);
ALTER TABLE churches ADD COLUMN favicon_url VARCHAR(500);
ALTER TABLE churches ADD COLUMN custom_domain VARCHAR(255);
