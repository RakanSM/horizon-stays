import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { adminRpc, fmtSAR, type AdminLandlord, type AdminProperty } from "../../lib/adminApi";

function AssignEditor({ ll, props, onSaved }: { ll: AdminLandlord; props: AdminProperty[]; onSaved: () => void }) {
  const assigned = new Map(ll.properties.map((p) => [p.property_id, p.commission_pct]));
  const [sel, setSel] = useState<Map<number, string>>(new Map([...assigned].map(([k, v]) => [k, String(v)])));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = (pid: number) => {
    const next = new Map(sel);
    if (next.has(pid)) next.delete(pid);
    else next.set(pid, String(ll.default_commission_pct));
    setSel(next);
  };

  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const ids = [...sel.keys()];
      const commissions: Record<string, string> = {};
      sel.forEach((v, k) => { commissions[String(k)] = v; });
      await adminRpc("admin_landlords", { p_action: "assign", p_id: ll.id, p_property_ids: ids, p_property_commissions: commissions });
      setMsg("تم الحفظ ✓");
      onSaved();
      setTimeout(() => setMsg(""), 2500);
    } catch (e: any) { setMsg("فشل: " + e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="ll-assign">
      <p className="odoo-hint">اختر وحدات هذا المالك وحدد نسبة Horizon لكل وحدة (٪ من الدخل الإجمالي):</p>
      <div className="ll-props">
        {props.map((p) => {
          const on = sel.has(p.id);
          const takenBy = p.landlord && p.landlord.id !== ll.id ? p.landlord.name : null;
          return (
            <div key={p.id} className={`ll-prop ${on ? "on" : ""} ${takenBy ? "taken" : ""}`}>
              <label>
                <input type="checkbox" checked={on} disabled={!!takenBy} onChange={() => toggle(p.id)} />
                <span>{p.name_ar}</span>
                {takenBy && <small>لدى {takenBy}</small>}
              </label>
              {on && (
                <span className="ll-pct">
                  <input dir="ltr" type="number" min={0} max={100} step="0.5" value={sel.get(p.id)}
                    onChange={(e) => { const n = new Map(sel); n.set(p.id, e.target.value); setSel(n); }} />%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <button className="btn-activate" onClick={save} disabled={busy}>{busy ? "..." : "حفظ التعيينات"}</button>
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

export default function AdminLandlords() {
  const [rows, setRows] = useState<AdminLandlord[]>([]);
  const [props, setProps] = useState<AdminProperty[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", commission: "15", notes: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const [l, p] = await Promise.all([
        adminRpc<{ landlords: AdminLandlord[] }>("admin_landlords", { p_action: "list" }),
        adminRpc<{ properties: AdminProperty[] }>("admin_list_properties"),
      ]);
      setRows(l.landlords || []);
      setProps(p.properties || []);
    } catch (e: any) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.name) { setMsg("أدخل اسم المالك"); return; }
    setBusy(true); setMsg("");
    try {
      const r = await adminRpc<{ access_code: string }>("admin_landlords", {
        p_action: "create", p_name: draft.name, p_phone: draft.phone || null,
        p_email: draft.email || null, p_commission: Number(draft.commission) || 15, p_notes: draft.notes || null,
      });
      setMsg(`تم إنشاء المالك ✓ — رمز الدخول: ${r.access_code}`);
      setAdding(false);
      setDraft({ name: "", phone: "", email: "", commission: "15", notes: "" });
      await load();
    } catch (e: any) { setMsg("فشل: " + e.message); }
    finally { setBusy(false); }
  };

  const action = async (a: string, ll: AdminLandlord, extra: Record<string, unknown> = {}) => {
    if (a === "delete" && !confirm(`حذف المالك ${ll.name}؟ ستُفك وحداته.`)) return;
    setBusy(true);
    try {
      const r = await adminRpc<any>("admin_landlords", { p_action: a, p_id: ll.id, ...extra });
      if (a === "regen_code") setMsg(`رمز جديد لـ ${ll.name}: ${r.access_code}`);
      await load();
    } catch (e: any) { setMsg("فشل: " + e.message); }
    finally { setBusy(false); }
  };

  const shareText = (ll: AdminLandlord) =>
    `مرحباً ${ll.name}،\nهذه بوابتك الخاصة في Horizon Stays لمتابعة وحداتك ودخلك:\nhttps://horizonstay-sa.com/landlord\nرمز الدخول: ${ll.access_code}\n(الرمز سري — لا تشاركه مع أحد)`;

  return (
    <AdminLayout title="المُلّاك" subtitle="إدارة ملاك الوحدات، نسب Horizon، وبيانات دخولهم لبوابة المالك /landlord">
      {err && <div className="admin-err">{err}</div>}
      <div className="adm-toolbar">
        <span className="odoo-hint">لكل مالك رمز دخول خاص يرى به وحداته ودخله فقط.</span>
        <button className="btn-activate" onClick={() => setAdding((v) => !v)}>{adding ? "إغلاق" : "+ مالك جديد"}</button>
      </div>

      {adding && (
        <div className="odoo-card">
          <div className="pe-grid">
            <div className="sf-row"><label>الاسم</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="sf-row"><label>الجوال</label><input dir="ltr" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+9665…" /></div>
            <div className="sf-row"><label>البريد</label><input dir="ltr" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
            <div className="sf-row"><label>نسبة Horizon الافتراضية (٪)</label><input dir="ltr" type="number" value={draft.commission} onChange={(e) => setDraft({ ...draft, commission: e.target.value })} /></div>
            <div className="sf-row"><label>ملاحظات</label><input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></div>
          </div>
          <button className="btn-activate" onClick={create} disabled={busy}>{busy ? "..." : "إنشاء المالك"}</button>
        </div>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}

      {rows.length === 0 && !adding ? (
        <p className="odoo-hint">لا يوجد ملاك بعد — أضف أول مالك واربطه بوحداته.</p>
      ) : (
        <div className="adm-prop-list">
          {rows.map((ll) => (
            <div key={ll.id} className={`adm-prop-item ${ll.is_active ? "" : "inactive"}`}>
              <button className="adm-prop-row" onClick={() => setOpenId(openId === ll.id ? null : ll.id)}>
                <div className="ll-avatar">{ll.name.slice(0, 1)}</div>
                <div className="adm-prop-info">
                  <strong>{ll.name}</strong>
                  <span>{ll.properties.length} وحدة · نسبة افتراضية {ll.default_commission_pct}%{ll.phone ? ` · ${ll.phone}` : ""}</span>
                  <small dir="ltr">رمز الدخول: {ll.access_code}</small>
                </div>
                <span className={`adm-prop-state ${ll.is_active ? "on" : "off"}`}>{ll.is_active ? "نشط" : "موقوف"}</span>
              </button>
              {openId === ll.id && (
                <div className="prop-editor">
                  <div className="theme-actions ll-actions">
                    <button className="btn-ghost sm" onClick={() => { navigator.clipboard.writeText(shareText(ll)); setMsg("نُسخت رسالة الدخول ✓"); setTimeout(() => setMsg(""), 2000); }}>نسخ رسالة الدخول 📋</button>
                    <a className="btn-ghost sm" href={`https://wa.me/${(ll.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(shareText(ll))}`} target="_blank" rel="noreferrer">إرسال واتساب</a>
                    <button className="btn-ghost sm" onClick={() => action("regen_code", ll)} disabled={busy}>تجديد الرمز ⟳</button>
                    <button className="btn-ghost sm" onClick={() => action("toggle", ll)} disabled={busy}>{ll.is_active ? "إيقاف" : "تفعيل"}</button>
                    <button className="btn-ghost sm danger" onClick={() => action("delete", ll)} disabled={busy}>حذف</button>
                  </div>
                  <AssignEditor ll={ll} props={props} onSaved={load} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
