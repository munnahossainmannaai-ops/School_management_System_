import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Student } from './user.entity';
import { AcademicClass } from './academic.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  EXCUSED = 'excused',
}

@Entity('daily_attendance')
export class DailyAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @Column({ type: 'date' })
  @IsDateString()
  date: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @Column({ type: 'time', nullable: true })
  @IsOptional()
  checkInTime?: string;

  @Column({ type: 'time', nullable: true })
  @IsOptional()
  checkOutTime?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  remarks?: string;

  @Column({ type: 'uuid', nullable: true })
  markedBy?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('monthly_attendance_summaries')
export class MonthlyAttendanceSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int', default: 0 })
  totalDays: number;

  @Column({ type: 'int', default: 0 })
  presentDays: number;

  @Column({ type: 'int', default: 0 })
  absentDays: number;

  @Column({ type: 'int', default: 0 })
  lateDays: number;

  @Column({ type: 'int', default: 0 })
  excusedDays: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  attendancePercentage: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
