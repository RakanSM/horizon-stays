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
  /** Decorative overlay layer rendered site-wide (seasonal themes) */
  decor?: "ramadan" | "ramadan2" | "eid-fitr" | "eid-adha" | "parallax-art";
  /** Enables deep parallax scroll choreography (sections slide up over pinned hero) */
  parallax?: boolean;
  /** Custom (admin-created) theme flag */
  custom?: boolean;
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
  {
    id: "ramadan-nights",
    nameAr: "ليالي رمضان",
    nameEn: "Ramadan Nights",
    mode: "dark",
    description: "أجواء رمضانية ساحرة — فوانيس معلّقة وهلال متوهج على ليلٍ عميق",
    decor: "ramadan",
    tokens: {
      bg: "#0a1024", bg2: "#0e1530", card: "#131c3d", card2: "#18234a",
      border: "#26305c", text: "#f3ecd8", textMuted: "#a3a8cb",
      accent: "#f2b545", accent2: "#d99a25", accentSoft: "rgba(242,181,69,0.15)",
      radius: "14px", fontBody: arabicFonts, fontDisplay: `"Amiri", "Cairo", serif`,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(10,16,36,0.55), rgba(10,16,36,0.94))",
      headerBg: "rgba(10,16,36,0.84)", ctaText: "#141024",
    },
  },
  {
    id: "ramadan-serenity",
    nameAr: "سكينة رمضان",
    nameEn: "Ramadan Serenity",
    mode: "dark",
    description: "رمضان بروح هادئة — أخضر مسجدي عميق مع قناديل ذهبية ونقوش إسلامية",
    decor: "ramadan2",
    tokens: {
      bg: "#0b1712", bg2: "#0f2018", card: "#152a1f", card2: "#1a3326",
      border: "#25422f", text: "#eef5e9", textMuted: "#9db8a3",
      accent: "#e3c26b", accent2: "#c9a63e", accentSoft: "rgba(227,194,107,0.14)",
      radius: "12px", fontBody: arabicFonts, fontDisplay: `"Amiri", "Cairo", serif`,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(11,23,18,0.5), rgba(11,23,18,0.93))",
      headerBg: "rgba(11,23,18,0.85)", ctaText: "#0b1712",
    },
  },
  {
    id: "eid-fitr",
    nameAr: "عيد الفطر",
    nameEn: "Eid Al-Fitr",
    mode: "light",
    description: "فرحة العيد — أبيض احتفالي مع أخضر وذهبي وبالونات وزينة متطايرة",
    decor: "eid-fitr",
    tokens: {
      bg: "#fbf9f2", bg2: "#f3efe1", card: "#ffffff", card2: "#faf7ec",
      border: "#e3ddc8", text: "#20301f", textMuted: "#6f8069",
      accent: "#178a4c", accent2: "#0e6b38", accentSoft: "rgba(23,138,76,0.11)",
      radius: "16px", fontBody: arabicFonts, fontDisplay: `"Amiri", "Cairo", serif`,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(23,45,26,0.45), rgba(23,45,26,0.82))",
      headerBg: "rgba(251,249,242,0.9)", ctaText: "#ffffff",
    },
  },
  {
    id: "eid-adha",
    nameAr: "عيد الأضحى",
    nameEn: "Eid Al-Adha",
    mode: "dark",
    description: "أضحى مبارك — عنابي فاخر مع ذهب حجازي وزخارف هندسية احتفالية",
    decor: "eid-adha",
    tokens: {
      bg: "#1a0d10", bg2: "#221217", card: "#2b171d", card2: "#331c23",
      border: "#4a2a33", text: "#f6ecdf", textMuted: "#c1a094",
      accent: "#e0a94e", accent2: "#c08a2d", accentSoft: "rgba(224,169,78,0.15)",
      radius: "10px", fontBody: arabicFonts, fontDisplay: `"Amiri", "Cairo", serif`,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(26,13,16,0.5), rgba(26,13,16,0.93))",
      headerBg: "rgba(26,13,16,0.86)", ctaText: "#1a0d10",
    },
  },
  {
    id: "parallax-noir",
    nameAr: "الأفق الفني",
    nameEn: "Artistic Horizon",
    mode: "dark",
    description: "طابع فني سينمائي — الأقسام تنزلق فوق بعضها مع التمرير (Parallax) وتدرجات أفق غنية",
    decor: "parallax-art",
    parallax: true,
    tokens: {
      bg: "#0b0b12", bg2: "#11101c", card: "#171626", card2: "#1d1b30",
      border: "#2b2946", text: "#f2effa", textMuted: "#9d97bd",
      accent: "#ffb454", accent2: "#ff8a3d", accentSoft: "rgba(255,180,84,0.14)",
      radius: "20px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(11,11,18,0.35), rgba(11,11,18,0.85))",
      headerBg: "rgba(11,11,18,0.65)", ctaText: "#160e02",
    },
  },
  {
    id: "kafd-futurist",
    nameAr: "مستقبل المركز المالي",
    nameEn: "KAFD Futurist",
    mode: "dark",
    description: "مستوحى من أبراج المركز المالي — فولاذي حديث مع أخضر ليزري",
    tokens: {
      bg: "#07090b", bg2: "#0c0f13", card: "#12161b", card2: "#171c23",
      border: "#242b35", text: "#eef4f8", textMuted: "#8b99a8",
      accent: "#4ade80", accent2: "#22c55e", accentSoft: "rgba(74,222,128,0.12)",
      radius: "4px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(7,9,11,0.5), rgba(7,9,11,0.93))",
      headerBg: "rgba(7,9,11,0.85)", ctaText: "#06130a",
    },
  },
  {
    id: "najdi-heritage",
    nameAr: "التراث النجدي",
    nameEn: "Najdi Heritage",
    mode: "light",
    description: "ألوان الأبواب النجدية التراثية — طيني دافئ مع أزرق وبرتقالي نجدي",
    tokens: {
      bg: "#f8f3ea", bg2: "#f0e8d9", card: "#fffcf5", card2: "#f8f2e5",
      border: "#e0d4bd", text: "#3a2c1c", textMuted: "#8d7c62",
      accent: "#c2410c", accent2: "#9a3412", accentSoft: "rgba(194,65,12,0.1)",
      radius: "8px", fontBody: arabicFonts, fontDisplay: `"Amiri", "Cairo", serif`,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(58,44,28,0.45), rgba(58,44,28,0.82))",
      headerBg: "rgba(248,243,234,0.9)", ctaText: "#fffcf5",
    },
  },
  {
    id: "velvet-lounge",
    nameAr: "المخمل الليلي",
    nameEn: "Velvet Lounge",
    mode: "dark",
    description: "فخامة اللاونج — كحلي مخملي مع وردي ذهبي دافئ",
    tokens: {
      bg: "#100d16", bg2: "#161221", card: "#1e182c", card2: "#251e37",
      border: "#372c50", text: "#f5eef7", textMuted: "#a795b5",
      accent: "#f0abfc", accent2: "#d946ef", accentSoft: "rgba(240,171,252,0.13)",
      radius: "22px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(16,13,22,0.5), rgba(16,13,22,0.93))",
      headerBg: "rgba(16,13,22,0.84)", ctaText: "#22081f",
    },
  },
  {
    id: "mono-editorial",
    nameAr: "المجلة الفنية",
    nameEn: "Mono Editorial",
    mode: "light",
    description: "طابع المجلات الفاخرة — أبيض ورقي مع أحمر تحريري جريء",
    tokens: {
      bg: "#fcfbf8", bg2: "#f4f2ec", card: "#ffffff", card2: "#faf8f3",
      border: "#e6e2d8", text: "#191713", textMuted: "#75705f",
      accent: "#dc2626", accent2: "#b91c1c", accentSoft: "rgba(220,38,38,0.08)",
      radius: "0px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(25,23,19,0.42), rgba(25,23,19,0.8))",
      headerBg: "rgba(252,251,248,0.92)", ctaText: "#ffffff",
    },
  },
  {
    id: "riyadh-season",
    nameAr: "موسم الرياض",
    nameEn: "Riyadh Season",
    mode: "dark",
    description: "طاقة الموسم — بنفسجي كهربائي مع تدرجات نيون احتفالية",
    tokens: {
      bg: "#0d0618", bg2: "#140a24", card: "#1c1032", card2: "#241540",
      border: "#3b2563", text: "#f4edff", textMuted: "#a893cf",
      accent: "#22d3ee", accent2: "#a855f7", accentSoft: "rgba(34,211,238,0.13)",
      radius: "14px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(160deg, rgba(168,85,247,0.25), rgba(13,6,24,0.92))",
      headerBg: "rgba(13,6,24,0.82)", ctaText: "#081217",
    },
  },
  {
    id: "shopify-dawn",
    nameAr: "متجر شوبيفاي (Dawn Commerce)",
    nameEn: "Shopify Dawn Store",
    mode: "light",
    description: "مستوحى من متاجر شوبيفاي العصرية — تصميم نظيف، أبيض ناصع مع أزرار سوداء واضحة وتجربة تسوق عالمية",
    tokens: {
      bg: "#ffffff", bg2: "#f5f5f7", card: "#ffffff", card2: "#fafafa",
      border: "#e5e5ea", text: "#111111", textMuted: "#666666",
      accent: "#000000", accent2: "#333333", accentSoft: "rgba(0,0,0,0.08)",
      radius: "8px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Space Grotesk", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.75))",
      headerBg: "rgba(255,255,255,0.92)", ctaText: "#ffffff",
    },
  },
  {
    id: "shopify-boutique",
    nameAr: "متجر شوبيفاي الفاخر (Boutique)",
    nameEn: "Shopify Luxury Boutique",
    mode: "dark",
    description: "مستوحى من متاجر العلامات الفاخرة على شوبيفاي — أسود عميق مع لمسات نحاسية متألقة",
    tokens: {
      bg: "#09090b", bg2: "#121217", card: "#18181f", card2: "#21212b",
      border: "#2d2d3d", text: "#fafafa", textMuted: "#a1a1aa",
      accent: "#d4af37", accent2: "#aa8c2c", accentSoft: "rgba(212,175,55,0.15)",
      radius: "4px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Cormorant Garamond", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(9,9,11,0.5), rgba(9,9,11,0.92))",
      headerBg: "rgba(9,9,11,0.88)", ctaText: "#09090b",
    },
  },
  {
    id: "wordpress-editorial",
    nameAr: "مدونة ووردبريس الإخبارية (Editorial Press)",
    nameEn: "WordPress Editorial Press",
    mode: "light",
    description: "مستوحى من قوالب ووردبريس الصحفية والمجلات — خطوط كلاسيكية وأعمدة محتوى غنية",
    tokens: {
      bg: "#fcfbf9", bg2: "#f3f0ea", card: "#ffffff", card2: "#f7f5ef",
      border: "#e2ddd5", text: "#222222", textMuted: "#777777",
      accent: "#2563eb", accent2: "#1d4ed8", accentSoft: "rgba(37,99,235,0.1)",
      radius: "6px", fontBody: arabicFonts, fontDisplay: `"Amiri", "Cairo", serif`,
      fontLatin: `"Merriweather", serif`,
      heroOverlay: "linear-gradient(180deg, rgba(34,34,34,0.4), rgba(34,34,34,0.8))",
      headerBg: "rgba(252,251,249,0.92)", ctaText: "#ffffff",
    },
  },
  {
    id: "wordpress-minimal",
    nameAr: "مدونة ووردبريس الهادئة (Gutenberg Minimal)",
    nameEn: "WordPress Gutenberg Minimal",
    mode: "light",
    description: "مستوحى من محرر جوتنبرج في ووردبريس — بساطة فائقة في عرض المقالات والوحدات العقارية",
    tokens: {
      bg: "#ffffff", bg2: "#faf9f6", card: "#ffffff", card2: "#f4f3ef",
      border: "#e5e5e0", text: "#1a1a1a", textMuted: "#6b7280",
      accent: "#0d9488", accent2: "#0f766e", accentSoft: "rgba(13,148,136,0.1)",
      radius: "12px", fontBody: arabicFonts, fontDisplay: cairoDisplay,
      fontLatin: `"Inter", sans-serif`,
      heroOverlay: "linear-gradient(180deg, rgba(26,26,26,0.4), rgba(26,26,26,0.75))",
      headerBg: "rgba(255,255,255,0.95)", ctaText: "#ffffff",
    },
  },
];

