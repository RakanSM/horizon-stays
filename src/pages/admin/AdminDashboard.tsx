import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type FinanceSummary, type AdminBooking } from "../../lib/adminApi";

export default function AdminDashboard() {
  const [fin, setFin] = useState<FinanceSummary | null>(null);
  const [upcoming, setUpcoming] = useState<AdminBooking[]>([]);
  const [propCount, setPropCount] = useState(26);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [f, b, p] = await Promise.all([
          adminRpc<FinanceSummary>("admin_finance_summary"),
          adminRpc<{ bookings: AdminBooking[] }>("admin_bookings", { p_action: "list", p_scope: "upcoming" }),
          adminRpc<{ properties: any[] }>("admin_list_properties"),
        ]);
        setFin(f);
        setUpcoming((b.bookings || []).slice(0, 6));
        if (p?.properties) setPropCount(p.properties.length);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  const t = fin?.totals;
  // Occupancy rate calculation:
  // Available nights in a year (or active period) = propCount * 365
  // Occupancy rate = (t.nights / (propCount * 365)) * 100
  const totalAvailableNights = propCount * 365;
  const bookedNights = t?.nights || 0;
  const occupancyRate = totalAvailableNights > 0 ? Math.min(100, (bookedNights / totalAvailableNights) * 100) : 0;

  return (
    <AdminLayout title="الرئيسية" subtitle="نظرة سريعة على الأداء — السنة الحالية ونسبة الإشغال">
      {err && <div className="admin-err">{err}</div>}
      <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="adm-kpi">
          <span className="adm-kpi-label">إجمالي الدخل</span>
          <strong className="adm-kpi-val gold">{t ? fmtSAR(t.gross) : "…"}</strong>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-label">عمولة Horizon</span>
          <strong className="adm-kpi-val">{t ? fmtSAR(t.commission) : "…"}</strong>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-label">صافي المُلّاك</span>
          <strong className="adm-kpi-val">{t ? fmtSAR(t.net_to_landlords) : "…"}</strong>
        </div>
        <div className="adm-kpi" style={{ borderRight: "4px solid #C9A96A" }}>
          <span className="adm-kpi-label">نسبة الإشغال الإجمالية</span>
          <strong className="adm-kpi-val gold">{occupancyRate.toFixed(1)}%</strong>
          <small style={{ color: "#666", display: "block", marginTop: "2px" }}>{bookedNights} ليلة محجوزة</small>
        </div>
        <div className="adm-kpi">
          <span className="adm-kpi-label">الحجوزات / الليالي</span>
          <strong className="adm-kpi-val">{t ? `${t.bookings} / ${t.nights}` : "…"}</strong>
        </div>
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head">
          <div>
            <h2>نسبة إشغال الوحدات</h2>
            <p>معدل إشغال كل شقة خلال السنة الحالية (بناءً على 365 يوماً لكل وحدة)</p>
          </div>
        </div>
        {(!fin?.by_property || fin.by_property.length === 0) ? (
          <p className="odoo-hint">لا توجد بيانات إشغال مسجلة.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الوحدة</th><th>الليالي المحجوزة</th><th>نسبة الإشغال</th><th>الدخل الإجمالي</th></tr></thead>
              <tbody>
                {fin.by_property.map((p) => {
                  const pOcc = (p.nights / 365) * 100;
                  return (
                    <tr key={p.property_id}>
                      <td><strong>{p.name_ar}</strong></td>
                      <td>{p.nights} ليلة</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, background: "#eee", height: "8px", borderRadius: "4px", overflow: "hidden", maxWidth: "120px" }}>
                            <div style={{ width: `${Math.min(100, pOcc)}%`, background: "#C9A96A", height: "100%" }} />
                          </div>
                          <strong>{pOcc.toFixed(1)}%</strong>
                        </div>
                      </td>
                      <td>{fmtSAR(p.gross)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="odoo-card">
        <div className="odoo-card-head">
          <div>
            <h2>الحجوزات القادمة</h2>
            <p>أقرب {upcoming.length} حجوزات</p>
          </div>
          <Link className="btn-activate" to="/admin/bookings">كل الحجوزات ←</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="odoo-hint">لا توجد حجوزات قادمة مسجلة — أضف حجزاً من صفحة الحجوزات.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>الوحدة</th><th>الضيف</th><th>الوصول</th><th>المغادرة</th><th>المبلغ</th><th>المصدر</th></tr></thead>
              <tbody>
                {upcoming.map((b) => (
                  <tr key={b.id}>
                    <td>{b.property_name_ar}</td>
                    <td>{b.guest_name || "—"}</td>
                    <td dir="ltr">{b.check_in}</td>
                    <td dir="ltr">{b.check_out}</td>
                    <td>{fmtSAR(b.amount)}</td>
                    <td><span className={`src-badge ${b.source}`}>{b.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
