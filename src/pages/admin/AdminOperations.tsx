import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminProperty } from "../../lib/adminApi";

type Expense = { id: string; property_id: number | null; property_name_ar?: string; landlord_name?: string; expense_date: string; category: string; description: string; amount_sar: number; vat_sar: number; total_sar: number; landlord_share_pct: number; payer: string; status: string; paid_amount_sar: number; invoice_number?: string | null };
type Report = { totals: { gross_revenue: number; horizon_commission: number; landlord_before_expenses: number; approved_expenses: number; landlord_expense_share: number; bookings: number; nights: number }; by_property: Array<{ property_id: number; name_ar: string; gross_revenue: number; horizon_commission: number; approved_expenses: number; landlord_expense_share: number }>; expense_categories: Array<{ category: string; total: number; count: number }> };
type Module = "crm" | "pos" | "subscriptions" | "rental" | "accounting" | "documents" | "spreadsheets" | "signatures" | "invoices";

const MODULES: Array<{ id: Module; icon: string; label: string; text: string }> = [
  { id: "crm", icon: "◎", label: "CRM", text: "إدارة العملاء المحتملين وفرص الإقامة" },
  { id: "pos", icon: "▣", label: "نقطة البيع", text: "تسجيل المبالغ المباشرة والخدمات" },
  { id: "subscriptions", icon: "◌", label: "الاشتراكات", text: "التجديدات والرسوم الدورية" },
  { id: "rental", icon: "⌂", label: "التأجير", text: "عقود الإيجار وحالة التسليم" },
  { id: "accounting", icon: "═", label: "المحاسبة", text: "قيود المسك الدفتري الداخلية" },
  { id: "invoices", icon: "▤", label: "الفواتير", text: "فواتير الحجوزات والمدفوعات" },
  { id: "documents", icon: "▱", label: "المستندات", text: "سجل الروابط والملفات التشغيلية" },
  { id: "spreadsheets", icon: "▦", label: "الجداول", text: "سجلات جداول العمل الداخلية" },
  { id: "signatures", icon: "✎", label: "التوقيع", text: "طلبات توقيع العقود والمستندات" },
];

