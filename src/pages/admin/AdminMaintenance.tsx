import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { fmtSAR } from "../../lib/adminApi";

type MaintenanceReq = {
  id: string;
  property_id: number;
  property_name_ar: string;
  title: string;
  description: string | null;
  cost: number;
  invoice_number: string | null;
  payment_status: "unpaid" | "partial" | "paid" | "cancelled";
  paid_amount: number;
  status: string;
  created_at: string;
};

type PropertyCost = {
  id: string;
  property_id: number;
  property_name_ar: string;
  title: string;
  cost_type: "daily" | "monthly";
  amount: number;
  invoice_number: string | null;
  payment_status: "unpaid" | "partial" | "paid" | "cancelled";
  paid_amount: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

type Property = {
  id: number;
  name_ar: string;
};

export default function AdminMaintenance() {
  const [activeTab, setActiveTab] = useState<"maintenance" | "costs">("maintenance");

  const [mList, setMList] = useState<MaintenanceReq[]>([]);
  const [cList, setCList] = useState<PropertyCost[]>([]);
  const [props, setProps] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddM, setShowAddM] = useState(false);
  const [showAddC, setShowAddC] = useState(false);

  // M Form
  const [mProp, setMProp] = useState("");
  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mCost, setMCost] = useState("");
  const [mInv, setMInv] = useState("");
  const [mPayStatus, setMPayStatus] = useState<any>("unpaid");
  const [mPaidAmt, setMPaidAmt] = useState("");
  const [mStatus, setMStatus] = useState<any>("pending");

  // C Form
  const [cProp, setCProp] = useState("");
  const [cTitle, setCTitle] = useState("");
  const [cType, setCType] = useState<"daily" | "monthly">("monthly");
  const [cAmount, setCAmount] = useState("");
  const [cInv, setCInv] = useState("");
  const [cPayStatus, setCPayStatus] = useState<any>("unpaid");
  const [cPaidAmt, setCPaidAmt] = useState("");
  const [cStart, setCStart] = useState("");
  const [cEnd, setCEnd] = useState("");

  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: mData }, { data: cData }, { data: pData }] = await Promise.all([
      supabase.from("maintenance_requests").select("*, properties(name_ar)").order("created_at", { ascending: false }),
      supabase.from("property_costs").select("*, properties(name_ar)").order("created_at", { ascending: false }),
      supabase.from("properties").select("id, name_ar").order("name_ar"),
    ]);

    if (mData) {
      setMList(mData.map((i: any) => ({ ...i, property_name_ar: i.properties?.name_ar || "وحدة" })));
    }
    if (cData) {
      setCList(cData.map((i: any) => ({ ...i, property_name_ar: i.properties?.name_ar || "وحدة" })));
    }
    if (pData) setProps(pData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mProp || !mTitle || !mCost) return alert("الرجاء ملء الحقول الإجبارية");
    setSaving(true);
    try {
      const { error } = await supabase.from("maintenance_requests").insert({
        property_id: parseInt(mProp),
        title: mTitle,
        description: mDesc,
        cost: parseFloat(mCost) || 0,
        invoice_number: mInv || null,
        payment_status: mPayStatus,
        paid_amount: parseFloat(mPaidAmt) || (mPayStatus === 'paid' ? parseFloat(mCost) || 0 : 0),
        status: mStatus,
      });
      if (error) throw error;
      setMTitle(""); setMDesc(""); setMCost(""); setMInv(""); setMPaidAmt("");
      setShowAddM(false);
      fetchData();
    } catch (err: any) { alert("خطأ: " + err.message); }
    finally { setSaving(false); }
  };

  const handleAddC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cProp || !cTitle || !cAmount) return alert("الرجاء ملء الحقول الإجبارية");
    setSaving(true);
    try {
      const { error } = await supabase.from("property_costs").insert({
        property_id: parseInt(cProp),
        title: cTitle,
        cost_type: cType,
        amount: parseFloat(cAmount) || 0,
        invoice_number: cInv || null,
        payment_status: cPayStatus,
        paid_amount: parseFloat(cPaidAmt) || (cPayStatus === 'paid' ? parseFloat(cAmount) || 0 : 0),
        start_date: cStart || null,
        end_date: cEnd || null,
      });
      if (error) throw error;
      setCTitle(""); setCAmount(""); setCInv(""); setCPaidAmt(""); setCStart(""); setCEnd("");
      setShowAddC(false);
      fetchData();
    } catch (err: any) { alert("خطأ: " + err.message); }
    finally { setSaving(false); }
  };

  const deleteM = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from("maintenance_requests").delete().eq("id", id);
    fetchData();
  };

  const deleteC = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from("property_costs").delete().eq("id", id);
    fetchData();
  };

  const getPayBadge = (p: string) => {
    switch (p) {
      case 'paid': return <span style={{ padding: "3px 8px", background: "#eef6ec", color: "#2e7d32", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>مدفوع بالكامل</span>;
      case 'partial': return <span style={{ padding: "3px 8px", background: "#fef8ee", color: "#b26a00", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>مدفوع جزئياً</span>;
      case 'cancelled': return <span style={{ padding: "3px 8px", background: "#f5f5f5", color: "#666", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>ملغى</span>;
      default: return <span style={{ padding: "3px 8px", background: "#fde8e8", color: "#c53030", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>غير مدفوع</span>;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0 }}>الصيانة والتكاليف والفواتير</h1>
          <p style={{ color: "#666", fontSize: "13px", margin: "4px 0 0" }}>إدارة فواتير الصيانة وتكاليف الشقق اليومية أو الشهرية ومتابعة حالة السداد</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={`btn-ghost ${activeTab === 'maintenance' ? 'active-filter' : ''}`} style={{ background: activeTab === 'maintenance' ? '#C9A96A' : '#fff', color: activeTab === 'maintenance' ? '#fff' : 'inherit' }} onClick={() => setActiveTab('maintenance')}>طلبات الصيانة ({mList.length})</button>
          <button className={`btn-ghost ${activeTab === 'costs' ? 'active-filter' : ''}`} style={{ background: activeTab === 'costs' ? '#C9A96A' : '#fff', color: activeTab === 'costs' ? '#fff' : 'inherit' }} onClick={() => setActiveTab('costs')}>تكاليف الشقق اليومية/الشهرية ({cList.length})</button>
        </div>
      </div>

      {activeTab === 'maintenance' ? (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button className="btn-activate" onClick={() => setShowAddM(!showAddM)}>{showAddM ? "إغلاق النموذج" : "+ إضافة طلب صيانة وفاتورة"}</button>
          </div>

          {showAddM && (
            <form onSubmit={handleAddM} className="odoo-card" style={{ marginBottom: "24px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#8a6d3b" }}>تسجيل طلب صيانة وفاتورة جديدة</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>الشقة / الوحدة *</label>
                  <select value={mProp} onChange={(e) => setMProp(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                    <option value="">اختر الوحدة</option>
                    {props.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>عنوان العطل / الصيانة *</label>
                  <input type="text" value={mTitle} onChange={(e) => setMTitle(e.target.value)} required placeholder="مثال: صيانة المكيف الرئيسي" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>رقم الفاتورة</label>
                  <input type="text" value={mInv} onChange={(e) => setMInv(e.target.value)} placeholder="INV-2026-001" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>التكلفة الإجمالية (ر.س) *</label>
                  <input type="number" step="0.01" value={mCost} onChange={(e) => setMCost(e.target.value)} required placeholder="450.00" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>حالة الدفع</label>
                  <select value={mPayStatus} onChange={(e) => setMPayStatus(e.target.value as any)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                    <option value="unpaid">غير مدفوع</option>
                    <option value="partial">مدفوع جزئياً</option>
                    <option value="paid">مدفوع بالكامل</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>المبلغ المدفوع (ر.س)</label>
                  <input type="number" step="0.01" value={mPaidAmt} onChange={(e) => setMPaidAmt(e.target.value)} placeholder="0.00" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
              </div>
              <div style={{ marginTop: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>تفاصيل إضافية / وصف</label>
                <textarea value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="تفاصيل الفني والقطع..." style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", height: "60px" }} />
              </div>
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowAddM(false)}>إلغاء</button>
                <button type="submit" className="btn-activate" disabled={saving}>حفظ الطلب والفاتورة</button>
              </div>
            </form>
          )}

          <div className="odoo-card">
            {loading ? <p className="odoo-hint">جاري التحميل...</p> : mList.length === 0 ? <p className="odoo-hint">لا توجد طلبات صيانة مسجلة حتى الآن.</p> : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>الوحدة</th>
                      <th>العطل / الطلب</th>
                      <th>رقم الفاتورة</th>
                      <th>التكلفة</th>
                      <th>حالة السداد</th>
                      <th>المدفوع</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mList.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.property_name_ar}</strong></td>
                        <td><div>{item.title}</div>{item.description && <small style={{ color: "#777" }}>{item.description}</small>}</td>
                        <td><span dir="ltr">{item.invoice_number || "—"}</span></td>
                        <td><strong>{fmtSAR(item.cost)}</strong></td>
                        <td>{getPayBadge(item.payment_status)}</td>
                        <td>{fmtSAR(item.paid_amount)}</td>
                        <td><span style={{ fontSize: "11px", padding: "2px 6px", background: item.status === 'completed' ? '#eef6ec' : '#fff8e1', color: item.status === 'completed' ? '#2e7d32' : '#f57c00', borderRadius: "4px" }}>{item.status}</span></td>
                        <td dir="ltr" style={{ fontSize: "12px" }}>{new Date(item.created_at).toLocaleDateString("en-GB")}</td>
                        <td><button className="btn-ghost" style={{ padding: "3px 6px", fontSize: "11px", color: "#c53030" }} onClick={() => deleteM(item.id)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button className="btn-activate" onClick={() => setShowAddC(!showAddC)}>{showAddC ? "إغلاق النموذج" : "+ إضافة تكلفة يومية/شهرية وفاتورة"}</button>
          </div>

          {showAddC && (
            <form onSubmit={handleAddC} className="odoo-card" style={{ marginBottom: "24px", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#8a6d3b" }}>تسجيل تكلفة دورية أو ثابتة للشقة (يومي / شهري)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>الشقة / الوحدة *</label>
                  <select value={cProp} onChange={(e) => setCProp(e.target.value)} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                    <option value="">اختر الوحدة</option>
                    {props.map(p => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>اسم التكلفة / البند *</label>
                  <input type="text" value={cTitle} onChange={(e) => setCTitle(e.target.value)} required placeholder="مثال: إيجار أساسي / اشتراك إنترنت / كهرباء" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>نوع التكلفة *</label>
                  <select value={cType} onChange={(e) => setCType(e.target.value as any)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                    <option value="monthly">شهرية (Monthly)</option>
                    <option value="daily">يومية (Daily)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>المبلغ (ر.س) *</label>
                  <input type="number" step="0.01" value={cAmount} onChange={(e) => setCAmount(e.target.value)} required placeholder="1200.00" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>رقم الفاتورة (إن وجدت)</label>
                  <input type="text" value={cInv} onChange={(e) => setCInv(e.target.value)} placeholder="INV-COST-01" style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>حالة السداد</label>
                  <select value={cPayStatus} onChange={(e) => setCPayStatus(e.target.value as any)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}>
                    <option value="unpaid">غير مدفوع</option>
                    <option value="partial">مدفوع جزئياً</option>
                    <option value="paid">مدفوع بالكامل</option>
                    <option value="cancelled">ملغى</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginTop: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>تاريخ البداية (اختياري)</label>
                  <input type="date" value={cStart} onChange={(e) => setCStart(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>تاريخ النهاية (اختياري)</label>
                  <input type="date" value={cEnd} onChange={(e) => setCEnd(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
                </div>
              </div>
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowAddC(false)}>إلغاء</button>
                <button type="submit" className="btn-activate" disabled={saving}>حفظ التكلفة الدورية</button>
              </div>
            </form>
          )}

          <div className="odoo-card">
            {loading ? <p className="odoo-hint">جاري التحميل...</p> : cList.length === 0 ? <p className="odoo-hint">لا توجد تكاليف يومية أو شهرية مسجلة حتى الآن.</p> : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>الوحدة</th>
                      <th>البند / التكلفة</th>
                      <th>النوع</th>
                      <th>المبلغ</th>
                      <th>رقم الفاتورة</th>
                      <th>حالة السداد</th>
                      <th>الفترة</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cList.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.property_name_ar}</strong></td>
                        <td>{item.title}</td>
                        <td>
                          <span style={{ fontSize: "11px", padding: "2px 6px", background: item.cost_type === 'daily' ? '#e3f2fd' : '#f3e5f5', color: item.cost_type === 'daily' ? '#1565c0' : '#7b1fa2', borderRadius: "4px" }}>
                            {item.cost_type === 'daily' ? '📅 يومي (Daily)' : '📆 شهري (Monthly)'}
                          </span>
                        </td>
                        <td><strong>{fmtSAR(item.amount)}</strong></td>
                        <td><span dir="ltr">{item.invoice_number || "—"}</span></td>
                        <td>{getPayBadge(item.payment_status)}</td>
                        <td dir="ltr" style={{ fontSize: "12px" }}>{item.start_date || item.end_date ? `${item.start_date || '...'} → ${item.end_date || '...'}` : 'مستمر'}</td>
                        <td><button className="btn-ghost" style={{ padding: "3px 6px", fontSize: "11px", color: "#c53030" }} onClick={() => deleteC(item.id)}>حذف</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
