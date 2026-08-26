# 🏫 World-Class School Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

A comprehensive, enterprise-grade, fully dynamic School Management System built with modern technologies. This platform provides end-to-end management for educational institutions with AI-powered insights, real-time communication, mobile applications, and extensive third-party integrations.

## ✨ Key Features

### 🎯 Core Modules
- **Student Management** - Complete lifecycle management from admission to graduation
- **Staff & HR Management** - Recruitment, payroll, performance tracking
- **Academic Management** - Classes, subjects, sections, timetables
- **Attendance System** - Biometric, RFID, and manual attendance tracking
- **Examination & Grading** - Exam scheduling, grading, report cards
- **Fee Management** - Invoicing, online payments, refunds, financial reports
- **Library Management** - Book catalog, issuing, returns, fines
- **Transport Management** - Route planning, vehicle tracking, fees
- **Hostel Management** - Room allocation, amenities, fees
- **Communication Hub** - Notifications, messaging, announcements

### 🚀 Advanced Features

#### 🤖 AI-Powered Analytics
- Predictive analytics for student dropout risks
- Performance trend analysis and insights
- Personalized learning path recommendations
- Automated risk assessment with actionable recommendations
- Daily automated analytics processing

#### 📹 Video Conferencing Integration
- WebRTC-based video meetings
- Multi-participant rooms with screen sharing
- Scheduled and instant meetings
- Session recording and playback
- Real-time chat during sessions

#### 💳 Payment Gateway Integrations
- **Stripe** - Credit/debit cards, digital wallets
- **PayPal** - International payments (architecture ready)
- **Razorpay** - India-specific payment methods (architecture ready)
- Recurring fee automation
- Invoice generation and reminders
- Refund processing

#### 🔐 Biometric Attendance
- Fingerprint recognition
- Face recognition with liveness detection
- Iris scanning support
- RFID card integration
- Anti-spoofing mechanisms
- Real-time attendance sync

#### 📊 Advanced Reporting Engine
- Dynamic report builder
- 50+ pre-built report templates
- Multi-format exports (PDF, Excel, CSV)
- Scheduled report generation
- Role-based report access
- Interactive dashboards with charts

#### 📱 Mobile Applications
- **iOS & Android** native apps via React Native
- Offline-first architecture
- Biometric authentication (Face ID, Touch ID)
- Real-time notifications
- Parent portal access
- Student self-service
- Teacher mobile tools

#### 🧩 Marketplace for Extensions
- Plugin architecture for third-party extensions
- Custom module development framework
- API marketplace for integrations
- Theme customization support
- Webhook system for events

## 🏗️ Technology Stack

### Backend
- **Framework**: NestJS 10+ (Node.js + TypeScript)
- **Database**: PostgreSQL 14+ with TypeORM
- **Caching**: Redis
- **Authentication**: JWT with Passport.js
- **Real-time**: Socket.io
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Task Scheduling**: @nestjs/schedule

### Frontend
- **Framework**: React 18+ with Next.js
- **UI Library**: Material-UI / Ant Design
- **State Management**: Redux Toolkit / Zustand
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Biometrics**: expo-local-authentication
- **Video**: react-native-webrtc
- **Payments**: stripe-react-native

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (production-ready)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis (optional for caching)
- Docker & Docker Compose (recommended)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd school-management-system

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:3001/api
# Swagger Docs: http://localhost:3001/api/docs
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your database in .env
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=postgres
# DATABASE_PASSWORD=yourpassword
# DATABASE_NAME=school_management

# Create database
createdb school_management

# Run migrations
npm run migration:run

# Seed initial data (optional)
npm run seed

# Start development server
npm run start:dev

# Access Swagger documentation
# http://localhost:3000/api/docs
```

### Option 3: Mobile App Development

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
npm run build:ios
npm run build:android
```

## 📁 Project Structure

