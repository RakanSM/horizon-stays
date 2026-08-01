import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminBooking, type AdminProperty, type Invoice } from "../../lib/adminApi";

const EMPTY = { property_id: 0, guest_name: "", guest_phone: "", guest_email: "", source: "direct", check_in: "", check_out: "", amount: "", status: "confirmed", notes: "" };

function InvoiceModal({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const printIt = () => {
    const w = window.open("", "_blank", "width=760,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${inv.invoice_no}</title>
<style>
  body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;padding:40px;color:#1a1a1a;background:#fff}
  .inv-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C9A96A;padding-bottom:20px;margin-bottom:28px}
  .brand{font-size:26px;font-weight:800;color:#C9A96A}.brand small{display:block;font-size:12px;color:#666;font-weight:400}
  .inv-no{text-align:left}.inv-no strong{font-size:18px}.inv-no span{display:block;font-size:12px;color:#666}
  table{width:100%;border-collapse:collapse;margin:18px 0}
  th{background:#faf6ee;color:#8a6d3b;text-align:right;padding:10px 12px;font-size:13px;border-bottom:2px solid #C9A96A}
  td{padding:10px 12px;border-bottom:1px solid #eee;font-size:14px}
  .totals{margin-top:10px;margin-right:auto;width:300px}
  .totals div{display:flex;justify-content:space-between;padding:7px 0;font-size:14px}
  .totals .grand{border-top:2px solid #C9A96A;font-weight:800;font-size:17px;color:#8a6d3b}
  .foot{margin-top:44px;font-size:11px;color:#888;text-align:center;border-top:1px solid #eee;padding-top:16px}
</style></head><body>
<div class="inv-head">
  <div class="brand">Horizon Stays<small>أفق للإقامة الفاخرة — الرياض، المملكة العربية السعودية</small></div>
  <div class="inv-no"><strong>فاتورة ${inv.invoice_no}</strong><span dir="ltr">${new Date(inv.issued_at).toLocaleDateString("en-GB")}</span><span>فاتورة ضريبية مبسطة</span></div>
</div>
<p><strong>الضيف:</strong> ${inv.guest_name || "—"}</p>
<table>
  <thead><tr><th>الوصف</th><th>الوصول</th><th>المغادرة</th><th>الليالي</th><th>المبلغ</th></tr></thead>
  <tbody><tr><td>${inv.property_name || ""}</td><td dir="ltr">${inv.check_in}</td><td dir="ltr">${inv.check_out}</td><td>${inv.nights}</td><td>${Number(inv.total).toLocaleString()} ر.س</td></tr></tbody>
</table>
<div class="totals">
  <div><span>الإجمالي قبل الضريبة</span><span>${Number(inv.subtotal).toLocaleString()} ر.س</span></div>
  <div><span>ضريبة القيمة المضافة (${inv.vat_rate}%)</span><span>${Number(inv.vat_amount).toLocaleString()} ر.س</span></div>
  <div class="grand"><span>الإجمالي شامل الضريبة</span><span>${Number(inv.total).toLocaleString()} ر.س</span></div>
</div>
<div class="foot">horizonstay-sa.com · واتساب +966 56 090 3335 · شكراً لاختياركم Horizon Stays</div>
<script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  return (
    <div className="adm-modal-bg" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>فاتورة {inv.invoice_no}</h3>
        <div className="inv-preview">
          <p><strong>الضيف:</strong> {inv.guest_name || "—"}</p>
          <p><strong>الوحدة:</strong> {inv.property_name}</p>
          <p><strong>الفترة:</strong> <span dir="ltr">{inv.check_in} → {inv.check_out}</span> ({inv.nights} ليالٍ)</p>
          <div className="inv-lines">
            <div><span>قبل الضريبة</span><span>{fmtSAR(inv.subtotal)}</span></div>
            <div><span>ضريبة {inv.vat_rate}%</span><span>{fmtSAR(inv.vat_amount)}</span></div>
            <div className="grand"><span>الإجمالي</span><span>{fmtSAR(inv.total)}</span></div>
          </div>
        </div>
        <div className="theme-actions">
          <button className="btn-activate" onClick={printIt}>طباعة / PDF 🖨</button>
          <button className="btn-ghost" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [scope, setScope] = useState<"upcoming" | "past" | "all">("upcoming");
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [props, setProps] = useState<AdminProperty[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminBooking | null>(null);
  const [draft, setDraft] = useState<any>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await adminRpc<{ bookings: AdminBooking[] }>("admin_bookings", { p_action: "list", p_scope: scope });
      setRows(r.bookings || []);
    } catch (e: any) { setErr(e.message); }
  }, [scope]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    adminRpc<{ properties: AdminProperty[] }>("admin_list_properties").then((r) => setProps(r.properties || [])).catch(() => {});
  }, []);

  const startEdit = (b: AdminBooking) => {
    setEditing(b);
    setAdding(false);
    setDraft({ property_id: b.property_id, guest_name: b.guest_name || "", guest_phone: b.guest_phone || "", guest_email: b.guest_email || "", source: b.source, check_in: b.check_in, check_out: b.check_out, amount: String(b.amount), status: b.status, notes: b.notes || "" });
  };

  const submit = async () => {
    if (!draft.property_id || !draft.check_in || !draft.check_out) { setMsg("اختر الوحدة والتواريخ"); return; }
    setBusy(true); setMsg("");
    try {
      await adminRpc("admin_bookings", {
        p_action: editing ? "update" : "create",
        ...(editing ? { p_id: editing.id } : {}),
        p_property_id: Number(draft.property_id),
        p_guest_name: draft.guest_name || null, p_guest_phone: draft.guest_phone || null, p_guest_email: draft.guest_email || null,
        p_source: draft.source, p_check_in: draft.check_in, p_check_out: draft.check_out,
        p_amount: Number(draft.amount) || 0, p_status: draft.status, p_notes: draft.notes || null,
      });
      setMsg(editing ? "تم التحديث ✓" : "تمت الإضافة ✓");
      setAdding(false); setEditing(null); setDraft(EMPTY);
      await load();
      setTimeout(() => setMsg(""), 2500);
    } catch (e: any) { setMsg("فشل: " + e.message); }
    finally { setBusy(false); }
  };

  const del = async (b: AdminBooking) => {
    if (!confirm(`حذف حجز ${b.guest_name || b.id.slice(0, 8)}؟`)) return;
    await adminRpc("admin_bookings", { p_action: "delete", p_id: b.id });
    await load();
  };

  const genInvoice = async (b: AdminBooking) => {
    setBusy(true);
    try {
      await adminRpc("admin_invoice", { p_action: "create", p_booking_id: b.id });
      const r = await adminRpc<{ invoice: Invoice }>("admin_invoice", { p_action: "get", p_booking_id: b.id });
      setInvoice(r.invoice);
      await load();
    } catch (e: any) { setMsg("فشل إنشاء الفاتورة: " + e.message); }
    finally { setBusy(false); }
  };

  const form = (
    <div className="odoo-card">
      <h3 className="pe-sub">{editing ? "تعديل حجز" : "حجز جديد"}</h3>
      <div className="pe-grid">
        <div className="sf-row"><label>الوحدة</label>
          <select value={draft.property_id} onChange={(e) => setDraft({ ...draft, property_id: e.target.value })}>
            <option value={0}>— اختر —</option>
            {props.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
          </select>
        </div>
        <div className="sf-row"><label>اسم الضيف</label><input value={draft.guest_name} onChange={(e) => setDraft({ ...draft, guest_name: e.target.value })} /></div>
        <div className="sf-row"><label>الجوال</label><input dir="ltr" value={draft.guest_phone} onChange={(e) => setDraft({ ...draft, guest_phone: e.target.value })} placeholder="+9665…" /></div>
        <div className="sf-row"><label>البريد</label><input dir="ltr" value={draft.guest_email} onChange={(e) => setDraft({ ...draft, guest_email: e.target.value })} /></div>
        <div className="sf-row"><label>المصدر</label>
          <select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>
            <option value="direct">مباشر</option><option value="airbnb">Airbnb</option><option value="gathern">Gathern</option><option value="other">آخر</option>
          </select>
        </div>
        <div className="sf-row"><label>الوصول</label><input type="date" value={draft.check_in} onChange={(e) => setDraft({ ...draft, check_in: e.target.value })} /></div>
        <div className="sf-row"><label>المغادرة</label><input type="date" value={draft.check_out} onChange={(e) => setDraft({ ...draft, check_out: e.target.value })} /></div>
        <div className="sf-row"><label>المبلغ شامل الضريبة (﷼)</label><input dir="ltr" type="number" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} /></div>
        <div className="sf-row"><label>الحالة</label>
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            <option value="confirmed">مؤكد</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option>
          </select>
        </div>
        <div className="sf-row"><label>ملاحظات</label><input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></div>
      </div>
      <div className="theme-actions">
        <button className="btn-activate" onClick={submit} disabled={busy}>{busy ? "..." : editing ? "حفظ التعديل" : "إضافة الحجز"}</button>
        <button className="btn-ghost" onClick={() => { setAdding(false); setEditing(null); setDraft(EMPTY); }}>إلغاء</button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="الحجوزات والضيوف" subtitle="إدارة الحجوزات القادمة والسابقة وإصدار الفواتير">
      {err && <div className="admin-err">{err}</div>}
      <div className="adm-toolbar">
        <div className="adm-tabs">
          {(["upcoming", "past", "all"] as const).map((s) => (
            <button key={s} className={`adm-tab ${scope === s ? "active" : ""}`} onClick={() => setScope(s)}>
              {s === "upcoming" ? "القادمة" : s === "past" ? "السابقة" : "الكل"}
            </button>
          ))}
        </div>
        <button className="btn-activate" onClick={() => { setAdding((v) => !v); setEditing(null); setDraft(EMPTY); }}>{adding ? "إغلاق" : "+ حجز جديد"}</button>
      </div>

      {(adding || editing) && form}
      {msg && <div className="admin-toast inline">{msg}</div>}

      {rows.length === 0 ? (
        <p className="odoo-hint">لا توجد حجوزات في هذا النطاق.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>الوحدة</th><th>الضيف</th><th>الفترة</th><th>الليالي</th><th>المبلغ</th><th>عمولة Horizon</th><th>صافي المالك</th><th>المصدر</th><th>الحالة</th><th></th></tr></thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className={b.status === "cancelled" ? "cancelled" : ""}>
                  <td>{b.property_name_ar}</td>
                  <td>{b.guest_name || "—"}<br /><small dir="ltr">{b.guest_phone || ""}</small></td>
                  <td dir="ltr">{b.check_in} → {b.check_out}</td>
                  <td>{b.nights}</td>
                  <td>{fmtSAR(b.amount)}</td>
                  <td>{fmtSAR(b.commission_amount)} <small>({b.commission_pct}%)</small></td>
                  <td>{fmtSAR(b.net_to_landlord)}</td>
                  <td><span className={`src-badge ${b.source}`}>{b.source}</span></td>
                  <td>{b.status === "confirmed" ? "مؤكد" : b.status === "completed" ? "مكتمل" : b.status === "cancelled" ? "ملغي" : b.status}</td>
                  <td className="adm-row-actions">
                    <button className="btn-ghost sm" onClick={() => startEdit(b)}>تعديل</button>
                    <button className="btn-ghost sm" onClick={() => genInvoice(b)} disabled={busy}>{b.has_invoice ? "الفاتورة 🧾" : "فاتورة +"}</button>
                    <button className="btn-ghost sm danger" onClick={() => del(b)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {invoice && <InvoiceModal inv={invoice} onClose={() => setInvoice(null)} />}
    </AdminLayout>
  );
}
