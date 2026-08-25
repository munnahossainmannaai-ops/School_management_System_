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
  Unique,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  STAFF = 'staff',
  LIBRARIAN = 'librarian',
  ACCOUNTANT = 'accountant',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  @Exclude()
  @MinLength(8)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  phone?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  city?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  zipCode?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  profilePicture?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLogin?: Date;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  twoFactorSecret?: string;

  @OneToMany(() => Student, (student) => student.user)
  students: Student[];

  @OneToMany(() => Staff, (staff) => staff.user)
  staff: Staff[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Student entity - extends user relationship
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  admissionNumber: string;

  @ManyToOne(() => User, (user) => user.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bloodGroup?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  religion?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  caste?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherTongue?: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ type: 'uuid', nullable: true })
  currentClassId?: string;

  @Column({ type: 'uuid', nullable: true })
  currentSectionId?: string;

  @Column({ type: 'date' })
  admissionDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  previousSchool?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remarks?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

// Staff entity - extends user relationship
@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  employeeId: string;

  @ManyToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'date' })
  joinDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  designation?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qualification?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  experience?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialisation?: string;

  @Column({ type: 'text', nullable: true })
  workLocation?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employmentType?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
