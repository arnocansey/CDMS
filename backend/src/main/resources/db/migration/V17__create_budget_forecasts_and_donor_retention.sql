CREATE TABLE IF NOT EXISTS budget_forecasts (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL REFERENCES churches(id),
    forecast_name VARCHAR(255) NOT NULL,
    period VARCHAR(50) NOT NULL,
    forecasted_income DECIMAL(12,2) NOT NULL,
    forecasted_expenses DECIMAL(12,2) NOT NULL,
    actual_income DECIMAL(12,2),
    actual_expenses DECIMAL(12,2),
    variance_income DECIMAL(12,2),
    variance_expenses DECIMAL(12,2),
    method VARCHAR(50) NOT NULL,
    confidence DECIMAL(5,2),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_budget_forecasts_church_id ON budget_forecasts(church_id);

CREATE TABLE IF NOT EXISTS donor_retention (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL REFERENCES churches(id),
    member_id BIGINT NOT NULL REFERENCES members(id),
    period VARCHAR(50) NOT NULL,
    total_given DECIMAL(12,2),
    donation_count INTEGER,
    retention_status VARCHAR(50) NOT NULL,
    average_gift DECIMAL(10,2),
    last_donation_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donor_retention_church_id ON donor_retention(church_id);
CREATE INDEX idx_donor_retention_member_id ON donor_retention(member_id);
