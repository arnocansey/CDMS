# Administrator Manual

## Church Database Management System (CDMS)

**Version:** 1.0  
**Last Updated:** June 2026

---

## Table of Contents

1. [Administrator Responsibilities](#administrator-responsibilities)
2. [User Management](#user-management)
3. [Role Management](#role-management)
4. [System Configuration](#system-configuration)
5. [Data Backup and Recovery](#data-backup-and-recovery)
6. [Security Management](#security-management)
7. [Audit Logs](#audit-logs)
8. [Troubleshooting](#troubleshooting)

---

## Administrator Responsibilities

As a CDMS Administrator, you are responsible for:

- Managing user accounts and access levels
- Configuring system settings
- Monitoring system usage
- Ensuring data security and privacy
- Performing regular backups
- Training new users

---

## User Management

### Creating a New User
1. Navigate to **Users** in the sidebar
2. Click **Add User**
3. Enter the user's information:
   - First Name
   - Last Name
   - Email (this will be their username)
4. Assign a role
5. Click **Create User**
6. The user will receive an email with login instructions

### Editing a User
1. Navigate to **Users**
2. Find the user in the list
3. Click the **Edit** icon
4. Modify their information or role
5. Click **Save**

### Disabling a User Account
1. Navigate to **Users**
2. Find the user
3. Click **Edit**
4. Toggle **Enabled** to off
5. Click **Save**

### Deleting a User
1. Navigate to **Users**
2. Find the user
3. Click **Delete**
4. Confirm the deletion

**Note:** Deleted users cannot be recovered. Consider disabling accounts instead.

---

## Role Management

### Available Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full system access | All permissions |
| **Pastor** | View members, attendance, reports | Read access, prayer request management |
| **Secretary** | Manage members and announcements | Member CRUD, attendance, announcements |
| **Treasurer** | Manage finances | Financial module access, reports |
| **Department Leader** | Department management | View department members |
| **Member** | Basic access | View announcements, events, submit prayers |

### Assigning Roles
1. Navigate to **Users**
2. Select the user
3. Click **Edit**
4. Select the appropriate role from the dropdown
5. Click **Save**

### Custom Permissions (Advanced)
Role permissions are configured in the database. Contact your development team to modify role permissions.

---

## System Configuration

### General Settings
Configuration is managed through environment variables:

```properties
# Backend Configuration
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/church_db
spring.datasource.username=postgres
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS Configuration
app.cors.allowed-origins=http://localhost:3000
```

### Email Configuration
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

---

## Data Backup and Recovery

### Manual Backup
```bash
# Backup database
pg_dump -U postgres church_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres church_db < backup_20240601.sql
```

### Automated Backups
Set up a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U postgres church_db | gzip > /backups/church_db_$(date +\%Y\%m\%d).sql.gz
```

### Recovery Procedure
1. Stop the application server
2. Restore the database from backup
3. Verify data integrity
4. Restart the application server

---

## Security Management

### Password Policy
- Minimum 8 characters
- Should include uppercase, lowercase, and numbers
- Passwords are hashed using BCrypt

### JWT Token Management
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Tokens are invalidated on logout

### Rate Limiting
- API rate limit: 60 requests per minute per IP
- Exceeding the limit returns HTTP 429

### Security Headers
The following security headers are enabled:
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Content-Security-Policy: default-src 'self'

---

## Audit Logs

### Viewing Audit Logs
1. Navigate to **System** > **Audit Logs**
2. Filter by:
   - User
   - Action type
   - Entity type
   - Date range

### Audit Log Fields
| Field | Description |
|-------|-------------|
| User | User who performed the action |
| Action | CREATE, UPDATE, DELETE |
| Entity | Affected entity type |
| Entity ID | ID of the affected record |
| Old Value | Previous value (for updates) |
| New Value | New value (for updates) |
| IP Address | Client IP address |
| Timestamp | When the action occurred |

### Exporting Audit Logs
1. Navigate to **System** > **Audit Logs**
2. Set date range
3. Click **Export**
4. Download as CSV or PDF

---

## Troubleshooting

### Common Issues

#### Cannot Login
**Symptom:** Users cannot log in with correct credentials
**Solution:**
1. Verify the user account is enabled
2. Check if the account is locked
3. Reset the user's password
4. Check database connectivity

#### Slow Performance
**Symptom:** Pages load slowly
**Solution:**
1. Check database connection pool
2. Verify server resources (CPU, memory)
3. Check for long-running queries
4. Clear application cache

#### API Errors
**Symptom:** API returns 500 errors
**Solution:**
1. Check application logs
2. Verify database connectivity
3. Check for null pointer exceptions
4. Review recent code changes

### Application Logs
```bash
# View application logs
tail -f logs/application.log

# Search for errors
grep ERROR logs/application.log
```

### Database Maintenance
```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Check table sizes
SELECT pg_size_pretty(pg_total_relation_size tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';

-- Reindex
REINDEX DATABASE church_db;
```

---

## Contact Support

For technical issues beyond this guide:
- **Development Team:** dev-team@yourchurch.com
- **IT Support:** it-support@yourchurch.com
- **Emergency:** Call the IT emergency line
