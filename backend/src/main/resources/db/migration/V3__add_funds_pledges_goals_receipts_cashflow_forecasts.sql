-- V3: Add Fund Accounting, Pledges, Financial Goals, Receipts, Cash Flow, Forecasts

-- ============================================================
-- FUNDS TABLE
-- ============================================================
CREATE TABLE funds (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    fund_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    opening_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    target_amount DECIMAL(12,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_funds_name ON funds(name);
CREATE INDEX idx_funds_type ON funds(fund_type);
CREATE INDEX idx_funds_active ON funds(is_active);

-- ============================================================
-- FUND TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE fund_transactions (
    id BIGSERIAL PRIMARY KEY,
    fund_id BIGINT NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    source_type VARCHAR(50), -- DONATION, TITHE, OFFERING, EXPENSE, TRANSFER
    source_id BIGINT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fund_transactions_fund ON fund_transactions(fund_id);
CREATE INDEX idx_fund_transactions_date ON fund_transactions(transaction_date);
CREATE INDEX idx_fund_transactions_type ON fund_transactions(transaction_type);

-- ============================================================
-- PLEDGES TABLE
-- ============================================================
CREATE TABLE pledges (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    pledge_type VARCHAR(50) NOT NULL,
    description TEXT,
    pledge_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
    outstanding_balance DECIMAL(12,2) GENERATED ALWAYS AS (pledge_amount - amount_paid) STORED,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, DEFAULTED, CANCELLED
    frequency VARCHAR(20) DEFAULT 'ONE_TIME', -- ONE_TIME, WEEKLY, MONTHLY, QUARTERLY, ANNUAL
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pledges_member ON pledges(member_id);
CREATE INDEX idx_pledges_status ON pledges(status);
CREATE INDEX idx_pledges_due_date ON pledges(due_date);
CREATE INDEX idx_pledges_type ON pledges(pledge_type);

-- ============================================================
-- PLEDGE PAYMENTS TABLE
-- ============================================================
CREATE TABLE pledge_payments (
    id BIGSERIAL PRIMARY KEY,
    pledge_id BIGINT NOT NULL REFERENCES pledges(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pledge_payments_pledge ON pledge_payments(pledge_id);
CREATE INDEX idx_pledge_payments_date ON pledge_payments(payment_date);

-- ============================================================
-- FINANCIAL GOALS TABLE
-- ============================================================
CREATE TABLE financial_goals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    amount_raised DECIMAL(12,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(12,2) GENERATED ALWAYS AS (target_amount - amount_raised) STORED,
    percentage_completion DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN target_amount > 0 THEN (amount_raised / target_amount * 100) ELSE 0 END) STORED,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED, PAUSED
    category VARCHAR(50), -- BUILDING, VEHICLE, MISSION, WELFARE, EQUIPMENT, OTHER
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_goals_status ON financial_goals(status);
CREATE INDEX idx_financial_goals_category ON financial_goals(category);
CREATE INDEX idx_financial_goals_end_date ON financial_goals(end_date);

-- ============================================================
-- GOAL CONTRIBUTIONS TABLE
-- ============================================================
CREATE TABLE goal_contributions (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goal_contributions_goal ON goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_member ON goal_contributions(member_id);
CREATE INDEX idx_goal_contributions_date ON goal_contributions(contribution_date);

-- ============================================================
-- RECEIPTS TABLE
-- ============================================================
CREATE TABLE receipts (
    id BIGSERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
    contribution_type VARCHAR(50) NOT NULL, -- TITHE, OFFERING, DONATION, PLEDGE, GOAL
    contribution_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    treasurer_name VARCHAR(200),
    treasurer_signature VARCHAR(200),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED', -- ISSUED, SENT, PRINTED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_receipts_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_member ON receipts(member_id);
CREATE INDEX idx_receipts_type ON receipts(contribution_type);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);

-- ============================================================
-- CASH FLOW ENTRIES TABLE
-- ============================================================
CREATE TABLE cash_flow_entries (
    id BIGSERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    entry_type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    reference_number VARCHAR(100),
    source VARCHAR(50), -- DONATION, TITHE, OFFERING, EXPENSE, TRANSFER
    source_id BIGINT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cash_flow_date ON cash_flow_entries(entry_date);
CREATE INDEX idx_cash_flow_type ON cash_flow_entries(entry_type);
CREATE INDEX idx_cash_flow_category ON cash_flow_entries(category);

-- ============================================================
-- FORECASTS TABLE
-- ============================================================
CREATE TABLE forecasts (
    id BIGSERIAL PRIMARY KEY,
    forecast_name VARCHAR(200) NOT NULL,
    forecast_type VARCHAR(50) NOT NULL, -- MONTHLY, QUARTERLY, ANNUAL
    forecast_date DATE NOT NULL,
    predicted_income DECIMAL(12,2),
    predicted_expenses DECIMAL(12,2),
    predicted_net DECIMAL(12,2),
    confidence_level DECIMAL(5,2), -- 0-100
    methodology VARCHAR(50), -- MOVING_AVERAGE, TREND, GROWTH_RATE
    actual_income DECIMAL(12,2),
    actual_expenses DECIMAL(12,2),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forecasts_type ON forecasts(forecast_type);
CREATE INDEX idx_forecasts_date ON forecasts(forecast_date);

-- ============================================================
-- ENHANCE EXPENSES TABLE
-- ============================================================
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS approved_by_user_id BIGINT REFERENCES users(id);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_attached BOOLEAN DEFAULT false;

-- ============================================================
-- SEED DEFAULT FUNDS
-- ============================================================
INSERT INTO funds (name, description, fund_type, opening_balance, current_balance) VALUES
('General Fund', 'Main church operating fund', 'GENERAL', 0, 0),
('Building Fund', 'Church building and renovation projects', 'BUILDING', 0, 0),
('Welfare Fund', 'Member welfare and community support', 'WELFARE', 0, 0),
('Mission Fund', 'Missionary work and evangelism', 'MISSION', 0, 0),
('Youth Fund', 'Youth programs and activities', 'YOUTH', 0, 0),
('Project Fund', 'Special projects and initiatives', 'PROJECT', 0, 0);
