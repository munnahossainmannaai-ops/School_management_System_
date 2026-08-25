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
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Student, Staff } from './user.entity';

export enum BookStatus {
  AVAILABLE = 'available',
  ISSUED = 'issued',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
  LOST = 'lost',
  UNDER_REPAIR = 'under_repair',
}

export enum IssueStatus {
  ISSUED = 'issued',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  author?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  publisher?: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  isbn: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  bookNumber: string; // Internal library编号

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  category?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'int', default: 1 })
  totalCopies: number;

  @Column({ type: 'int', default: 0 })
  availableCopies: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  purchaseDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  location?: string; // Shelf/rack location

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('book_issues')
export class BookIssue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  issueNumber: string;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ name: 'bookId', type: 'uuid' })
  bookId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @Column({ name: 'studentId', type: 'uuid', nullable: true })
  studentId?: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff?: Staff;

  @Column({ name: 'staffId', type: 'uuid', nullable: true })
  staffId?: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  returnDate?: Date;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.ISSUED,
  })
  status: IssueStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fineAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finePaid: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  remarks?: string;

  @Column({ type: 'uuid' })
  issuedBy: string;

  @Column({ type: 'uuid', nullable: true })
  returnedTo?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('book_reservations')
export class BookReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ name: 'bookId', type: 'uuid' })
  bookId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @Column({ name: 'studentId', type: 'uuid', nullable: true })
  studentId?: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff?: Staff;

  @Column({ name: 'staffId', type: 'uuid', nullable: true })
  staffId?: string;

  @Column({ type: 'date' })
  reservationDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  expiryDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFulfilled: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('library_fines')
export class LibraryFine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BookIssue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issueId' })
  issue: BookIssue;

  @Column({ name: 'issueId', type: 'uuid' })
  issueId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'studentId' })
  student?: Student;

  @Column({ name: 'studentId', type: 'uuid', nullable: true })
  studentId?: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'staffId' })
  staff?: Staff;

  @Column({ name: 'staffId', type: 'uuid', nullable: true })
  staffId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fineAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  paidDate?: Date;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  paidBy?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
