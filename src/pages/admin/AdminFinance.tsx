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

  const exportCsv = () => {
    if (!fin) return;
    const lines = ["month,gross,commission,bookings"];
    monthly.forEach((m) => lines.push(`${m.month},${m.gross},${m.commission},${m.bookings}`));
    lines.push("");
    lines.push("property,gross,commission,bookings,nights");
    (fin.by_property || []).forEach((p) => lines.push(`${p.name_en},${p.gross},${p.commission},${p.bookings},${p.nights}`));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `horizon-finance-${year}.csv`;
    a.click();
  };

  return (
    <AdminLayout title="المالية" subtitle="كامل الدخل وتفاصيله — الإيرادات، عمولة Horizon، صافي المُلّاك، والضريبة">
      {err && <div className="admin-err">{err}</div>}
      <div className="adm-toolbar">
        <div className="adm-tabs">
          {[new Date().getFullYear() - 1, new Date().getFullYear()].map((y) => (
            <button key={y} className={`adm-tab ${year === y ? "active" : ""}`} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
        <button className="btn-ghost" onClick={exportCsv}>تصدير CSV ⬇</button>
      </div>

      <div className="adm-kpis">
        <div className="adm-kpi"><span className="adm-kpi-label">إجمالي الدخل (شامل الضريبة)</span><strong className="adm-kpi-val gold">{t ? fmtSAR(t.gross) : "…"}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">عمولة Horizon</span><strong className="adm-kpi-val">{t ? fmtSAR(t.commission) : "…"}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">صافي المُلّاك</span><strong className="adm-kpi-val">{t ? fmtSAR(t.net_to_landlords) : "…"}</strong></div>
        <div className="adm-kpi"><span className="adm-kpi-label">ض.ق.م ضمن الدخل (15%)</span><strong className="adm-kpi-val">{t ? fmtSAR(vatCollected) : "…"}</strong></div>
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
        <div className="odoo-card-head"><div><h2>حسب الوحدة</h2><p>أداء كل وحدة خلال {year}</p></div></div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>الوحدة</th><th>الدخل</th><th>عمولة Horizon</th><th>صافي المالك</th><th>حجوزات</th><th>ليالٍ</th></tr></thead>
            <tbody>
              {(fin?.by_property || []).map((p) => (
                <tr key={p.property_id}>
                  <td>{p.name_ar}</td>
                  <td>{fmtSAR(p.gross)}</td>
                  <td>{fmtSAR(p.commission)}</td>
                  <td>{fmtSAR(p.gross - p.commission)}</td>
                  <td>{p.bookings}</td>
                  <td>{p.nights}</td>
                </tr>
              ))}
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
