import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'failed';
  clientSecret: string;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethodId: string;
  customerId: string;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface Refund {
  id: string;
  amount: number;
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'expired_uncaptured_charge';
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  transactionId: string;
}

class PaymentGatewayService {
  private stripe: Stripe;
  private static instance: PaymentGatewayService;

  private constructor() {
    this.stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  public static getInstance(): PaymentGatewayService {
    if (!PaymentGatewayService.instance) {
      PaymentGatewayService.instance = new PaymentGatewayService();
    }
    return PaymentGatewayService.instance;
  }

  /**
   * Create a payment intent for school fees or other payments
   */
  public async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentCreateParams = {
        amount, // Amount in cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...metadata,
          source: 'school_management_system',
        },
      };

      if (customerId) {
        params.customer = customerId;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(params);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as PaymentIntent['status'],
        clientSecret: paymentIntent.client_secret!,
        description: paymentIntent.description,
      };
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   */
  public async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as PaymentIntent['status'],
        clientSecret: paymentIntent.client_secret!,
        description: paymentIntent.description,
      };
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent details
   */
  public async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as PaymentIntent['status'],
        clientSecret: paymentIntent.client_secret!,
        description: paymentIntent.description,
      };
    } catch (error: any) {
      console.error('Error retrieving payment intent:', error);
      throw new Error(`Failed to retrieve payment: ${error.message}`);
    }
  }

  /**
   * Create or retrieve a customer
   */
  public async createOrGetCustomer(email: string, name: string, metadata?: Record<string, any>): Promise<string> {
    try {
      // Search for existing customer
      const existingCustomers = await this.stripe.customers.list({ email });
      
      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          source: 'school_management_system',
        },
      });

      return customer.id;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Attach payment method to customer
   */
  public async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return {
        id: paymentMethod.id,
        type: paymentMethod.type as PaymentMethod['type'],
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
        } : undefined,
      };
    } catch (error: any) {
      console.error('Error attaching payment method:', error);
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
  }

  /**
   * Get customer's payment methods
   */
  public async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type as PaymentMethod['type'],
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : undefined,
      }));
    } catch (error: any) {
      console.error('Error retrieving payment methods:', error);
      throw new Error(`Failed to retrieve payment methods: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  public async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason: Refund['reason'] = 'requested_by_customer'
  ): Promise<Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
        reason,
      };

      if (amount) {
        params.amount = amount;
      }

      const refund = await this.stripe.refunds.create(params);

      return {
        id: refund.id,
        amount: refund.amount!,
        reason: refund.reason as Refund['reason'],
        status: refund.status as Refund['status'],
        transactionId: refund.payment_intent!,
      };
    } catch (error: any) {
      console.error('Error processing refund:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Get transaction history for a customer
   */
  public async getTransactionHistory(customerId: string, limit: number = 10): Promise<Transaction[]> {
    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: customerId,
        limit,
      });

      return paymentIntents.data.map((pi) => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: this.mapStripeStatus(pi.status),
        paymentMethodId: pi.payment_method as string || '',
        customerId: pi.customer as string || '',
        description: pi.description || '',
        createdAt: new Date(pi.created * 1000),
        metadata: pi.metadata,
      }));
    } catch (error: any) {
      console.error('Error retrieving transaction history:', error);
      throw new Error(`Failed to retrieve transactions: ${error.message}`);
    }
  }

  /**
   * Create invoice for recurring fees
   */
  public async createInvoice(
    customerId: string,
    items: Array<{ description: string; amount: number; quantity: number }>,
    dueDate?: Date
  ): Promise<string> {
    try {
      // Create invoice
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        auto_advance: false,
        collection_method: 'send_invoice',
        days_until_due: dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
      });

      // Add line items
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          description: item.description,
          amount: item.amount,
          quantity: item.quantity,
        });
      }

      // Finalize invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

      return finalizedInvoice.hosted_invoice_url!;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Setup webhook endpoint verification
   */
  public verifyWebhookSignature(payload: Buffer, signature: string, endpointSecret: string): Stripe.Event {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return event;
    } catch (error: any) {
      console.error('Error verifying webhook signature:', error);
      throw new Error(`Webhook verification failed: ${error.message}`);
    }
  }

  /**
   * Handle webhook events
   */
  public handleWebhookEvent(event: Stripe.Event): void {
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        // Update database, send notification
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        // Notify user, update database
        break;
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object.id);
        // Activate subscription
        break;
      case 'invoice.paid':
        console.log('Invoice paid:', event.data.object.id);
        // Update records
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private mapStripeStatus(status: string): Transaction['status'] {
    switch (status) {
      case 'succeeded':
        return 'completed';
      case 'processing':
        return 'pending';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

export const paymentGatewayService = PaymentGatewayService.getInstance();
export default paymentGatewayService;
