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
pnpm install
pnpm dev
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

Core endpoints (see `docs/API_DOCUMENTATION.md` for the full surface — ~49 controllers):

### Authentication
- `POST /api/auth/login` - User login (sets httpOnly auth cookies)
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token (cookie or body)
- `POST /api/auth/logout` - User logout

### Members / Attendance / Visitors
- `GET|POST /api/members`, `PUT|DELETE /api/members/{id}`
- `GET|POST /api/attendance`
- `GET|POST /api/visitors`

### Finance
- `GET|POST /api/finance/donations|tithes|offerings|expenses`
- `GET /api/finance/members/{id}/contributions`
- Funds, budgets, pledges, goals, cash-flow, receipts, recurring, bank reconciliation

### Operations
- Events, announcements, departments, prayer requests
- Analytics, forecasts, reports (PDF/Excel), donor retention

### Platform
- Multi-church admin, subscriptions (Paystack), API keys, white-label branding, 2FA, audit logs, CSV import

## Documentation

- [Software Requirements Specification](docs/SRS_DOCUMENTATION.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Documentation](docs/DATABASE_DOCUMENTATION.md)
- [User Manual](docs/USER_MANUAL.md)
- [Administrator Manual](docs/ADMIN_MANUAL.md)
- [Installation & Deployment Guide](docs/INSTALLATION_DEPLOYMENT_GUIDE.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md) (Render + Vercel + Neon)

## Environment Variables

### Backend
- `DATABASE_URL` - JDBC PostgreSQL URL
- `DATABASE_USERNAME` / `DATABASE_PASSWORD` - Database credentials
- `JWT_SECRET` - Base64-encoded secret (>= 256 bits); **required in production**
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins (default `http://localhost:3000`)
- `COOKIE_SECURE` - Set `true` behind HTTPS
- `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_WEBHOOK_SECRET`

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g. `http://localhost:8080/api`)

### Mobile
- `EXPO_PUBLIC_API_URL` - Backend API URL

## License

MIT License
