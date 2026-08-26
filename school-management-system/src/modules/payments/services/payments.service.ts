import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentTransaction)
    private transactionRepo: Repository<PaymentTransaction>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async createInvoice(
    studentId: string,
    lineItems: Array<{ description: string; quantity: number; unitPrice: number }>,
    dueDate: Date,
    billingAddress?: any,
    notes?: string,
  ): Promise<Invoice> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(-6).toUpperCase()}`;

    const invoice = this.invoiceRepo.create({
      invoiceNumber,
      student,
      totalAmount,
      paidAmount: 0,
      discountAmount: 0,
      dueAmount: totalAmount,
      status: 'draft',
      dueDate,
      issuedDate: new Date(),
      lineItems,
      notes,
      billingAddress,
    });

    return this.invoiceRepo.save(invoice);
  }

  async createStripePaymentIntent(
    invoiceId: string,
    payer: User,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const invoice = await this.invoiceRepo.findOne({ 
      where: { id: invoiceId },
      relations: ['student'],
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice already paid');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(invoice.dueAmount * 100),
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        studentId: invoice.student.id,
        payerId: payer.id,
      },
    });

    const transaction = this.transactionRepo.create({
      transactionId: paymentIntent.id,
      amount: invoice.dueAmount,
      currency: 'usd',
      student: invoice.student,
      payer,
      status: 'pending',
      paymentMethod: 'stripe',
      paymentDetails: { clientSecret: paymentIntent.client_secret },
      stripeData: {
        chargeId: '',
        paymentIntentId: paymentIntent.id,
        receiptUrl: '',
      },
    });

    await this.transactionRepo.save(transaction);
    this.logger.log(`Stripe payment intent created: ${paymentIntent.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<any> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const transaction = await this.transactionRepo.findOne({
      where: { transactionId: paymentIntent.id },
      relations: ['student'],
    });

    if (transaction) {
      transaction.status = 'completed';
      transaction.processedAt = new Date();
      transaction.stripeData.receiptUrl = paymentIntent.charges.data[0]?.receipt_url || '';
      await this.transactionRepo.save(transaction);

      const invoice = await this.invoiceRepo.findOne({
        where: { id: paymentIntent.metadata.invoiceId },
      });

      if (invoice) {
        invoice.paidAmount = invoice.totalAmount;
        invoice.dueAmount = 0;
        invoice.status = 'paid';
        invoice.paidAt = new Date();
        await this.invoiceRepo.save(invoice);
      }

      this.logger.log(`Payment successful: ${paymentIntent.id}`);
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const transaction = await this.transactionRepo.findOne({
      where: { transactionId: paymentIntent.id },
    });

    if (transaction) {
      transaction.status = 'failed';
      transaction.failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
      await this.transactionRepo.save(transaction);

      this.logger.log(`Payment failed: ${paymentIntent.id}`);
    }
  }

  async getInvoicesByStudent(studentId: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      where: { student: { id: studentId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionsByStudent(studentId: string): Promise<PaymentTransaction[]> {
    return this.transactionRepo.find({
      where: { student: { id: studentId } },
      order: { createdAt: 'DESC' },
      relations: ['payer'],
    });
  }

  async processRefund(transactionId: string, amount?: number): Promise<PaymentTransaction> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
      relations: ['student'],
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new BadRequestException('Can only refund completed transactions');
    }

    if (transaction.paymentMethod === 'stripe' && this.stripe) {
      const refund = await this.stripe.refunds.create({
        payment_intent: transaction.stripeData.paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      transaction.status = 'refunded';
      transaction.refundedAt = new Date();
      transaction.refundAmount = amount || transaction.amount;
      await this.transactionRepo.save(transaction);
    }

    return transaction;
  }

  async sendInvoiceReminder(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['student'],
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    invoice.reminderCount += 1;
    invoice.lastReminderSentAt = new Date();
    await this.invoiceRepo.save(invoice);

    this.logger.log(`Reminder sent for invoice ${invoice.invoiceNumber}`);
  }
}
