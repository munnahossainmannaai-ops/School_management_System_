import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Student, Staff } from './user.entity';

export enum VehicleType {
  BUS = 'bus',
  VAN = 'van',
  CAR = 'car',
  AUTO = 'auto',
}

export enum RouteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('transport_routes')
export class TransportRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  routeName: string; // e.g., "North Route 1"

  @Column({ type: 'text' })
  @IsNotEmpty()
  routeDescription: string; // Detailed route with stops

  @Column({ type: 'int', default: 0 })
  totalDistance: number; // in kilometers

  @Column({ type: 'int', default: 60 })
  estimatedDuration: number; // in minutes

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.ACTIVE,
  })
  status: RouteStatus;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  stops?: any[]; // Array of stop objects with lat/lng, name, timing

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  vehicleNumber: string; // Registration number

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  @IsNotEmpty()
  vehicleType: VehicleType;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  model: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  manufacturer?: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  purchaseDate?: Date;

  @Column({ type: 'int', nullable: true })
  @IsOptional()
  manufacturingYear?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  color?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  insuranceDetails?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  insuranceExpiry?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  fitnessCertificate?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  fitnessExpiry?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ name: 'staffId', type: 'uuid' })
  staffId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  licenseNumber: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  licenseType: string;

  @Column({ type: 'date' })
  licenseExpiry: Date;

  @Column({ type: 'int', default: 0 })
  experienceYears: number;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  emergencyContact?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  bloodGroup?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('vehicle_assignments')
export class VehicleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ name: 'vehicleId', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Driver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @Column({ name: 'driverId', type: 'uuid' })
  driverId: string;

  @ManyToOne(() => TransportRoute, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'routeId' })
  route?: TransportRoute;

  @Column({ name: 'routeId', type: 'uuid', nullable: true })
  routeId?: string;

  @Column({ type: 'date' })
  assignmentDate: Date;

  @Column({ type: 'time' })
  departureTime: string;

  @Column({ type: 'time', nullable: true })
  @IsOptional()
  returnTime?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('student_transport')
export class StudentTransport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ name: 'studentId', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => TransportRoute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routeId' })
  route: TransportRoute;

  @Column({ name: 'routeId', type: 'uuid' })
  routeId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle?: Vehicle;

  @Column({ name: 'vehicleId', type: 'uuid', nullable: true })
  vehicleId?: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  pickupPoint: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  dropPoint: string;

  @Column({ type: 'time', nullable: true })
  @IsOptional()
  pickupTime?: string;

  @Column({ type: 'time', nullable: true })
  @IsOptional()
  dropTime?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyFee: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  validUntil?: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
