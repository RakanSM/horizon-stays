import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { fmtSAR } from "../lib/adminApi";

const LL_KEY = "hs_landlord_token";
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

type LLData = {
  ok: boolean;
  landlord: { name: string; default_commission_pct: number };
  properties: { property_id: number; slug: string; name_ar: string; name_en: string; relation_type: "owned" | "managed"; commission_pct: number }[];
  bookings: {
    id: string; property_id: number; property_name_ar: string; guest_name: string | null; source: string;
    check_in: string; check_out: string; nights: number; amount: number;
    relation_type: "owned" | "managed";
    commission_pct: number; commission_amount: number; net_to_landlord: number; vat_in_amount: number; status: string;
  }[];
  totals: {
    gross: number; commission: number; net: number; bookings: number; nights: number;
    owned_gross: number; managed_gross: number; owned_net: number; managed_net: number;
    owned_bookings: number; owned_nights: number; managed_bookings: number; managed_nights: number;
  };
  monthly: { month: string; gross: number; commission: number; net: number }[];
};

export default function Landlord() {
  const [tok, setTok] = useState<string | null>(() => localStorage.getItem(LL_KEY));
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<LLData | null>(null);

  // Filter states
  const [periodFilter, setPeriodFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedPropId, setSelectedPropId] = useState<string>("all");

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

  // Apply filters to bookings
  const nowStr = new Date().toISOString().slice(0, 10);
  const weekAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const currentMonthStr = nowStr.slice(0, 7);

  const filteredBookings = data.bookings.filter((b) => {
    if (selectedPropId !== "all" && String(b.property_id) !== selectedPropId) return false;
    if (b.status === "cancelled") return false;

    if (periodFilter === "today") {
      return b.check_in <= nowStr && b.check_out >= nowStr;
    }
    if (periodFilter === "week") {
      return b.check_out >= weekAgoStr && b.check_in <= nowStr;
    }
    if (periodFilter === "month") {
      return b.check_in.startsWith(currentMonthStr) || b.check_out.startsWith(currentMonthStr);
    }
    if (periodFilter === "custom" && customStart && customEnd) {
      return b.check_in <= customEnd && b.check_out >= customStart;
    }
    return true;
  });

  // Re-compute filtered totals
  let f_gross = 0, f_commission = 0, f_net = 0;
  let f_owned_gross = 0, f_managed_gross = 0, f_owned_net = 0, f_managed_net = 0;
  let f_owned_bookings = 0, f_owned_nights = 0, f_managed_bookings = 0, f_managed_nights = 0;
  let f_nights = 0;

  filteredBookings.forEach((b) => {
    f_gross += b.amount;
    f_nights += b.nights;
    if (b.relation_type === "owned") {
      f_owned_gross += b.amount;
      f_owned_net += b.amount;
      f_owned_bookings += 1;
      f_owned_nights += b.nights;
      f_net += b.amount;
    } else {
      f_managed_gross += b.amount;
      const comm = b.commission_amount;
      const net = b.net_to_landlord;
      f_commission += comm;
      f_managed_net += net;
      f_managed_bookings += 1;
      f_managed_nights += b.nights;
      f_net += net;
    }
  });

  const printStatement = () => {
    if (!data) return;
    const rows = filteredBookings.map((b) =>
      `<tr><td>${b.property_name_ar}</td><td><span style="font-size:11px;padding:2px 6px;background:${b.relation_type === 'owned' ? '#eef6ec;color:#2e7d32' : '#fef8ee;color:#b26a00'};border-radius:4px">${b.relation_type === 'owned' ? '🏠 ملكية خاصة' : '🤝 إدارة Horizon'}</span></td><td dir="ltr">${b.check_in} → ${b.check_out}</td><td>${b.nights}</td><td>${Number(b.amount).toLocaleString()}</td><td>${b.relation_type === 'owned' ? '-' : b.commission_pct + '%'}</td><td>${b.relation_type === 'owned' ? '0' : Number(b.commission_amount).toLocaleString()}</td><td>${Number(b.net_to_landlord).toLocaleString()}</td></tr>`
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
      .totals{margin-right:auto;width:380px;font-size:13.5px}
      .totals div{display:flex;justify-content:space-between;padding:6px 0}
      .totals .grand{border-top:2px solid #C9A96A;font-weight:800;font-size:16px;color:#8a6d3b}
      .note{font-size:11px;color:#777;margin-top:20px}
      .foot{margin-top:36px;font-size:11px;color:#888;text-align:center;border-top:1px solid #eee;padding-top:14px}
    </style></head><body>
    <div class="head">
      <div class="brand">Horizon Stays<small>كشف حساب المالك والفلترة المخصصة</small></div>
      <div style="text-align:left"><h2>${data.landlord.name}</h2><span dir="ltr" style="font-size:12px;color:#666">${new Date().toLocaleDateString("en-GB")}</span></div>
    </div>
    <table>
      <thead><tr><th>الوحدة</th><th>التصنيف</th><th>الفترة</th><th>الليالي</th><th>الإجمالي (ر.س)</th><th>نسبة العمولة</th><th>عمولة Horizon</th><th>صافي المستحق</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div><span>🏠 الوحدات المملوكة (${f_owned_bookings} حجز · ${f_owned_nights} ليلة)</span><span>${f_owned_gross.toLocaleString()} ر.س</span></div>
      <div><span>🤝 الوحدات المُدارة (${f_managed_bookings} حجز · ${f_managed_nights} ليلة)</span><span>${f_managed_gross.toLocaleString()} ر.س</span></div>
      <div><span>عمولة Horizon (من المُدارة)</span><span>− ${f_commission.toLocaleString()} ر.س</span></div>
      <div><span>صافي الوحدات المُدارة للمالك</span><span>${f_managed_net.toLocaleString()} ر.س</span></div>
      <div class="grand"><span>إجمالي المستحق المصفى</span><span>${f_net.toLocaleString()} ر.س</span></div>
    </div>
    <p class="note">الفترة المحددة: ${periodFilter} | الوحدات: ${selectedPropId === 'all' ? 'جميع الوحدات' : selectedPropId}</p>
    <div class="foot">horizonstay-sa.com · Horizon Stays</div>
    <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const ownedCount = data.properties.filter(p => p.relation_type === 'owned').length;
  const managedCount = data.properties.filter(p => p.relation_type === 'managed').length;
  const maxG = Math.max(1, ...data.monthly.map((m) => m.gross));

  return (
    <div className="ll-wrap">
      <header className="ll-head">
        <div>
          <h1>أهلاً، {data.landlord.name}</h1>
          <p>{data.properties.length} وحدة إجمالاً ({ownedCount} مملوكة بالكامل · {managedCount} مُدارة بنسبة عمولة {data.landlord.default_commission_pct}%)</p>
        </div>
        <div className="theme-actions">
          <button className="btn-activate" onClick={printStatement}>كشف حساب 🖨</button>
          <button className="btn-ghost" onClick={logout}>خروج</button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="odoo-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#8a6d3b" }}>📅 الفترة:</span>
            <button className={`btn-ghost ${periodFilter === 'all' ? 'active-filter' : ''}`} style={{ padding: "6px 12px", fontSize: "13px", background: periodFilter === 'all' ? '#C9A96A' : 'transparent', color: periodFilter === 'all' ? '#fff' : 'inherit' }} onClick={() => setPeriodFilter('all')}>الكل</button>
            <button className={`btn-ghost ${periodFilter === 'today' ? 'active-filter' : ''}`} style={{ padding: "6px 12px", fontSize: "13px", background: periodFilter === 'today' ? '#C9A96A' : 'transparent', color: periodFilter === 'today' ? '#fff' : 'inherit' }} onClick={() => setPeriodFilter('today')}>اليوم</button>
            <button className={`btn-ghost ${periodFilter === 'week' ? 'active-filter' : ''}`} style={{ padding: "6px 12px", fontSize: "13px", background: periodFilter === 'week' ? '#C9A96A' : 'transparent', color: periodFilter === 'week' ? '#fff' : 'inherit' }} onClick={() => setPeriodFilter('week')}>آخر 7 أيام</button>
            <button className={`btn-ghost ${periodFilter === 'month' ? 'active-filter' : ''}`} style={{ padding: "6px 12px", fontSize: "13px", background: periodFilter === 'month' ? '#C9A96A' : 'transparent', color: periodFilter === 'month' ? '#fff' : 'inherit' }} onClick={() => setPeriodFilter('month')}>هذا الشهر</button>
            <button className={`btn-ghost ${periodFilter === 'custom' ? 'active-filter' : ''}`} style={{ padding: "6px 12px", fontSize: "13px", background: periodFilter === 'custom' ? '#C9A96A' : 'transparent', color: periodFilter === 'custom' ? '#fff' : 'inherit' }} onClick={() => setPeriodFilter('custom')}>تواريخ مخصصة</button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#8a6d3b" }}>🏠 الوحدة:</span>
            <select value={selectedPropId} onChange={(e) => setSelectedPropId(e.target.value)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", fontSize: "13px" }}>
              <option value="all">جميع الشقق ({data.properties.length})</option>
              {data.properties.map((p) => (
                <option key={p.property_id} value={p.property_id}>{p.name_ar} ({p.relation_type === 'owned' ? 'ملك' : 'إدارة'})</option>
              ))}
            </select>
          </div>
        </div>

        {periodFilter === 'custom' && (
          <div style={{ display: "flex", gap: "12px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #eee", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#666" }}>من تاريخ:</span>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ddd" }} />
            <span style={{ fontSize: "12px", color: "#666" }}>إلى تاريخ:</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ddd" }} />
          </div>
        )}
      </div>

      {/* Separated KPI cards for Owned vs Managed based on filter */}
      <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="adm-kpi" style={{ borderRight: "4px solid #2e7d32" }}>
          <span className="adm-kpi-label">🏠 الوحدات المملوكة (100% لك)</span>
          <strong className="adm-kpi-val gold">{fmtSAR(f_owned_gross)}</strong>
          <small style={{ color: "#666", marginTop: "4px", display: "block" }}>{f_owned_bookings} حجز · {f_owned_nights} ليلة</small>
        </div>
        <div className="adm-kpi" style={{ borderRight: "4px solid #b26a00" }}>
          <span className="adm-kpi-label">🤝 الوحدات المُدارة (إجمالي)</span>
          <strong className="adm-kpi-val">{fmtSAR(f_managed_gross)}</strong>
          <small style={{ color: "#666", marginTop: "4px", display: "block" }}>{f_managed_bookings} حجز · {f_managed_nights} ليلة</small>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-label">عمولة Horizon (من المُدارة)</span>
          <strong className="adm-kpi-val">− {fmtSAR(f_commission)}</strong>
          <small style={{ color: "#666", marginTop: "4px", display: "block" }}>حسب نسبة كل وحدة</small>
        </div>
        <div className="adm-kpi" style={{ borderRight: "4px solid #C9A96A" }}>
          <span className="adm-kpi-label">إجمالي صافي المستحق لك</span>
          <strong className="adm-kpi-val gold">{fmtSAR(f_net)}</strong>
          <small style={{ color: "#666", marginTop: "4px", display: "block" }}>{filteredBookings.length} حجز مصفى · {f_nights} ليلة</small>
        </div>
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>وحداتك وتصنيفاتها</h2><p>الوحدات المملوكة (عوائد كاملة للمالك) والوحدات المُدارة (خصم نسبة عمولة Horizon)</p></div></div>
        <div className="ll-units">
          {data.properties.filter(p => selectedPropId === 'all' || String(p.property_id) === selectedPropId).map((p) => (
            <div key={p.property_id} className="ll-unit">
              <img src={`https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images/${p.slug}-1.webp`} alt="" loading="lazy" />
              <div>
                <strong>{p.name_ar}</strong>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", padding: "2px 8px", background: p.relation_type === 'owned' ? '#eef6ec' : '#fef8ee', color: p.relation_type === 'owned' ? '#2e7d32' : '#b26a00', borderRadius: "4px", fontWeight: 600 }}>
                    {p.relation_type === 'owned' ? '🏠 ملكية خاصة (100% لك)' : `🤝 إدارة Horizon (عمولة ${p.commission_pct}%)`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.monthly.length > 0 && selectedPropId === 'all' && (
        <div className="odoo-card">
          <div className="odoo-card-head"><div><h2>الدخل الشهري</h2><p>مقارنة الدخل الإجمالي وصافي المستحق لكل شهر</p></div></div>
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
          <div className="fin-legend"><span><i className="fin-dot gross" />الإجمالي</span><span><i className="fin-dot comm" />صافي المستحق</span></div>
        </div>
      )}

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>سجل الحجوزات (حسب الفلتر المحدد)</h2><p>تفاصيل الحجوزات والليالي لكل وحدة مع بيان نوع العلاقة والعمولة والصفاء</p></div></div>
        {filteredBookings.length === 0 ? <p className="odoo-hint">لا توجد حجوزات تطابق الفلتر المحدد.</p> : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الوحدة</th><th>التصنيف</th><th>الفترة</th><th>الليالي</th><th>الإجمالي</th><th>ض.ق.م</th><th>نسبة العمولة</th><th>عمولة Horizon</th><th>صافي المستحق</th><th>المصدر</th></tr></thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className={b.status === "cancelled" ? "cancelled" : ""}>
                    <td>{b.property_name_ar}</td>
                    <td>
                      <span style={{ fontSize: "11px", padding: "2px 6px", background: b.relation_type === 'owned' ? '#eef6ec' : '#fef8ee', color: b.relation_type === 'owned' ? '#2e7d32' : '#b26a00', borderRadius: "4px" }}>
                        {b.relation_type === 'owned' ? '🏠 ملك خاص' : '🤝 إدارة'}
                      </span>
                    </td>
                    <td dir="ltr">{b.check_in} → {b.check_out}</td>
                    <td><strong>{b.nights} ليلة</strong></td>
                    <td>{fmtSAR(b.amount)}</td>
                    <td>{fmtSAR(b.vat_in_amount)}</td>
                    <td>{b.relation_type === 'owned' ? '—' : `${b.commission_pct}%`}</td>
                    <td>{b.relation_type === 'owned' ? '0 ر.س (مملوكة)' : fmtSAR(b.commission_amount)}</td>
                    <td><strong>{fmtSAR(b.net_to_landlord)}</strong></td>
                    <td><span className={`src-badge ${b.source}`}>{b.source === "direct" ? "مباشر" : b.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="ll-note">الوحدات المملوكة بالكامل تعود عوائدها للمالك بنسبة 100%، بينما الوحدات المُدارة يُحسم منها نسبة عمولة إدارة Horizon المتفق عليها. للاستفسار: واتساب +966 56 090 3335</p>
    </div>
  );
}