export const DEFAULT_THEME_ID = "royal-gold";

/* ==================================================================
   Light / dark variants (T18): every theme can flip to its opposite
   mode. Dark themes get an auto-derived light palette that keeps the
   accent identity; light themes get a matching dark palette.
   ================================================================== */
export type ThemeVariant = "default" | "flipped";

/** Hand-tuned light counterparts for dark themes (keyed by theme id).
 * Anything not listed falls back to a generated palette. */
const LIGHT_COUNTERPARTS: Record<string, Partial<ThemeTokens>> = {
  "royal-gold": {
    bg: "#faf7f0", bg2: "#f2ecdf", card: "#ffffff", card2: "#faf5ea",
    border: "#e4dac5", text: "#2b2416", textMuted: "#8a7d63",
    accent: "#a97e1f", accent2: "#8a6414", accentSoft: "rgba(169,126,31,0.1)",
    heroOverlay: "linear-gradient(180deg, rgba(43,36,22,0.45), rgba(43,36,22,0.8))",
    headerBg: "rgba(250,247,240,0.9)", ctaText: "#ffffff",
  },
  "midnight-neon": {
    bg: "#f5f9fc", bg2: "#eaf2f8", card: "#ffffff", card2: "#f2f8fc",
    border: "#d7e5ef", text: "#0f2233", textMuted: "#587489",
    accent: "#0891b2", accent2: "#0e7490", accentSoft: "rgba(8,145,178,0.1)",
    heroOverlay: "linear-gradient(180deg, rgba(15,34,51,0.45), rgba(15,34,51,0.8))",
    headerBg: "rgba(245,249,252,0.9)", ctaText: "#ffffff",
  },
  "emerald-oasis": {
    bg: "#f4faf6", bg2: "#e8f4ec", card: "#ffffff", card2: "#f1f9f4",
    border: "#d3e7da", text: "#122b1e", textMuted: "#5b7d68",
    accent: "#059669", accent2: "#047857", accentSoft: "rgba(5,150,105,0.1)",
    heroOverlay: "linear-gradient(180deg, rgba(18,43,30,0.45), rgba(18,43,30,0.8))",
    headerBg: "rgba(244,250,246,0.9)", ctaText: "#ffffff",
  },
  "royal-purple": {
    bg: "#faf8fd", bg2: "#f2eefa", card: "#ffffff", card2: "#f7f3fc",
    border: "#e3daf1", text: "#291d3d", textMuted: "#77689a",
    accent: "#7c3aed", accent2: "#6d28d9", accentSoft: "rgba(124,58,237,0.09)",
    heroOverlay: "linear-gradient(180deg, rgba(41,29,61,0.45), rgba(41,29,61,0.8))",
    headerBg: "rgba(250,248,253,0.9)", ctaText: "#ffffff",
  },
  "carbon-ember": {
    bg: "#faf8f6", bg2: "#f2eee9", card: "#ffffff", card2: "#f8f4ef",
    border: "#e5ded4", text: "#241c14", textMuted: "#82796d",
    accent: "#ea580c", accent2: "#c2410c", accentSoft: "rgba(234,88,12,0.09)",
    heroOverlay: "linear-gradient(180deg, rgba(36,28,20,0.45), rgba(36,28,20,0.8))",
    headerBg: "rgba(250,248,246,0.9)", ctaText: "#ffffff",
  },
  "aurora-glass": {
    bg: "#f8f7fc", bg2: "#efedf8", card: "#ffffff", card2: "#f5f3fb",
    border: "#e0dcf0", text: "#221d38", textMuted: "#6f6892",
    accent: "#c026d3", accent2: "#a21caf", accentSoft: "rgba(192,38,211,0.08)",
    heroOverlay: "linear-gradient(180deg, rgba(34,29,56,0.45), rgba(34,29,56,0.8))",
    headerBg: "rgba(248,247,252,0.88)", ctaText: "#ffffff",
  },
  "ramadan-nights": {
    bg: "#f7f6f0", bg2: "#eeece1", card: "#ffffff", card2: "#f6f4ea",
    border: "#ddd8c5", text: "#22263e", textMuted: "#6f7390",
    accent: "#b8860b", accent2: "#976d05", accentSoft: "rgba(184,134,11,0.1)",
    heroOverlay: "linear-gradient(180deg, rgba(34,38,62,0.5), rgba(34,38,62,0.82))",
    headerBg: "rgba(247,246,240,0.9)", ctaText: "#ffffff",
  },
  "ramadan-serenity": {
    bg: "#f5f8f3", bg2: "#eaf0e5", card: "#ffffff", card2: "#f2f6ec",
    border: "#d8e2cf", text: "#1d2b1c", textMuted: "#64775f",
    accent: "#8c6d1f", accent2: "#715614", accentSoft: "rgba(140,109,31,0.1)",
    heroOverlay: "linear-gradient(180deg, rgba(29,43,28,0.48), rgba(29,43,28,0.82))",
    headerBg: "rgba(245,248,243,0.9)", ctaText: "#ffffff",
  },
  "eid-adha": {
    bg: "#faf5f2", bg2: "#f3eae4", card: "#ffffff", card2: "#f9f1ea",
    border: "#e6d6cb", text: "#33191f", textMuted: "#8d6f66",
    accent: "#9a3324", accent2: "#7c2318", accentSoft: "rgba(154,51,36,0.09)",
    heroOverlay: "linear-gradient(180deg, rgba(51,25,31,0.45), rgba(51,25,31,0.8))",
    headerBg: "rgba(250,245,242,0.9)", ctaText: "#ffffff",
  },
  "parallax-noir": {
    bg: "#f9f8fc", bg2: "#f0eff7", card: "#ffffff", card2: "#f6f5fb",
    border: "#e1dfee", text: "#211f33", textMuted: "#6e6a8c",
    accent: "#d97706", accent2: "#b45309", accentSoft: "rgba(217,119,6,0.09)",
    heroOverlay: "linear-gradient(180deg, rgba(33,31,51,0.42), rgba(33,31,51,0.78))",
    headerBg: "rgba(249,248,252,0.85)", ctaText: "#ffffff",
  },
  "kafd-futurist": {
    bg: "#f5f8f6", bg2: "#eaf1ec", card: "#ffffff", card2: "#f1f7f3",
    border: "#d6e3da", text: "#14211a", textMuted: "#5f7568",
    accent: "#16a34a", accent2: "#15803d", accentSoft: "rgba(22,163,74,0.09)",
    heroOverlay: "linear-gradient(180deg, rgba(20,33,26,0.45), rgba(20,33,26,0.8))",
    headerBg: "rgba(245,248,246,0.9)", ctaText: "#ffffff",
  },
  "velvet-lounge": {
    bg: "#fbf8fc", bg2: "#f4edf7", card: "#ffffff", card2: "#f9f3fb",
    border: "#e8daee", text: "#2c1e33", textMuted: "#7d6b8a",
    accent: "#c026d3", accent2: "#a21caf", accentSoft: "rgba(192,38,211,0.08)",
    heroOverlay: "linear-gradient(180deg, rgba(44,30,51,0.45), rgba(44,30,51,0.8))",
    headerBg: "rgba(251,248,252,0.9)", ctaText: "#ffffff",
  },
  "riyadh-season": {
    bg: "#f7f5fc", bg2: "#eeeaf8", card: "#ffffff", card2: "#f4f1fb",
    border: "#ded7f0", text: "#231738", textMuted: "#6f6394",
    accent: "#7c3aed", accent2: "#0891b2", accentSoft: "rgba(124,58,237,0.09)",
    heroOverlay: "linear-gradient(160deg, rgba(124,58,237,0.2), rgba(35,23,56,0.85))",
    headerBg: "rgba(247,245,252,0.9)", ctaText: "#ffffff",
  },
};

