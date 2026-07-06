-- V19: Districts and Branches Support

-- Districts Table
CREATE TABLE districts (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches Table
CREATE TABLE branches (
    id BIGSERIAL PRIMARY KEY,
    church_id BIGINT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add branch_id and district_id columns to existing tables
ALTER TABLE users ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL;

ALTER TABLE members ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE members ADD COLUMN district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL;

ALTER TABLE donations ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE tithes ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE offerings ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE budgets ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL;

-- Automatically create Headquarters branch for existing churches
INSERT INTO branches (church_id, name, code, enabled)
SELECT id, name || ' Headquarters', 'HQ', true FROM churches;

-- Associate existing users and records with their church's Headquarters branch
UPDATE users u
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = u.church_id AND b.code = 'HQ')
WHERE u.church_id IS NOT NULL;

UPDATE members m
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = m.church_id AND b.code = 'HQ');

UPDATE donations d
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = d.church_id AND b.code = 'HQ');

UPDATE tithes t
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = t.church_id AND b.code = 'HQ');

UPDATE offerings o
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = o.church_id AND b.code = 'HQ');

UPDATE expenses e
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = e.church_id AND b.code = 'HQ');

UPDATE budgets bu
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = bu.church_id AND b.code = 'HQ');

UPDATE attendance a
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = a.church_id AND b.code = 'HQ');

UPDATE events ev
SET branch_id = (SELECT b.id FROM branches b WHERE b.church_id = ev.church_id AND b.code = 'HQ');
