/** Theme system: 10 presets. Tokens map to CSS variables applied at runtime. */

export type ThemeTokens = {
  bg: string;
  bg2: string;
  card: string;
  card2: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  radius: string;
  fontBody: string;
  fontDisplay: string;
  fontLatin: string;
  /** Extra visual flavor used by hero/backgrounds */
  heroOverlay: string;
  headerBg: string;
  ctaText: string;
};

export type ThemePreset = {
  id: string;
  nameAr: string;
  nameEn: string;
  mode: "dark" | "light";
  description: string;
  tokens: ThemeTokens;
};

const arabicFonts = `"IBM Plex Sans Arabic", "Cairo", sans-serif`;
const cairoDisplay = `"Cairo", "IBM Plex Sans Arabic", sans-serif`;

export const THEMES: ThemePreset[] = [
  {
    id: "royal-gold",
    nameAr: "الذهب الملكي",
    nameEn: "Royal Gold",
    mode: "dark",
    description: "الطابع الأصلي الفاخر — أسود دافئ وذهبي ملكي",
    tokens: {
      bg: "#0d0c0b", bg2: "#14120f", card: "#1a1815", card2: "#201d19",
      border: "#2c2822", text: "#f0ead9", textMuted: "#a89f8d",
      accent: "#d4a84b", accent2: "#b8862a", accentSoft: "rgba(212,168,75,0.14)",
      radius: "6px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(13,12,11,0.55), rgba(13,12,11,0.92))",
      headerBg: "rgba(13,12,11,0.86)", ctaText: "#14120f",
    },
  },
  {
    id: "midnight-neon",
    nameAr: "النيون الليلي",
    nameEn: "Midnight Neon",
    mode: "dark",
    description: "مستقبلي جريء — كحلي عميق مع سماوي نيون",
    tokens: {
      bg: "#060a14", bg2: "#0a101f", card: "#0e1526", card2: "#131b30",
      border: "#1d2942", text: "#e6f1ff", textMuted: "#8fa3c4",
      accent: "#22d3ee", accent2: "#0ea5e9", accentSoft: "rgba(34,211,238,0.14)",
      radius: "12px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(6,10,20,0.5), rgba(6,10,20,0.94))",
      headerBg: "rgba(6,10,20,0.82)", ctaText: "#06121a",
    },
  },
  {
    id: "desert-rose",
    nameAr: "وردة الصحراء",
    nameEn: "Desert Rose",
    mode: "light",
    description: "دافئ وأنيق — رملي فاتح مع وردي ترابي",
    tokens: {
      bg: "#faf6f1", bg2: "#f3ece3", card: "#ffffff", card2: "#faf3ea",
      border: "#e5d9ca", text: "#2f2620", textMuted: "#8a7a68",
      accent: "#c26d5c", accent2: "#a8503f", accentSoft: "rgba(194,109,92,0.12)",
      radius: "14px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(47,38,32,0.45), rgba(47,38,32,0.8))",
      headerBg: "rgba(250,246,241,0.88)", ctaText: "#ffffff",
    },
  },
  {
    id: "emerald-oasis",
    nameAr: "واحة الزمرد",
    nameEn: "Emerald Oasis",
    mode: "dark",
    description: "فخامة طبيعية — أخضر غامق وزمردي مضيء",
    tokens: {
      bg: "#07120e", bg2: "#0b1a14", card: "#10211a", card2: "#152a21",
      border: "#1f3a2e", text: "#e8f5ee", textMuted: "#93b3a3",
      accent: "#34d399", accent2: "#10b981", accentSoft: "rgba(52,211,153,0.13)",
      radius: "10px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(7,18,14,0.5), rgba(7,18,14,0.93))",
      headerBg: "rgba(7,18,14,0.85)", ctaText: "#06251a",
    },
  },
  {
    id: "pearl-minimal",
    nameAr: "اللؤلؤ الهادئ",
    nameEn: "Pearl Minimal",
    mode: "light",
    description: "بساطة راقية — أبيض لؤلؤي مع أسود فحمي",
    tokens: {
      bg: "#ffffff", bg2: "#f6f6f4", card: "#ffffff", card2: "#fafaf8",
      border: "#e8e8e4", text: "#1c1c1a", textMuted: "#6f6f68",
      accent: "#1c1c1a", accent2: "#3d3d38", accentSoft: "rgba(28,28,26,0.07)",
      radius: "2px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(20,20,18,0.4), rgba(20,20,18,0.75))",
      headerBg: "rgba(255,255,255,0.9)", ctaText: "#ffffff",
    },
  },
  {
    id: "royal-purple",
    nameAr: "البنفسج الملكي",
    nameEn: "Royal Purple",
    mode: "dark",
    description: "غموض فاخر — بنفسجي ملكي وذهبي وردي",
    tokens: {
      bg: "#0f0a18", bg2: "#160f23", card: "#1d1430", card2: "#241a3b",
      border: "#332552", text: "#f1eafd", textMuted: "#a89bc4",
      accent: "#a78bfa", accent2: "#8b5cf6", accentSoft: "rgba(167,139,250,0.14)",
      radius: "16px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(15,10,24,0.5), rgba(15,10,24,0.93))",
      headerBg: "rgba(15,10,24,0.85)", ctaText: "#160f23",
    },
  },
  {
    id: "ocean-breeze",
    nameAr: "نسيم المحيط",
    nameEn: "Ocean Breeze",
    mode: "light",
    description: "منعش وحديث — أزرق سماوي على خلفية بيضاء ناعمة",
    tokens: {
      bg: "#f7fafc", bg2: "#eef4f8", card: "#ffffff", card2: "#f4f9fc",
      border: "#dbe7ef", text: "#12283a", textMuted: "#5c7a91",
      accent: "#0284c7", accent2: "#0369a1", accentSoft: "rgba(2,132,199,0.1)",
      radius: "12px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(18,40,58,0.45), rgba(18,40,58,0.82))",
      headerBg: "rgba(247,250,252,0.9)", ctaText: "#ffffff",
    },
  },
  {
    id: "carbon-ember",
    nameAr: "الجمر الفحمي",
    nameEn: "Carbon Ember",
    mode: "dark",
    description: "قوة وحداثة — فحمي داكن مع برتقالي متوهج",
    tokens: {
      bg: "#0c0c0e", bg2: "#131316", card: "#1a1a1e", card2: "#212126",
      border: "#2e2e35", text: "#f2f0ec", textMuted: "#9d9a94",
      accent: "#f97316", accent2: "#ea580c", accentSoft: "rgba(249,115,22,0.13)",
      radius: "8px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(12,12,14,0.5), rgba(12,12,14,0.93))",
      headerBg: "rgba(12,12,14,0.86)", ctaText: "#160b03",
    },
  },
  {
    id: "sand-dune",
    nameAr: "كثبان الرمال",
    nameEn: "Sand Dune",
    mode: "light",
    description: "تراثي عصري — بيج صحراوي مع بني محمّص",
    tokens: {
      bg: "#f5efe4", bg2: "#ede4d3", card: "#fdfaf3", card2: "#f7f1e4",
      border: "#ddd0b8", text: "#33291a", textMuted: "#84765d",
      accent: "#92400e", accent2: "#78350f", accentSoft: "rgba(146,64,14,0.1)",
      radius: "10px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(51,41,26,0.45), rgba(51,41,26,0.82))",
      headerBg: "rgba(245,239,228,0.9)", ctaText: "#fdfaf3",
    },
  },
  {
    id: "aurora-glass",
    nameAr: "الشفق الزجاجي",
    nameEn: "Aurora Glass",
    mode: "dark",
    description: "مستقبلي حالم — تدرجات الشفق القطبي مع لمسات زجاجية",
    tokens: {
      bg: "#0a0e1a", bg2: "#0f1524", card: "rgba(255,255,255,0.045)", card2: "rgba(255,255,255,0.075)",
      border: "rgba(255,255,255,0.12)", text: "#eef2ff", textMuted: "#97a3c9",
      accent: "#e879f9", accent2: "#c026d3", accentSoft: "rgba(232,121,249,0.13)",
      radius: "18px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(10,14,26,0.5), rgba(10,14,26,0.93))",
      headerBg: "rgba(10,14,26,0.7)", ctaText: "#1a0a20",
    },
  },
];

