import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { fmtSAR } from "../lib/adminApi";

const LL_KEY = "hs_landlord_token";
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

type LLData = {
  ok: boolean;
  landlord: { name: string; default_commission_pct: number };
  properties: { property_id: number; slug: string; name_ar: string; name_en: string; commission_pct: number }[];
  bookings: {
    id: string; property_name_ar: string; guest_name: string | null; source: string;
    check_in: string; check_out: string; nights: number; amount: number;
    commission_pct: number; commission_amount: number; net_to_landlord: number; vat_in_amount: number; status: string;
  }[];
  totals: { gross: number; commission: number; net: number; bookings: number; nights: number };
  monthly: { month: string; gross: number; commission: number; net: number }[];
};

export default function Landlord() {
  const [tok, setTok] = useState<string | null>(() => localStorage.getItem(LL_KEY));
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<LLData | null>(null);

  const load = async (t: string) => {
    const { data: d, error } = await supabase.rpc("landlord_data", { p_token: t });
    if (error || !d?.ok) {
      localStorage.removeItem(LL_KEY);
      setTok(null);
      setData(null);
      return;
    }
    setData(d as LLData);
  };

  useEffect(() => { if (tok) load(tok); }, [tok]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const { data: d, error } = await supabase.rpc("landlord_login", { p_code: code.trim() });
      if (error || !d?.ok) { setErr("رمز الدخول غير صحيح"); return; }
      localStorage.setItem(LL_KEY, d.token);
      setTok(d.token);
    } finally { setBusy(false); }
  };

  const logout = () => { localStorage.removeItem(LL_KEY); setTok(null); setData(null); };

  const printStatement = () => {
    if (!data) return;
    const t = data.totals;
    const rows = data.bookings.filter((b) => b.status !== "cancelled").map((b) =>
      `<tr><td>${b.property_name_ar}</td><td dir="ltr">${b.check_in} → ${b.check_out}</td><td>${b.nights}</td><td>${Number(b.amount).toLocaleString()}</td><td>${b.commission_pct}%</td><td>${Number(b.commission_amount).toLocaleString()}</td><td>${Number(b.net_to_landlord).toLocaleString()}</td></tr>`
    ).join("");
    const w = window.open("", "_blank", "width=900,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>كشف حساب — ${data.landlord.name}</title>
<style>
  body{font-family:'Segoe UI',Tahoma,sans-serif;margin:0;padding:36px;color:#1a1a1a}
  .head{display:flex;justify-content:space-between;border-bottom:3px solid #C9A96A;padding-bottom:16px;margin-bottom:22px}
  .brand{font-size:24px;font-weight:800;color:#C9A96A}.brand small{display:block;font-size:11px;color:#666;font-weight:400}
  h2{font-size:16px;margin:0 0 4px}
  table{width:100%;border-collapse:collapse;margin:14px 0;font-size:12.5px}
  th{background:#faf6ee;color:#8a6d3b;text-align:right;padding:8px 10px;border-bottom:2px solid #C9A96A;font-size:12px}
  td{padding:8px 10px;border-bottom:1px solid #eee}
  .totals{margin-right:auto;width:340px;font-size:13.5px}
  .totals div{display:flex;justify-content:space-between;padding:6px 0}
  .totals .grand{border-top:2px solid #C9A96A;font-weight:800;font-size:16px;color:#8a6d3b}
  .note{font-size:11px;color:#777;margin-top:20px}
  .foot{margin-top:36px;font-size:11px;color:#888;text-align:center;border-top:1px solid #eee;padding-top:14px}
</style></head><body>
<div class="head">
  <div class="brand">Horizon Stays<small>كشف حساب المالك — أفق للإقامة الفاخرة</small></div>
  <div style="text-align:left"><h2>${data.landlord.name}</h2><span dir="ltr" style="font-size:12px;color:#666">${new Date().toLocaleDateString("en-GB")}</span></div>
</div>
<table>
  <thead><tr><th>الوحدة</th><th>الفترة</th><th>الليالي</th><th>الإجمالي (ر.س)</th><th>نسبة Horizon</th><th>عمولة Horizon</th><th>صافي المالك</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <div><span>إجمالي الدخل (شامل ض.ق.م)</span><span>${t.gross.toLocaleString()} ر.س</span></div>
  <div><span>ض.ق.م ضمن الإجمالي (15%)</span><span>${(t.gross - t.gross / 1.15).toLocaleString(undefined, { maximumFractionDigits: 0 })} ر.س</span></div>
  <div><span>عمولة Horizon</span><span>− ${t.commission.toLocaleString()} ر.س</span></div>
  <div class="grand"><span>صافي المستحق للمالك</span><span>${t.net.toLocaleString()} ر.س</span></div>
</div>
<p class="note">ملاحظة ضريبية: المبالغ شاملة ضريبة القيمة المضافة (15%). عمولة Horizon محسوبة من الإجمالي حسب النسبة المتفق عليها لكل وحدة. هذا الكشف للمطابقة والمراجعة ولا يغني عن الفواتير الضريبية الرسمية.</p>
<div class="foot">horizonstay-sa.com · Horizon Stays · ${t.bookings} حجز · ${t.nights} ليلة</div>
<script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  if (!tok || !data) {
    return (
      <div className="admin-wrap admin-login-wrap">
        <form className="admin-login" onSubmit={doLogin}>
          <h1>بوابة المالك</h1>
          <p>أدخل رمز الدخول الخاص بك لعرض وحداتك ودخلك</p>
          <input dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} placeholder="LL-XXXXXXXX" autoFocus />
          {err && <div className="admin-err">{err}</div>}
          <button type="submit" className="btn-activate wide" disabled={busy}>{busy ? "..." : "دخول"}</button>
        </form>
      </div>
    );
  }

  const t = data.totals;
  const maxG = Math.max(1, ...data.monthly.map((m) => m.gross));

  return (
    <div className="ll-wrap">
      <header className="ll-head">
        <div>
          <h1>أهلاً، {data.landlord.name}</h1>
          <p>{data.properties.length} وحدة · نسبة Horizon الافتراضية {data.landlord.default_commission_pct}%</p>
        </div>
        <div className="theme-actions">
          <button className="btn-activate" onClick={printStatement}>كشف حساب 🖨</button>
          <button className="btn-ghost" onClick={logout}>خروج</button>
        </div>
      </header>

      <div className="adm-kpis">
        <div className="adm-kpi"><span className="adm-kpi-label">إجمالي الدخل</span><strong className="adm-kpi-val gold">{fmtSAR(t.gross)}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">عمولة Horizon</span><strong className="adm-kpi-val">− {fmtSAR(t.commission)}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">صافي المستحق لك</span><strong className="adm-kpi-val gold">{fmtSAR(t.net)}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">حجوزات / ليالٍ</span><strong className="adm-kpi-val">{t.bookings} / {t.nights}</strong></div>
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>وحداتك</h2><p>النسبة المتفق عليها لكل وحدة</p></div></div>
        <div className="ll-units">
          {data.properties.map((p) => (
            <div key={p.property_id} className="ll-unit">
              <img src={`https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/${p.slug}-1.webp`} alt="" loading="lazy" />
              <div><strong>{p.name_ar}</strong><span>نسبة Horizon: {p.commission_pct}%</span></div>
            </div>
          ))}
        </div>
      </div>

      {data.monthly.length > 0 && (
        <div className="odoo-card">
          <div className="odoo-card-head"><div><h2>الدخل الشهري</h2><p>الإجمالي مقابل صافيك بعد عمولة Horizon</p></div></div>
          <div className="fin-chart">
            {data.monthly.map((m) => {
              const mi = parseInt(m.month.slice(5)) - 1;
              return (
                <div key={m.month} className="fin-col" title={`صافي ${fmtSAR(m.net)}`}>
                  <div className="fin-bars">
                    <div className="fin-bar gross" style={{ height: `${(m.gross / maxG) * 100}%` }} />
                    <div className="fin-bar comm" style={{ height: `${(m.net / maxG) * 100}%` }} />
                  </div>
                  <span className="fin-month">{MONTHS_AR[mi] || m.month}</span>
                  <small>{fmtSAR(m.net)}</small>
                </div>
              );
            })}
          </div>
          <div className="fin-legend"><span><i className="fin-dot gross" />الإجمالي</span><span><i className="fin-dot comm" />صافيك</span></div>
        </div>
      )}

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>الحجوزات</h2><p>كل حجوزات وحداتك مع تفاصيل العمولة والضريبة</p></div></div>
        {data.bookings.length === 0 ? <p className="odoo-hint">لا توجد حجوزات بعد.</p> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الوحدة</th><th>الفترة</th><th>الليالي</th><th>الإجمالي</th><th>ض.ق.م ضمنه</th><th>نسبة Horizon</th><th>عمولة Horizon</th><th>صافيك</th><th>المصدر</th></tr></thead>
              <tbody>
                {data.bookings.map((b) => (
                  <tr key={b.id} className={b.status === "cancelled" ? "cancelled" : ""}>
                    <td>{b.property_name_ar}</td>
                    <td dir="ltr">{b.check_in} → {b.check_out}</td>
                    <td>{b.nights}</td>
                    <td>{fmtSAR(b.amount)}</td>
                    <td>{fmtSAR(b.vat_in_amount)}</td>
                    <td>{b.commission_pct}%</td>
                    <td>{fmtSAR(b.commission_amount)}</td>
                    <td><strong>{fmtSAR(b.net_to_landlord)}</strong></td>
                    <td><span className={`src-badge ${b.source}`}>{b.source === "direct" ? "مباشر" : b.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="ll-note">المبالغ شاملة ضريبة القيمة المضافة 15٪. عمولة Horizon تُحسب من الإجمالي حسب النسبة المتفق عليها لكل وحدة. للاستفسار: واتساب +966 56 090 3335</p>
    </div>
  );
}
