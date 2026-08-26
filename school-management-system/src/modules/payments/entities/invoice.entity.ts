import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @ManyToOne(() => Student)
  student: Student;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  dueAmount: number;

  @Column('enum', { 
    enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled'], 
    default: 'draft' 
  })
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

  @Column('timestamptz')
  dueDate: Date;

  @Column('timestamptz', { nullable: true })
  issuedDate: Date;

  @Column('jsonb')
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.student)
  transactions: PaymentTransaction[];

  @Column('text', { nullable: true })
  notes: string;

  @Column('jsonb', { nullable: true })
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column('int', { default: 0 })
  reminderCount: number;

  @Column('timestamptz', { nullable: true })
  lastReminderSentAt: Date;
}
