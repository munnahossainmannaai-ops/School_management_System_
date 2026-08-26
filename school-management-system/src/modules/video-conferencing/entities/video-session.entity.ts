import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../../database/entities/user.entity';

@Entity('video_sessions')
export class VideoSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @Column()
  roomName: string;

  @Column()
  meetingUrl: string;

  @Column({ nullable: true })
  password: string;

  @ManyToOne(() => User)
  host: User;

  @Column('jsonb')
  participants: string[];

  @Column('enum', { enum: ['scheduled', 'active', 'ended', 'cancelled'], default: 'scheduled' })
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';

  @Column('timestamptz')
  scheduledAt: Date;

  @Column('int', { default: 60 })
  durationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @Column('jsonb', { nullable: true })
  recording: {
    url: string;
    duration: number;
    size: number;
  };

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
}
