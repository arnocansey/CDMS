# Church Database Management System (CDMS)

A comprehensive web-based and mobile church database management system built with modern technologies.

## Features

- **Member Management**: Register, update, and manage church members
- **Attendance Tracking**: Record and track service attendance
- **Financial Management**: Track donations, tithes, offerings, and expenses
- **Event Management**: Create and manage church events
- **Announcements**: Publish and manage church announcements
- **Prayer Requests**: Submit and track prayer requests
- **Department Management**: Organize members into departments
- **User Management**: Role-based access control with multiple user roles
- **Dashboard**: Analytics and reporting with charts and graphs
- **Mobile App**: Native iOS and Android applications
- **Reporting**: PDF and Excel export for all reports

## Project Structure

```
cdms/
├── backend/                    # Spring Boot 3.3 + Java 21
│   ├── src/main/java/com/cdms/
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Data repositories
│   │   ├── service/           # Business logic
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Data transfer objects
│   │   ├── security/          # JWT authentication
│   │   ├── config/            # Configuration
│   │   └── exception/         # Exception handling
│   └── pom.xml
├── frontend/                   # Next.js 15 + React 19
│   ├── app/                   # Pages and layouts
│   ├── components/            # Reusable components
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utilities
├── mobile/                     # React Native + Expo
│   ├── src/
│   │   ├── screens/           # App screens
│   │   ├── components/        # Reusable components
│   │   ├── navigation/        # Navigation setup
│   │   ├── services/          # API services
│   │   └── hooks/             # Custom hooks
│   └── App.tsx
├── docs/                       # Documentation
│   ├── SRS_DOCUMENTATION.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DOCUMENTATION.md
│   ├── USER_MANUAL.md
│   ├── ADMIN_MANUAL.md
│   └── INSTALLATION_DEPLOYMENT_GUIDE.md
├── .github/workflows/         # CI/CD pipeline
├── nginx/                      # Nginx configuration
└── docker-compose.yml         # Docker setup
```

## Technology Stack

### Backend
- Spring Boot 3.3
- Java 21
- PostgreSQL 16
- Spring Security with JWT Authentication
- Spring Data JPA
- Flyway Migrations
- Maven

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- TanStack Query
- Recharts

### Mobile
- React Native
- Expo
- TypeScript
- React Navigation
- Expo Notifications

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access | All modules |
| **Pastor** | View members, attendance, reports | Read-only + prayer requests |
| **Secretary** | Manage members and announcements | Member/attendance management |
| **Treasurer** | Manage finances | Full financial access |
| **Department Leader** | Department management | Department-specific |
| **Member** | Basic access | View only + prayer requests |

## Getting Started

### Prerequisites
- Java 21
- Node.js 20+
- PostgreSQL 16
- Maven

### Backend Setup

```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npm start
```

### Docker Setup

```bash
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

### Attendance
- `GET /api/attendance` - Get attendance by date
- `POST /api/attendance` - Record attendance

### Finance
- `GET /api/finance/donations` - Get donations
- `POST /api/finance/donations` - Record donation
- `GET /api/finance/tithes` - Get tithes
- `POST /api/finance/tithes` - Record tithe
- `GET /api/finance/offerings` - Get offerings
- `POST /api/finance/offerings` - Record offering
- `GET /api/finance/expenses` - Get expenses
- `POST /api/finance/expenses` - Record expense

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement

### Prayer Requests
- `GET /api/prayer-requests` - Get all prayer requests
- `POST /api/prayer-requests` - Create prayer request
- `PUT /api/prayer-requests/{id}/approve` - Approve request
- `PUT /api/prayer-requests/{id}/answered` - Mark as answered

### Reports
- `GET /api/reports/membership/pdf` - Membership report (PDF)
- `GET /api/reports/membership/excel` - Membership report (Excel)
- `GET /api/reports/financial/pdf` - Financial report (PDF)
- `GET /api/reports/financial/excel` - Financial report (Excel)
- `GET /api/reports/attendance/pdf` - Attendance report (PDF)

## Documentation

- [Software Requirements Specification](docs/SRS_DOCUMENTATION.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Documentation](docs/DATABASE_DOCUMENTATION.md)
- [User Manual](docs/USER_MANUAL.md)
- [Administrator Manual](docs/ADMIN_MANUAL.md)
- [Installation & Deployment Guide](docs/INSTALLATION_DEPLOYMENT_GUIDE.md)

## Environment Variables

### Backend
- `SPRING_DATASOURCE_URL` - Database URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Mobile
- `EXPO_PUBLIC_API_URL` - Backend API URL

## License

MIT License
