CREATE TABLE currency_rates (
    id BIGSERIAL PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(15,6) NOT NULL,
    last_updated DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(base_currency, target_currency, last_updated)
);
