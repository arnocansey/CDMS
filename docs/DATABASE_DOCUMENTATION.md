# Database Documentation

## Church Database Management System (CDMS)

**Database:** PostgreSQL 16  
**Schema:** church_db

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Indexes](#indexes)
5. [Constraints](#constraints)

---

## Overview

The CDMS database follows a relational model with the following design principles:
- Normalized to Third Normal Form (3NF)
- Referential integrity through foreign keys
- Audit fields for tracking changes
- Indexes for query optimization

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users     │────<│  user_roles │>────│    roles     │
└─────────────┘     └─────────────┘     └─────────────┘
                                                  │
                                                  │
                                         ┌────────┴────────┐
                                         │role_permissions  │
                                         └────────┬────────┘
                                                  │
                                                  v
                                         ┌─────────────────┐
                                         │   permissions    │
                                         └─────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  departments │<────│   members   │────<│ attendance  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          v               v               v
   ┌──────────┐   ┌──────────┐   ┌──────────────┐
   │ donations │   │  tithes  │   │prayer_requests│
   └──────────┘   └──────────┘   └──────────────┘

┌─────────────┐     ┌─────────────┐
│   events    │     │announcements│
└─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐
│notifications│     │ audit_logs  │
└─────────────┘     └─────────────┘
```

---

## Table Definitions

### users
Stores user account information for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| first_name | VARCHAR(100) | NOT NULL | User first name |
| last_name | VARCHAR(100) | NOT NULL | User last name |
| enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | Account status |
| account_non_locked | BOOLEAN | NOT NULL, DEFAULT TRUE | Lock status |
| password_reset_token | VARCHAR(255) | | Reset token |
| refresh_token | VARCHAR(255) | | JWT refresh token |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### roles
Defines user roles for RBAC.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Role name |

**Predefined Roles:**
- ROLE_ADMIN
- ROLE_PASTOR
- ROLE_SECRETARY
- ROLE_TREASURER
- ROLE_DEPARTMENT_LEADER
- ROLE_MEMBER

### permissions
Defines granular permissions for resources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Permission name |
| description | TEXT | | Permission description |
| resource | VARCHAR(100) | NOT NULL | Resource type |
| action | VARCHAR(50) | NOT NULL | Action type |

### user_roles
Join table for users and roles (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | BIGINT | FK → users(id), CASCADE | User reference |
| role_id | BIGINT | FK → roles(id), CASCADE | Role reference |

### role_permissions
Join table for roles and permissions (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | BIGINT | FK → roles(id), CASCADE | Role reference |
| permission_id | BIGINT | FK → permissions(id), CASCADE | Permission reference |

### departments
Church departments/ministries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Department name |
| description | TEXT | | Department description |
| leader_id | BIGINT | FK → members(id), SET NULL | Department leader |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### members
Church member information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| first_name | VARCHAR(100) | NOT NULL | Member first name |
| last_name | VARCHAR(100) | NOT NULL | Member last name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| date_of_birth | DATE | | Date of birth |
| gender | VARCHAR(10) | NOT NULL | Gender |
| address | TEXT | | Street address |
| city | VARCHAR(100) | | City |
| state | VARCHAR(100) | | State |
| zip_code | VARCHAR(20) | | ZIP code |
| membership_date | DATE | | Date joined |
| baptism_date | DATE | | Baptism date |
| photo_url | VARCHAR(500) | | Profile photo URL |
| active | BOOLEAN | NOT NULL, DEFAULT TRUE | Active status |
| department_id | BIGINT | FK → departments(id), SET NULL | Department |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### attendance
Service attendance records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| member_id | BIGINT | FK → members(id), CASCADE | Member reference |
| service_date | DATE | NOT NULL | Date of service |
| service_type | VARCHAR(50) | NOT NULL | Service type |
| present | BOOLEAN | NOT NULL, DEFAULT TRUE | Attendance status |
| check_in_time | TIMESTAMP | | Check-in time |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### donations
Donation records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| member_id | BIGINT | FK → members(id), SET NULL | Donor (optional) |
| amount | DECIMAL(10,2) | NOT NULL | Donation amount |
| category | VARCHAR(100) | NOT NULL | Donation category |
| description | TEXT | | Description |
| donation_date | DATE | NOT NULL | Donation date |
| payment_method | VARCHAR(50) | | Payment method |
| reference_number | VARCHAR(100) | | Reference number |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### tithes
Tithe records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| member_id | BIGINT | FK → members(id), CASCADE | Member reference |
| amount | DECIMAL(10,2) | NOT NULL | Tithe amount |
| tithe_date | DATE | NOT NULL | Tithe date |
| payment_method | VARCHAR(50) | | Payment method |
| reference_number | VARCHAR(100) | | Reference number |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### offerings
Service offering records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| service_date | DATE | NOT NULL | Service date |
| service_type | VARCHAR(50) | NOT NULL | Service type |
| amount | DECIMAL(10,2) | NOT NULL | Offering amount |
| offering_type | VARCHAR(50) | | Offering type |
| description | TEXT | | Description |
| recorded_by | VARCHAR(200) | | Recorder name |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### expenses
Expense records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| category | VARCHAR(100) | NOT NULL | Expense category |
| amount | DECIMAL(10,2) | NOT NULL | Expense amount |
| description | TEXT | | Description |
| expense_date | DATE | NOT NULL | Expense date |
| payment_method | VARCHAR(50) | | Payment method |
| receipt_url | VARCHAR(500) | | Receipt URL |
| approved_by | VARCHAR(200) | | Approver name |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### events
Church events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| title | VARCHAR(200) | NOT NULL | Event title |
| description | TEXT | | Event description |
| event_date | DATE | NOT NULL | Event date |
| start_time | TIMESTAMP | | Start time |
| end_time | TIMESTAMP | | End time |
| location | VARCHAR(200) | | Event location |
| is_recurring | BOOLEAN | DEFAULT FALSE | Recurring flag |
| created_by | VARCHAR(200) | | Creator name |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### announcements
Church announcements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| title | VARCHAR(200) | NOT NULL | Announcement title |
| content | TEXT | NOT NULL | Announcement content |
| publish_date | DATE | | Publish date |
| expiry_date | DATE | | Expiry date |
| published | BOOLEAN | DEFAULT FALSE | Published status |
| created_by | VARCHAR(200) | | Creator name |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### prayer_requests
Prayer request records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| member_id | BIGINT | FK → members(id), SET NULL | Requester |
| title | VARCHAR(200) | NOT NULL | Request title |
| description | TEXT | NOT NULL | Request details |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | Status |
| anonymous | BOOLEAN | DEFAULT FALSE | Anonymous flag |
| prayed_by | VARCHAR(200) | | Prayer person |
| prayed_at | TIMESTAMP | | Prayer timestamp |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

**Status Values:**
- PENDING
- IN_PROGRESS
- ANSWERED
- CLOSED

### notifications
User notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| user_id | BIGINT | NOT NULL | User reference |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| type | VARCHAR(50) | NOT NULL | Notification type |
| read | BOOLEAN | DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

### audit_logs
System audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| user_id | BIGINT | | User who performed action |
| action | VARCHAR(100) | NOT NULL | Action performed |
| entity | VARCHAR(100) | NOT NULL | Entity affected |
| entity_id | BIGINT | | Entity identifier |
| old_value | TEXT | | Previous value |
| new_value | TEXT | | New value |
| ip_address | VARCHAR(50) | | Client IP address |
| created_at | TIMESTAMP | NOT NULL | Action timestamp |

---

## Indexes

```sql
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
```

---

## Constraints

### Primary Keys
All tables have primary key constraints on their `id` columns.

### Foreign Keys
- `user_roles.user_id` → `users.id` (CASCADE)
- `user_roles.role_id` → `roles.id` (CASCADE)
- `role_permissions.role_id` → `roles.id` (CASCADE)
- `role_permissions.permission_id` → `permissions.id` (CASCADE)
- `departments.leader_id` → `members.id` (SET NULL)
- `members.department_id` → `departments.id` (SET NULL)
- `attendance.member_id` → `members.id` (CASCADE)
- `donations.member_id` → `members.id` (SET NULL)
- `tithes.member_id` → `members.id` (CASCADE)
- `prayer_requests.member_id` → `members.id` (SET NULL)

### Unique Constraints
- `users.email`
- `members.email`
- `roles.name`
- `permissions.name`
- `departments.name`

### Check Constraints
- `attendance.service_type` must be a valid service type
- `prayer_requests.status` must be one of: PENDING, IN_PROGRESS, ANSWERED, CLOSED
