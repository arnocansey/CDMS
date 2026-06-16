# API Documentation

## Church Database Management System (CDMS)

**Base URL:** `http://localhost:8080/api`

---

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["ROLE_MEMBER"]
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## Members

### Get All Members
```http
GET /api/members?page=0&size=10&sort=firstName,asc
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "gender": "Male",
      "active": true,
      "departmentName": "Youth"
    }
  ],
  "totalElements": 100,
  "totalPages": 10
}
```

### Search Members
```http
GET /api/members/search?search=john&page=0&size=10
Authorization: Bearer {token}
```

### Get Member by ID
```http
GET /api/members/{id}
Authorization: Bearer {token}
```

### Create Member
```http
POST /api/members
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "gender": "Male",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701",
  "membershipDate": "2024-01-01",
  "departmentId": 1
}
```

### Update Member
```http
PUT /api/members/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0987654321",
  "active": true
}
```

### Delete Member
```http
DELETE /api/members/{id}
Authorization: Bearer {token}
```

---

## Attendance

### Get Attendance by Date
```http
GET /api/attendance?date=2024-06-01
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "memberId": 1,
    "memberName": "John Doe",
    "serviceDate": "2024-06-01",
    "serviceType": "Sunday Service",
    "present": true,
    "checkInTime": "2024-06-01T09:00:00"
  }
]
```

### Record Attendance
```http
POST /api/attendance
Authorization: Bearer {token}
Content-Type: application/json

{
  "memberId": 1,
  "serviceDate": "2024-06-01",
  "serviceType": "Sunday Service",
  "present": true
}
```

### Get Member Attendance
```http
GET /api/attendance/member/{memberId}?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

---

## Finance

### Donations

#### Get Donations
```http
GET /api/finance/donations?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

#### Record Donation
```http
POST /api/finance/donations
Authorization: Bearer {token}
Content-Type: application/json

{
  "memberId": 1,
  "amount": 100.00,
  "category": "General",
  "description": "Monthly donation",
  "donationDate": "2024-06-01",
  "paymentMethod": "Cash"
}
```

### Tithes

#### Get Tithes
```http
GET /api/finance/tithes?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

#### Record Tithe
```http
POST /api/finance/tithes
Authorization: Bearer {token}
Content-Type: application/json

{
  "memberId": 1,
  "amount": 500.00,
  "titheDate": "2024-06-01",
  "paymentMethod": "Check"
}
```

### Offerings

#### Get Offerings
```http
GET /api/finance/offerings?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

#### Record Offering
```http
POST /api/finance/offerings
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceDate": "2024-06-01",
  "serviceType": "Sunday Service",
  "amount": 1000.00,
  "offeringType": "General"
}
```

### Expenses

#### Get Expenses
```http
GET /api/finance/expenses?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

#### Record Expense
```http
POST /api/finance/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Utilities",
  "amount": 150.00,
  "description": "Electric bill",
  "expenseDate": "2024-06-01",
  "paymentMethod": "Bank Transfer"
}
```

---

## Events

### Get All Events
```http
GET /api/events
Authorization: Bearer {token}
```

### Get Upcoming Events
```http
GET /api/events/upcoming
Authorization: Bearer {token}
```

### Get Event by ID
```http
GET /api/events/{id}
Authorization: Bearer {token}
```

### Create Event
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Sunday Service",
  "description": "Weekly worship service",
  "eventDate": "2024-06-02",
  "startTime": "2024-06-02T09:00:00",
  "endTime": "2024-06-02T11:00:00",
  "location": "Main Sanctuary",
  "recurring": true
}
```

### Update Event
```http
PUT /api/events/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Sunday Service",
  "description": "Weekly worship service - Updated",
  "eventDate": "2024-06-02",
  "startTime": "2024-06-02T09:30:00",
  "endTime": "2024-06-02T11:30:00",
  "location": "Main Sanctuary"
}
```

### Delete Event
```http
DELETE /api/events/{id}
Authorization: Bearer {token}
```

---

## Announcements

### Get All Announcements
```http
GET /api/announcements
Authorization: Bearer {token}
```

### Get Active Announcements
```http
GET /api/announcements/active
Authorization: Bearer {token}
```

### Create Announcement
```http
POST /api/announcements
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Easter Service",
  "content": "Join us for our special Easter service...",
  "publishDate": "2024-03-25",
  "expiryDate": "2024-04-01",
  "published": true
}
```

### Update Announcement
```http
PUT /api/announcements/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Easter Service - Updated",
  "content": "Updated content...",
  "published": true
}
```

### Delete Announcement
```http
DELETE /api/announcements/{id}
Authorization: Bearer {token}
```

---

## Prayer Requests

### Get All Prayer Requests
```http
GET /api/prayer-requests
Authorization: Bearer {token}
```

### Get Pending Prayer Requests
```http
GET /api/prayer-requests/pending
Authorization: Bearer {token}
```

### Create Prayer Request
```http
POST /api/prayer-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "memberId": 1,
  "title": "Healing Prayer",
  "description": "Please pray for my mother's recovery...",
  "anonymous": false
}
```

### Approve Prayer Request
```http
PUT /api/prayer-requests/{id}/approve
Authorization: Bearer {token}
```

### Mark as Answered
```http
PUT /api/prayer-requests/{id}/answered
Authorization: Bearer {token}
```

---

## Departments

### Get All Departments
```http
GET /api/departments
Authorization: Bearer {token}
```

### Get Department by ID
```http
GET /api/departments/{id}
Authorization: Bearer {token}
```

### Create Department
```http
POST /api/departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Youth Ministry",
  "description": "Ministry for young adults",
  "leaderId": 1
}
```

### Update Department
```http
PUT /api/departments/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Youth Ministry",
  "description": "Updated description",
  "leaderId": 2
}
```

### Delete Department
```http
DELETE /api/departments/{id}
Authorization: Bearer {token}
```

---

## Notifications

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

### Get Unread Count
```http
GET /api/notifications/unread/count
Authorization: Bearer {token}
```

### Mark as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {token}
```

---

## Reports

### Membership Report (PDF)
```http
GET /api/reports/membership/pdf
Authorization: Bearer {token}
```

### Membership Report (Excel)
```http
GET /api/reports/membership/excel
Authorization: Bearer {token}
```

### Financial Report (PDF)
```http
GET /api/reports/financial/pdf?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

### Financial Report (Excel)
```http
GET /api/reports/financial/excel?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

### Attendance Report (PDF)
```http
GET /api/reports/attendance/pdf?startDate=2024-01-01&endDate=2024-06-01
Authorization: Bearer {token}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2024-06-01T00:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2024-06-01T00:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-06-01T00:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-06-01T00:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Member not found with id: 123"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests. Please try again later."
}
```
