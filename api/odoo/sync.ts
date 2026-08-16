import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rpc, SUPABASE_KEY, SUPABASE_URL, SYNC_SECRET } from "../_lib/config.js";

type OdooConfig = {
  ok: boolean;
  error?: string;
  base_url?: string;
  database_name?: string;
  username?: string;
  api_key?: string;
  is_enabled?: boolean;
  sync_enabled?: boolean;
  configured?: boolean;
};

type OdooBooking = {
  id: string;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  amount_sar: number;
  source: string;
  status: string;
  payment_status: string | null;
  property: {
    id: number;
    slug: string;
    name_ar: string;
    name_en: string;
    odoo_product_id: number | null;
    odoo_product_name: string | null;
    price_per_night: number;
  };
};

type OdooJsonRpc = { jsonrpc: string; id: number; result?: unknown; error?: { data?: { message?: string }; message?: string } };

async function isAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ p_token: token }),
    });
    const data = await response.json();
    return data === true || data?.ok === true;
  } catch {
    return false;
  }
}

async function odooCall<T>(baseUrl: string, service: string, method: string, args: unknown[]): Promise<T> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: Date.now() }),
  });
  if (!response.ok) throw new Error(`Odoo HTTP ${response.status}`);
  const data = (await response.json()) as OdooJsonRpc;
  if (data.error) throw new Error(data.error.data?.message || data.error.message || "Odoo request failed");
  return data.result as T;
}

async function odooExecute<T>(config: Required<Pick<OdooConfig, "base_url" | "database_name" | "api_key">>, uid: number, model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}): Promise<T> {
  return odooCall<T>(config.base_url, "object", "execute_kw", [config.database_name, uid, config.api_key, model, method, args, kwargs]);
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/(api[_ -]?key|password|token)\s*[:=]\s*\S+/gi, "$1=[hidden]").slice(0, 500);
}

async function recordRun(payload: { triggeredBy: "manual" | "scheduled" | "connection_test"; status: string; total: number; succeeded: number; failed: number; details?: unknown[]; error?: string }) {
  return rpc<number>("odoo_record_sync_run", {
    p_secret: SYNC_SECRET,
    p_triggered_by: payload.triggeredBy,
    p_status: payload.status,
    p_total_bookings: payload.total,
    p_succeeded: payload.succeeded,
    p_failed: payload.failed,
    p_details: payload.details || [],
    p_error_message: payload.error || null,
  });
}

