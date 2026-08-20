import { useState } from "react";
import { ThemePreset } from "../lib/themes";

const arabicFonts = `"IBM Plex Sans Arabic", "Cairo", sans-serif`;
const cairoDisplay = `"Cairo", "IBM Plex Sans Arabic", sans-serif`;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApplyTheme: (t: ThemePreset) => void;
};

export default function ThemeQuestionnaireModal({ isOpen, onClose, onApplyTheme }: Props) {
  const [step, setStep] = useState(1);
  const [vibe, setVibe] = useState<"luxury" | "modern" | "editorial" | "celebration">("luxury");
  const [mode, setMode] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState("#d4a84b");
  const [themeName, setThemeName] = useState("طابع مخصص من الاستبيان");

  if (!isOpen) return null;

  const generateAndApply = () => {
    let bg = mode === "dark" ? "#09090b" : "#ffffff";
    let bg2 = mode === "dark" ? "#121217" : "#f4f5f7";
    let card = mode === "dark" ? "#18181f" : "#ffffff";
    let border = mode === "dark" ? "#272732" : "#e2e8f0";
    let text = mode === "dark" ? "#fafafa" : "#0f172a";
    let textMuted = mode === "dark" ? "#a1a1aa" : "#64748b";

    if (vibe === "editorial") {
      bg = mode === "dark" ? "#121110" : "#fcfbf9";
      bg2 = mode === "dark" ? "#1c1a18" : "#f3f0ea";
    } else if (vibe === "modern") {
      bg = mode === "dark" ? "#0b0f19" : "#f8fafc";
      bg2 = mode === "dark" ? "#111827" : "#f1f5f9";
    }

    const newTheme: ThemePreset = {
      id: `quiz-theme-${Date.now()}`,
      nameAr: themeName,
      nameEn: `${themeName} (Custom)`,
      mode,
      description: `طابع مولّد تلقائياً عبر الاستبيان التفاعلي — ذوق: ${vibe}، النمط: ${mode}`,
      custom: true,
      tokens: {
        bg,
        bg2,
        card,
        card2: card,
        border,
        text,
        textMuted,
        accent: accentColor,
        accent2: accentColor,
        accentSoft: `${accentColor}25`,
        radius: vibe === "modern" ? "12px" : vibe === "editorial" ? "2px" : "8px",
        fontBody: arabicFonts,
        fontDisplay: cairoDisplay,
        fontLatin: vibe === "editorial" ? `"Cormorant Garamond", serif` : `"Space Grotesk", sans-serif`,
        heroOverlay: mode === "dark" ? "linear-gradient(180deg, rgba(9,9,11,0.4), rgba(9,9,11,0.9))" : "linear-gradient(180deg, rgba(15,23,42,0.3), rgba(15,23,42,0.75))",
        headerBg: mode === "dark" ? "rgba(9,9,11,0.85)" : "rgba(255,255,255,0.92)",
        ctaText: mode === "dark" ? "#09090b" : "#ffffff",
      },
    };

    onApplyTheme(newTheme);
    onClose();
    setStep(1);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "var(--card)", color: "var(--text)", width: "100%", maxWidth: "540px", borderRadius: "16px", padding: "28px", border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>✨ استبيان تصميم الطابع (Theme Questionnaire)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>السؤال ١ من ٣: ما هو الطابع العام والمظهر الذي ترغب في أن يعكسه موقعك؟</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { id: "luxury", title: "فخامة وذهب ملكي ✨", desc: "أجواء فندقية راقية تليق بالبنتهاوس والشقق الفخمة" },
                { id: "modern", title: "عصري وتقني 🚀", desc: "تصميم نظيف مستوحى من منصات التسوق العالمية مثل شوبيفاي" },
                { id: "editorial", title: "مجلاتي تحريري 📰", desc: "خطوط كلاسيكية وأعمدة محتوى مميزة تشبه مدونات ووردبريس" },
                { id: "celebration", title: "مواسم واحتفالات 🌙", desc: "ألوان حيوية وأجواء احتفالية للمناسبات والأعياد" },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setVibe(opt.id as any)}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: `2px solid ${vibe === opt.id ? "var(--accent)" : "var(--border)"}`,
                    background: vibe === opt.id ? "var(--accent-soft)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{opt.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: "24px" }} onClick={() => setStep(2)}>التالي ←</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>السؤال ٢ من ٣: ما هو نمط الإضاءة واللون الأساسي (Accent Color)؟</p>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>الوضع المفضل:</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setMode("dark")}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `2px solid ${mode === "dark" ? "var(--accent)" : "var(--border)"}`, background: mode === "dark" ? "var(--accent-soft)" : "transparent", fontWeight: "bold", cursor: "pointer", color: "inherit" }}
                >
                  الوضع الداكن (Dark) 🌙
                </button>
                <button
                  type="button"
                  onClick={() => setMode("light")}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `2px solid ${mode === "light" ? "var(--accent)" : "var(--border)"}`, background: mode === "light" ? "var(--accent-soft)" : "transparent", fontWeight: "bold", cursor: "pointer", color: "inherit" }}
                >
                  الوضع الفاتح (Light) ☀️
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>اللون البارز الرئيسي (Accent):</label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ width: "48px", height: "40px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                />
                <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>{accentColor}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>→ السابق</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>التالي ←</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>السؤال ٣ من ٣: ماذا تريد أن نسمي هذا الطابع الجديد؟</p>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="مثال: طابع البنتهاوس الملكي"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "16px" }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>→ السابق</button>
              <button className="btn-primary" style={{ flex: 1, background: "var(--accent)", color: "var(--cta-text)" }} onClick={generateAndApply}>✨ توليد وتطبيق الطابع الآن</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
