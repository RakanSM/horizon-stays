
import xmlrpc from 'xmlrpc';

interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
}

class OdooClient {
  private config: OdooConfig;
  private uid: number | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async getUid(): Promise<number> {
    if (this.uid) return this.uid;
    const common = xmlrpc.createSecureClient(`${this.config.url}/xmlrpc/2/common`);
    return new Promise((resolve, reject) => {
      common.methodCall('authenticate', [this.config.db, this.config.username, this.config.apiKey, {}], (error: any, value: any) => {
        if (error) reject(error);
        if (!value) reject(new Error('Authentication failed'));
        this.uid = value;
        resolve(value);
      });
    });
  }

  async execute(model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
    const uid = await this.getUid();
    const models = xmlrpc.createSecureClient(`${this.config.url}/xmlrpc/2/object`);
    return new Promise((resolve, reject) => {
      models.methodCall('execute_kw', [this.config.db, uid, this.config.apiKey, model, method, args, kwargs], (error: any, value: any) => {
        if (error) reject(error);
        resolve(value);
      });
    });
  }
}

export class OdooIntegration {
  private client: OdooClient;

  constructor(config: OdooConfig) {
    this.client = new OdooClient(config);
  }

  // --- Rental ---
  async createRentalOrder(bookingData: any) {
    return this.client.execute('rental.order', 'create', [bookingData]);
  }

  // --- Invoicing & Accounting ---
  async createInvoice(invoiceData: any) {
    return this.client.execute('account.move', 'create', [invoiceData]);
  }

  async recordPayment(paymentData: any) {
    return this.client.execute('account.payment', 'create', [paymentData]);
  }

  // --- Expenses ---
  async createExpense(expenseData: any) {
    return this.client.execute('hr.expense', 'create', [expenseData]);
  }

  // --- Sign ---
  async createSignRequest(templateId: number, partnerId: number, reference: string) {
    return this.client.execute('sign.request', 'create', [{
      template_id: templateId,
      reference: reference,
      request_item_ids: [[0, 0, { partner_id: partnerId, role_id: 1 }]]
    }]);
  }

  // --- Forum ---
  async createForumPost(forumId: number, name: string, content: string) {
    return this.client.execute('forum.post', 'create', [{
      forum_id: forumId,
      name: name,
      content: content
    }]);
  }

  // --- Equity ---
  async getEquityDistribution() {
    return this.client.execute('equity.share', 'search_read', [[]], { fields: ['partner_id', 'share_count', 'equity_type'] });
  }

  // --- ESG ---
  async getESGMetrics() {
    return this.client.execute('esg.metric', 'search_read', [[]], { fields: ['metric_type', 'value', 'unit', 'period_start', 'period_end'] });
  }

  // --- General ---
  async checkConnection() {
    try {
      await this.client.execute('res.users', 'search_count', [[['id', '=', 1]]]);
      return true;
    } catch (e) {
      return false;
    }
  }
}