export const DEFAULT_THEME_ID = "royal-gold";

export function getTheme(id: string): ThemePreset {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/** Editable content settings (Shopify-style customizations) */
export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  brandEn: string;
  brandAr: string;
  ctaText: string;
  showStats: boolean;
  animationsEnabled: boolean;
};

export const DEFAULT_CONTENT: SiteContent = {
  heroTitle: "إقامة استثنائية في قلب الرياض",
  heroSubtitle: "بنتهاوس وشقق فاخرة في أرقى الأحياء — تجربة ضيافة مصممة بعناية، بتقويم توفر محدث لحظياً",
  heroBadge: "أكثر من ٢٥ وحدة فاخرة",
  brandEn: "Horizon Stays",
  brandAr: "إقامة فاخرة في الرياض",
  ctaText: "احجز الآن",
  showStats: true,
  animationsEnabled: true,
};

export type ThemeOverrides = {
  content?: Partial<SiteContent>;
  /** per-theme token overrides from the editor */
  tokens?: Partial<ThemeTokens>;
};

export function applyThemeToDOM(theme: ThemePreset, overrides?: ThemeOverrides) {
  const tokens = { ...theme.tokens, ...(overrides?.tokens || {}) };
  const r = document.documentElement;
  r.style.setProperty("--bg", tokens.bg);
  r.style.setProperty("--bg-2", tokens.bg2);
  r.style.setProperty("--card", tokens.card);
  r.style.setProperty("--card-2", tokens.card2);
  r.style.setProperty("--border", tokens.border);
  r.style.setProperty("--text", tokens.text);
  r.style.setProperty("--text-muted", tokens.textMuted);
  r.style.setProperty("--gold", tokens.accent);
  r.style.setProperty("--gold-2", tokens.accent2);
  r.style.setProperty("--gold-soft", tokens.accentSoft);
  r.style.setProperty("--radius", tokens.radius);
  r.style.setProperty("--font-body", tokens.fontBody);
  r.style.setProperty("--font-display", tokens.fontDisplay);
  r.style.setProperty("--font-latin", tokens.fontLatin);
  r.style.setProperty("--hero-overlay", tokens.heroOverlay);
  r.style.setProperty("--header-bg", tokens.headerBg);
  r.style.setProperty("--cta-text", tokens.ctaText);
  r.dataset.theme = theme.id;
  r.dataset.mode = theme.mode;
}
