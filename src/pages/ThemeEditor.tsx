import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  THEMES, getTheme, DEFAULT_CONTENT,
  type ThemeOverrides, type ThemeTokens, type SiteContent,
} from "../lib/themes";
import { useTheme, getAdminToken, adminCheck } from "../lib/ThemeContext";
import Home from "./Home";

type TokenKey = keyof ThemeTokens;

const COLOR_FIELDS: { key: TokenKey; label: string }[] = [
  { key: "accent", label: "اللون الرئيسي" },
  { key: "accent2", label: "اللون الرئيسي الداكن" },
  { key: "bg", label: "خلفية الموقع" },
  { key: "bg2", label: "خلفية ثانوية" },
  { key: "card", label: "خلفية البطاقات" },
  { key: "text", label: "لون النص" },
  { key: "textMuted", label: "النص الثانوي" },
  { key: "border", label: "لون الحدود" },
];

const FONT_OPTIONS = [
  { label: "IBM Plex Sans Arabic", value: `"IBM Plex Sans Arabic", "Cairo", sans-serif` },
  { label: "Cairo", value: `"Cairo", "IBM Plex Sans Arabic", sans-serif` },
  { label: "Tajawal", value: `"Tajawal", "Cairo", sans-serif` },
  { label: "Almarai", value: `"Almarai", "Cairo", sans-serif` },
];

function toHex(c: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  // best-effort: rgba/others → fallback swatch (color input requires hex)
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return (
      "#" + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, "0")).join("")
    );
  }
  return "#888888";
}

