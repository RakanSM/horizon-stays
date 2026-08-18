export type FeatureFlagKey =
  | "nav_properties"
  | "nav_about"
  | "nav_contact"
  | "nav_calendar"
  | "page_landlord"
  | "page_cleaner"
  | "booking_whatsapp"
  | "booking_airbnb"
  | "booking_gathern"
  | "booking_myfatoorah"
  | "feature_gallery"
  | "feature_amenities"
  | "feature_map"
  | "feature_social_share"
  | "feature_theme_decor"
  | "feature_scrollytelling";

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  nav_properties: true,
  nav_about: true,
  nav_contact: true,
  nav_calendar: true,
  page_landlord: true,
  page_cleaner: true,
  booking_whatsapp: true,
  booking_airbnb: true,
  booking_gathern: true,
  booking_myfatoorah: true,
  feature_gallery: true,
  feature_amenities: true,
  feature_map: true,
  feature_social_share: true,
  feature_theme_decor: true,
  feature_scrollytelling: true,
};

export type FeatureFlagGroup = {
  id: string;
  title: string;
  description: string;
  items: Array<{ key: FeatureFlagKey; ar: string; en: string; hint?: string }>;
};

export const FEATURE_FLAG_GROUPS: FeatureFlagGroup[] = [
  {
    id: "navigation",
    title: "التنقل والصفحات",
    description: "إخفاء الرابط من الموقع العام. الإخفاء لا يحذف البيانات ولا يمنع الوصول الإداري.",
    items: [
      { key: "nav_properties", ar: "صفحة الوحدات", en: "Properties page" },
      { key: "nav_about", ar: "صفحة من نحن", en: "About page" },
      { key: "nav_contact", ar: "صفحة التواصل", en: "Contact page" },
      { key: "nav_calendar", ar: "تقويم التوفر العام", en: "Public availability calendar" },
      { key: "page_landlord", ar: "بوابة المالك", en: "Landlord portal" },
      { key: "page_cleaner", ar: "بوابة النظافة", en: "Cleaner portal" },
    ],
  },
  {
    id: "booking",
    title: "طرق الحجز والدفع",
    description: "تحكم في أزرار التواصل والحجز التي يراها الضيف على الصفحة الرئيسية وصفحات الوحدات.",
    items: [
      { key: "booking_whatsapp", ar: "الحجز عبر WhatsApp", en: "WhatsApp booking" },
      { key: "booking_airbnb", ar: "زر Airbnb", en: "Airbnb button" },
      { key: "booking_gathern", ar: "زر Gathern", en: "Gathern button" },
      { key: "booking_myfatoorah", ar: "الدفع عبر MyFatoorah", en: "MyFatoorah checkout", hint: "يؤثر على زر الدفع عند وجود مسار MyFatoorah في الواجهة." },
    ],
  },
  {
    id: "property",
    title: "تفاصيل الوحدة",
    description: "إخفاء أجزاء العرض من كل صفحات الوحدات دون حذف الصور أو البيانات.",
    items: [
      { key: "feature_gallery", ar: "معرض الصور", en: "Photo gallery" },
      { key: "feature_amenities", ar: "المرافق والخدمات", en: "Amenities" },
      { key: "feature_map", ar: "الخريطة والموقع", en: "Map and location" },
      { key: "feature_social_share", ar: "المشاركة والروابط الاجتماعية", en: "Social sharing" },
    ],
  },
  {
    id: "experience",
    title: "تجربة الموقع",
    description: "مفاتيح للميزات البصرية والحركية العامة.",
    items: [
      { key: "feature_theme_decor", ar: "زخارف المواسم والاحتفالات", en: "Seasonal and celebration decor" },
      { key: "feature_scrollytelling", ar: "قسم القصص المتحركة", en: "Scrollytelling section" },
    ],
  },
];

export function normalizeFeatureFlags(value: unknown): FeatureFlags {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return Object.keys(DEFAULT_FEATURE_FLAGS).reduce((result, key) => {
    const typedKey = key as FeatureFlagKey;
    result[typedKey] = typeof source[typedKey] === "boolean" ? source[typedKey] as boolean : DEFAULT_FEATURE_FLAGS[typedKey];
    return result;
  }, {} as FeatureFlags);
}
