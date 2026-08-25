# School Management System - API Documentation

## Overview

This document provides comprehensive documentation for the School Management System REST API. The API follows RESTful principles and uses JWT for authentication.

**Base URL**: `http://localhost:3000/api/v1`

**API Documentation (Swagger)**: `http://localhost:3000/api/docs`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Students](#students)
4. [Staff](#staff)
5. [Academics](#academics)
6. [Attendance](#attendance)
7. [Examinations](#examinations)
8. [Fees](#fees)
9. [Library](#library)
10. [Transport](#transport)
11. [Notifications](#notifications)

---

## Authentication

All API endpoints (except login and register) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login

**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "admin@school.edu",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@school.edu",
    "role": "SUPER_ADMIN",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### Register

**POST** `/auth/register`

Register a new user (requires SUPER_ADMIN or ADMIN role).

**Request Body:**
```json
{
  "email": "teacher@school.edu",
  "password": "Password@123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "TEACHER"
}
```

### Refresh Token

**POST** `/auth/refresh`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

**POST** `/auth/logout`

Logout user and invalidate tokens.

---

## Users

### Get All Users

**GET** `/users`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name or email
- `role` (string): Filter by role

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Get User by ID

**GET** `/users/:id`

### Update User

**PATCH** `/users/:id`

### Delete User

**DELETE** `/users/:id` (Soft delete)

---

## Students

### Get All Students

**GET** `/students`

**Query Parameters:**
- `page`, `limit`, `search`
- `classId` (string): Filter by class
- `sectionId` (string): Filter by section
- `status` (string): active, inactive, graduated

### Create Student

**POST** `/students`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "2010-05-15",
  "gender": "FEMALE",
  "bloodGroup": "A+",
  "classId": "uuid",
  "sectionId": "uuid",
  "admissionNumber": "ADM2024001",
  "admissionDate": "2024-04-01",
  "parentId": "uuid",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "contactInfo": {
    "email": "jane.smith@student.edu",
    "phone": "+1234567890"
  }
}
```

### Get Student by ID

**GET** `/students/:id`

### Update Student

**PATCH** `/students/:id`

### Delete Student

**DELETE** `/students/:id`

### Get Student Academic History

**GET** `/students/:id/academics`

### Get Student Attendance

**GET** `/students/:id/attendance`

### Get Student Results

**GET** `/students/:id/results`

---

## Staff

### Get All Staff

**GET** `/staff`

**Query Parameters:**
- `page`, `limit`, `search`
- `department` (string): Filter by department
- `designation` (string): Filter by designation
- `status` (string): active, inactive

### Create Staff

**POST** `/staff`

**Request Body:**
```json
{
  "userId": "uuid",
  "employeeId": "EMP2024001",
  "department": "Mathematics",
  "designation": "Senior Teacher",
  "joiningDate": "2024-01-15",
  "qualification": "M.Ed Mathematics",
  "experience": 5,
  "salary": {
    "basic": 50000,
    "allowances": 10000,
    "currency": "USD"
  },
  "address": {...},
  "contactInfo": {...}
}
```

### Get Staff by ID

**GET** `/staff/:id`

### Update Staff

**PATCH** `/staff/:id`

### Delete Staff

**DELETE** `/staff/:id`

---

## Academics

### Classes

#### Get All Classes

**GET** `/academics/classes`

#### Create Class

**POST** `/academics/classes`

```json
{
  "name": "Grade 10",
  "code": "G10",
  "description": "Tenth Grade"
}
```

### Sections

#### Get All Sections

**GET** `/academics/sections`

#### Create Section

**POST** `/academics/sections`

```json
{
  "name": "Section A",
  "code": "A",
  "classId": "uuid",
  "capacity": 40
}
```

### Subjects

#### Get All Subjects

**GET** `/academics/subjects`

#### Create Subject

**POST** `/academics/subjects`

```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "classId": "uuid",
  "teacherId": "uuid",
  "credits": 3
}
```

### Academic Sessions

#### Get All Sessions

**GET** `/academics/sessions`

#### Create Session

**POST** `/academics/sessions`

```json
{
  "name": "2024-2025",
  "startDate": "2024-04-01",
  "endDate": "2025-03-31",
  "isCurrent": true
}
```

### Terms

#### Get All Terms

**GET** `/academics/terms`

#### Create Term

**POST** `/academics/terms`

```json
{
  "name": "First Term",
  "code": "T1",
  "sessionId": "uuid",
  "startDate": "2024-04-01",
  "endDate": "2024-08-31"
}
```

### Timetable

#### Get Class Timetable

**GET** `/academics/timetable/:classId`

#### Create Timetable Entry

**POST** `/academics/timetable`

```json
{
  "classId": "uuid",
  "sectionId": "uuid",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "10:00",
  "roomNumber": "101"
}
```

---

## Attendance

### Student Attendance

#### Mark Attendance

**POST** `/attendance/students`

```json
{
  "classId": "uuid",
  "sectionId": "uuid",
  "date": "2024-04-15",
  "records": [
    {
      "studentId": "uuid",
      "status": "PRESENT",
      "remarks": ""
    }
  ]
}
```

#### Get Attendance

**GET** `/attendance/students`

**Query Parameters:**
- `classId`, `sectionId`
- `startDate`, `endDate`
- `studentId`

### Staff Attendance

#### Mark Attendance

**POST** `/attendance/staff`

```json
{
  "staffId": "uuid",
  "date": "2024-04-15",
  "checkIn": "08:30",
  "checkOut": "16:30",
  "status": "PRESENT"
}
```

---

## Examinations

### Get All Examinations

**GET** `/examinations`

### Create Examination

**POST** `/examinations`

```json
{
  "name": "Mid Term Examination",
  "code": "MID2024",
  "termId": "uuid",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "type": "WRITTEN"
}
```

### Create Exam Schedule

**POST** `/examinations/schedule`

```json
{
  "examId": "uuid",
  "subjectId": "uuid",
  "classId": "uuid",
  "date": "2024-06-01",
  "startTime": "10:00",
  "endTime": "13:00",
  "roomNumber": "101",
  "maxMarks": 100,
  "passMarks": 35
}
```

### Enter Marks

**POST** `/examinations/marks`

```json
{
  "scheduleId": "uuid",
  "marks": [
    {
      "studentId": "uuid",
      "marksObtained": 85,
      "remarks": "Excellent"
    }
  ]
}
```

### Get Results

**GET** `/examinations/results/:studentId`

### Generate Report Card

**POST** `/examinations/report-card/:studentId`

---

## Fees

### Fee Structure

#### Get All Fee Structures

**GET** `/fees/structures`

#### Create Fee Structure

**POST** `/fees/structures`

```json
{
  "classId": "uuid",
  "academicSessionId": "uuid",
  "feeType": "TUITION",
  "amount": 5000,
  "frequency": "MONTHLY",
  "dueDate": 5
}
```

### Fee Collection

#### Collect Fee

**POST** `/fees/collections`

```json
{
  "studentId": "uuid",
  "structureId": "uuid",
  "amount": 5000,
  "paymentMethod": "CASH",
  "transactionId": "TXN123456",
  "remarks": "Monthly tuition fee"
}
```

#### Get Fee History

**GET** `/fees/history/:studentId`

#### Get Due Fees

**GET** `/fees/due/:studentId`

---

## Library

### Books

#### Get All Books

**GET** `/library/books`

**Query Parameters:**
- `search`, `category`, `author`
- `available` (boolean): Filter available books

#### Add Book

**POST** `/library/books`

```json
{
  "title": "Introduction to Algorithms",
  "isbn": "978-0262033848",
  "author": "Thomas H. Cormen",
  "category": "Computer Science",
  "publisher": "MIT Press",
  "publishYear": 2009,
  "quantity": 5,
  "rackNumber": "A-101"
}
```

### Issue Book

**POST** `/library/issue`

```json
{
  "bookId": "uuid",
  "studentId": "uuid",
  "issueDate": "2024-04-15",
  "dueDate": "2024-05-15"
}
```

### Return Book

**POST** `/library/return`

```json
{
  "issueId": "uuid",
  "returnDate": "2024-05-10",
  "condition": "GOOD",
  "fineAmount": 0
}
```

---

## Transport

### Routes

#### Get All Routes

**GET** `/transport/routes`

#### Create Route

**POST** `/transport/routes`

```json
{
  "name": "Route 1 - North Zone",
  "code": "R001",
  "stops": [
    {
      "name": "Main Gate",
      "sequence": 1,
      "arrivalTime": "07:30"
    }
  ],
  "totalDistance": 15.5,
  "estimatedDuration": 45
}
```

### Vehicles

#### Get All Vehicles

**GET** `/transport/vehicles`

#### Add Vehicle

**POST** `/transport/vehicles`

```json
{
  "vehicleNumber": "BUS-001",
  "type": "BUS",
  "capacity": 50,
  "routeId": "uuid",
  "driverName": "John Driver",
  "driverPhone": "+1234567890"
}
```

### Assign Student to Transport

**POST** `/transport/assign`

```json
{
  "studentId": "uuid",
  "vehicleId": "uuid",
  "pickupPoint": "Main Gate",
  "dropPoint": "School"
}
```

---

## Notifications

### Get All Notifications

**GET** `/notifications`

**Query Parameters:**
- `type`: ALL, ANNOUNCEMENT, ATTENDANCE, FEE, EXAM
- `read` (boolean): Filter read/unread

### Mark as Read

**PATCH** `/notifications/:id/read`

### Mark All as Read

**POST** `/notifications/read-all`

### Send Notification

**POST** `/notifications` (ADMIN only)

```json
{
  "title": "School Closure",
  "message": "School will remain closed on Monday due to holiday.",
  "type": "ANNOUNCEMENT",
  "targetAudience": ["STUDENT", "PARENT", "STAFF"],
  "scheduledAt": "2024-04-15T08:00:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": ["Validation error message"],
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

---

## Webhooks

Configure webhooks to receive real-time notifications for events:
- Student admission
- Fee payment
- Attendance alerts
- Examination results

Contact system administrator to configure webhooks.

---

## Support

For API support, contact: api-support@schoolms.example.com

**Last Updated**: April 2024
**API Version**: v1.0.0
