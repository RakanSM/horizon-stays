import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { getAdminToken } from "../../lib/ThemeContext";
import { useLang } from "../../lib/i18n";

type Lock = {
  lockId: number;
  lockAlias: string;
  lockName: string;
  electricQuantity: number | null;
  hasGateway: boolean;
  keyboardPwdVersion: number | null;
  groupName: string;
};
type Passcode = { keyboardPwdId: number; keyboardPwd: string; keyboardPwdName: string; startDate: number | null; endDate: number | null; status: number | null };
type AccessRecord = { lockId: number; recordType: number | null; success: boolean; username: string; credential: string; lockDate: number | null; serverDate: number | null };
type Audit = { id: string; action: string; lock_id: number | null; lock_alias: string | null; status: "success" | "failed" | "blocked"; created_at: string };

async function ttlockApi<T>(action: string, params: Record<string, unknown> = {}) {
  const response = await fetch("/api/ttlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: getAdminToken(), action, ...params }),
  });
  return response.json() as Promise<T>;
}

const recordType = (type: number | null, lang: string) => {
  const names: Record<number, [string, string]> = {
    1: ["فتح من التطبيق", "App unlock"], 3: ["فتح عبر البوابة", "Gateway unlock"], 4: ["فتح برمز", "Passcode unlock"], 7: ["فتح ببطاقة", "IC card unlock"], 8: ["فتح ببصمة", "Fingerprint unlock"], 10: ["مفتاح ميكانيكي", "Mechanical key"], 29: ["فتح غير متوقع", "Unexpected unlock"], 31: ["فتح حساس الباب", "Door opened"], 32: ["فتح من الداخل", "Opened inside"], 44: ["تنبيه عبث", "Tamper alert"], 45: ["قفل تلقائي", "Auto lock"],
  };
  return names[type || 0]?.[lang === "en" ? 1 : 0] || (lang === "en" ? "Lock event" : "حدث قفل");
};

const auditName = (action: string, lang: string) => ({
  refresh: lang === "en" ? "Lock refresh" : "تحديث الأقفال",
  rename: lang === "en" ? "Lock name changed" : "تغيير اسم القفل",
  passcode_created: lang === "en" ? "Guest code created" : "إنشاء رمز ضيف",
  passcode_deleted: lang === "en" ? "Guest code deleted" : "حذف رمز ضيف",
  remote_unlock: lang === "en" ? "Remote unlock requested" : "طلب فتح عن بُعد",
  records_read: lang === "en" ? "Events reviewed" : "عرض الأحداث",
}[action] || action);

