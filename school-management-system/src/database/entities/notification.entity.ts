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
import { User, Student, Staff } from './user.entity';

export enum NotificationType {
  GENERAL = 'general',
  ACADEMIC = 'academic',
  ATTENDANCE = 'attendance',
  EXAMINATION = 'examination',
  FEE = 'fee',
  TRANSPORT = 'transport',
  LIBRARY = 'library',
  EVENT = 'event',
  EMERGENCY = 'emergency',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata?: any; // Additional data like links, IDs, etc.

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  senderId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  @Column({ type: 'boolean', default: false })
  isBroadcast: boolean;

  @Column({ type: 'uuid', nullable: true })
  targetClassId?: string;

  @Column({ type: 'uuid', nullable: true })
  targetSectionId?: string;

  @Column({ type: 'uuid', nullable: true })
  targetStudentId?: string;

  @Column({ type: 'uuid', nullable: true })
  targetStaffId?: string;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  sentAt?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;

  @Column({ name: 'notificationId', type: 'uuid' })
  notificationId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  readAt?: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('notification_templates')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  name: string; // e.g., "Fee Due Reminder"

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  templateKey: string; // e.g., "fee_due_reminder"

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  subject: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  body: string; // Can contain placeholders like {{studentName}}, {{dueAmount}}

  @Column({ type: 'jsonb', default: () => "'[]'" })
  variables: string[]; // Array of variable names used in template

  @Column({ type: 'jsonb', default: () => "['in_app', 'email']" })
  channels: NotificationChannel[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  content: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  attachments?: string; // JSON array of file URLs

  @Column({ type: 'date' })
  publishDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  expiryDate?: Date;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ type: 'uuid', nullable: true })
  targetClassId?: string;

  @Column({ type: 'uuid', nullable: true })
  targetSectionId?: string;

  @Column({ type: 'boolean', default: false })
  showToStudents: boolean;

  @Column({ type: 'boolean', default: false })
  showToParents: boolean;

  @Column({ type: 'boolean', default: false })
  showToStaff: boolean;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
