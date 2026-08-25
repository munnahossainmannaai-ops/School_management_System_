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
import { IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Student } from './user.entity';
import { AcademicClass, Subject, Term } from './academic.entity';

export enum ExamType {
  UNIT_TEST = 'unit_test',
  HALF_YEARLY = 'half_yearly',
  ANNUAL = 'annual',
  QUARTERLY = 'quarterly',
  PRE_BOARD = 'pre_board',
  BOARD = 'board',
}

@Entity('examinations')
export class Examination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  name: string; // e.g., "First Term Examination 2024"

  @Column({
    type: 'enum',
    enum: ExamType,
  })
  @IsNotEmpty()
  examType: ExamType;

  @ManyToOne(() => Term, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column({ name: 'termId', type: 'uuid' })
  termId: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  instructions?: string;

  @Column({ type: 'int', default: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  totalMarks: number;

  @Column({ type: 'int', default: 40 })
  @IsNumber()
  @Min(0)
  passingMarks: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('exam_schedules')
export class ExamSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Examination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'examinationId' })
  examination: Examination;

  @Column({ name: 'examinationId', type: 'uuid' })
  examinationId: string;

  @ManyToOne(() => AcademicClass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  academicClass: AcademicClass;

  @Column({ name: 'classId', type: 'uuid' })
  classId: string;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column({ name: 'subjectId', type: 'uuid' })
  subjectId: string;

  @Column({ type: 'date' })
  examDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  roomNumber?: string;

  @Column({ type: 'int', default: 100 })
  @IsNumber()
  totalMarks: number;

  @Column({ type: 'int', default: 40 })
  @IsNumber()
  passingMarks: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('exam_results')
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExamSchedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleId' })
  schedule: ExamSchedule;

  @Column({ name: 'scheduleId', type: 'uuid' })
  scheduleId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNumber()
  @Min(0)
  marksObtained: number;

  @Column({ type: 'int' })
  @IsNumber()
  totalMarks: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @Column({ type: 'varchar', length: 10, default: 'P' })
  grade: string; // A+, A, B, C, D, F

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  remarks?: string;

  @Column({ type: 'boolean', default: false })
  isFailed: boolean;

  @Column({ type: 'uuid', nullable: true })
  evaluatedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  evaluatedAt?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('report_cards')
export class ReportCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Term, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'termId' })
  term: Term;

  @Column({ name: 'termId', type: 'uuid' })
  termId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  totalMarksObtained: number;

  @Column({ type: 'int' })
  grandTotalMarks: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallPercentage: number;

  @Column({ type: 'varchar', length: 10 })
  finalGrade: string;

  @Column({ type: 'varchar', length: 50 })
  resultStatus: string; // Pass, Fail, Compartment

  @Column({ type: 'int', default: 0 })
  classRank?: number;

  @Column({ type: 'int', nullable: true })
  totalStudentsInClass?: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  teacherRemarks?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  principalRemarks?: string;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  publishedBy?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
