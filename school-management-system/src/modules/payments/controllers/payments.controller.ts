import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('invoices')
  async createInvoice(
    @Body() body: {
      studentId: string;
      lineItems: Array<{ description: string; quantity: number; unitPrice: number }>;
      dueDate: Date;
      billingAddress?: any;
      notes?: string;
    },
  ) {
    return this.paymentsService.createInvoice(
      body.studentId,
      body.lineItems,
      new Date(body.dueDate),
      body.billingAddress,
      body.notes,
    );
  }

  @Get('invoices/student/:studentId')
  async getInvoicesByStudent(@Param('studentId') studentId: string) {
    return this.paymentsService.getInvoicesByStudent(studentId);
  }

  @Post('invoices/:invoiceId/payment-intent')
  async createPaymentIntent(
    @Param('invoiceId') invoiceId: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.createStripePaymentIntent(invoiceId, user);
  }

  @Get('transactions/student/:studentId')
  async getTransactionsByStudent(@Param('studentId') studentId: string) {
    return this.paymentsService.getTransactionsByStudent(studentId);
  }

  @Post('transactions/:transactionId/refund')
  async processRefund(
    @Param('transactionId') transactionId: string,
    @Body() body: { amount?: number },
  ) {
    return this.paymentsService.processRefund(transactionId, body.amount);
  }

  @Post('invoices/:invoiceId/remind')
  async sendReminder(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.sendInvoiceReminder(invoiceId);
  }

  @Post('webhooks/stripe')
  async handleStripeWebhook(@Req() req: Request) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody;
    return this.paymentsService.handleStripeWebhook(rawBody, signature);
  }
}
