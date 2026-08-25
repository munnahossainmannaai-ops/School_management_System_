import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

import { User, Student, Staff } from './entities/user.entity';
import { AcademicClass, Section, Subject, AcademicSession, Term } from './entities/academic.entity';
import { DailyAttendance, MonthlyAttendanceSummary } from './entities/attendance.entity';
import { Examination, ExamSchedule, ExamResult, ReportCard } from './entities/examination.entity';
import {
  FeeStructure,
  FeeInvoice,
  FeeInvoiceItem,
  FeePayment,
  FeeConcession,
} from './entities/fee.entity';
import { Book, BookIssue, BookReservation, LibraryFine } from './entities/library.entity';
import {
  Notification,
  UserNotification,
  NotificationTemplate,
  Announcement,
} from './entities/notification.entity';
import {
  TransportRoute,
  Vehicle,
  Driver,
  VehicleAssignment,
  StudentTransport,
} from './entities/transport.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'school_management',
  entities: [
    User,
    Student,
    Staff,
    AcademicClass,
    Section,
    Subject,
    AcademicSession,
    Term,
    DailyAttendance,
    MonthlyAttendanceSummary,
    Examination,
    ExamSchedule,
    ExamResult,
    ReportCard,
    FeeStructure,
    FeeInvoice,
    FeeInvoiceItem,
    FeePayment,
    FeeConcession,
    Book,
    BookIssue,
    BookReservation,
    LibraryFine,
    Notification,
    UserNotification,
    NotificationTemplate,
    Announcement,
    TransportRoute,
    Vehicle,
    Driver,
    VehicleAssignment,
    StudentTransport,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Set to true only for development, false for production
  logging: process.env.NODE_ENV === 'development',
  migrationsTableName: 'migrations',
});