/** Hand-tuned dark counterparts for light themes */
const DARK_COUNTERPARTS: Record<string, Partial<ThemeTokens>> = {
  "desert-rose": {
    bg: "#171210", bg2: "#1e1815", card: "#261e1a", card2: "#2d2420",
    border: "#3e322b", text: "#f4ece5", textMuted: "#b3a190",
    accent: "#e08a76", accent2: "#c26d5c", accentSoft: "rgba(224,138,118,0.13)",
    heroOverlay: "linear-gradient(180deg, rgba(23,18,16,0.5), rgba(23,18,16,0.92))",
    headerBg: "rgba(23,18,16,0.86)", ctaText: "#1e1210",
  },
  "pearl-minimal": {
    bg: "#111110", bg2: "#181817", card: "#1f1f1d", card2: "#262624",
    border: "#333330", text: "#f4f4f0", textMuted: "#9d9d94",
    accent: "#f4f4f0", accent2: "#d6d6cf", accentSoft: "rgba(244,244,240,0.08)",
    heroOverlay: "linear-gradient(180deg, rgba(17,17,16,0.5), rgba(17,17,16,0.92))",
    headerBg: "rgba(17,17,16,0.88)", ctaText: "#111110",
  },
  "ocean-breeze": {
    bg: "#081521", bg2: "#0c1c2b", card: "#112438", card2: "#162c44",
    border: "#22405c", text: "#e9f3fb", textMuted: "#8fa9c0",
    accent: "#38bdf8", accent2: "#0ea5e9", accentSoft: "rgba(56,189,248,0.13)",
    heroOverlay: "linear-gradient(180deg, rgba(8,21,33,0.5), rgba(8,21,33,0.92))",
    headerBg: "rgba(8,21,33,0.86)", ctaText: "#081521",
  },
  "sand-dune": {
    bg: "#171310", bg2: "#1f1a14", card: "#282118", card2: "#30281d",
    border: "#43382a", text: "#f3ecdf", textMuted: "#b3a68e",
    accent: "#d98e28", accent2: "#b8741a", accentSoft: "rgba(217,142,40,0.13)",
    heroOverlay: "linear-gradient(180deg, rgba(23,19,16,0.5), rgba(23,19,16,0.92))",
    headerBg: "rgba(23,19,16,0.86)", ctaText: "#171310",
  },
  "eid-fitr": {
    bg: "#0c1810", bg2: "#112016", card: "#16291d", card2: "#1b3224",
    border: "#28452f", text: "#eef6ea", textMuted: "#9cb8a1",
    accent: "#4ade80", accent2: "#22c55e", accentSoft: "rgba(74,222,128,0.12)",
    heroOverlay: "linear-gradient(180deg, rgba(12,24,16,0.5), rgba(12,24,16,0.92))",
    headerBg: "rgba(12,24,16,0.86)", ctaText: "#0c1810",
  },
  "najdi-heritage": {
    bg: "#171006", bg2: "#1f160a", card: "#281d10", card2: "#302415",
    border: "#453521", text: "#f5ecdd", textMuted: "#b5a289",
    accent: "#fb923c", accent2: "#f97316", accentSoft: "rgba(251,146,60,0.13)",
    heroOverlay: "linear-gradient(180deg, rgba(23,16,6,0.5), rgba(23,16,6,0.92))",
    headerBg: "rgba(23,16,6,0.86)", ctaText: "#171006",
  },
  "mono-editorial": {
    bg: "#121110", bg2: "#191817", card: "#211f1e", card2: "#282625",
    border: "#373431", text: "#f4f2ee", textMuted: "#9e9a93",
    accent: "#f87171", accent2: "#ef4444", accentSoft: "rgba(248,113,113,0.11)",
    heroOverlay: "linear-gradient(180deg, rgba(18,17,16,0.5), rgba(18,17,16,0.92))",
    headerBg: "rgba(18,17,16,0.88)", ctaText: "#121110",
  },
};

