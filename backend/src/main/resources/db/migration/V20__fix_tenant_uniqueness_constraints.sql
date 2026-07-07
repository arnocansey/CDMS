-- V20: Fix uniqueness constraints to be tenant-scoped (per church)

-- For departments: drop global unique name constraint and make it unique per church
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE departments ADD CONSTRAINT departments_church_id_name_key UNIQUE (church_id, name);

-- For members: drop global unique email constraint and make it unique per church
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_email_key;
ALTER TABLE members ADD CONSTRAINT members_church_id_email_key UNIQUE (church_id, email);
