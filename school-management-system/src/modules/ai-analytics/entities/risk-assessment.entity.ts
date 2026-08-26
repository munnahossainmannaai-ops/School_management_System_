import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Student } from '../../../database/entities/user.entity';

@Entity('risk_assessments')
export class RiskAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  student: Student;

  @Column('enum', { enum: ['low', 'medium', 'high', 'critical'], default: 'low' })
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  @Column('float')
  dropoutRiskScore: number;

  @Column('float')
  academicRiskScore: number;

  @Column('float')
  behavioralRiskScore: number;

  @Column('jsonb')
  riskFactors: string[];

  @Column('text', { nullable: true })
  recommendations: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  assessedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @CreateDateColumn({ nullable: true })
  reviewedAt: Date;
}
