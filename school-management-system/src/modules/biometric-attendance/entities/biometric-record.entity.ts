import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';

@Entity('biometric_records')
export class BiometricRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { nullable: true })
  student: Student;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column('enum', { enum: ['fingerprint', 'face_recognition', 'iris', 'rfid'] })
  biometricType: 'fingerprint' | 'face_recognition' | 'iris' | 'rfid';

  @Column()
  biometricId: string;

  @Column('decimal', { precision: 5, scale: 4 })
  confidenceScore: number;

  @Column('enum', { enum: ['check_in', 'check_out'] })
  attendanceType: 'check_in' | 'check_out';

  @Column('enum', { enum: ['success', 'failed', 'spoof_detected'], default: 'success' })
  status: 'success' | 'failed' | 'spoof_detected';

  @Column('jsonb', { nullable: true })
  biometricData: {
    template: string;
    quality: number;
    livenessScore?: number;
  };

  @Column('timestamptz')
  timestamp: Date;

  @Column({ nullable: true })
  deviceId: string;

  @Column({ nullable: true })
  location: string;

  @Column('text', { nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
}
