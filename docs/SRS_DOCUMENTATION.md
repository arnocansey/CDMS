# Software Requirements Specification (SRS)

## Church Database Management System (CDMS)

**Version:** 1.0  
**Date:** June 2026  
**Authors:** CDMS Development Team

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive description of the Church Database Management System (CDMS). It outlines the functional and non-functional requirements for the system, which enables churches to efficiently manage their members, attendance, finances, events, and other administrative tasks.

### 1.2 Scope
CDMS is a web-based and mobile application system designed to streamline church management operations. The system includes:
- Web Application (Next.js 15)
- Mobile Application (React Native + Expo)
- REST API Backend (Spring Boot 3)
- PostgreSQL Database

### 1.3 Definitions, Acronyms, and Abbreviations
| Term | Definition |
|------|------------|
| CDMS | Church Database Management System |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| SRS | Software Requirements Specification |

---

## 2. Overall Description

### 2.1 Product Perspective
CDMS is a standalone system consisting of three main components:
1. **Frontend Web Application** - User interface for web browsers
2. **Mobile Application** - Native mobile app for iOS and Android
3. **Backend API Server** - RESTful API with business logic

### 2.2 Product Functions
The system provides the following core functions:
- User authentication and authorization
- Member management
- Attendance tracking
- Financial management (donations, tithes, offerings, expenses)
- Event management
- Announcement management
- Prayer request handling
- Department management
- Reporting and analytics

### 2.3 User Classes and Characteristics
| Role | Description | Access Level |
|------|-------------|--------------|
| Administrator | Full system access | All modules |
| Pastor | View members, attendance, reports | Read-only with prayer request management |
| Secretary | Manage members, attendance, announcements | Member and attendance management |
| Treasurer | Manage finances | Full financial module access |
| Department Leader | View department members | Department-specific access |
| Church Member | Basic access | View announcements, events, submit prayer requests |

---

## 3. Functional Requirements

### 3.1 Authentication Module
**FR-AUTH-001:** The system shall allow users to register with email and password.  
**FR-AUTH-002:** The system shall authenticate users using JWT tokens.  
**FR-AUTH-003:** The system shall support password reset functionality.  
**FR-AUTH-004:** The system shall implement refresh token rotation.  
**FR-AUTH-005:** The system shall enforce password complexity requirements (minimum 8 characters).

### 3.2 User Management Module
**FR-USER-001:** The administrator shall be able to create, edit, and delete users.  
**FR-USER-002:** The administrator shall be able to assign roles to users.  
**FR-USER-003:** The system shall display a list of all users with their roles.

### 3.3 Membership Module
**FR-MEM-001:** Authorized users shall be able to add new members.  
**FR-MEM-002:** Authorized users shall be able to edit member information.  
**FR-MEM-003:** The system shall support member search by name or email.  
**FR-MEM-004:** The system shall display member profiles with contact information.  
**FR-MEM-005:** The system shall track membership status (active/inactive).

### 3.4 Attendance Module
**FR-ATT-001:** Authorized users shall be able to record attendance for services.  
**FR-ATT-002:** The system shall display attendance history by date range.  
**FR-ATT-003:** The system shall generate attendance statistics.  
**FR-ATT-004:** The system shall support multiple service types (Sunday Service, Wednesday Service, etc.).

### 3.5 Financial Module
**FR-FIN-001:** Authorized users shall be able to record donations.  
**FR-FIN-002:** Authorized users shall be able to record tithes.  
**FR-FIN-003:** Authorized users shall be able to record offerings.  
**FR-FIN-004:** Authorized users shall be able to record expenses.  
**FR-FIN-005:** The system shall calculate total income and expenses.  
**FR-FIN-006:** The system shall generate financial reports.

### 3.6 Event Management Module
**FR-EVT-001:** Authorized users shall be able to create, edit, and delete events.  
**FR-EVT-002:** The system shall display events in a calendar view.  
**FR-EVT-003:** The system shall support recurring events.  
**FR-EVT-004:** The system shall send notifications for upcoming events.

### 3.7 Announcement Module
**FR-ANN-001:** Authorized users shall be able to create and publish announcements.  
**FR-ANN-002:** The system shall display active announcements to members.  
**FR-ANN-003:** The system shall support announcement scheduling with publish and expiry dates.

