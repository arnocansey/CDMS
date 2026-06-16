-- V5: Fix seed user passwords (correct bcrypt hash of "password123)
-- Idempotent: ON CONFLICT handles re-runs

UPDATE users SET password = '$2b$10$Xx6lcprCzEbv4PqQXD7FWuDDZRVmit6lYOpzFlyTnBfpNyIGsy4CO'
WHERE email IN ('admin@gracechurch.org', 'pastor@gracechurch.org', 'treasurer@gracechurch.org', 'secretary@gracechurch.org', 'member@gracechurch.org')
  AND password != '$2b$10$Xx6lcprCzEbv4PqQXD7FWuDDZRVmit6lYOpzFlyTnBfpNyIGsy4CO';
