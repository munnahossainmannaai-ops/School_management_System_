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
import { IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { Student } from './user.entity';
import { AcademicSession } from './academic.entity';

export enum FeeType {
  TUITION = 'tuition',
  ADMISSION = 'admission',
  ANNUAL = 'annual',
  TRANSPORT = 'transport',
  LIBRARY = 'library',
  SPORTS = 'sports',
  EXAMINATION = 'examination',
  HOSTEL = 'hostel',
  MISCELLANEOUS = 'miscellaneous',
}

export enum FeeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  WAIVED = 'waived',
}

export enum PaymentMode {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
  CHEQUE = 'cheque',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('fee_structures')
export class FeeStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  name: string; // e.g., "Class 10 - Annual Fee"

  @ManyToOne(() => AcademicSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: AcademicSession;

  @Column({ name: 'sessionId', type: 'uuid' })
  sessionId: string;

  @Column({ type: 'uuid', nullable: true })
  classId?: string;

  @Column({ type: 'uuid', nullable: true })
  sectionId?: string;

  @Column({
    type: 'enum',
    enum: FeeType,
  })
  @IsEnum(FeeType)
  feeType: FeeType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  amount: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('fee_invoices')
export class FeeInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => AcademicSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: AcademicSession;

  @Column({ name: 'sessionId', type: 'uuid' })
  sessionId: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: FeeStatus,
    default: FeeStatus.PENDING,
  })
  @IsEnum(FeeStatus)
  status: FeeStatus;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  remarks?: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('fee_invoice_items')
export class FeeInvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FeeInvoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: FeeInvoice;

  @Column({ name: 'invoiceId', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => FeeStructure, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feeStructureId' })
  feeStructure: FeeStructure;

  @Column({ name: 'feeStructureId', type: 'uuid' })
  feeStructureId: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netAmount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

@Entity('fee_payments')
export class FeePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  paymentReceiptNumber: string;

  @ManyToOne(() => FeeInvoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: FeeInvoice;

  @Column({ name: 'invoiceId', type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMode,
  })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  transactionId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  chequeNumber?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  chequeDate?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  bankName?: string;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  remarks?: string;

  @Column({ type: 'uuid', nullable: true })
  receivedBy?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('fee_concessions')
export class FeeConcession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  reason: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  concessionAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @IsOptional()
  concessionPercentage?: number;

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  validUntil?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  remarks?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  approvedBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