export default function ThemeEditor() {
  const { activeThemeId, overrides, saveSettings, previewTheme } = useTheme();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [themeId, setThemeId] = useState(activeThemeId);
  const [draft, setDraft] = useState<ThemeOverrides>(overrides[activeThemeId] || {});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [panel, setPanel] = useState<"theme" | "colors" | "fonts" | "content">("theme");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const tok = getAdminToken();
    if (!tok) {
      navigate("/admin");
      return;
    }
    adminCheck(tok).then((ok) => {
      if (!ok) navigate("/admin");
      else setAuthed(true);
    });
  }, [navigate]);

  // Live preview: apply draft on every change
  useEffect(() => {
    previewTheme(themeId, draft);
    return () => {
      // restore persisted theme when leaving editor
      previewTheme(activeThemeId, overrides[activeThemeId]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, draft]);

  const base = getTheme(themeId);
  const tokens = useMemo(() => ({ ...base.tokens, ...(draft.tokens || {}) }), [base, draft]);
  const content: SiteContent = useMemo(() => ({ ...DEFAULT_CONTENT, ...(draft.content || {}) }), [draft]);

  const setToken = (k: TokenKey, v: string) => {
    setDraft((d) => ({ ...d, tokens: { ...(d.tokens || {}), [k]: v } }));
    setDirty(true);
  };

  const setContent = (k: keyof SiteContent, v: string | boolean) => {
    setDraft((d) => ({ ...d, content: { ...(d.content || {}), [k]: v } }));
    setDirty(true);
  };

  const switchTheme = (id: string) => {
    setThemeId(id);
    setDraft(overrides[id] || {});
    setDirty(id !== activeThemeId);
  };

  const resetTheme = () => {
    setDraft({});
    setDirty(true);
  };

  const publish = async () => {
    const tok = getAdminToken();
    if (!tok) return navigate("/admin");
    setSaving(true);
    try {
      const all = { ...overrides, [themeId]: draft };
      await saveSettings(tok, themeId, all);
      setDirty(false);
      setToast("تم النشر بنجاح ✓");
      setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("فشل الحفظ — تحقق من الجلسة");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!authed) return <div className="admin-wrap"><div className="admin-loading">جارٍ التحقق...</div></div>;

  return (
    <div className="editor-shell" dir="rtl">
      {/* Top bar */}
      <div className="editor-topbar">
        <div className="et-right">
          <button className="btn-ghost sm" onClick={() => navigate("/admin")}>← رجوع</button>
          <strong>محرر الطابع</strong>
          <span className="et-theme-name">{base.nameAr}</span>
          {dirty && <span className="et-dirty">تغييرات غير منشورة</span>}
        </div>
        <div className="et-left">
          <div className="device-toggle">
            <button className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}>🖥</button>
            <button className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")}>📱</button>
          </div>
          <button className="btn-ghost sm" onClick={resetTheme}>استعادة الافتراضي</button>
          <button className="btn-publish" onClick={publish} disabled={saving || !dirty}>
            {saving ? "جارٍ النشر..." : "نشر"}
          </button>
        </div>
      </div>

      <div className="editor-body">
        {/* Side panel */}
        <aside className="editor-panel">
          <div className="ep-tabs">
            <button className={panel === "theme" ? "on" : ""} onClick={() => setPanel("theme")}>الطابع</button>
            <button className={panel === "colors" ? "on" : ""} onClick={() => setPanel("colors")}>الألوان</button>
            <button className={panel === "fonts" ? "on" : ""} onClick={() => setPanel("fonts")}>الخطوط</button>
            <button className={panel === "content" ? "on" : ""} onClick={() => setPanel("content")}>المحتوى</button>
          </div>

          {panel === "theme" && (
            <div className="ep-section">
              <label className="ep-label">الطابع الأساسي</label>
              <div className="ep-theme-list">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`ep-theme-item ${t.id === themeId ? "on" : ""}`}
                    onClick={() => switchTheme(t.id)}
                  >
                    <span className="ep-dot" style={{ background: t.tokens.accent }} />
                    <span>{t.nameAr}</span>
                    <small>{t.mode === "dark" ? "داكن" : "فاتح"}</small>
                  </button>
                ))}
              </div>
              <label className="ep-label">استدارة الزوايا: {parseInt(tokens.radius) || 0}px</label>
              <input
                type="range" min={0} max={24}
                value={parseInt(tokens.radius) || 0}
                onChange={(e) => setToken("radius", `${e.target.value}px`)}
              />
            </div>
          )}

          {panel === "colors" && (
            <div className="ep-section">
              {COLOR_FIELDS.map((f) => (
                <div key={f.key} className="ep-color-row">
                  <label>{f.label}</label>
                  <div className="ep-color-input">
                    <input
                      type="color"
                      value={toHex(String(tokens[f.key]))}
                      onChange={(e) => setToken(f.key, e.target.value)}
                    />
                    <input
                      type="text"
                      value={String(tokens[f.key])}
                      onChange={(e) => setToken(f.key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {panel === "fonts" && (
            <div className="ep-section">
              <label className="ep-label">خط النصوص</label>
              <select value={tokens.fontBody} onChange={(e) => setToken("fontBody", e.target.value)}>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.label} value={f.value}>{f.label}</option>
                ))}
              </select>
              <label className="ep-label">خط العناوين</label>
              <select value={tokens.fontDisplay} onChange={(e) => setToken("fontDisplay", e.target.value)}>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.label} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          )}

          {panel === "content" && (
            <div className="ep-section">
              <label className="ep-label">شارة البطل (Badge)</label>
              <input type="text" value={content.heroBadge} onChange={(e) => setContent("heroBadge", e.target.value)} />
              <label className="ep-label">عنوان الصفحة الرئيسية</label>
              <textarea rows={2} value={content.heroTitle} onChange={(e) => setContent("heroTitle", e.target.value)} />
              <label className="ep-label">الوصف التعريفي</label>
              <textarea rows={3} value={content.heroSubtitle} onChange={(e) => setContent("heroSubtitle", e.target.value)} />
              <label className="ep-label">نص زر الحجز</label>
              <input type="text" value={content.ctaText} onChange={(e) => setContent("ctaText", e.target.value)} />
              <label className="ep-check">
                <input type="checkbox" checked={content.showStats} onChange={(e) => setContent("showStats", e.target.checked)} />
                إظهار شريط الإحصائيات
              </label>
              <label className="ep-check">
                <input type="checkbox" checked={content.animationsEnabled} onChange={(e) => setContent("animationsEnabled", e.target.checked)} />
                تفعيل الحركات والانتقالات
              </label>
            </div>
          )}
        </aside>

        {/* Live preview */}
        <div className={`editor-preview ${device}`}>
          <div className="preview-frame">
            <div className="preview-scale">
              <PreviewContent content={content} />
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="admin-toast editor-toast">{toast}</div>}
    </div>
  );
}

/** Renders the actual Home page inside the editor with content overrides via context trick. */
function PreviewContent({ content }: { content: SiteContent }) {
  return (
    <div className="preview-home">
      <EditorContentContext.Provider value={content}>
        <Home />
      </EditorContentContext.Provider>
    </div>
  );
}

import { createContext } from "react";
export const EditorContentContext = createContext<SiteContent | null>(null);
