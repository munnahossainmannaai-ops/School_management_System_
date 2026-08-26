import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Student, User } from '../../../database/entities/user.entity';

@Entity('student_performances')
export class StudentPerformance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column('decimal', { precision: 5, scale: 2 })
  averageGrade: number;

  @Column('int')
  attendancePercentage: number;

  @Column('jsonb')
  subjectWisePerformance: Record<string, number>;

  @Column('jsonb')
  trendData: Record<string, number[]>;

  @Column('enum', { enum: ['improving', 'stable', 'declining'], default: 'stable' })
  performanceTrend: 'improving' | 'stable' | 'declining';

  @CreateDateColumn()
  analyzedAt: Date;
}
