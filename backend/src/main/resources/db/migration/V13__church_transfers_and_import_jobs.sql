CREATE TABLE church_transfers (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id),
    from_church_id BIGINT NOT NULL,
    to_church_id BIGINT NOT NULL,
    transfer_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_by VARCHAR(255),
    approved_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE import_jobs (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    import_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    errors TEXT,
    filename VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