/** Returns tokens (and effective mode) for a theme + variant combination. */
export function resolveVariantTokens(
  theme: ThemePreset,
  variant: ThemeVariant
): { tokens: ThemeTokens; mode: "dark" | "light" } {
  if (variant !== "flipped") return { tokens: theme.tokens, mode: theme.mode };
  const table = theme.mode === "dark" ? LIGHT_COUNTERPARTS : DARK_COUNTERPARTS;
  const override = table[theme.id];
  const flippedMode = theme.mode === "dark" ? "light" : "dark";
  if (override) return { tokens: { ...theme.tokens, ...override }, mode: flippedMode };
  // Generic fallback for custom themes: derive a neutral opposite palette
  const generic: Partial<ThemeTokens> =
    flippedMode === "light"
      ? {
          bg: "#faf9f6", bg2: "#f1efe9", card: "#ffffff", card2: "#f7f5f0",
          border: "#e3e0d6", text: "#26231d", textMuted: "#7d786b",
          heroOverlay: "linear-gradient(180deg, rgba(38,35,29,0.45), rgba(38,35,29,0.8))",
          headerBg: "rgba(250,249,246,0.9)", ctaText: "#ffffff",
        }
      : {
          bg: "#111013", bg2: "#18171b", card: "#201f24", card2: "#28262c",
          border: "#37343d", text: "#f2f1f5", textMuted: "#9c98a6",
          heroOverlay: "linear-gradient(180deg, rgba(17,16,19,0.5), rgba(17,16,19,0.92))",
          headerBg: "rgba(17,16,19,0.86)", ctaText: "#111013",
        };
  return { tokens: { ...theme.tokens, ...generic }, mode: flippedMode };
}

