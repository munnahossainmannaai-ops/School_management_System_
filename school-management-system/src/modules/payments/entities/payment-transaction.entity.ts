import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @Column()
  amount: number;

  @Column()
  currency: string;

  @ManyToOne(() => Student)
  student: Student;

  @ManyToOne(() => User)
  payer: User;

  @Column('enum', { 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

  @Column('enum', {
    enum: ['stripe', 'paypal', 'razorpay', 'bank_transfer', 'cash'],
  })
  paymentMethod: 'stripe' | 'paypal' | 'razorpay' | 'bank_transfer' | 'cash';

  @Column('jsonb', { nullable: true })
  paymentDetails: Record<string, any>;

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  refundedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundAmount: number;

  @Column('text', { nullable: true })
  failureReason: string;

  @Column('jsonb', { nullable: true })
  stripeData: {
    chargeId: string;
    paymentIntentId: string;
    receiptUrl: string;
  };

  @Column('jsonb', { nullable: true })
  paypalData: {
    paymentId: string;
    payerId: string;
    status: string;
  };

  @Column('jsonb', { nullable: true })
  razorpayData: {
    orderId: string;
    paymentId: string;
    signature: string;
  };
}
