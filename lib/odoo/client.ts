import * as xmlrpc from 'xmlrpc';

export class OdooClient {
  private url: string;
  private db: string;
  private username: string;
  private apiKey: string;
  private uid: number | null = null;

  constructor(url?: string, db?: string, username?: string, apiKey?: string) {
    this.url = url ?? process.env.ODOO_URL ?? '';
    this.db = db ?? process.env.ODOO_DB ?? '';
    this.username = username ?? process.env.ODOO_USERNAME ?? '';
    this.apiKey = apiKey ?? process.env.ODOO_API_KEY ?? '';
  }

  async authenticate(): Promise<number> {
    const client = xmlrpc.createSecureClient({ url: `${this.url}/xmlrpc/2/common` });
    return new Promise((resolve, reject) => {
      client.methodCall('authenticate', [this.db, this.username, this.apiKey, {}], (err: object | null, uid: number) => {
        if (err) reject(err);
        else if (!uid) reject(new Error('Odoo auth failed: invalid credentials'));
        else { this.uid = uid; resolve(uid); }
      });
    });
  }

  async call(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.uid) await this.authenticate();
    const client = xmlrpc.createSecureClient({ url: `${this.url}/xmlrpc/2/object` });
    return new Promise((resolve, reject) => {
      client.methodCall('execute_kw', [this.db, this.uid, this.apiKey, model, method, args, kwargs], (err: object | null, result: unknown) => err ? reject(err) : resolve(result));
    });
  }

  async testConnection(): Promise<boolean> { try { await this.authenticate(); return true; } catch { return false; } }
}

let _client: OdooClient | null = null;
export function getOdooClient(): OdooClient { if (!_client) _client = new OdooClient(); return _client; }
