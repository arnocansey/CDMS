-- V8: Recurring donations, expense approval, recurring expenses, bank reconciliation

CREATE TABLE recurring_donations (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    member_id BIGINT REFERENCES members(id),
    amount NUMERIC(10,2) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    frequency VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    next_due_date DATE NOT NULL,
    last_processed_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE expenses ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE expenses ADD COLUMN approved_by_id BIGINT;
ALTER TABLE expenses ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE expenses ADD COLUMN rejection_reason TEXT;

ALTER TABLE churches ADD COLUMN expense_approval_threshold NUMERIC(10,2) DEFAULT 0;

CREATE TABLE recurring_expenses (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    next_due_date DATE NOT NULL,
    last_processed_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_reconciliations (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    bank_statement_date DATE NOT NULL,
    bank_balance NUMERIC(12,2) NOT NULL,
    book_balance NUMERIC(12,2) NOT NULL,
    difference NUMERIC(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reconciled_by_id BIGINT,
    reconciled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reconciliation_entries (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL DEFAULT 1,
    reconciliation_id BIGINT NOT NULL REFERENCES bank_reconciliations(id),
    cash_flow_entry_id BIGINT REFERENCES cash_flow_entries(id),
    matched BOOLEAN NOT NULL DEFAULT FALSE,
    bank_amount NUMERIC(12,2),
    book_amount NUMERIC(12,2),
    description TEXT,
    transaction_date DATE
);