export default function AdminLocks() {
  const { lang } = useLang();
  const isEnglish = lang === "en";
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [locks, setLocks] = useState<Lock[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [passcodes, setPasscodes] = useState<Passcode[]>([]);
  const [records, setRecords] = useState<AccessRecord[]>([]);
  const [alias, setAlias] = useState("");
  const [codeDraft, setCodeDraft] = useState({ name: "", start: "", end: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const selected = useMemo(() => locks.find((lock) => lock.lockId === selectedId) || null, [locks, selectedId]);
  const dateTime = useCallback((value?: number | string | null) => value ? new Date(value).toLocaleString(isEnglish ? "en-US" : "ar-SA", { dateStyle: "medium", timeStyle: "short" }) : "—", [isEnglish]);

  const loadAudit = useCallback(async () => {
    const result = await ttlockApi<{ ok: boolean; data: Audit[] }>("audit").catch(() => null);
    if (result?.ok) setAudit(result.data || []);
  }, []);

  const refresh = useCallback(async () => {
    setBusy("refresh");
    setMessage("");
    try {
      const status = await ttlockApi<{ configured?: boolean; connected?: boolean; error?: string }>("status");
      setConfigured(Boolean(status.configured));
      setConnected(Boolean(status.connected));
      if (!status.configured || !status.connected) { setLocks([]); return; }
      const result = await ttlockApi<{ ok: boolean; data: Lock[] }>("locks");
      if (result.ok) {
        const nextLocks = result.data || [];
        setLocks(nextLocks);
        setSelectedId((current) => current && nextLocks.some((lock) => lock.lockId === current) ? current : nextLocks[0]?.lockId || null);
      }
    } finally {
      setBusy(null);
      loadAudit();
    }
  }, [loadAudit]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (selected) { setAlias(selected.lockAlias || selected.lockName); setPasscodes([]); setRecords([]); setCodeDraft({ name: "", start: "", end: "" }); } }, [selected]);

  const changeAlias = async () => {
    if (!selected || !alias.trim()) return;
    if (!window.confirm(isEnglish ? "Change this lock name in TTLock now?" : "هل تريد تغيير اسم هذا القفل في TTLock الآن؟")) return;
    setBusy("rename"); setMessage("");
    try {
      const result = await ttlockApi<{ ok: boolean }>("rename", { lockId: selected.lockId, lockAlias: alias.trim(), confirmed: true });
      setMessage(result.ok ? (isEnglish ? "The name was updated in TTLock." : "تم تحديث الاسم في TTLock.") : (isEnglish ? "TTLock did not accept the name change." : "لم يقبل TTLock تغيير الاسم."));
      if (result.ok) await refresh();
    } finally { setBusy(null); loadAudit(); }
  };

  const loadPasscodes = async () => {
    if (!selected) return;
    setBusy("passcodes");
    try {
      const result = await ttlockApi<{ ok: boolean; data: Passcode[] }>("passcodes", { lockId: selected.lockId });
      setPasscodes(result.ok ? result.data || [] : []);
    } finally { setBusy(null); }
  };

  const createPasscode = async () => {
    if (!selected || !codeDraft.start || !codeDraft.end) { setMessage(isEnglish ? "Set the start and end time first." : "حدد وقت البداية والنهاية أولاً."); return; }
    if (!window.confirm(isEnglish ? "Create this guest code in TTLock now?" : "هل تريد إنشاء رمز الضيف في TTLock الآن؟")) return;
    setBusy("create"); setMessage("");
    try {
      const result = await ttlockApi<{ ok: boolean; data?: { keyboardPwd?: string } }>("create-passcode", { lockId: selected.lockId, start: new Date(codeDraft.start).getTime(), end: new Date(codeDraft.end).getTime(), name: codeDraft.name || (isEnglish ? "Guest" : "ضيف"), confirmed: true });
      setMessage(result.ok ? (isEnglish ? `Guest code created: ${result.data?.keyboardPwd || "—"}. Save it now; existing codes stay masked.` : `تم إنشاء رمز الضيف: ${result.data?.keyboardPwd || "—"}. احفظه الآن؛ الرموز السابقة تظل مخفية.`) : (isEnglish ? "The guest code could not be created." : "تعذر إنشاء رمز الضيف."));
      if (result.ok) { setCodeDraft({ name: "", start: "", end: "" }); await loadPasscodes(); }
    } finally { setBusy(null); loadAudit(); }
  };

  const deletePasscode = async (passcode: Passcode) => {
    if (!selected || !window.confirm(isEnglish ? "Delete this guest code from TTLock?" : "هل تريد حذف رمز الضيف من TTLock؟")) return;
    setBusy(`delete-${passcode.keyboardPwdId}`);
    try {
      const result = await ttlockApi<{ ok: boolean }>("delete-passcode", { lockId: selected.lockId, keyboardPwdId: passcode.keyboardPwdId, confirmed: true });
      setMessage(result.ok ? (isEnglish ? "Guest code deleted." : "تم حذف رمز الضيف.") : (isEnglish ? "The guest code could not be deleted." : "تعذر حذف رمز الضيف."));
      if (result.ok) await loadPasscodes();
    } finally { setBusy(null); loadAudit(); }
  };

  const requestUnlock = async () => {
    if (!selected || !window.confirm(isEnglish ? "Unlock this door remotely now? This is an immediate door action." : "هل تريد فتح هذا الباب عن بُعد الآن؟ هذا إجراء فوري على الباب.")) return;
    setBusy("unlock");
    try {
      const result = await ttlockApi<{ ok: boolean }>("unlock", { lockId: selected.lockId, confirmed: true });
      setMessage(result.ok ? (isEnglish ? "Remote unlock request sent to TTLock." : "تم إرسال طلب الفتح عن بُعد إلى TTLock.") : (isEnglish ? "Remote unlock was not completed. Check the gateway or Wi‑Fi lock." : "لم يكتمل الفتح عن بُعد. تحقق من البوابة أو قفل Wi‑Fi."));
    } finally { setBusy(null); loadAudit(); }
  };

  const loadRecords = async () => {
    if (!selected) return;
    setBusy("records");
    try {
      const result = await ttlockApi<{ ok: boolean; data: AccessRecord[] }>("records", { lockId: selected.lockId });
      setRecords(result.ok ? result.data || [] : []);
    } finally { setBusy(null); loadAudit(); }
  };

  return (
    <AdminLayout title={isEnglish ? "Smart locks" : "الأقفال الذكية"} subtitle={isEnglish ? "Live TTLock management. Unit mapping will be added later." : "إدارة TTLock الحية. ربط الأقفال بالوحدات سيُضاف لاحقاً."}>
      <div className="locks-page">
        <section className="locks-hero-card">
          <div><span>{isEnglish ? "TTLOCK COMMAND" : "مركز TTLOCK"}</span><h2>{isEnglish ? "Every managed lock, one Horizon control surface." : "كل الأقفال المُدارة، من صفحة Horizon واحدة."}</h2><p>{isEnglish ? "Changes approved here are sent directly to TTLock and appear in the audit log. No lock is connected to a property from this page yet." : "التغييرات المعتمدة هنا تُرسل مباشرة إلى TTLock وتظهر في سجل التدقيق. لا يتم ربط أي قفل بوحدة من هذه الصفحة حالياً."}</p></div>
          <div className="locks-hero-actions"><button className="btn-ghost" onClick={refresh} disabled={busy === "refresh"}>{busy === "refresh" ? "…" : isEnglish ? "Refresh locks" : "تحديث الأقفال"}</button><span className={`locks-connection ${configured && connected ? "is-live" : ""}`}>{configured === null ? "…" : configured && connected ? (isEnglish ? "Connected" : "متصل") : configured ? (isEnglish ? "Connection needs attention" : "يتطلب معالجة الاتصال") : (isEnglish ? "Not configured" : "غير مهيأ")}</span></div>
        </section>

        {!configured && <section className="locks-empty"><h3>{isEnglish ? "Secure connection is not configured" : "اتصال TTLock الآمن غير مهيأ"}</h3><p>{isEnglish ? "Add the TTLock developer credentials in Integrations. The lock page will then load the real locks from your TTLock app account." : "أضف بيانات مطور TTLock في صفحة التكاملات. بعدها ستعرض هذه الصفحة الأقفال الحقيقية من حساب تطبيق TTLock."}</p><Link className="btn-activate" to="/admin/integrations">{isEnglish ? "Open integrations" : "فتح التكاملات"}</Link></section>}

        {configured && !connected && <section className="locks-empty"><h3>{isEnglish ? "TTLock connection needs attention" : "اتصال TTLock يحتاج معالجة"}</h3><p>{isEnglish ? "Review the secured TTLock application settings, then refresh this page. No remote operation is available while the connection is unavailable." : "راجع إعدادات تطبيق TTLock الآمنة ثم حدّث الصفحة. لا تتاح أي عملية عن بُعد أثناء تعذر الاتصال."}</p><Link className="btn-activate" to="/admin/integrations">{isEnglish ? "Review connection" : "مراجعة الاتصال"}</Link></section>}

        {configured && connected && <div className="locks-layout">
          <section className="locks-list-card"><div className="locks-section-head"><div><span>{isEnglish ? "MANAGED LOCKS" : "الأقفال المُدارة"}</span><h3>{locks.length} {isEnglish ? "locks" : "قفل"}</h3></div><small>{isEnglish ? "Live from TTLock" : "مباشرة من TTLock"}</small></div>
            {locks.length === 0 ? <p className="locks-muted">{isEnglish ? "No locks are visible in this TTLock account yet." : "لا توجد أقفال ظاهرة في حساب TTLock هذا بعد."}</p> : <div className="locks-list">{locks.map((lock) => <button key={lock.lockId} type="button" onClick={() => setSelectedId(lock.lockId)} className={`lock-row ${selectedId === lock.lockId ? "selected" : ""}`}><span className={`lock-battery ${(lock.electricQuantity ?? 100) <= 20 ? "critical" : (lock.electricQuantity ?? 100) <= 40 ? "low" : ""}`} /><span className="lock-row-copy"><strong>{lock.lockAlias || lock.lockName || `Lock #${lock.lockId}`}</strong><small>#{lock.lockId}{lock.groupName ? ` · ${lock.groupName}` : ""}</small></span><span className="lock-row-meta"><b>{lock.electricQuantity ?? "—"}{lock.electricQuantity !== null ? "%" : ""}</b><small>{lock.hasGateway ? (isEnglish ? "Gateway" : "بوابة") : (isEnglish ? "No gateway" : "بدون بوابة")}</small></span></button>)}</div>}
          </section>

          <section className="locks-detail-card">
            {!selected ? <div className="locks-empty compact"><h3>{isEnglish ? "Choose a lock" : "اختر قفلاً"}</h3><p>{isEnglish ? "Select any lock to review its status and controlled actions." : "اختر أي قفل لمراجعة حالته وإجراء العمليات المصرح بها."}</p></div> : <>
              <div className="locks-section-head"><div><span>{isEnglish ? "HORIZON → TTLOCK" : "HORIZON ←→ TTLOCK"}</span><h3>{selected.lockAlias || selected.lockName || `Lock #${selected.lockId}`}</h3></div><span className={selected.hasGateway ? "lock-tag live" : "lock-tag"}>{selected.hasGateway ? (isEnglish ? "Gateway connected" : "بوابة متصلة") : (isEnglish ? "Gateway not reported" : "لا توجد بوابة معلنة")}</span></div>
              <div className="lock-status-grid"><div><span>{isEnglish ? "Battery" : "البطارية"}</span><b>{selected.electricQuantity ?? "—"}{selected.electricQuantity !== null ? "%" : ""}</b></div><div><span>{isEnglish ? "Passcode version" : "إصدار الرموز"}</span><b>{selected.keyboardPwdVersion ?? "—"}</b></div><div><span>{isEnglish ? "Property link" : "ربط الوحدة"}</span><b>{isEnglish ? "Later" : "لاحقاً"}</b></div></div>
              <div className="lock-action-block"><div><h4>{isEnglish ? "Lock name" : "اسم القفل"}</h4><p>{isEnglish ? "A confirmed Horizon save is reflected immediately in TTLock." : "عند الحفظ المؤكد من Horizon ينعكس الاسم فوراً في TTLock."}</p></div><div className="lock-rename"><input value={alias} onChange={(event) => setAlias(event.target.value)} maxLength={80} aria-label={isEnglish ? "Lock name" : "اسم القفل"}/><button className="btn-activate sm" onClick={changeAlias} disabled={busy === "rename" || !alias.trim()}>{busy === "rename" ? "…" : isEnglish ? "Save to TTLock" : "حفظ في TTLock"}</button></div></div>
              <div className="lock-action-block"><div><h4>{isEnglish ? "Guest codes" : "رموز الضيوف"}</h4><p>{isEnglish ? "Existing codes are masked. Creating or deleting a code always requires an explicit confirmation." : "الرموز السابقة تظهر مخفية. إنشاء أو حذف أي رمز يتطلب تأكيداً صريحاً دائماً."}</p></div><div className="lock-action-row"><button className="btn-ghost sm" onClick={loadPasscodes} disabled={busy === "passcodes"}>{busy === "passcodes" ? "…" : isEnglish ? "View codes" : "عرض الرموز"}</button></div>
                <div className="lock-code-form"><input placeholder={isEnglish ? "Guest name" : "اسم الضيف"} value={codeDraft.name} onChange={(event) => setCodeDraft({ ...codeDraft, name: event.target.value })}/><input type="datetime-local" value={codeDraft.start} onChange={(event) => setCodeDraft({ ...codeDraft, start: event.target.value })}/><input type="datetime-local" value={codeDraft.end} onChange={(event) => setCodeDraft({ ...codeDraft, end: event.target.value })}/><button className="btn-activate sm" onClick={createPasscode} disabled={busy === "create"}>{busy === "create" ? "…" : isEnglish ? "Create code" : "إنشاء رمز"}</button></div>
                {passcodes.length > 0 && <div className="lock-code-list">{passcodes.map((passcode) => <div key={passcode.keyboardPwdId}><div><strong dir="ltr">{passcode.keyboardPwd}</strong><span>{passcode.keyboardPwdName}</span><small>{dateTime(passcode.startDate)} → {dateTime(passcode.endDate)}</small></div><button className="btn-ghost sm danger" onClick={() => deletePasscode(passcode)} disabled={busy === `delete-${passcode.keyboardPwdId}`}>{isEnglish ? "Delete" : "حذف"}</button></div>)}</div>}
              </div>
              <div className="lock-action-block danger-zone"><div><h4>{isEnglish ? "Remote unlock" : "فتح عن بُعد"}</h4><p>{isEnglish ? "This is never automatic. It creates an immediate door action only after the final confirmation." : "هذا لا يتم تلقائياً أبداً. ينشئ إجراءً فورياً على الباب فقط بعد التأكيد النهائي."}</p></div><button className="btn-ghost danger" onClick={requestUnlock} disabled={busy === "unlock"}>{busy === "unlock" ? "…" : isEnglish ? "Request unlock" : "طلب فتح القفل"}</button></div>
              <div className="lock-action-block"><div><h4>{isEnglish ? "Access events" : "أحداث الوصول"}</h4><p>{isEnglish ? "The latest TTLock events are read-only and any shown credential remains masked." : "أحدث أحداث TTLock للعرض فقط وأي بيانات اعتماد معروضة تبقى مخفية."}</p></div><button className="btn-ghost sm" onClick={loadRecords} disabled={busy === "records"}>{busy === "records" ? "…" : isEnglish ? "Load events" : "تحميل الأحداث"}</button>
                {records.length > 0 && <div className="lock-events">{records.map((record, index) => <div key={`${record.lockDate}-${index}`}><span className={record.success ? "event-good" : "event-bad"} /><div><strong>{recordType(record.recordType, lang)}</strong><small>{record.username} · {record.credential}</small></div><time>{dateTime(record.lockDate || record.serverDate)}</time></div>)}</div>}
              </div>
            </>}
            {message && <p className="locks-message" role="status">{message}</p>}
          </section>
        </div>}

        <section className="locks-audit-card"><div className="locks-section-head"><div><span>{isEnglish ? "AUDIT TRAIL" : "سجل التدقيق"}</span><h3>{isEnglish ? "Horizon changes reflected in TTLock" : "تغييرات Horizon المنعكسة في TTLock"}</h3></div><button className="btn-ghost sm" onClick={loadAudit}>{isEnglish ? "Refresh log" : "تحديث السجل"}</button></div>
          {audit.length === 0 ? <p className="locks-muted">{isEnglish ? "No TTLock actions have been recorded yet." : "لم تُسجل أي عمليات TTLock بعد."}</p> : <div className="locks-audit-list">{audit.map((item) => <div key={item.id}><span className={`audit-state ${item.status}`} /><div><strong>{auditName(item.action, lang)}</strong><small>{item.lock_alias || (item.lock_id ? `#${item.lock_id}` : "—")}</small></div><span className="audit-label">{item.status === "success" ? (isEnglish ? "Completed" : "تم") : item.status === "blocked" ? (isEnglish ? "Confirmation required" : "يتطلب تأكيداً") : (isEnglish ? "Not completed" : "لم يكتمل")}</span><time>{dateTime(item.created_at)}</time></div>)}</div>}
        </section>
      </div>
    </AdminLayout>
  );
}