/** Custom themes created by the admin (stored in Supabase site_settings.custom_themes) */
let CUSTOM_THEMES: ThemePreset[] = [];

export function setCustomThemes(themes: ThemePreset[]) {
  CUSTOM_THEMES = (themes || []).map((t) => ({ ...t, custom: true }));
}

export function getCustomThemes(): ThemePreset[] {
  return CUSTOM_THEMES;
}

export function getAllThemes(): ThemePreset[] {
  if ((window as any).__HUGE_2500_THEMES_CACHE__) {
    return [...(window as any).__HUGE_2500_THEMES_CACHE__, ...CUSTOM_THEMES];
  }

  const generated: ThemePreset[] = [...THEMES];
  const categories = [
    { prefix: "shopify-store", ar: "متجر شوبيفاي", en: "Shopify Storefront", mode: "light" as const, colors: ["#000000", "#111827", "#2563eb", "#059669", "#7c3aed", "#d97706", "#db2777", "#0891b2"] },
    { prefix: "wordpress-mag", ar: "مدونة ووردبريس", en: "WordPress Editorial", mode: "light" as const, colors: ["#2563eb", "#0d9488", "#dc2626", "#4f46e5", "#b45309", "#047857", "#be185d", "#1e40af"] },
    { prefix: "luxury-horizon", ar: "فخامة الأفق", en: "Luxury Horizon", mode: "dark" as const, colors: ["#d4a84b", "#e0a94e", "#34d399", "#a78bfa", "#f43f5e", "#38bdf8", "#fbbf24", "#c084fc"] },
    { prefix: "celebration-fest", ar: "موسم واحتفال", en: "Celebration Fest", mode: "dark" as const, colors: ["#f2b545", "#178a4c", "#e0a94e", "#22d3ee", "#e879f9", "#fb7185", "#4ade80", "#f97316"] },
  ];

  let idCounter = 1;
  for (const cat of categories) {
    for (let i = 1; i <= 650; i++) {
      const id = `${cat.prefix}-${i}`;
      const color = cat.colors[i % cat.colors.length];
      const isDark = cat.mode === "dark" || i % 4 === 0;
      generated.push({
        id,
        nameAr: `${cat.ar} الاحترافي #${i}`,
        nameEn: `${cat.en} Professional #${i}`,
        mode: isDark ? "dark" : "light",
        description: `طابع رقم ${i} ضمن إصدارات ${cat.ar} المعتمدة لتخصيص الهوية البصرية، البنرات والألوان`,
        tokens: {
          bg: isDark ? (i % 2 === 0 ? "#07090e" : "#0a0d14") : (i % 2 === 0 ? "#ffffff" : "#f8fafc"),
          bg2: isDark ? "#111622" : "#f1f5f9",
          card: isDark ? "#171e2e" : "#ffffff",
          card2: isDark ? "#1f293d" : "#f8fafc",
          border: isDark ? "#28354f" : "#e2e8f0",
          text: isDark ? "#f8fafc" : "#0f172a",
          textMuted: isDark ? "#94a3b8" : "#64748b",
          accent: color,
          accent2: color,
          accentSoft: `${color}22`,
          radius: `${(i % 5) * 4 + 4}px`,
          fontBody: arabicFonts,
          fontDisplay: cairoDisplay,
          fontLatin: `"Space Grotesk", sans-serif`,
          heroOverlay: isDark ? "linear-gradient(180deg, rgba(7,9,14,0.5), rgba(7,9,14,0.92))" : "linear-gradient(180deg, rgba(15,23,42,0.4), rgba(15,23,42,0.78))",
          headerBg: isDark ? "rgba(7,9,14,0.85)" : "rgba(255,255,255,0.9)",
          ctaText: isDark ? "#07090e" : "#ffffff",
        },
      });
      idCounter++;
    }
  }

  (window as any).__HUGE_2500_THEMES_CACHE__ = generated;
  return [...generated, ...CUSTOM_THEMES];
}

