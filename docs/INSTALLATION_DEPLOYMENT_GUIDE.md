# Installation & Deployment Guide

## Church Database Management System (CDMS)

**Version:** 1.0  
**Last Updated:** June 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Docker Setup](#docker-setup)
4. [Production Deployment](#production-deployment)
5. [Mobile App Setup](#mobile-app-setup)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Development Requirements
| Software | Version | Purpose |
|----------|---------|---------|
| Java | 21+ | Backend runtime |
| Node.js | 20+ | Frontend runtime |
| PostgreSQL | 16+ | Database |
| Maven | 3.9+ | Backend build |
| pnpm | 9+ | Frontend package manager |
| Git | Latest | Version control |

### Docker Requirements
| Software | Version |
|----------|---------|
| Docker | 24+ |
| Docker Compose | 2.20+ |

### Mobile Development Requirements
| Software | Version |
|----------|---------|
| Node.js | 20+ |
| Expo CLI | Latest |
| Android Studio | Latest (Android) |
| Xcode | 15+ (iOS) |

---

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/cdms.git
cd cdms
```

### 2. Database Setup

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql@16

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE church_db;

# Create user (optional)
CREATE USER cdms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE church_db TO cdms_user;

# Exit
\q
```

#### Run Migrations
```bash
cd backend
mvn flyway:migrate
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install pnpm (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

The frontend will start on `http://localhost:3000`

### 5. Verify Installation
1. Open browser to `http://localhost:3000`
2. You should see the login page
3. Use test credentials:
   - Email: `admin@church.com`
   - Password: `admin123`

---

## Docker Setup

### Quick Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-org/cdms.git
cd cdms

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Docker Services
| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| backend | 8080 | Spring Boot API |
| frontend | 3000 | Next.js application |

### Building Docker Images

```bash
# Build backend image
docker build -t cdms-backend ./backend

# Build frontend image
docker build -t cdms-frontend ./frontend
```

---

## Production Deployment

### 1. Server Requirements
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 20 GB | 50 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### 2. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y
```

### 3. Deploy with Docker Compose

```bash
# Clone repository
git clone https://github.com/your-org/cdms.git
cd cdms

# Create environment file
cp .env.example .env
nano .env  # Edit with production values

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### 4. SSL Configuration

#### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/key.pem
```

#### Update Nginx Configuration
```bash
# Edit nginx configuration
nano nginx/nginx.conf

# Update server_name to your domain
server_name yourdomain.com;

# Restart nginx
docker-compose restart nginx
```

### 5. Domain Configuration
1. Point your domain's A record to your server IP
2. Update `nginx/nginx.conf` with your domain
3. Configure CORS in backend with your production domain

### 6. Backup Configuration

```bash
# Create backup script
nano /opt/cdms/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec cdms-postgres pg_dump -U postgres church_db | gzip > /backups/cdms_$DATE.sql.gz

# Add to crontab for daily backups
crontab -e
0 2 * * * /opt/cdms/backup.sh
```

---

## Mobile App Setup

### Development Setup

```bash
cd mobile

# Install pnpm (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start Expo development server
pnpm start

# Run on iOS simulator
pnpm run ios

# Run on Android emulator
pnpm run android
```

### Building for Production

#### iOS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

#### Android
```bash
# Build for Android
eas build --platform android
```

### Publishing to App Stores

#### Apple App Store
1. Create an Apple Developer account
2. Configure app in App Store Connect
3. Upload build using EAS Submit
4. Submit for review

#### Google Play Store
1. Create a Google Play Developer account
2. Create app listing
3. Upload build using EAS Submit
4. Submit for review

---

## Environment Variables

### Backend (.env)
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/church_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password

# JWT
jwt.secret=your-256-bit-secret-key-here
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS
app.cors.allowed-origins=http://localhost:3000

# Email (optional)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: Connection refused
```
**Solution:**
1. Verify PostgreSQL is running
2. Check connection parameters
3. Ensure database exists

#### Port Already in Use
```
Error: Port 8080 already in use
```
**Solution:**
1. Find process using the port: `lsof -i :8080`
2. Kill the process: `kill -9 <PID>`
3. Or change the port in application.properties

#### Build Failures
```
Error: Maven build failed
```
**Solution:**
1. Clean and rebuild: `mvn clean install`
2. Check Java version: `java -version`
3. Verify Maven settings

### Viewing Logs

```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs
docker-compose logs -f backend
```

### Health Checks

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Database connection
psql -U postgres -d church_db -c "SELECT 1;"
```

---

## Support

For deployment assistance:
- **Documentation:** See `/docs` folder
- **Issues:** Submit via GitHub Issues
- **Email:** devops@yourchurch.com
