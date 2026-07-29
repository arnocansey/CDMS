-- Add missing created_at column expected by ReconciliationEntry entity
ALTER TABLE reconciliation_entries
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