export function getTheme(id: string): ThemePreset {
  return getAllThemes().find((t) => t.id === id) || THEMES[0];
}

/** Theme schedule: auto-activate a theme within a date range */
export type ThemeSchedule = {
  id: string;          // unique schedule id
  themeId: string;     // theme to activate
  startDate: string;   // YYYY-MM-DD inclusive
  endDate: string;     // YYYY-MM-DD inclusive
  label?: string;      // e.g. "رمضان ١٤٤٨"
  enabled: boolean;
};

/** Returns the theme id that should be active today given schedules, or null */
export function resolveScheduledTheme(schedules: ThemeSchedule[], today = new Date()): string | null {
  const d = today.toISOString().slice(0, 10);
  const active = (schedules || []).filter(
    (s) => s.enabled && s.startDate && s.endDate && s.startDate <= d && s.endDate >= d
  );
  if (active.length === 0) return null;
  // Most recently started schedule wins
  active.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
  return active[0].themeId;
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

export function applyThemeToDOM(
  theme: ThemePreset,
  overrides?: ThemeOverrides,
  variant: ThemeVariant = "default"
) {
  const resolved = resolveVariantTokens(theme, variant);
  const tokens = { ...resolved.tokens, ...(variant === "default" ? overrides?.tokens || {} : {}) };
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
  r.dataset.mode = resolved.mode;
  r.dataset.variant = variant;
  if (theme.decor) r.dataset.decor = theme.decor;
  else delete r.dataset.decor;
  if (theme.parallax) r.dataset.parallax = "on";
  else delete r.dataset.parallax;
}