const STATUS_LABEL: Record<string, string> = { draft: "مسودة", submitted: "بانتظار الاعتماد", approved: "معتمد", partially_paid: "مدفوع جزئياً", paid: "مدفوع", rejected: "مرفوض", void: "ملغي", new: "جديد", contacted: "تم التواصل", qualified: "مؤهل", won: "مكتسب", lost: "مغلق", open: "مفتوح", active: "نشط", paused: "موقوف", cancelled: "ملغي", completed: "مكتمل", posted: "مرحل", sent: "مرسل", viewed: "تمت المشاهدة", signed: "موقّع", declined: "مرفوض", expired: "منتهي" };
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminOperations() {
  const [active, setActive] = useState<Module | "finance" | "expenses">("finance");
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [period, setPeriod] = useState({ from: `${new Date().getFullYear()}-01-01`, to: today(), property: "" });
  const [expense, setExpense] = useState({ expense_date: today(), property_id: "", description: "", category: "operations", amount_sar: "", vat_sar: "0", landlord_share_pct: "0", payer: "horizon", status: "draft", invoice_number: "", notes: "" });
  const [moduleForm, setModuleForm] = useState<Record<string, string>>({});

  const reload = async () => {
    setMessage("");
    try {
      const [props, finance, expenseData] = await Promise.all([
        adminRpc<{ properties: AdminProperty[] }>("admin_list_properties"),
        adminRpc<Report>("admin_financial_report", { p_from: period.from, p_to: period.to, p_property_id: period.property ? Number(period.property) : null }),
        adminRpc<{ expenses: Expense[] }>("admin_operation_expense", { p_action: "list" }),
      ]);
      setProperties(props.properties || []); setReport(finance); setExpenses(expenseData.expenses || []);
    } catch (error: any) { setMessage(error.message || "تعذر تحميل بيانات العمليات"); }
  };

  useEffect(() => { reload(); }, [period.from, period.to, period.property]);
  useEffect(() => {
    if (!["crm","pos","subscriptions","rental","accounting","documents","spreadsheets","signatures"].includes(active)) return;
    adminRpc<{ records: any[] }>("admin_operations", { p_module: active, p_action: "list" }).then((r) => setRecords(r.records || [])).catch((e) => setMessage(e.message));
  }, [active]);

  const netOwner = useMemo(() => {
    const t = report?.totals;
    return t ? Number(t.landlord_before_expenses || 0) - Number(t.landlord_expense_share || 0) : 0;
  }, [report]);

  const createExpense = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      await adminRpc("admin_operation_expense", { p_action: "create", p_expense: expense });
      setExpense({ expense_date: today(), property_id: "", description: "", category: "operations", amount_sar: "", vat_sar: "0", landlord_share_pct: "0", payer: "horizon", status: "draft", invoice_number: "", notes: "" });
      setFormOpen(false); await reload(); setMessage("تم حفظ المصروف كمسودة. لن يدخل التقرير إلا بعد اعتماده.");
    } catch (error: any) { setMessage(error.message || "تعذر حفظ المصروف"); }
    finally { setBusy(false); }
  };

  const changeExpenseStatus = async (item: Expense, status: string) => {
    if (!window.confirm(`تأكيد تغيير حالة المصروف إلى ${STATUS_LABEL[status] || status}؟`)) return;
    setBusy(true);
    try { await adminRpc("admin_operation_expense", { p_action: "status", p_expense: { id: item.id, status, paid_amount_sar: status === "paid" ? item.total_sar : item.paid_amount_sar } }); await reload(); }
    catch (error: any) { setMessage(error.message || "تعذر تحديث الحالة"); }
    finally { setBusy(false); }
  };

  const createModuleRecord = async (event: React.FormEvent) => {
    event.preventDefault(); if (!["crm","pos","subscriptions","rental","accounting","documents","spreadsheets","signatures"].includes(active)) return;
    setBusy(true); setMessage("");
    try {
      await adminRpc("admin_operations", { p_module: active, p_action: "create", p_payload: moduleForm });
      const result = await adminRpc<{ records: any[] }>("admin_operations", { p_module: active, p_action: "list" });
      setRecords(result.records || []); setModuleForm({}); setFormOpen(false); setMessage("تم حفظ السجل داخل Horizon.");
    } catch (error: any) { setMessage(error.message || "تعذر حفظ السجل"); }
    finally { setBusy(false); }
  };

  const field = (key: string, label: string, type = "text", required = false) => <label className="ops-field"><span>{label}</span><input required={required} type={type} value={moduleForm[key] || ""} onChange={(e) => setModuleForm({ ...moduleForm, [key]: e.target.value })} /></label>;
  const propertyField = () => <label className="ops-field"><span>الوحدة</span><select value={moduleForm.property_id || ""} onChange={(e) => setModuleForm({ ...moduleForm, property_id: e.target.value })}><option value="">غير مرتبطة بوحدة</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}</select></label>;

  const moduleFormFields = () => {
    switch (active) {
      case "crm": return <>{field("name", "اسم العميل", "text", true)}{field("phone", "رقم الجوال")}{field("email", "البريد", "email")}{field("expected_value_sar", "قيمة متوقعة (ر.س)", "number")}{propertyField()}</>;
      case "pos": return <>{field("description", "وصف العملية", "text", true)}{field("amount_sar", "المبلغ (ر.س)", "number", true)}{field("reference", "مرجع العملية")}{propertyField()}</>;
      case "subscriptions": return <>{field("name", "اسم الاشتراك", "text", true)}{field("amount_sar", "المبلغ (ر.س)", "number", true)}{field("next_renewal", "التجديد القادم", "date")}{propertyField()}</>;
      case "rental": return <>{field("reference", "مرجع العقد")}{field("start_date", "تاريخ البداية", "date", true)}{field("end_date", "تاريخ النهاية", "date", true)}{field("amount_sar", "قيمة العقد (ر.س)", "number", true)}{propertyField()}</>;
      case "accounting": return <>{field("account_code", "رمز الحساب", "text", true)}{field("account_name", "اسم الحساب", "text", true)}{field("debit_sar", "مدين (ر.س)", "number")}{field("credit_sar", "دائن (ر.س)", "number")}{propertyField()}</>;
      case "documents": return <>{field("title", "عنوان المستند", "text", true)}{field("file_url", "رابط المستند", "url")}{propertyField()}</>;
      case "spreadsheets": return <>{field("title", "عنوان الجدول", "text", true)}</>;
      case "signatures": return <>{field("signer_name", "اسم الموقّع", "text", true)}{field("signer_email", "بريد الموقّع", "email")}{field("signer_phone", "جوال الموقّع")}</>;
      default: return null;
    }
  };

  const selectedModule = MODULES.find((m) => m.id === active);
  const t = report?.totals;
  return <AdminLayout title="مكتب العمليات" subtitle="تشغيل Horizon الداخلي — تقارير، مصروفات، عقود، مستندات، وتدفقات عمل بدون وحدة مبيعات">
    {message && <div className="admin-err ops-message">{message}</div>}
    <div className="ops-tabs" role="tablist">
      <button className={active === "finance" ? "active" : ""} onClick={() => { setActive("finance"); setFormOpen(false); }}>المالية</button>
      <button className={active === "expenses" ? "active" : ""} onClick={() => { setActive("expenses"); setFormOpen(false); }}>المصروفات</button>
      {MODULES.map((m) => <button key={m.id} className={active === m.id ? "active" : ""} onClick={() => { setActive(m.id); setFormOpen(false); }}>{m.icon} {m.label}</button>)}
    </div>

    {(active === "finance" || active === "expenses") && <div className="ops-filter"><label>من<input type="date" value={period.from} onChange={(e) => setPeriod({ ...period, from: e.target.value })} /></label><label>إلى<input type="date" value={period.to} onChange={(e) => setPeriod({ ...period, to: e.target.value })} /></label><label>الوحدة<select value={period.property} onChange={(e) => setPeriod({ ...period, property: e.target.value })}><option value="">كل الوحدات</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}</select></label></div>}

    {active === "finance" && <>
      <div className="ops-kpis"><div><span>إيراد الحجوزات</span><strong>{fmtSAR(t?.gross_revenue || 0)}</strong><small>{t?.bookings || 0} حجز · {t?.nights || 0} ليلة</small></div><div><span>عمولة Horizon</span><strong>{fmtSAR(t?.horizon_commission || 0)}</strong><small>حسب عمولة كل وحدة</small></div><div><span>مصروفات معتمدة</span><strong className="negative">− {fmtSAR(t?.approved_expenses || 0)}</strong><small>لا تشمل المسودات</small></div><div><span>حصة الملاك من المصروفات</span><strong className="negative">− {fmtSAR(t?.landlord_expense_share || 0)}</strong><small>وفق نسبة التحميل</small></div><div><span>صافي الملاك بعد المصروفات</span><strong className="accent">{fmtSAR(netOwner)}</strong><small>تقرير تشغيلي قابل للمراجعة</small></div></div>
      <section className="ops-panel"><div className="ops-panel-head"><div><span>REPORT / FINANCE</span><h2>أداء الوحدات</h2></div><button className="btn-ghost" onClick={() => setActive("expenses")}>إدارة المصروفات</button></div><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>الوحدة</th><th>الإيراد</th><th>عمولة Horizon</th><th>المصروفات</th><th>حصة المالك</th></tr></thead><tbody>{(report?.by_property || []).map((p) => <tr key={p.property_id}><td><strong>{p.name_ar}</strong></td><td>{fmtSAR(p.gross_revenue)}</td><td>{fmtSAR(p.horizon_commission)}</td><td>{fmtSAR(p.approved_expenses)}</td><td>{fmtSAR(p.landlord_expense_share)}</td></tr>)}</tbody></table></div></section>
      <section className="ops-panel"><div className="ops-panel-head"><div><span>EXPENSE / MIX</span><h2>توزيع المصروفات المعتمدة</h2></div></div><div className="ops-category-grid">{(report?.expense_categories || []).map((c) => <article key={c.category}><span>{c.category}</span><strong>{fmtSAR(c.total)}</strong><small>{c.count} سجل</small></article>)}{!report?.expense_categories?.length && <p className="odoo-hint">لا توجد مصروفات معتمدة للفترة المحددة.</p>}</div></section>
    </>}

    {active === "expenses" && <section className="ops-panel"><div className="ops-panel-head"><div><span>EXPENSE / CONTROL</span><h2>المصروفات والاعتمادات</h2><p>تظهر في التقرير فقط بعد الاعتماد. حالة المدفوع لا تُنشأ تلقائياً.</p></div><button className="btn-activate" onClick={() => setFormOpen((v) => !v)}>إضافة مصروف</button></div>
      {formOpen && <form className="ops-form" onSubmit={createExpense}><label className="ops-field"><span>تاريخ المصروف</span><input type="date" value={expense.expense_date} onChange={(e) => setExpense({ ...expense, expense_date: e.target.value })} required /></label><label className="ops-field"><span>الوحدة</span><select value={expense.property_id} onChange={(e) => setExpense({ ...expense, property_id: e.target.value })}><option value="">مصروف عام</option>{properties.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}</select></label><label className="ops-field wide"><span>الوصف</span><input value={expense.description} onChange={(e) => setExpense({ ...expense, description: e.target.value })} required /></label><label className="ops-field"><span>التصنيف</span><select value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>{["operations","maintenance","utilities","cleaning","supplies","marketing","tax","other"].map((x) => <option key={x} value={x}>{x}</option>)}</select></label><label className="ops-field"><span>المبلغ قبل الضريبة</span><input type="number" min="0" step="0.01" value={expense.amount_sar} onChange={(e) => setExpense({ ...expense, amount_sar: e.target.value })} required /></label><label className="ops-field"><span>الضريبة</span><input type="number" min="0" step="0.01" value={expense.vat_sar} onChange={(e) => setExpense({ ...expense, vat_sar: e.target.value })} /></label><label className="ops-field"><span>حصة المالك %</span><input type="number" min="0" max="100" value={expense.landlord_share_pct} onChange={(e) => setExpense({ ...expense, landlord_share_pct: e.target.value })} /></label><label className="ops-field"><span>المسؤول عن السداد</span><select value={expense.payer} onChange={(e) => setExpense({ ...expense, payer: e.target.value })}><option value="horizon">Horizon</option><option value="landlord">المالك</option><option value="shared">مشترك</option></select></label><label className="ops-field"><span>رقم الفاتورة</span><input value={expense.invoice_number} onChange={(e) => setExpense({ ...expense, invoice_number: e.target.value })} /></label><label className="ops-field"><span>الحالة</span><select value={expense.status} onChange={(e) => setExpense({ ...expense, status: e.target.value })}><option value="draft">مسودة</option><option value="submitted">بانتظار الاعتماد</option></select></label><div className="ops-form-actions"><button type="button" className="btn-ghost" onClick={() => setFormOpen(false)}>إلغاء</button><button className="btn-activate" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ المصروف"}</button></div></form>}
      <div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>التاريخ</th><th>الوحدة</th><th>الوصف</th><th>الإجمالي</th><th>حصة المالك</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{expenses.map((e) => <tr key={e.id}><td dir="ltr">{e.expense_date}</td><td>{e.property_name_ar || "عام"}</td><td><strong>{e.description}</strong><small>{e.category}</small></td><td>{fmtSAR(e.total_sar)}</td><td>{e.landlord_share_pct}%</td><td><span className={`ops-status ${e.status}`}>{STATUS_LABEL[e.status] || e.status}</span></td><td><select aria-label="تغيير الحالة" value="" onChange={(x) => x.target.value && changeExpenseStatus(e, x.target.value)} disabled={busy}><option value="">تغيير…</option>{["submitted","approved","partially_paid","paid","rejected","void"].filter((s) => s !== e.status).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></td></tr>)}{!expenses.length && <tr><td colSpan={7}>لا توجد مصروفات مسجلة بعد.</td></tr>}</tbody></table></div></section>}

    {active === "invoices" && <section className="ops-panel ops-empty"><span>INVOICE / BOOKING</span><h2>الفواتير مرتبطة بالحجوزات</h2><p>يتم إنشاء فاتورة الضيف من الحجز الفعلي لتبقى الإقامة والمبلغ والضريبة متطابقة مع مصدر الحجز.</p><Link className="btn-activate" to="/admin/bookings">فتح الحجوزات والفواتير</Link></section>}
    {selectedModule && !["finance","expenses","invoices"].includes(active) && <section className="ops-panel"><div className="ops-panel-head"><div><span>HORIZON / {selectedModule.label.toUpperCase()}</span><h2>{selectedModule.label}</h2><p>{selectedModule.text}</p></div><button className="btn-activate" onClick={() => setFormOpen((v) => !v)}>إضافة سجل</button></div>{formOpen && <form className="ops-form" onSubmit={createModuleRecord}>{moduleFormFields()}<div className="ops-form-actions"><button type="button" className="btn-ghost" onClick={() => setFormOpen(false)}>إلغاء</button><button className="btn-activate" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ"}</button></div></form>}<div className="ops-record-grid">{records.map((record) => <article key={record.id}><span className={`ops-status ${record.status || record.stage || "draft"}`}>{STATUS_LABEL[record.status || record.stage] || record.status || record.stage}</span><h3>{record.name || record.title || record.description || record.reference || record.account_name || record.signer_name}</h3><p>{record.email || record.phone || record.account_code || record.cadence || record.method || record.file_url || record.next_renewal || record.start_date || "سجل داخلي"}</p>{record.amount_sar !== undefined && <strong>{fmtSAR(record.amount_sar)}</strong>}{record.expected_value_sar !== undefined && <strong>{fmtSAR(record.expected_value_sar)}</strong>}</article>)}{!records.length && <p className="odoo-hint">لا توجد سجلات بعد. أضف بيانات Horizon الفعلية من الزر أعلاه.</p>}</div></section>}
  </AdminLayout>;
}
