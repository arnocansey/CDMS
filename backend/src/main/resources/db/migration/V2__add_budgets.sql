CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    period VARCHAR(20),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_category ON budgets(category);
