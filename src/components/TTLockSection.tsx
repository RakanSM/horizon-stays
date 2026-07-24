import { useState, useEffect, useCallback } from "react";
import { getAdminToken } from "../lib/ThemeContext";

/**
 * TTLock smart-lock management for the admin panel.
 * Talks to /api/ttlock (Vercel serverless) which proxies the TTLock cloud API.
 */

type Lock = {
  lockId: number;
  lockAlias?: string;
  lockName?: string;
  electricQuantity?: number;
  lockMac?: string;
};

type Passcode = {
  keyboardPwdId: number;
  keyboardPwd: string;
  keyboardPwdName?: string;
  startDate?: number;
  endDate?: number;
  keyboardPwdType?: number;
};

async function ttlockApi(action: string, params: Record<string, unknown> = {}) {
  const token = getAdminToken();
  const res = await fetch("/api/ttlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, action, ...params }),
  });
  return res.json();
}

/** md5 implementation (small, dependency-free) for hashing the TTLock password client-side */
async function md5Hex(str: string): Promise<string> {
  // Pure JS MD5 (RFC 1321) — Web Crypto has no MD5.
  /* eslint-disable no-bitwise */
  function rl(n: number, c: number) { return (n << c) | (n >>> (32 - c)); }
  function add(a: number, b: number) { return (((a >> 16) + (b >> 16) + (((a & 0xffff) + (b & 0xffff)) >> 16)) << 16) | (((a & 0xffff) + (b & 0xffff)) & 0xffff); }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return add(rl(add(add(a, q), add(x, t)), s), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
  const utf8 = new TextEncoder().encode(str);
  const len = utf8.length;
  const words: number[] = [];
  for (let i = 0; i < len; i++) words[i >> 2] = (words[i >> 2] || 0) | (utf8[i] << ((i % 4) * 8));
  words[len >> 2] = (words[len >> 2] || 0) | (0x80 << ((len % 4) * 8));
  const n = ((len + 8) >> 6) * 16 + 16;
  for (let i = words.length; i < n; i++) words[i] = 0;
  words[n - 2] = len * 8;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < n; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, words[i], 7, -680876936); d = ff(d, a, b, c, words[i + 1], 12, -389564586); c = ff(c, d, a, b, words[i + 2], 17, 606105819); b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4], 7, -176418897); d = ff(d, a, b, c, words[i + 5], 12, 1200080426); c = ff(c, d, a, b, words[i + 6], 17, -1473231341); b = ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = ff(a, b, c, d, words[i + 8], 7, 1770035416); d = ff(d, a, b, c, words[i + 9], 12, -1958414417); c = ff(c, d, a, b, words[i + 10], 17, -42063); b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12], 7, 1804603682); d = ff(d, a, b, c, words[i + 13], 12, -40341101); c = ff(c, d, a, b, words[i + 14], 17, -1502002290); b = ff(b, c, d, a, words[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, words[i + 1], 5, -165796510); d = gg(d, a, b, c, words[i + 6], 9, -1069501632); c = gg(c, d, a, b, words[i + 11], 14, 643717713); b = gg(b, c, d, a, words[i], 20, -373897302);
    a = gg(a, b, c, d, words[i + 5], 5, -701558691); d = gg(d, a, b, c, words[i + 10], 9, 38016083); c = gg(c, d, a, b, words[i + 15], 14, -660478335); b = gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = gg(a, b, c, d, words[i + 9], 5, 568446438); d = gg(d, a, b, c, words[i + 14], 9, -1019803690); c = gg(c, d, a, b, words[i + 3], 14, -187363961); b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13], 5, -1444681467); d = gg(d, a, b, c, words[i + 2], 9, -51403784); c = gg(c, d, a, b, words[i + 7], 14, 1735328473); b = gg(b, c, d, a, words[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, words[i + 5], 4, -378558); d = hh(d, a, b, c, words[i + 8], 11, -2022574463); c = hh(c, d, a, b, words[i + 11], 16, 1839030562); b = hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = hh(a, b, c, d, words[i + 1], 4, -1530992060); d = hh(d, a, b, c, words[i + 4], 11, 1272893353); c = hh(c, d, a, b, words[i + 7], 16, -155497632); b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13], 4, 681279174); d = hh(d, a, b, c, words[i], 11, -358537222); c = hh(c, d, a, b, words[i + 3], 16, -722521979); b = hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = hh(a, b, c, d, words[i + 9], 4, -640364487); d = hh(d, a, b, c, words[i + 12], 11, -421815835); c = hh(c, d, a, b, words[i + 15], 16, 530742520); b = hh(b, c, d, a, words[i + 2], 23, -995338651);
    a = ii(a, b, c, d, words[i], 6, -198630844); d = ii(d, a, b, c, words[i + 7], 10, 1126891415); c = ii(c, d, a, b, words[i + 14], 15, -1416354905); b = ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = ii(a, b, c, d, words[i + 12], 6, 1700485571); d = ii(d, a, b, c, words[i + 3], 10, -1894986606); c = ii(c, d, a, b, words[i + 10], 15, -1051523); b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8], 6, 1873313359); d = ii(d, a, b, c, words[i + 15], 10, -30611744); c = ii(c, d, a, b, words[i + 6], 15, -1560198380); b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4], 6, -145523070); d = ii(d, a, b, c, words[i + 11], 10, -1120210379); c = ii(c, d, a, b, words[i + 2], 15, 718787259); b = ii(b, c, d, a, words[i + 9], 21, -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  const hex = (x: number) => { let s = ""; for (let j = 0; j < 4; j++) s += ((x >> (j * 8 + 4)) & 0x0f).toString(16) + ((x >> (j * 8)) & 0x0f).toString(16); return s; };
  return hex(a) + hex(b) + hex(c) + hex(d);
  /* eslint-enable no-bitwise */
}

