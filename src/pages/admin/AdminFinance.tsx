import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminFinancialReport, type AdminProperty } from "../../lib/adminApi";

const PAYMENT_LABEL: Record<string, string> = { paid: "محصل بالكامل", partial: "محصل جزئياً", pending: "بانتظار التحصيل", refunded: "مسترد", failed: "فشل التحصيل", unrecorded: "غير مسجل" };
const BOOKING_LABEL: Record<string, string> = { pending: "قيد المراجعة", confirmed: "مؤكد", completed: "مكتمل", unrecorded: "غير مسجل" };
const EXPENSE_LABEL: Record<string, string> = { draft: "مسودة", submitted: "بانتظار الاعتماد", approved: "معتمد", partially_paid: "مدفوع جزئياً", paid: "مدفوع", rejected: "مرفوض", void: "ملغي" };
const SETTLEMENT_LABEL: Record<string, string> = { collection_review: "قيد مراجعة التحصيل", expense_approval: "بانتظار اعتماد مصروف", ready_for_review: "جاهز لمراجعة التسوية" };
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminFinance() {
  const [report, setReport] = useState<AdminFinancialReport | null>(null);
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [from, setFrom] = useState(`${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(today());
  const [property, setProperty] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    setErr("");
    Promise.all([
      adminRpc<AdminFinancialReport>("admin_financial_report", { p_from: from, p_to: to, p_property_id: property ? Number(property) : null }),
      adminRpc<{ properties: AdminProperty[] }>("admin_list_properties"),
    ]).then(([financial, propertyList]) => {
      if (cancelled) return;
      setReport(financial);
      setProperties(propertyList.properties || []);
    }).catch((error: Error) => { if (!cancelled) setErr(error.message); });
    return () => { cancelled = true; };
  }, [from, to, property]);

  const t = report?.totals;
  const netOwner = useMemo(() => Number(t?.landlord_before_expenses || 0) - Number(t?.landlord_expense_share || 0), [t]);
  const applyYear = (year: number) => { setFrom(`${year}-01-01`); setTo(`${year}-12-31`); };

  const exportCsv = () => {
    if (!report) return;
    const lines = [
      "section,status,count,value_sar,paid_sar",
      ...report.booking_statuses.map((item) => `booking,${item.status},${item.booking_count || 0},${item.gross_revenue || 0},`),
      ...report.payment_statuses.map((item) => `collection,${item.status},${item.booking_count || 0},${item.gross_revenue || 0},`),
      ...report.expense_statuses.map((item) => `expense,${item.status},${item.record_count || 0},${item.total_sar || 0},${item.paid_amount_sar || 0}`),
      "", "property,gross_revenue,horizon_commission,approved_expenses,landlord_expense_share",
      ...report.by_property.map((item) => `${item.name_ar},${item.gross_revenue},${item.horizon_commission},${item.approved_expenses},${item.landlord_expense_share}`),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `horizon-financial-status-${from}-to-${to}.csv`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return <AdminLayout title="المالية" subtitle="تقرير الدخل والتحصيل والفواتير والمصروفات — حسب تاريخ الوصول، الوحدة، وحالة التسوية">
    {err && <div className="admin-err">{err}</div>}
    <div className="ops-filter"><label>من<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label><label>إلى<input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></label><label>الوحدة<select value={property} onChange={(event) => setProperty(event.target.value)}><option value="">كل الوحدات</option>{properties.map((item) => <option key={item.id} value={item.id}>{item.name_ar}</option>)}</select></label><div className="adm-tabs" aria-label="سنوات سريعة">{[new Date().getFullYear() - 1, new Date().getFullYear()].map((year) => <button key={year} className={`adm-tab ${from === `${year}-01-01` && to === `${year}-12-31` ? "active" : ""}`} onClick={() => applyYear(year)}>{year}</button>)}</div><button className="btn-ghost" onClick={exportCsv} disabled={!report}>تصدير CSV ⬇</button></div>
    <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))" }}><div className="adm-kpi"><span className="adm-kpi-label">إيراد الحجوزات</span><strong className="adm-kpi-val gold">{fmtSAR(t?.gross_revenue || 0)}</strong><small>{t?.bookings || 0} حجز · {t?.nights || 0} ليلة</small></div><div className="adm-kpi"><span className="adm-kpi-label">تحصيل مسجل بالكامل</span><strong className="adm-kpi-val gold">{fmtSAR(t?.fully_paid_revenue || 0)}</strong><small>{t?.fully_paid_bookings || 0} حجز بحالة مدفوع</small></div><div className="adm-kpi"><span className="adm-kpi-label">حجوزات تحتاج تسوية</span><strong className="adm-kpi-val" style={{ color: "#b26a00" }}>{fmtSAR(t?.collection_review_revenue || 0)}</strong><small>{t?.collection_review_bookings || 0} حجز ليست مدفوعة بالكامل</small></div><div className="adm-kpi"><span className="adm-kpi-label">عمولة Horizon</span><strong className="adm-kpi-val">{fmtSAR(t?.horizon_commission || 0)}</strong><small>حسب نسبة كل وحدة</small></div><div className="adm-kpi"><span className="adm-kpi-label">حصة الملاك من المصروفات</span><strong className="adm-kpi-val" style={{ color: "#c53030" }}>− {fmtSAR(t?.landlord_expense_share || 0)}</strong><small>مصروفات معتمدة فقط</small></div><div className="adm-kpi"><span className="adm-kpi-label">صافي الملاك التشغيلي</span><strong className="adm-kpi-val gold">{fmtSAR(netOwner)}</strong><small>ليس أمراً بصرف الدفعة</small></div></div>
    <section className="odoo-card"><div className="odoo-card-head"><div><h2>حالة التسوية المالية</h2><p>لا تتعامل المنصة مع قيمة الدفعة الجزئية كرصد مستحق دقيق؛ لذلك تظهر قيمة الحجز ضمن «تحتاج تسوية» حتى تُراجع الدفعة الفعلية.</p></div><span className={`ops-status ${report?.settlement_status || "collection_review"}`}>{SETTLEMENT_LABEL[report?.settlement_status || "collection_review"]}</span></div><div className="ops-category-grid"><article><span>فواتير ضيوف صادرة</span><strong>{report?.invoice_summary?.issued || 0}</strong><small>{report?.invoice_summary?.missing || 0} حجز بلا فاتورة ضمن الفلتر</small></article><article><span>قيمة الفواتير الصادرة</span><strong>{fmtSAR(report?.invoice_summary?.issued_total_sar || 0)}</strong><small>للحجوزات ضمن الفترة</small></article><article><span>مصروفات مسددة</span><strong>{fmtSAR(t?.paid_expenses || 0)}</strong><small>من دفتر المصروفات التشغيلي المعتمد</small></article><article><span>مبالغ مستردة</span><strong>{fmtSAR(t?.refunded_revenue || 0)}</strong><small>منفصلة عن التحصيل الكامل</small></article></div><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>المسار</th><th>الحالة</th><th>العدد</th><th>القيمة</th><th>المسدد</th></tr></thead><tbody>{(report?.booking_statuses || []).map((item) => <tr key={`booking-${item.status}`}><td>الحجز</td><td><span className={`ops-status ${item.status}`}>{BOOKING_LABEL[item.status] || item.status}</span></td><td>{item.booking_count || 0}</td><td>{fmtSAR(item.gross_revenue || 0)}</td><td>—</td></tr>)}{(report?.payment_statuses || []).map((item) => <tr key={`payment-${item.status}`}><td>تحصيل الحجز</td><td><span className={`ops-status ${item.status}`}>{PAYMENT_LABEL[item.status] || item.status}</span></td><td>{item.booking_count || 0}</td><td>{fmtSAR(item.gross_revenue || 0)}</td><td>—</td></tr>)}{(report?.expense_statuses || []).map((item) => <tr key={`expense-${item.status}`}><td>المصروف</td><td><span className={`ops-status ${item.status}`}>{EXPENSE_LABEL[item.status] || item.status}</span></td><td>{item.record_count || 0}</td><td>{fmtSAR(item.total_sar || 0)}</td><td>{fmtSAR(item.paid_amount_sar || 0)}</td></tr>)}{!report?.booking_statuses?.length && !report?.expense_statuses?.length && <tr><td colSpan={5}>لا توجد بيانات مالية ضمن الفلتر المحدد.</td></tr>}</tbody></table></div></section>
    <section className="odoo-card"><div className="odoo-card-head"><div><h2>الأداء حسب الوحدة</h2><p>إيراد الحجوزات وعمولة Horizon والمصروفات التشغيلية المعتمدة لكل وحدة ضمن الفلتر.</p></div></div><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>الوحدة</th><th>إيراد الحجوزات</th><th>عمولة Horizon</th><th>المصروفات المعتمدة</th><th>حصة المالك</th><th>صافي المالك التشغيلي</th></tr></thead><tbody>{(report?.by_property || []).map((item) => <tr key={item.property_id}><td><strong>{item.name_ar}</strong></td><td>{fmtSAR(item.gross_revenue)}</td><td>{fmtSAR(item.horizon_commission)}</td><td>{fmtSAR(item.approved_expenses)}</td><td>{fmtSAR(item.landlord_expense_share)}</td><td><strong>{fmtSAR(item.gross_revenue - item.horizon_commission - item.landlord_expense_share)}</strong></td></tr>)}{!report?.by_property?.length && <tr><td colSpan={6}>لا توجد وحدات أو مبالغ ضمن الفلتر المحدد.</td></tr>}</tbody></table></div></section>
    <section className="odoo-card"><div className="odoo-card-head"><div><h2>حدود التقرير</h2><p>دفتر المصروفات التشغيلي هو المصدر الوحيد للمصروفات المعتمدة هنا. سجلات التكاليف الدورية وطلبات الصيانة القديمة تبقى قابلة للمراجعة في صفحاتها، لكنها لا تُدمج تلقائياً لتفادي احتساب نفس البند مرتين.</p></div></div></section>
  </AdminLayout>;
}
