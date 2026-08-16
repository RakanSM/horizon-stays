import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllThemes, getTheme, type ThemePreset, type ThemeSchedule } from "../lib/themes";
import { useTheme, getAdminToken, adminLogin, adminCheck, clearAdminToken } from "../lib/ThemeContext";
import TTLockSection from "../components/TTLockSection";
import ChannelsSection from "../components/ChannelsSection";
import { adminRpc } from "../lib/adminApi";

const DECOR_ICONS: Record<string, string> = {
  ramadan: "🏮",
  ramadan2: "🌙",
  "eid-fitr": "🎈",
  "eid-adha": "🕌",
  "parallax-art": "🎨",
};

export function ThemeSwatch({
  t, active, scheduled, onActivate, busy,
}: {
  t: ThemePreset; active: boolean; scheduled: boolean; onActivate: () => void; busy: boolean;
}) {
  const k = t.tokens;
  return (
    <div className={`theme-card ${active ? "active" : ""}`}>
      <div className="theme-preview" style={{ background: k.bg }}>
        {t.decor && <span className="tp-decor">{DECOR_ICONS[t.decor] || "✨"}</span>}
        <div className="tp-header" style={{ background: k.headerBg, borderBottom: `1px solid ${k.border}` }}>
          <span style={{ color: k.accent, fontWeight: 700, fontSize: 10 }}>Horizon</span>
          <span className="tp-pill" style={{ background: k.accent, color: k.ctaText }} />
        </div>
        <div className="tp-hero" style={{ background: `linear-gradient(135deg, ${k.bg2}, ${k.bg})` }}>
          <div className="tp-line" style={{ background: k.text, width: "62%" }} />
          <div className="tp-line" style={{ background: k.textMuted, width: "40%", height: 4 }} />
          <div className="tp-btn" style={{ background: k.accent }} />
        </div>
        <div className="tp-cards">
          {[0, 1, 2].map((i) => (
            <div key={i} className="tp-card" style={{ background: k.card, border: `1px solid ${k.border}`, borderRadius: Math.min(parseInt(k.radius) || 6, 8) }}>
              <div className="tp-img" style={{ background: k.accentSoft }} />
              <div className="tp-line" style={{ background: k.textMuted, width: "70%", height: 3 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="theme-meta">
        <div>
          <strong>{t.nameAr}</strong>
          <span className="theme-mode">
            {t.nameEn} · {t.mode === "dark" ? "داكن" : "فاتح"}
            {t.custom ? " · مخصص" : ""}
            {t.parallax ? " · Parallax" : ""}
          </span>
          <p>{t.description}</p>
        </div>
        <div className="theme-actions">
          {scheduled && <span className="badge-scheduled">مجدول 📅</span>}
          {active ? (
            <span className="badge-active">مفعّل ✓</span>
          ) : (
            <button className="btn-activate" onClick={onActivate} disabled={busy}>
              {busy ? "..." : "تفعيل"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Theme scheduling ---------- */
export function ScheduleSection() {
  const { schedules, saveSchedules, activeScheduleId } = useTheme();
  const allThemes = getAllThemes();
  const [items, setItems] = useState<ThemeSchedule[]>(schedules);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<ThemeSchedule>({
    id: "", themeId: "ramadan-nights", startDate: "", endDate: "", label: "", enabled: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => setItems(schedules), [schedules]);

  const persist = async (next: ThemeSchedule[]) => {
    const tok = getAdminToken();
    if (!tok) return;
    setBusy(true);
    setMsg("");
    try {
      await saveSchedules(tok, next);
      setMsg("تم الحفظ ✓");
      setTimeout(() => setMsg(""), 2200);
    } catch {
      setMsg("فشل الحفظ — تحقق من الجلسة");
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    if (!draft.startDate || !draft.endDate || draft.endDate < draft.startDate) {
      setMsg("تحقق من التواريخ — تاريخ النهاية يجب أن يكون بعد البداية");
      return;
    }
    const next = [...items, { ...draft, id: `sch_${Date.now()}` }];
    setItems(next);
    setAdding(false);
    setDraft({ id: "", themeId: "ramadan-nights", startDate: "", endDate: "", label: "", enabled: true });
    await persist(next);
  };

  const remove = async (id: string) => {
    const next = items.filter((s) => s.id !== id);
    setItems(next);
    await persist(next);
  };

  const toggle = async (id: string) => {
    const next = items.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setItems(next);
    await persist(next);
  };

  return (
    <div className="odoo-card schedule-card">
      <div className="odoo-card-head">
        <div>
          <h2>جدولة الطُّبوع 📅</h2>
          <p>حدد فترة زمنية ليتم تفعيل طابع تلقائياً — مثالي لرمضان والأعياد. عند انتهاء الفترة يعود الموقع للطابع الأساسي.</p>
        </div>
        <button className="btn-activate" onClick={() => setAdding((v) => !v)}>{adding ? "إغلاق" : "+ جدولة جديدة"}</button>
      </div>

      {adding && (
        <div className="schedule-form">
          <div className="sf-row">
            <label>الطابع</label>
            <select value={draft.themeId} onChange={(e) => setDraft({ ...draft, themeId: e.target.value })}>
              {allThemes.map((t) => (
                <option key={t.id} value={t.id}>{t.nameAr} ({t.nameEn})</option>
              ))}
            </select>
          </div>
          <div className="sf-row">
            <label>الاسم (اختياري)</label>
            <input type="text" value={draft.label || ""} placeholder="مثال: رمضان ١٤٤٨" onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </div>
          <div className="sf-dates">
            <div className="sf-row">
              <label>من تاريخ</label>
              <input type="date" value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
            </div>
            <div className="sf-row">
              <label>إلى تاريخ</label>
              <input type="date" value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
            </div>
          </div>
          <button className="btn-activate" onClick={add} disabled={busy}>{busy ? "..." : "إضافة الجدولة"}</button>
        </div>
      )}

      {items.length === 0 && !adding && <p className="odoo-hint">لا توجد جدولات بعد — أضف جدولة لتفعيل طابع رمضان أو العيد تلقائياً في موعده.</p>}

      {items.length > 0 && (
        <div className="schedule-list">
          {items.map((s) => {
            const th = getTheme(s.themeId);
            const isLive = activeScheduleId === s.id;
            return (
              <div key={s.id} className={`schedule-item ${s.enabled ? "" : "disabled"} ${isLive ? "live" : ""}`}>
                <span className="si-dot" style={{ background: th.tokens.accent }} />
                <div className="si-info">
                  <strong>{s.label || th.nameAr}</strong>
                  <span dir="ltr">{s.startDate} → {s.endDate}</span>
                  <small>{th.nameAr}{isLive ? " — نشط الآن ✓" : ""}</small>
                </div>
                <div className="theme-actions">
                  <button className="btn-ghost sm" onClick={() => toggle(s.id)} disabled={busy}>{s.enabled ? "إيقاف" : "تفعيل"}</button>
                  <button className="btn-ghost sm danger" onClick={() => remove(s.id)} disabled={busy}>حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

/* ---------- Odoo ---------- */
type OdooStatus = {
  config: {
    base_url: string;
    database_name: string;
    username: string;
    has_api_key: boolean;
    is_enabled: boolean;
    sync_enabled: boolean;
    configured: boolean;
    last_connection_status: "not_configured" | "ready" | "connected" | "failed";
    last_connection_checked_at: string | null;
    last_sync_at: string | null;
    last_sync_summary: { status?: string; total?: number; succeeded?: number; failed?: number } | null;
    last_error: string | null;
  };
  runs: Array<{
    id: number;
    triggered_by: string;
    status: string;
    total_bookings: number;
    succeeded: number;
    failed: number;
    error_message: string | null;
    started_at: string;
    finished_at: string | null;
  }>;
};

export function OdooSection() {
  const [status, setStatus] = useState<OdooStatus | null>(null);
  const [form, setForm] = useState({ baseUrl: "", databaseName: "", username: "", apiKey: "", isEnabled: false, syncEnabled: false });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<"connection" | "sync" | null>(null);

  const load = async () => {
    try {
      const data = await adminRpc<{ ok: boolean } & OdooStatus>("admin_odoo_status");
      if (!data.ok) throw new Error("تعذر تحميل إعدادات أودو");
      setStatus(data);
      setForm((current) => ({
        baseUrl: data.config.base_url || "",
        databaseName: data.config.database_name || "",
        username: data.config.username || "",
        apiKey: current.apiKey,
        isEnabled: data.config.is_enabled,
        syncEnabled: data.config.sync_enabled,
      }));
    } catch (error: any) {
      setMsg(error.message || "فشل تحميل حالة Odoo");
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    let clean = form.baseUrl.trim();
    if (clean && !/^https?:\/\//i.test(clean)) clean = "https://" + clean;
    setBusy(true);
    setMsg("");
    try {
      await adminRpc("admin_set_odoo_config", {
        p_base_url: clean,
        p_database_name: form.databaseName.trim(),
        p_username: form.username.trim(),
        p_api_key: form.apiKey.trim() || null,
        p_is_enabled: form.isEnabled,
        p_sync_enabled: form.syncEnabled,
      });
      setForm((current) => ({ ...current, baseUrl: clean, apiKey: "" }));
      setMsg("تم حفظ إعدادات Odoo بأمان ✓");
      await load();
    } catch (error: any) {
      setMsg(error.message || "فشل الحفظ — تحقق من الجلسة");
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (nextAction: "connection" | "sync") => {
    const token = getAdminToken();
    if (!token) return;
    setAction(nextAction);
    setMsg("");
    try {
      const response = await fetch(`/api/odoo/sync?action=${nextAction}`, { method: "POST", headers: { "x-admin-token": token } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.detail || data.error || "فشلت العملية");
      setMsg(nextAction === "connection" ? "تم التحقق من اتصال Odoo ✓" : `انتهت المزامنة: ${data.succeeded || 0} ناجح، ${data.failed || 0} فشل`);
      await load();
    } catch (error: any) {
      setMsg(error.message || "فشلت العملية");
      await load();
    } finally {
      setAction(null);
    }
  };

  const config = status?.config;
  const stateLabel = !config?.configured ? "غير مكتمل" : config.last_connection_status === "connected" ? "متصل ✓" : config.last_connection_status === "failed" ? "فشل الاتصال" : "بانتظار التحقق";

  return (
    <div className="odoo-card">
      <div className="odoo-card-head">
        <div>
          <h2>تكامل Odoo (ERP)</h2>
          <p>اربط حجوزات Horizon بوحدات Odoo والإيرادات والفواتير. لا تظهر مفاتيح Odoo بعد حفظها.</p>
        </div>
        <span className={`odoo-status ${config?.last_connection_status === "connected" ? "on" : "off"}`}>{stateLabel}</span>
      </div>

      <div className="pe-grid odoo-settings-grid">
        <div className="sf-row"><label>رابط Odoo</label><input dir="ltr" value={form.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} placeholder="https://yourcompany.odoo.com" /></div>
        <div className="sf-row"><label>اسم قاعدة بيانات Odoo</label><input dir="ltr" value={form.databaseName} onChange={(e) => set("databaseName", e.target.value)} placeholder="yourcompany-prod" /></div>
        <div className="sf-row"><label>اسم مستخدم Odoo</label><input dir="ltr" type="email" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="admin@company.com" /></div>
        <div className="sf-row"><label>مفتاح API {config?.has_api_key ? "(محفوظ — اتركه فارغاً للإبقاء عليه)" : ""}</label><input dir="ltr" type="password" value={form.apiKey} onChange={(e) => set("apiKey", e.target.value)} placeholder={config?.has_api_key ? "••••••••" : "API Key"} autoComplete="new-password" /></div>
      </div>

      <div className="odoo-toggles">
        <label className="pe-toggle"><input type="checkbox" checked={form.isEnabled} onChange={(e) => set("isEnabled", e.target.checked)} /> تفعيل ربط Odoo</label>
        <label className="pe-toggle"><input type="checkbox" checked={form.syncEnabled} onChange={(e) => set("syncEnabled", e.target.checked)} /> تفعيل مزامنة الحجوزات</label>
      </div>

      <div className="odoo-row">
        <div className="odoo-status-copy">
          <strong>آخر تحقق:</strong> {config?.last_connection_checked_at ? new Date(config.last_connection_checked_at).toLocaleString("ar-SA") : "لم يتم"}
          {config?.last_sync_at && <><br /><strong>آخر مزامنة:</strong> {new Date(config.last_sync_at).toLocaleString("ar-SA")}</>}
          {config?.last_error && <><br /><span className="admin-err">{config.last_error}</span></>}
        </div>
        <div className="theme-actions">
          <button className="btn-ghost" onClick={() => runAction("connection")} disabled={action !== null}>{action === "connection" ? "جارٍ التحقق…" : "اختبار الاتصال"}</button>
          <button className="btn-activate" onClick={() => runAction("sync")} disabled={action !== null || !config?.configured || !form.isEnabled || !form.syncEnabled}>{action === "sync" ? "جارٍ التزامن…" : "مزامنة الحجوزات الآن"}</button>
          <button className="btn-ghost" onClick={save} disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ الإعدادات"}</button>
          {config?.base_url && <a className="btn-ghost" href={config.base_url} target="_blank" rel="noreferrer">فتح Odoo ↗</a>}
        </div>
      </div>

      {status?.runs?.length ? (
        <div className="odoo-run-list">
          <h4 className="pe-sub">سجل مزامنة Odoo</h4>
          {status.runs.slice(0, 5).map((run) => (
            <div className="odoo-run" key={run.id}>
              <span className={`odoo-status ${run.status === "completed" ? "on" : "off"}`}>{run.status}</span>
              <span>{run.total_bookings} حجوزات · {run.succeeded} ناجح · {run.failed} فشل</span>
              <small>{new Date(run.started_at).toLocaleString("ar-SA")}</small>
            </div>
          ))}
        </div>
      ) : (
        <p className="odoo-hint">بعد حفظ بيانات Odoo، اضغط «اختبار الاتصال». بعدها اربط كل وحدة بمنتج Rental داخل إعداداتها ثم فعّل المزامنة.</p>
      )}

      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}

/* ---------- Cleaning (cleaner role) ---------- */
type AdminCleaner = { id: number; name: string; phone: string | null; pin: string; active: boolean };
type AdminCleanLog = { id: number; property_slug: string; notes: string | null; cleaned_at: string; cleaner_name: string; cleaner_phone: string | null };

export function CleaningSection() {
  const [logs, setLogs] = useState<AdminCleanLog[]>([]);
  const [cleaners, setCleaners] = useState<AdminCleaner[]>([]);
  const [showManage, setShowManage] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", pin: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const tok = getAdminToken();
    if (!tok) return;
    const { supabase } = await import("../lib/supabase");
    const [l, c] = await Promise.all([
      supabase.rpc("admin_cleaning_logs", { p_token: tok }),
      supabase.rpc("admin_manage_cleaners", { p_token: tok, p_action: "list" }),
    ]);
    if (l.data?.ok) setLogs(l.data.logs || []);
    if (c.data?.ok) setCleaners(c.data.cleaners || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manage = async (action: string, extra: Record<string, unknown> = {}) => {
    const tok = getAdminToken();
    if (!tok) return;
    setBusy(true);
    setMsg("");
    try {
      const { supabase } = await import("../lib/supabase");
      const { data, error } = await supabase.rpc("admin_manage_cleaners", { p_token: tok, p_action: action, p_name: null, p_phone: null, p_pin: null, p_cleaner_id: null, ...extra });
      if (error || !data?.ok) {
        setMsg("فشل التنفيذ — تحقق من البيانات");
        return;
      }
      setCleaners(data.cleaners || []);
      if (action === "add") {
        setDraft({ name: "", phone: "", pin: "" });
        setMsg("تمت إضافة العاملة ✓ — شاركها الرابط /cleaner ورمز الدخول");
      }
      setTimeout(() => setMsg(""), 4000);
    } finally {
      setBusy(false);
    }
  };

  const slugName = (slug: string) => slug.replace(/-/g, " ");

  return (
    <div className="odoo-card cleaning-card">
      <div className="odoo-card-head">
        <div>
          <h2>سجل النظافة 🧹</h2>
          <p>تسجّل عاملات النظافة إتمام تنظيف الوحدات من هواتفهن عبر صفحة <code>/cleaner</code> برمز دخول خاص.</p>
        </div>
        <button className="btn-activate" onClick={() => setShowManage((v) => !v)}>{showManage ? "إغلاق الإدارة" : "إدارة العاملات"}</button>
      </div>

      {showManage && (
        <div className="cleaners-manage">
          <div className="schedule-form">
            <div className="sf-dates">
              <div className="sf-row">
                <label>الاسم</label>
                <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="اسم العاملة" />
              </div>
              <div className="sf-row">
                <label>الجوال (اختياري)</label>
                <input type="text" dir="ltr" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+9665…" />
              </div>
              <div className="sf-row">
                <label>رمز الدخول (4+ أرقام)</label>
                <input type="text" dir="ltr" value={draft.pin} onChange={(e) => setDraft({ ...draft, pin: e.target.value })} placeholder="1234" />
              </div>
            </div>
            <button className="btn-activate" disabled={busy || !draft.name || draft.pin.length < 4} onClick={() => manage("add", { p_name: draft.name, p_phone: draft.phone || null, p_pin: draft.pin })}>
              {busy ? "..." : "+ إضافة عاملة"}
            </button>
          </div>
          {cleaners.length > 0 && (
            <div className="schedule-list">
              {cleaners.map((c) => (
                <div key={c.id} className={`schedule-item ${c.active ? "" : "disabled"}`}>
                  <span className="si-dot" style={{ background: c.active ? "#22c55e" : "#6b7280" }} />
                  <div className="si-info">
                    <strong>{c.name}</strong>
                    <span dir="ltr">PIN: {c.pin}{c.phone ? ` · ${c.phone}` : ""}</span>
                    <small>{c.active ? "نشطة" : "موقوفة"}</small>
                  </div>
                  <div className="theme-actions">
                    <button className="btn-ghost sm" onClick={() => manage("toggle", { p_cleaner_id: c.id })} disabled={busy}>{c.active ? "إيقاف" : "تفعيل"}</button>
                    <button className="btn-ghost sm danger" onClick={() => manage("delete", { p_cleaner_id: c.id })} disabled={busy}>حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {logs.length === 0 ? (
        <p className="odoo-hint">لا توجد سجلات نظافة بعد — عند إرسال أول تسجيل من صفحة /cleaner سيظهر هنا.</p>
      ) : (
        <div className="clean-log-table">
          {logs.map((l) => (
            <div key={l.id} className="clean-log-row">
              <div className="cl-main">
                <strong>{slugName(l.property_slug)}</strong>
                <span>{l.cleaner_name}{l.notes ? ` — ${l.notes}` : ""}</span>
              </div>
              <time dir="ltr">{new Date(l.cleaned_at).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</time>
            </div>
          ))}
        </div>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}
