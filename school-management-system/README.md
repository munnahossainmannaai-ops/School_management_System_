# School Management System

A world-class, fully dynamic School Management System built with NestJS (TypeScript) for the backend.

## 🏗️ Architecture

### Technology Stack
- **Backend**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.io
- **Validation**: class-validator & class-transformer

### Core Modules
- ✅ Authentication & Authorization (JWT + RBAC)
- ✅ User Management (Multi-role support)
- ✅ Student Management
- ✅ Staff/Faculty Management
- ✅ Academic Management (Classes, Sections, Subjects)
- ✅ Attendance Tracking
- ✅ Examination & Results
- ✅ Fee Management
- ✅ Library Management
- ✅ Transport Management
- ✅ Real-time Notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
cd school-management-system
```

2. Install dependencies
```bash
npm install
```

3. Copy environment file and configure
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Create PostgreSQL database
```sql
CREATE DATABASE school_management;
```

5. Run database migrations (auto-runs on first start)

6. Start development server
```bash
npm run start:dev
```

7. Access API documentation
```
http://localhost:3000/api/docs
```

## 📁 Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators (@Roles)
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth & Role guards
│   ├── interceptors/      # Request/response interceptors
│   └── pipes/             # Validation pipes
├── config/                # Configuration files
├── database/
│   ├── entities/          # TypeORM entities
│   └── migrations/        # Database migrations
├── gateways/              # WebSocket gateways
├── modules/               # Feature modules
│   ├── auth/              # Authentication
│   ├── users/             # User management
│   ├── students/          # Student management
│   ├── staff/             # Staff management
│   ├── academics/         # Academic structure
│   ├── attendance/        # Attendance tracking
│   ├── examinations/      # Exam management
│   ├── fees/              # Fee collection
│   ├── library/           # Library system
│   ├── transport/         # Transport management
│   └── notifications/     # Real-time notifications
├── swagger/               # Swagger configuration
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## 🔐 Authentication & Authorization

The system uses JWT-based authentication with role-based access control (RBAC).

### Available Roles
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `TEACHER` - Teaching staff
- `STUDENT` - Students
- `PARENT` - Parents/Guardians
- `STAFF` - Non-teaching staff
- `LIBRARIAN` - Library management
- `ACCOUNTANT` - Fee management

### Using Role Guards
```typescript
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@Get()
async findAll() {
  // Only accessible by SUPER_ADMIN and ADMIN
}
```

## 📝 API Documentation

Access interactive API documentation at:
```
http://localhost:3000/api/docs
```

Features:
- Complete API endpoint documentation
- Try out endpoints directly from browser
- JWT authentication support
- Request/Response schemas

## 🔧 Development Commands

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug

# Run tests
npm run test
npm run test:cov

# Lint code
npm run lint
```

## 🌟 Key Features

### World-Class Standards
- ✅ Enterprise-grade architecture
- ✅ Comprehensive input validation
- ✅ Soft delete support
- ✅ Audit trails (createdAt, updatedAt, deletedAt)
- ✅ Pagination & filtering
- ✅ Search functionality
- ✅ Error handling
- ✅ Security best practices
- ✅ Scalable module structure
- ✅ API versioning ready

### Dynamic Capabilities
- Configurable workflows
- Multi-campus support ready
- Multi-language ready
- Customizable forms
- Flexible role permissions
- Real-time updates via WebSockets

## 📊 Database Schema

The system includes comprehensive entities for:
- Users (with polymorphic relationships)
- Students & Staff profiles
- Academic Classes, Sections, Subjects
- Academic Sessions & Terms
- Attendance records
- Examinations & Results
- Fee structures & Payments
- Library books & Issues
- Transport routes & Vehicles

## 🚀 Next Steps

To complete the system:
1. Implement remaining module services and controllers
2. Add comprehensive unit and e2e tests
3. Set up CI/CD pipeline
4. Configure Docker containerization
5. Add frontend integration (React/Next.js recommended)
6. Implement email notifications
7. Add file upload handling
8. Set up monitoring and logging

## 📄 License

MIT License

## 👥 Contributing

This is a professional-grade system. Follow best practices when contributing:
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow TypeScript strict mode
- Use ESLint rules

---

Built with ❤️ using NestJS