```
school-management-system/
├── src/
│   ├── common/                 # Shared utilities
│   │   ├── decorators/        # Custom decorators (@Roles, @CurrentUser)
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth & Role guards
│   │   ├── interceptors/      # Request/response interceptors
│   │   └── pipes/             # Validation pipes
│   ├── config/                # Configuration files
│   ├── database/
│   │   ├── entities/          # TypeORM entities
│   │   └── migrations/        # Database migrations
│   ├── gateways/              # WebSocket gateways (Socket.io)
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── users/             # User management
│   │   ├── students/          # Student management
│   │   ├── staff/             # Staff management
│   │   ├── academics/         # Academic structure
│   │   ├── attendance/        # Attendance tracking
│   │   ├── examinations/      # Exam management
│   │   ├── fees/              # Fee collection
│   │   ├── library/           # Library system
│   │   ├── transport/         # Transport management
│   │   ├── notifications/     # Real-time notifications
│   │   ├── ai-analytics/      # AI-powered analytics ⭐
│   │   ├── video-conferencing/# Video meetings ⭐
│   │   ├── payments/          # Payment gateway integration ⭐
│   │   ├── biometric-attendance/ # Biometric system ⭐
│   │   ├── reporting-engine/  # Advanced reporting ⭐
│   │   └── marketplace/       # Extension marketplace ⭐
│   ├── swagger/               # Swagger configuration
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── mobile-app/                # React Native mobile app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── assets/
│   └── package.json
├── k8s/                       # Kubernetes manifests
│   ├── base/
│   └── overlays/
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Docker configuration
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-Based Access Control (RBAC)** with granular permissions
- **Input Validation** using class-validator
- **SQL Injection Prevention** via TypeORM parameterized queries
- **XSS Protection** with input sanitization
- **CORS Configuration** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Helmet.js** for HTTP security headers
- **Biometric Authentication** for mobile apps
- **Encrypted Data Storage** for sensitive information

## 📊 API Documentation

Access interactive API documentation at:
```
http://localhost:3000/api/docs
```

The API follows RESTful conventions with JSON responses. All endpoints (except public ones) require JWT authentication.

### Example API Calls

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.com", "password": "password"}'

# Get students (with JWT token)
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer <token>"

# Create invoice
curl -X POST http://localhost:3000/api/payments/invoices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uuid",
    "lineItems": [{"description": "Tuition Fee", "quantity": 1, "unitPrice": 5000}],
    "dueDate": "2024-12-31"
  }'
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Mobile app tests
cd mobile-app && npm test
```

## 📦 Deployment

### Production Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -k k8s/overlays/production

# Check status
kubectl get pods -n school-management

# Scale services
kubectl scale deployment api --replicas=3 -n school-management
```

### Environment Variables

See `.env.example` for all required environment variables:

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=school_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
```

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for:

- **Continuous Integration**: Run tests on every push
- **Code Quality**: ESLint and Prettier checks
- **Security Scanning**: Dependency vulnerability checks
- **Docker Build**: Build and push images to registry
- **Deployment**: Automatic deployment to staging/production

## 📈 Monitoring & Logging

- **Application Logs**: Winston with file and console transports
- **Error Tracking**: Sentry integration ready
- **Metrics**: Prometheus metrics endpoint
- **Health Checks**: `/health` and `/ready` endpoints
- **APM**: New Relic/DataDog integration ready

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Email: support@schoolmanagement.com
- Documentation: https://docs.schoolmanagement.com
- Issue Tracker: https://github.com/your-org/school-management/issues

## 🎯 Roadmap

- [ ] Microservices architecture migration
- [ ] GraphQL API support
- [ ] Advanced timetable generator
- [ ] Learning Management System (LMS) integration
- [ ] Parent-teacher meeting scheduler
- [ ] Alumni management module
- [ ] Inventory management
- [ ] Hospital/clinic management
- [ ] Certificate generator
- [ ] Multi-language support (i18n)

---

Built with ❤️ for educational institutions worldwide