### 3.8 Prayer Request Module
**FR-PR-001:** Members shall be able to submit prayer requests.  
**FR-PR-002:** The system shall support anonymous prayer requests.  
**FR-PR-003:** Authorized users shall be able to approve and mark prayer requests as prayed for.  
**FR-PR-004:** The system shall track prayer request status (Pending, In Progress, Answered, Closed).

---

## 4. Non-Functional Requirements

### 4.1 Security
**NFR-SEC-001:** The system shall use JWT for authentication.  
**NFR-SEC-002:** The system shall encrypt passwords using BCrypt.  
**NFR-SEC-003:** The system shall implement RBAC for access control.  
**NFR-SEC-004:** The system shall prevent SQL injection attacks.  
**NFR-SEC-005:** The system shall implement XSS protection headers.  
**NFR-SEC-006:** The system shall implement rate limiting (60 requests/minute).

### 4.2 Performance
**NFR-PER-001:** The system shall respond to API requests within 2 seconds.  
**NFR-PER-002:** The system shall support at least 100 concurrent users.  
**NFR-PER-003:** The database shall handle at least 10,000 member records.

### 4.3 Usability
**NFR-USE-001:** The web application shall be responsive on all screen sizes.  
**NFR-USE-002:** The mobile application shall support iOS and Android platforms.  
**NFR-USE-003:** The system shall support dark and light themes.

### 4.4 Reliability
**NFR-REL-001:** The system shall have 99.5% uptime.  
**NFR-REL-002:** The system shall perform daily database backups.  
**NFR-REL-003:** The system shall implement audit logging for all data changes.

---

## 5. System Architecture

### 5.1 Architecture Overview
The system follows a three-tier architecture:
1. **Presentation Tier** - Web and Mobile applications
2. **Application Tier** - Spring Boot REST API
3. **Data Tier** - PostgreSQL database

### 5.2 Technology Stack
| Component | Technology |
|-----------|------------|
| Web Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Mobile | React Native, Expo, TypeScript |
| Backend | Spring Boot 3, Java 21, Spring Security |
| Database | PostgreSQL 16 |
| Authentication | JWT with Refresh Tokens |
| Build Tools | Maven (Backend), pnpm (Frontend) |

---

## 6. Database Requirements

### 6.1 Data Entities
The system shall manage the following entities:
- Users and Roles
- Members
- Departments
- Attendance Records
- Donations, Tithes, Offerings
- Expenses
- Events
- Announcements
- Prayer Requests
- Notifications
- Audit Logs

### 6.2 Data Integrity
- Primary keys for all tables
- Foreign key constraints
- Unique constraints on email fields
- Check constraints for enum values
- Indexes on frequently queried columns

---

## 7. API Requirements

### 7.1 RESTful Endpoints
The system shall provide RESTful APIs for all CRUD operations:
- Authentication: `/api/auth/*`
- Members: `/api/members/*`
- Attendance: `/api/attendance/*`
- Finance: `/api/finance/*`
- Events: `/api/events/*`
- Announcements: `/api/announcements/*`
- Prayer Requests: `/api/prayer-requests/*`
- Departments: `/api/departments/*`
- Reports: `/api/reports/*`

### 7.2 API Response Format
All API responses shall follow a consistent JSON format with appropriate HTTP status codes.

---

## 8. Testing Requirements

### 8.1 Test Coverage
- Unit tests for all service classes
- Integration tests for API endpoints
- Minimum 80% code coverage

### 8.2 Test Types
- Unit Tests (JUnit 5, Mockito)
- Integration Tests (Spring Boot Test)
- API Tests (MockMvc)
- Frontend Tests (Jest, React Testing Library)

---

## 9. Deployment Requirements

### 9.1 Docker Support
- Dockerfile for backend and frontend
- Docker Compose for local development
- Docker images for production deployment

### 9.2 CI/CD Pipeline
- GitHub Actions for automated testing
- Automated Docker image building
- Deployment to production server

---

## 10. Appendices

### Appendix A: Database Schema
See `V1__init_schema.sql` for complete database schema.

### Appendix B: API Documentation
See `docs/API_DOCUMENTATION.md` for detailed API documentation.

### Appendix C: User Manual
See `docs/USER_MANUAL.md` for end-user documentation.
