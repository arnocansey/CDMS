-- V9: Church settings columns and role-based permissions matrix

ALTER TABLE churches ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE churches ADD COLUMN currency_symbol VARCHAR(5) DEFAULT '$';
ALTER TABLE churches ADD COLUMN fiscal_year_start INTEGER DEFAULT 1;
ALTER TABLE churches ADD COLUMN email_from_name VARCHAR(255);
ALTER TABLE churches ADD COLUMN email_from_address VARCHAR(255);
ALTER TABLE churches ADD COLUMN website VARCHAR(255);

DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    role VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    allowed BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(church_id, role, resource, action)
);
