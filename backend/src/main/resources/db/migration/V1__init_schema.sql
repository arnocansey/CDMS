CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    password_reset_token VARCHAR(255),
    refresh_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    leader_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    membership_date DATE,
    baptism_date DATE,
    photo_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    department_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

ALTER TABLE departments ADD FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL;

CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    service_date DATE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    present BOOLEAN NOT NULL DEFAULT TRUE,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE donations (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    donation_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE tithes (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tithe_date DATE NOT NULL,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE offerings (
    id BIGSERIAL PRIMARY KEY,
    service_date DATE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    offering_type VARCHAR(50),
    description TEXT,
    recorded_by VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    receipt_url VARCHAR(500),
    approved_by VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    location VARCHAR(200),
    is_recurring BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    publish_date DATE,
    expiry_date DATE,
    published BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prayer_requests (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    anonymous BOOLEAN DEFAULT FALSE,
    prayed_by VARCHAR(200),
    prayed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_department ON members(department_id);
CREATE INDEX idx_members_active ON members(active);
CREATE INDEX idx_attendance_date ON attendance(service_date);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_donations_category ON donations(category);
CREATE INDEX idx_tithes_date ON tithes(tithe_date);
CREATE INDEX idx_tithes_member ON tithes(member_id);
CREATE INDEX idx_offerings_date ON offerings(service_date);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_announcements_published ON announcements(published);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);

INSERT INTO permissions (name, resource, action) VALUES
('CREATE_USER', 'USER', 'CREATE'),
('READ_USER', 'USER', 'READ'),
('UPDATE_USER', 'USER', 'UPDATE'),
('DELETE_USER', 'USER', 'DELETE'),
('CREATE_MEMBER', 'MEMBER', 'CREATE'),
('READ_MEMBER', 'MEMBER', 'READ'),
('UPDATE_MEMBER', 'MEMBER', 'UPDATE'),
('DELETE_MEMBER', 'MEMBER', 'DELETE'),
('CREATE_ATTENDANCE', 'ATTENDANCE', 'CREATE'),
('READ_ATTENDANCE', 'ATTENDANCE', 'READ'),
('CREATE_DONATION', 'DONATION', 'CREATE'),
('READ_DONATION', 'DONATION', 'READ'),
('CREATE_TITHE', 'TITHE', 'CREATE'),
('READ_TITHE', 'TITHE', 'READ'),
('CREATE_OFFERING', 'OFFERING', 'CREATE'),
('READ_OFFERING', 'OFFERING', 'READ'),
('CREATE_EXPENSE', 'EXPENSE', 'CREATE'),
('READ_EXPENSE', 'EXPENSE', 'READ'),
('CREATE_EVENT', 'EVENT', 'CREATE'),
('READ_EVENT', 'EVENT', 'READ'),
('UPDATE_EVENT', 'EVENT', 'UPDATE'),
('DELETE_EVENT', 'EVENT', 'DELETE'),
('CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', 'CREATE'),
('READ_ANNOUNCEMENT', 'ANNOUNCEMENT', 'READ'),
('UPDATE_ANNOUNCEMENT', 'ANNOUNCEMENT', 'UPDATE'),
('DELETE_ANNOUNCEMENT', 'ANNOUNCEMENT', 'DELETE'),
('CREATE_PRAYER_REQUEST', 'PRAYER_REQUEST', 'CREATE'),
('READ_PRAYER_REQUEST', 'PRAYER_REQUEST', 'READ'),
('UPDATE_PRAYER_REQUEST', 'PRAYER_REQUEST', 'UPDATE'),
('DELETE_PRAYER_REQUEST', 'PRAYER_REQUEST', 'DELETE'),
('CREATE_DEPARTMENT', 'DEPARTMENT', 'CREATE'),
('READ_DEPARTMENT', 'DEPARTMENT', 'READ'),
('UPDATE_DEPARTMENT', 'DEPARTMENT', 'UPDATE'),
('DELETE_DEPARTMENT', 'DEPARTMENT', 'DELETE'),
('READ_REPORT', 'REPORT', 'READ'),
('EXPORT_REPORT', 'REPORT', 'EXPORT'),
('MANAGE_SYSTEM', 'SYSTEM', 'MANAGE');

INSERT INTO roles (name) VALUES 
('ROLE_ADMIN'),
('ROLE_PASTOR'),
('ROLE_SECRETARY'),
('ROLE_TREASURER'),
('ROLE_DEPARTMENT_LEADER'),
('ROLE_MEMBER');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_PASTOR'
AND p.name IN ('READ_MEMBER', 'READ_ATTENDANCE', 'READ_DONATION', 'READ_TITHE', 'READ_OFFERING', 'READ_EXPENSE', 'READ_EVENT', 'READ_ANNOUNCEMENT', 'READ_PRAYER_REQUEST', 'UPDATE_PRAYER_REQUEST', 'READ_REPORT');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_SECRETARY'
AND p.name IN ('CREATE_MEMBER', 'READ_MEMBER', 'UPDATE_MEMBER', 'CREATE_ATTENDANCE', 'READ_ATTENDANCE', 'CREATE_ANNOUNCEMENT', 'READ_ANNOUNCEMENT', 'UPDATE_ANNOUNCEMENT', 'READ_EVENT');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_TREASURER'
AND p.name IN ('READ_MEMBER', 'CREATE_DONATION', 'READ_DONATION', 'CREATE_TITHE', 'READ_TITHE', 'CREATE_OFFERING', 'READ_OFFERING', 'CREATE_EXPENSE', 'READ_EXPENSE', 'READ_REPORT', 'EXPORT_REPORT');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_DEPARTMENT_LEADER'
AND p.name IN ('READ_MEMBER', 'READ_ATTENDANCE', 'READ_EVENT', 'UPDATE_EVENT');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ROLE_MEMBER'
AND p.name IN ('READ_MEMBER', 'READ_ANNOUNCEMENT', 'READ_EVENT', 'CREATE_PRAYER_REQUEST', 'READ_PRAYER_REQUEST');
