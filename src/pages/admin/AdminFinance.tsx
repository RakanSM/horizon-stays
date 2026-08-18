import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type FinanceSummary } from "../../lib/adminApi";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function AdminFinance() {
  const [fin, setFin] = useState<FinanceSummary | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [err, setErr] = useState("");

  useEffect(() => {
    adminRpc<FinanceSummary>("admin_finance_summary", { p_year: year })
      .then(setFin)
      .catch((e) => setErr(e.message));
  }, [year]);

  const t = fin?.totals;
  const monthly = fin?.monthly || [];
  const maxG = Math.max(1, ...monthly.map((m) => m.gross));
  const vatCollected = t ? t.gross - t.gross / 1.15 : 0;
  const propCount = fin?.by_property?.length || 26;
  const totalAvailableNights = propCount * 365;
  const bookedNights = t?.nights || 0;
  const occupancyRate = totalAvailableNights > 0 ? Math.min(100, (bookedNights / totalAvailableNights) * 100) : 0;

  const exportCsv = () => {
    if (!fin) return;
    const lines = ["month,gross,commission,bookings"];
    monthly.forEach((m) => lines.push(`${m.month},${m.gross},${m.commission},${m.bookings}`));
    lines.push("");
    lines.push("property,gross,commission,bookings,nights,occupancy_pct");
    (fin.by_property || []).forEach((p) => lines.push(`${p.name_en},${p.gross},${p.commission},${p.bookings},${p.nights},${((p.nights/365)*100).toFixed(1)}%`));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `horizon-finance-${year}.csv`;
    a.click();
  };

  return (
    <AdminLayout title="المالية" subtitle="كامل الدخل وتفاصيله — الإيرادات، نسبة الإشغال، عمولة Horizon، وصافي المُلّاك">
      {err && <div className="admin-err">{err}</div>}
      <div className="adm-toolbar">
        <div className="adm-tabs">
          {[new Date().getFullYear() - 1, new Date().getFullYear()].map((y) => (
            <button key={y} className={`adm-tab ${year === y ? "active" : ""}`} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
        <button className="btn-ghost" onClick={exportCsv}>تصدير CSV ⬇</button>
      </div>

      <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="adm-kpi"><span className="adm-kpi-label">إجمالي الدخل (شامل الضريبة)</span><strong className="adm-kpi-val gold">{t ? fmtSAR(t.gross) : "…"}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">نسبة الإشغال الإجمالية</span><strong className="adm-kpi-val gold">{occupancyRate.toFixed(1)}%</strong><small style={{ color: "#666", display: "block", marginTop: "2px" }}>{bookedNights} ليلة محجوزة</small></div>
        <div className="adm-kpi"><span className="adm-kpi-label">عمولة Horizon</span><strong className="adm-kpi-val">{t ? fmtSAR(t.commission) : "…"}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">صافي المُلّاك</span><strong className="adm-kpi-val">{t ? fmtSAR(t.net_to_landlords) : "…"}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">حجوزات / ليالٍ</span><strong className="adm-kpi-val">{t ? `${t.bookings} / ${t.nights}` : "…"}</strong></div>
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>الدخل الشهري</h2><p>الإيراد الإجمالي مقابل عمولة Horizon لكل شهر</p></div></div>
        {monthly.length === 0 ? <p className="odoo-hint">لا بيانات لهذه السنة.</p> : (
          <div className="fin-chart">
            {monthly.map((m) => {
              const mi = parseInt(m.month.slice(5)) - 1;
              return (
                <div key={m.month} className="fin-col" title={`${fmtSAR(m.gross)} — عمولة ${fmtSAR(m.commission)}`}>
                  <div className="fin-bars">
                    <div className="fin-bar gross" style={{ height: `${(m.gross / maxG) * 100}%` }} />
                    <div className="fin-bar comm" style={{ height: `${(m.commission / maxG) * 100}%` }} />
                  </div>
                  <span className="fin-month">{MONTHS_AR[mi] || m.month}</span>
                  <small>{fmtSAR(m.gross)}</small>
                </div>
              );
            })}
          </div>
        )}
        <div className="fin-legend"><span><i className="fin-dot gross" />الإجمالي</span><span><i className="fin-dot comm" />عمولة Horizon</span></div>
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>حسب الوحدة ونسبة الإشغال</h2><p>أداء الدخل ونسبة الإشغال لكل وحدة خلال {year}</p></div></div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>الوحدة</th><th>الدخل</th><th>نسبة الإشغال</th><th>صافي المالك</th><th>حجوزات</th><th>ليالٍ</th></tr></thead>
            <tbody>
              {(fin?.by_property || []).map((p) => {
                const pOcc = (p.nights / 365) * 100;
                return (
                  <tr key={p.property_id}>
                    <td><strong>{p.name_ar}</strong></td>
                    <td>{fmtSAR(p.gross)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden", maxWidth: "120px" }}>
                          <div style={{ width: `${Math.min(100, pOcc)}%`, background: "#C9A96A", height: "100%" }} />
                        </div>
                        <strong>{pOcc.toFixed(1)}%</strong>
                      </div>
                    </td>
                    <td>{fmtSAR(p.gross - p.commission)}</td>
                    <td>{p.bookings}</td>
                    <td>{p.nights} ليلة</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head"><div><h2>حسب المصدر</h2><p>توزيع الدخل بين المنصات</p></div></div>
        <div className="fin-sources">
          {(fin?.by_source || []).map((s) => (
            <div key={s.source} className="fin-source">
              <span className={`src-badge ${s.source}`}>{s.source === "direct" ? "مباشر" : s.source}</span>
              <strong>{fmtSAR(s.gross)}</strong>
              <small>{s.bookings} حجز</small>
            </div>
          ))}
          {(!fin?.by_source || fin.by_source.length === 0) && <p className="odoo-hint">لا بيانات.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