export default function TTLockSection() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [connected, setConnected] = useState(false);
  const [connErr, setConnErr] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [creds, setCreds] = useState({ clientId: "", clientSecret: "", username: "", password: "" });
  const [locks, setLocks] = useState<Lock[]>([]);
  const [selLock, setSelLock] = useState<number | null>(null);
  const [passcodes, setPasscodes] = useState<Passcode[]>([]);
  const [pcDraft, setPcDraft] = useState({ name: "", start: "", end: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loadStatus = useCallback(async () => {
    const r = await ttlockApi("status").catch(() => null);
    if (!r) { setConfigured(false); return; }
    setConfigured(Boolean(r.configured));
    setConnected(Boolean(r.connected));
    setConnErr(r.error || "");
    if (r.configured && r.connected) {
      const l = await ttlockApi("locks").catch(() => null);
      if (l?.ok) setLocks(l.data || []);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const saveCreds = async () => {
    setBusy(true); setMsg("");
    try {
      const { supabase } = await import("../lib/supabase");
      const pwMd5 = await md5Hex(creds.password);
      const { data, error } = await supabase.rpc("admin_set_ttlock_config", {
        p_token: getAdminToken(),
        p_client_id: creds.clientId.trim(),
        p_client_secret: creds.clientSecret.trim(),
        p_username: creds.username.trim(),
        p_password_md5: pwMd5,
        p_api_base: null,
      });
      if (error || !data?.ok) { setMsg("فشل الحفظ — تحقق من الجلسة"); return; }
      setMsg("تم الحفظ — جارٍ اختبار الاتصال…");
      setShowSetup(false);
      await loadStatus();
      setMsg("");
    } finally { setBusy(false); }
  };

  const openLock = async (lockId: number) => {
    setSelLock(lockId);
    setPasscodes([]);
    const r = await ttlockApi("passcodes", { lockId }).catch(() => null);
    if (r?.ok) setPasscodes(r.data || []);
  };

  const createCode = async () => {
    if (!selLock || !pcDraft.start || !pcDraft.end) { setMsg("حدد تاريخ البداية والنهاية"); return; }
    setBusy(true); setMsg("");
    try {
      const r = await ttlockApi("create-passcode", {
        lockId: selLock,
        start: new Date(pcDraft.start).getTime(),
        end: new Date(pcDraft.end).getTime(),
        name: pcDraft.name || "Guest",
      });
      if (r?.ok && r.data?.keyboardPwd) {
        setMsg(`تم إنشاء رمز الضيف: ${r.data.keyboardPwd} ✓`);
        openLock(selLock);
      } else {
        setMsg(`فشل إنشاء الرمز${r?.data?.errmsg ? ` — ${r.data.errmsg}` : ""}`);
      }
    } finally { setBusy(false); }
  };

  const removeCode = async (keyboardPwdId: number) => {
    if (!selLock) return;
    setBusy(true);
    try {
      const r = await ttlockApi("delete-passcode", { lockId: selLock, keyboardPwdId });
      if (r?.ok) openLock(selLock);
      else setMsg("فشل الحذف — قد يتطلب بوابة Gateway متصلة");
    } finally { setBusy(false); }
  };

  const doUnlock = async (lockId: number) => {
    setBusy(true); setMsg("");
    try {
      const r = await ttlockApi("unlock", { lockId });
      setMsg(r?.ok ? "تم فتح القفل عن بُعد ✓" : `تعذر الفتح${r?.data?.errmsg ? ` — ${r.data.errmsg}` : " — يتطلب Gateway"}`);
    } finally { setBusy(false); }
  };

  const fmtDate = (ms?: number) => (ms ? new Date(ms).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" }) : "—");

  return (
    <div className="odoo-card ttlock-card">
      <div className="odoo-card-head">
        <div>
          <h2>الأقفال الذكية TTLock 🔐</h2>
          <p>أنشئ رموز دخول مؤقتة للضيوف (من الوصول حتى المغادرة)، افتح الأبواب عن بُعد، وراقب سجلات الدخول.</p>
        </div>
        <span className={`odoo-status ${configured && connected ? "on" : "off"}`}>
          {configured === null ? "..." : configured && connected ? "متصل ✓" : configured ? "خطأ اتصال" : "غير مهيّأ"}
        </span>
      </div>

      {configured === false && !showSetup && (
        <div>
          <p className="odoo-hint">
            لربط أقفال TTLock: سجّل تطبيق مطوّر في <a href="https://open.ttlock.com" target="_blank" rel="noreferrer">open.ttlock.com</a> للحصول على Client ID وClient Secret، ثم أدخلها هنا مع حساب تطبيق TTLock (الجوال/البريد وكلمة المرور). لإنشاء الرموز عن بُعد يلزم وجود بوابة TTLock Gateway (G2/G3) أو قفل WiFi.
          </p>
          <button className="btn-activate" onClick={() => setShowSetup(true)}>إعداد الاتصال</button>
        </div>
      )}

      {configured && !connected && connErr && (
        <p className="odoo-hint">تعذر الاتصال: <span dir="ltr">{connErr}</span> — <button className="btn-ghost sm" onClick={() => setShowSetup(true)}>تعديل البيانات</button></p>
      )}

      {showSetup && (
        <div className="schedule-form">
          <div className="sf-dates">
            <div className="sf-row"><label>Client ID</label><input dir="ltr" type="text" value={creds.clientId} onChange={(e) => setCreds({ ...creds, clientId: e.target.value })} /></div>
            <div className="sf-row"><label>Client Secret</label><input dir="ltr" type="password" value={creds.clientSecret} onChange={(e) => setCreds({ ...creds, clientSecret: e.target.value })} /></div>
          </div>
          <div className="sf-dates">
            <div className="sf-row"><label>حساب TTLock (جوال/بريد)</label><input dir="ltr" type="text" value={creds.username} onChange={(e) => setCreds({ ...creds, username: e.target.value })} /></div>
            <div className="sf-row"><label>كلمة المرور</label><input dir="ltr" type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} /></div>
          </div>
          <div className="theme-actions">
            <button className="btn-activate" onClick={saveCreds} disabled={busy || !creds.clientId || !creds.username}>{busy ? "..." : "حفظ واختبار الاتصال"}</button>
            <button className="btn-ghost" onClick={() => setShowSetup(false)}>إلغاء</button>
          </div>
        </div>
      )}

      {configured && connected && (
        <div>
          {locks.length === 0 ? (
            <p className="odoo-hint">لا توجد أقفال في حسابك بعد — أضف الأقفال عبر تطبيق TTLock أولاً ثم حدّث هذه الصفحة.</p>
          ) : (
            <div className="schedule-list">
              {locks.map((l) => (
                <div key={l.lockId} className={`schedule-item ${selLock === l.lockId ? "live" : ""}`}>
                  <span className="si-dot" style={{ background: (l.electricQuantity ?? 100) > 20 ? "#22c55e" : "#ef4444" }} />
                  <div className="si-info">
                    <strong>{l.lockAlias || l.lockName || `Lock ${l.lockId}`}</strong>
                    <span dir="ltr">🔋 {l.electricQuantity ?? "?"}% · {l.lockMac || ""}</span>
                  </div>
                  <div className="theme-actions">
                    <button className="btn-ghost sm" onClick={() => openLock(l.lockId)}>الرموز</button>
                    <button className="btn-activate sm" onClick={() => doUnlock(l.lockId)} disabled={busy}>فتح عن بُعد</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selLock && (
            <div className="ttlock-codes">
              <h3>رموز الدخول</h3>
              <div className="schedule-form">
                <div className="sf-dates">
                  <div className="sf-row"><label>اسم الضيف</label><input type="text" value={pcDraft.name} onChange={(e) => setPcDraft({ ...pcDraft, name: e.target.value })} placeholder="ضيف" /></div>
                  <div className="sf-row"><label>من (تسجيل الوصول)</label><input type="datetime-local" value={pcDraft.start} onChange={(e) => setPcDraft({ ...pcDraft, start: e.target.value })} /></div>
                  <div className="sf-row"><label>إلى (المغادرة)</label><input type="datetime-local" value={pcDraft.end} onChange={(e) => setPcDraft({ ...pcDraft, end: e.target.value })} /></div>
                </div>
                <button className="btn-activate" onClick={createCode} disabled={busy}>{busy ? "..." : "+ إنشاء رمز ضيف"}</button>
              </div>
              {passcodes.length > 0 && (
                <div className="schedule-list">
                  {passcodes.map((p) => (
                    <div key={p.keyboardPwdId} className="schedule-item">
                      <div className="si-info">
                        <strong dir="ltr">{p.keyboardPwd}</strong>
                        <span>{p.keyboardPwdName || "—"}</span>
                        <small dir="ltr">{fmtDate(p.startDate)} → {fmtDate(p.endDate)}</small>
                      </div>
                      <button className="btn-ghost sm danger" onClick={() => removeCode(p.keyboardPwdId)} disabled={busy}>حذف</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {msg && <div className="admin-toast inline">{msg}</div>}
    </div>
  );
}
