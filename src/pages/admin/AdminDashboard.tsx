import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type FinanceSummary, type AdminBooking } from "../../lib/adminApi";

export default function AdminDashboard() {
  const [fin, setFin] = useState<FinanceSummary | null>(null);
  const [upcoming, setUpcoming] = useState<AdminBooking[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [f, b] = await Promise.all([
          adminRpc<FinanceSummary>("admin_finance_summary"),
          adminRpc<{ bookings: AdminBooking[] }>("admin_bookings", { p_action: "list", p_scope: "upcoming" }),
        ]);
        setFin(f);
        setUpcoming((b.bookings || []).slice(0, 6));
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  const t = fin?.totals;

  return (
    <AdminLayout title="الرئيسية" subtitle="نظرة سريعة على الأداء — السنة الحالية">
      {err && <div className="admin-err">{err}</div>}
      <div className="adm-kpis">
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
        <div className="adm-kpi">
          <span className="adm-kpi-label">الحجوزات / الليالي</span>
          <strong className="adm-kpi-val">{t ? `${t.bookings} / ${t.nights}` : "…"}</strong>
        </div>
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

      <div className="adm-quicklinks">
        <Link to="/admin/properties" className="adm-ql"><span>🏢</span>إدارة الوحدات</Link>
        <Link to="/admin/finance" className="adm-ql"><span>💰</span>التقارير المالية</Link>
        <Link to="/admin/landlords" className="adm-ql"><span>🤝</span>المُلّاك والعمولات</Link>
        <Link to="/admin/themes" className="adm-ql"><span>🎨</span>طُبوع الموقع</Link>
      </div>
    </AdminLayout>
  );
}