/**
 * POST /api/odoo/sync
 *
 * - x-admin-token: a valid Horizon admin token for manual test/sync actions.
 * - x-vercel-cron: accepted only for a deployed scheduled job.
 * - ?action=connection runs a non-mutating Odoo authentication test.
 * - ?action=sync creates queued Odoo sales orders only for units with an Odoo product mapping.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed", hint: "POST only" });

  const isCron = Boolean(req.headers["x-vercel-cron"]);
  const hasSecret = String(req.query.secret || "") === SYNC_SECRET;
  const adminToken = String(req.headers["x-admin-token"] || "");
  if (!isCron && !hasSecret && !(await isAdminToken(adminToken))) return res.status(401).json({ error: "unauthorized" });

  const action = String(req.query.action || "connection").toLowerCase();
  if (action !== "connection" && action !== "sync") return res.status(400).json({ error: "invalid_action" });

  const triggeredBy = isCron ? "scheduled" : action === "connection" ? "connection_test" : "manual";
  let config: OdooConfig;
  try {
    config = await rpc<OdooConfig>("odoo_get_sync_config", { p_secret: SYNC_SECRET });
  } catch (error) {
    return res.status(500).json({ error: "odoo_config_unavailable", detail: safeError(error) });
  }

  if (!config.ok || !config.configured || !config.base_url || !config.database_name || !config.username || !config.api_key) {
    try { await recordRun({ triggeredBy, status: "skipped", total: 0, succeeded: 0, failed: 0, error: "Odoo configuration is incomplete" }); } catch {}
    return res.status(409).json({ error: "odoo_not_configured", message: "Add Odoo URL, database, username, and API key in Admin → Integrations." });
  }
  if (action === "sync" && (!config.is_enabled || !config.sync_enabled)) {
    return res.status(409).json({ error: "odoo_sync_disabled", message: "Enable Odoo and booking sync in Admin → Integrations first." });
  }

  let uid: number;
  try {
    uid = await odooCall<number>(config.base_url, "common", "authenticate", [config.database_name, config.username, config.api_key, {}]);
    if (!uid) throw new Error("Odoo authentication was rejected");
    await rpc<boolean>("odoo_record_connection_result", { p_secret: SYNC_SECRET, p_status: "connected", p_error: null });
  } catch (error) {
    const detail = safeError(error);
    try {
      await rpc<boolean>("odoo_record_connection_result", { p_secret: SYNC_SECRET, p_status: "failed", p_error: detail });
      await recordRun({ triggeredBy, status: "failed", total: 0, succeeded: 0, failed: 1, error: detail });
    } catch {}
    return res.status(502).json({ error: "odoo_connection_failed", detail });
  }

  if (action === "connection") {
    return res.status(200).json({ ok: true, connected: true, message: "Odoo connection verified" });
  }

  const queue = await rpc<{ ok: boolean; bookings: OdooBooking[] }>("odoo_list_sync_bookings", { p_secret: SYNC_SECRET, p_limit: 50 });
  if (!queue.ok) return res.status(500).json({ error: "odoo_queue_unavailable" });

  const details: Array<{ bookingId: string; status: "synced" | "failed"; message?: string }> = [];
  let succeeded = 0;
  let failed = 0;

  for (const booking of queue.bookings || []) {
    try {
      if (!booking.property.odoo_product_id) throw new Error(`No Odoo product mapping for ${booking.property.name_en || booking.property.slug}`);

      const partnerDomain = booking.guest_email
        ? [["email", "=", booking.guest_email]]
        : booking.guest_phone
          ? [["phone", "=", booking.guest_phone]]
          : [["name", "=", booking.guest_name || "Guest"]];
      const partnerIds = await odooExecute<number[]>(config as Required<Pick<OdooConfig, "base_url" | "database_name" | "api_key">>, uid, "res.partner", "search", [partnerDomain], { limit: 1 });
      const partnerId = partnerIds[0] || await odooExecute<number>(config as Required<Pick<OdooConfig, "base_url" | "database_name" | "api_key">>, uid, "res.partner", "create", [{
        name: booking.guest_name || "Horizon Guest",
        email: booking.guest_email || false,
        phone: booking.guest_phone || false,
      }]);

      const unitPrice = booking.nights > 0 ? Number(booking.amount_sar || 0) / booking.nights : Number(booking.amount_sar || 0);
      const orderId = await odooExecute<number>(config as Required<Pick<OdooConfig, "base_url" | "database_name" | "api_key">>, uid, "sale.order", "create", [{
        partner_id: partnerId,
        client_order_ref: `HZN-${booking.id}`,
        note: `Horizon Stays booking\nUnit: ${booking.property.name_en || booking.property.name_ar}\nCheck-in: ${booking.check_in}\nCheck-out: ${booking.check_out}\nSource: ${booking.source}`,
        order_line: [[0, 0, {
          product_id: booking.property.odoo_product_id,
          name: `${booking.property.name_en || booking.property.name_ar} (${booking.check_in} → ${booking.check_out})`,
          product_uom_qty: Math.max(1, booking.nights || 1),
          price_unit: unitPrice,
        }]],
      }]);
      await rpc<boolean>("odoo_mark_booking_sync", {
        p_secret: SYNC_SECRET,
        p_booking_id: booking.id,
        p_status: "synced",
        p_rental_order_id: orderId,
        p_invoice_id: null,
        p_payment_id: null,
        p_external_ref: `HZN-${booking.id}`,
        p_error: null,
      });
      succeeded += 1;
      details.push({ bookingId: booking.id, status: "synced" });
    } catch (error) {
      const message = safeError(error);
      failed += 1;
      details.push({ bookingId: booking.id, status: "failed", message });
      try {
        await rpc<boolean>("odoo_mark_booking_sync", {
          p_secret: SYNC_SECRET, p_booking_id: booking.id, p_status: "failed",
          p_rental_order_id: null, p_invoice_id: null, p_payment_id: null, p_external_ref: null, p_error: message,
        });
      } catch {}
    }
  }

  const status = failed === 0 ? "completed" : succeeded > 0 ? "partial" : "failed";
  const runId = await recordRun({ triggeredBy, status, total: queue.bookings.length, succeeded, failed, details });
  return res.status(200).json({ ok: status !== "failed", runId, status, total: queue.bookings.length, succeeded, failed, details });
}
