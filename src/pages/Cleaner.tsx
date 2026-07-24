import { useEffect, useState } from "react";
import { supabase, fetchProperties, type Property } from "../lib/supabase";
import { useLang } from "../lib/i18n";

type CleanerSession = { pin: string; name: string };
type MyLog = { id: number; property_slug: string; notes: string | null; cleaned_at: string };

const LS_KEY = "hz_cleaner_session";

export default function Cleaner() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const [session, setSession] = useState<CleanerSession | null>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [logs, setLogs] = useState<MyLog[]>([]);

  useEffect(() => {
    if (!session) return;
    fetchProperties().then(setProperties).catch(() => {});
    refreshLogs(session.pin);
  }, [session]);

  async function refreshLogs(p: string) {
    const { data } = await supabase.rpc("cleaner_my_logs", { p_pin: p });
    if (data?.ok) setLogs(data.logs || []);
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("cleaner_login", { p_pin: pin.trim() });
      if (error || !data?.ok) {
        setErr(ar ? "رمز الدخول غير صحيح" : "Invalid PIN");
        return;
      }
      const s = { pin: pin.trim(), name: data.name as string };
      setSession(s);
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(LS_KEY);
    setPin("");
    setLogs([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selected) return;
    setBusy(true);
    setErr("");
    try {
      const { data, error } = await supabase.rpc("cleaner_submit", {
        p_pin: session.pin,
        p_property_slug: selected,
        p_notes: notes,
      });
      if (error || !data?.ok) {
        setErr(ar ? "تعذر الإرسال — حاول مرة أخرى" : "Submission failed — try again");
        return;
      }
      setDone(selected);
      setSelected("");
      setNotes("");
      refreshLogs(session.pin);
      setTimeout(() => setDone(null), 4000);
    } finally {
      setBusy(false);
    }
  }

  const propName = (slug: string) => {
    const p = properties.find((x) => x.slug === slug);
    return p ? (ar ? p.name_ar : p.name_en || p.name_ar) : slug;
  };

  if (!session) {
    return (
      <div className="admin-wrap admin-login-wrap">
        <form className="admin-login" onSubmit={doLogin}>
          <h1>{ar ? "بوابة النظافة" : "Cleaning Portal"}</h1>
          <p>{ar ? "أدخلي رمز الدخول الخاص بك" : "Enter your PIN code"}</p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={ar ? "رمز الدخول" : "PIN"}
            autoFocus
          />
          {err && <div className="admin-err">{err}</div>}
          <button className="btn btn-gold" disabled={busy || pin.trim().length < 4}>
            {busy ? "..." : ar ? "دخول" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-wrap cleaner-wrap">
      <div className="cleaner-head">
        <div>
          <h1>{ar ? "مرحباً، " : "Hello, "}{session.name}</h1>
          <p>{ar ? "سجلي الوحدة بعد الانتهاء من تنظيفها" : "Submit a unit once cleaning is complete"}</p>
        </div>
        <button className="btn btn-ghost" onClick={logout}>{ar ? "خروج" : "Logout"}</button>
      </div>

      {done && (
        <div className="cleaner-success">
          ✓ {ar ? "تم تسجيل نظافة" : "Cleaning logged for"} «{propName(done)}»
        </div>
      )}

      <form className="cleaner-form" onSubmit={submit}>
        <label>{ar ? "الوحدة" : "Unit"}</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} required>
          <option value="" disabled>
            {ar ? "اختاري الوحدة…" : "Select unit…"}
          </option>
          {properties.map((p) => (
            <option key={p.slug} value={p.slug}>
              {ar ? p.name_ar : p.name_en || p.name_ar}
            </option>
          ))}
        </select>
        <label>{ar ? "ملاحظات (اختياري)" : "Notes (optional)"}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={ar ? "مثال: تم تغيير المفارش، ينقص صابون…" : "e.g. linens changed, low on soap…"}
        />
        {err && <div className="admin-err">{err}</div>}
        <button className="btn btn-gold cleaner-submit" disabled={busy || !selected}>
          {busy ? "..." : ar ? "✓ تم التنظيف" : "✓ Cleaning done"}
        </button>
      </form>

      <div className="cleaner-logs">
        <h2>{ar ? "آخر أعمالك" : "Your recent work"}</h2>
        {logs.length === 0 && <p className="muted">{ar ? "لا توجد سجلات بعد" : "No records yet"}</p>}
        {logs.map((l) => (
          <div className="cleaner-log-row" key={l.id}>
            <div>
              <strong>{propName(l.property_slug)}</strong>
              {l.notes && <span className="muted"> — {l.notes}</span>}
            </div>
            <time>{new Date(l.cleaned_at).toLocaleString(ar ? "ar-SA" : "en-GB", { dateStyle: "short", timeStyle: "short" })}</time>
          </div>
        ))}
      </div>
    </div>
  );
}
