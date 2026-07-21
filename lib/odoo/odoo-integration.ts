/**
 * Odoo ERP Integration for Horizon Stays
 * Handles syncing bookings, invoices, accounting, and more with Odoo
 */

interface OdooConfig {
  url: string;
  database: string;
  username: string;
  password: string;
  apiKey?: string;
}

interface BookingData {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  confirmationCode: string;
}

interface OdooRentalOrder {
  id: number;
  name: string;
  partner_id: number;
  rental_line_ids: Array<{
    product_id: number;
    quantity: number;
    price_unit: number;
  }>;
  amount_total: number;
  state: string;
}

class OdooIntegration {
  private config: OdooConfig;
  private sessionId: string | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  /**
   * Authenticate with Odoo using JSON-RPC
   */
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'common',
            method: 'authenticate',
            args: [this.config.database, this.config.username, this.config.password, {}],
          },
          id: 1,
        }),
      });

      const data = await response.json();
      if (data.result) {
        this.sessionId = data.result;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Odoo authentication failed:', error);
      return false;
    }
  }

  /**
   * Create a rental order in Odoo from a booking
   */
  async createRentalOrder(booking: BookingData): Promise<OdooRentalOrder | null> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      // First, create or get the customer (partner)
      const partnerId = await this.getOrCreatePartner(booking.guestName, booking.guestEmail);

      // Create rental order
      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'rental.order',
              'create',
              {
                partner_id: partnerId,
                rental_line_ids: [
                  [
                    0,
                    0,
                    {
                      name: booking.propertyName,
                      product_id: await this.getOrCreateProduct(booking.propertyName),
                      quantity: this.calculateNights(booking.checkIn, booking.checkOut),
                      price_unit: booking.totalPrice / this.calculateNights(booking.checkIn, booking.checkOut),
                    },
                  ],
                ],
                state: 'draft',
                external_reference: booking.confirmationCode,
              },
            ],
          },
          id: 2,
        }),
      });

      const data = await response.json();
      if (data.result) {
        return {
          id: data.result,
          name: `RO-${data.result}`,
          partner_id: partnerId,
          rental_line_ids: [],
          amount_total: booking.totalPrice,
          state: 'draft',
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to create rental order:', error);
      return null;
    }
  }

  /**
   * Create an invoice from a booking
   */
  async createInvoice(booking: BookingData, rentalOrderId: number): Promise<number | null> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const partnerId = await this.getOrCreatePartner(booking.guestName, booking.guestEmail);

      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'account.move',
              'create',
              {
                move_type: 'out_invoice',
                partner_id: partnerId,
                invoice_line_ids: [
                  [
                    0,
                    0,
                    {
                      name: `Rental: ${booking.propertyName} (${booking.checkIn} to ${booking.checkOut})`,
                      quantity: 1,
                      price_unit: booking.totalPrice,
                      account_id: await this.getDefaultRevenueAccount(),
                    },
                  ],
                ],
                ref: booking.confirmationCode,
                invoice_date: new Date().toISOString().split('T')[0],
              },
            ],
          },
          id: 3,
        }),
      });

      const data = await response.json();
      return data.result || null;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      return null;
    }
  }

  /**
   * Record a payment in Odoo accounting
   */
  async recordPayment(
    invoiceId: number,
    amount: number,
    paymentMethod: string,
    paymentReference: string
  ): Promise<boolean> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'account.payment',
              'create',
              {
                payment_type: 'inbound',
                partner_type: 'customer',
                partner_id: await this.getInvoicePartner(invoiceId),
                amount: amount,
                currency_id: await this.getDefaultCurrency(),
                payment_method_id: await this.getPaymentMethod(paymentMethod),
                ref: paymentReference,
                invoice_ids: [[6, 0, [invoiceId]]],
              },
            ],
          },
          id: 4,
        }),
      });

      const data = await response.json();
      return !!data.result;
    } catch (error) {
      console.error('Failed to record payment:', error);
      return false;
    }
  }

  /**
   * Log an expense
   */
  async logExpense(
    propertyId: string,
    description: string,
    amount: number,
    category: string,
    date: string
  ): Promise<number | null> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'hr.expense',
              'create',
              {
                name: description,
                unit_amount: amount,
                employee_id: await this.getDefaultEmployee(),
                expense_date: date,
                category_id: await this.getExpenseCategory(category),
                analytic_account_id: await this.getAnalyticAccount(propertyId),
              },
            ],
          },
          id: 5,
        }),
      });

      const data = await response.json();
      return data.result || null;
    } catch (error) {
      console.error('Failed to log expense:', error);
      return null;
    }
  }

  /**
   * Helper: Get or create a partner (customer)
   */
  private async getOrCreatePartner(name: string, email: string): Promise<number> {
    if (!this.sessionId) return 0;

    try {
      // Search for existing partner
      const searchResponse = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'res.partner',
              'search',
              [[['email', '=', email]]],
              { limit: 1 },
            ],
          },
          id: 6,
        }),
      });

      const searchData = await searchResponse.json();
      if (searchData.result && searchData.result.length > 0) {
        return searchData.result[0];
      }

      // Create new partner
      const createResponse = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'res.partner',
              'create',
              {
                name: name,
                email: email,
                customer_rank: 1,
              },
            ],
          },
          id: 7,
        }),
      });

      const createData = await createResponse.json();
      return createData.result || 0;
    } catch (error) {
      console.error('Failed to get or create partner:', error);
      return 0;
    }
  }

  /**
   * Helper: Get or create a product (property)
   */
  private async getOrCreateProduct(propertyName: string): Promise<number> {
    if (!this.sessionId) return 0;

    try {
      const response = await fetch(`${this.config.url}/jsonrpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'object',
            method: 'execute',
            args: [
              this.config.database,
              this.sessionId,
              'product.product',
              'create',
              {
                name: propertyName,
                type: 'service',
                categ_id: await this.getProductCategory('Rental'),
              },
            ],
          },
          id: 8,
        }),
      });

      const data = await response.json();
      return data.result || 0;
    } catch (error) {
      console.error('Failed to create product:', error);
      return 0;
    }
  }

  /**
   * Helper: Calculate number of nights
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Placeholder methods for getting IDs (implement based on your Odoo setup)
   */
  private async getDefaultRevenueAccount(): Promise<number> {
    return 1; // Replace with actual account ID
  }

  private async getDefaultCurrency(): Promise<number> {
    return 1; // Replace with actual currency ID
  }

  private async getPaymentMethod(method: string): Promise<number> {
    return 1; // Replace with actual payment method ID
  }

  private async getDefaultEmployee(): Promise<number> {
    return 1; // Replace with actual employee ID
  }

  private async getExpenseCategory(category: string): Promise<number> {
    return 1; // Replace with actual category ID
  }

  private async getAnalyticAccount(propertyId: string): Promise<number> {
    return 1; // Replace with actual analytic account ID
  }

  private async getProductCategory(category: string): Promise<number> {
    return 1; // Replace with actual product category ID
  }

  private async getInvoicePartner(invoiceId: number): Promise<number> {
    return 1; // Replace with actual partner ID from invoice
  }
}

export default OdooIntegration;
