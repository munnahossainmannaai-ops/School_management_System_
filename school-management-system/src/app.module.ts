import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { StaffModule } from './modules/staff/staff.module';
import { AcademicsModule } from './modules/academics/academics.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ExaminationsModule } from './modules/examinations/examinations.module';
import { FeesModule } from './modules/fees/fees.module';
import { LibraryModule } from './modules/library/library.module';
import { TransportModule } from './modules/transport/transport.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration module - loads .env files
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    
    // Application modules
    AuthModule,
    UsersModule,
    StudentsModule,
    StaffModule,
    AcademicsModule,
    AttendanceModule,
    ExaminationsModule,
    FeesModule,
    LibraryModule,
    TransportModule,
    NotificationsModule,
  ],
})
export class AppModule {}
