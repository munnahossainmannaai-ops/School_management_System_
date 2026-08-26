import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Student } from '../../../database/entities/user.entity';

@Entity('attendance_patterns')
export class AttendancePattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column('jsonb')
  weeklyPattern: Record<string, boolean>;

  @Column('float')
  punctualityScore: number;

  @Column('int')
  consecutiveAbsences: number;

  @Column('jsonb')
  absenceReasons: Record<string, number>;

  @Column('boolean', { default: false })
  isAtRisk: boolean;

  @CreateDateColumn()
  analyzedAt: Date;
}
