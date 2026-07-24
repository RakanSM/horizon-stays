/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const STR = {
  // Header / nav
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_properties: { ar: "الوحدات", en: "Properties" },
  nav_about: { ar: "من نحن", en: "About Us" },
  nav_contact: { ar: "تواصل معنا", en: "Contact" },
  book_now: { ar: "احجز الآن", en: "Book Now" },

  // Hero / home
  hero_badge: { ar: "إقامة فاخرة في الرياض", en: "Luxury Stays in Riyadh" },
  hero_title: { ar: "أفق للإقامة الفاخرة", en: "Horizon Luxury Stays" },
  hero_subtitle: {
    ar: "شقق وأجنحة مفروشة بمعايير فندقية في أرقى أحياء الرياض — حجز مباشر بدون عمولات",
    en: "Hotel-grade furnished apartments and suites in Riyadh's finest districts — book direct, no fees",
  },
  explore_units: { ar: "استكشف الوحدات", en: "Explore Properties" },
  stat_units: { ar: "وحدة فاخرة", en: "Luxury Units" },
  stat_districts: { ar: "أحياء مميزة", en: "Prime Districts" },
  stat_guests: { ar: "ضيف سعيد", en: "Happy Guests" },
  stat_support: { ar: "دعم على مدار الساعة", en: "Round-the-clock Support" },
  our_properties: { ar: "وحداتنا", en: "Our Properties" },
  props_sub: {
    ar: "اختر من مجموعتنا المميزة من الشقق والأجنحة الفاخرة",
    en: "Choose from our curated collection of luxury apartments and suites",
  },
  filter_all: { ar: "الكل", en: "All" },
  bedrooms_f: { ar: "غرف النوم", en: "Bedrooms" },
  guests_f: { ar: "الضيوف", en: "Guests" },
  night: { ar: "ليلة", en: "night" },
  sar: { ar: "ر.س", en: "SAR" },
  view_details: { ar: "عرض التفاصيل", en: "View Details" },
  no_results: { ar: "لا توجد وحدات مطابقة", en: "No matching properties" },
  loading: { ar: "جاري التحميل...", en: "Loading..." },

  // Property detail
  bedrooms: { ar: "غرف نوم", en: "Bedrooms" },
  bathrooms: { ar: "دورات مياه", en: "Bathrooms" },
  guests: { ar: "ضيوف", en: "Guests" },
  area: { ar: "المساحة", en: "Area" },
  sqm: { ar: "م²", en: "m²" },
  floor_lbl: { ar: "الدور", en: "Floor" },
  district: { ar: "الحي", en: "District" },
  amenities: { ar: "المرافق والخدمات", en: "Amenities & Services" },
  about_unit: { ar: "عن الوحدة", en: "About This Unit" },
  availability: { ar: "التوفر والحجز", en: "Availability & Booking" },
  cal_hint: {
    ar: "اختر تاريخ الوصول ثم تاريخ المغادرة من التقويم",
    en: "Select your check-in date, then your check-out date",
  },
  check_in: { ar: "الوصول", en: "Check-in" },
  check_out: { ar: "المغادرة", en: "Check-out" },
  select_date: { ar: "اختر التاريخ", en: "Select date" },
  nights: { ar: "الليالي", en: "Nights" },
  total: { ar: "الإجمالي", en: "Total" },
  clear_dates: { ar: "مسح التواريخ", en: "Clear dates" },
  book_whatsapp: { ar: "احجز عبر واتساب", en: "Book via WhatsApp" },
  view_airbnb: { ar: "عرض على Airbnb", en: "View on Airbnb" },
  blocked_legend: { ar: "محجوز", en: "Booked" },
  available_legend: { ar: "متاح", en: "Available" },
  selected_legend: { ar: "المحدد", en: "Selected" },
  back_to_all: { ar: "جميع الوحدات", en: "All Properties" },
  photos: { ar: "الصور", en: "Photos" },
  show_all_photos: { ar: "عرض كل الصور", en: "Show all photos" },
  not_found: { ar: "الوحدة غير موجودة", en: "Property not found" },
  min_1_night: { ar: "ليلة واحدة على الأقل", en: "Minimum 1 night" },
  dates_unavailable: { ar: "بعض التواريخ المحددة محجوزة", en: "Some selected dates are booked" },

  // WhatsApp booking message parts
  wa_greeting: { ar: "مرحباً، أرغب بحجز", en: "Hello, I would like to book" },
  wa_from: { ar: "من", en: "from" },
  wa_to: { ar: "إلى", en: "to" },
  wa_nights: { ar: "عدد الليالي", en: "Nights" },

  // About
  about_title: { ar: "من نحن", en: "About Us" },
  about_lead: {
    ar: "أفق للإقامة الفاخرة — وجهتك الأولى للسكن الفندقي الراقي في الرياض",
    en: "Horizon Luxury Stays — your first choice for premium hotel-style living in Riyadh",
  },
  about_p1: {
    ar: "نقدّم مجموعة مختارة بعناية من الشقق والأجنحة المفروشة بمعايير فندقية عالمية في أرقى أحياء الرياض: العليا، الياسمين، حطين، الملقا، والصحافة. كل وحدة صُممت لتمنحك تجربة إقامة استثنائية تجمع بين الفخامة والخصوصية والراحة.",
    en: "We offer a hand-picked collection of furnished apartments and suites finished to international hotel standards in Riyadh's most prestigious districts: Olaya, Al Yasmin, Hittin, Al Malqa, and Al Sahafa. Every unit is designed to deliver an exceptional stay combining luxury, privacy, and comfort.",
  },
  about_p2: {
    ar: "منذ انطلاقتنا، استضفنا آلاف الضيوف من داخل المملكة وخارجها، وحافظنا على أعلى معايير الجودة والنظافة والخدمة. فريقنا متواجد على مدار الساعة لضمان تجربة سلسة من لحظة الحجز حتى المغادرة.",
    en: "Since our launch, we have hosted thousands of guests from Saudi Arabia and abroad while maintaining the highest standards of quality, cleanliness, and service. Our team is available around the clock to ensure a seamless experience from booking to check-out.",
  },
  about_why: { ar: "لماذا أفق؟", en: "Why Horizon?" },
  why_1_t: { ar: "مواقع مميزة", en: "Prime Locations" },
  why_1_d: {
    ar: "وحدات في قلب أرقى أحياء الرياض، قريبة من الأعمال والترفيه والمطاعم",
    en: "Units in the heart of Riyadh's finest districts, close to business, dining, and entertainment",
  },
  why_2_t: { ar: "معايير فندقية", en: "Hotel Standards" },
  why_2_d: {
    ar: "تجهيز كامل وتشطيبات فاخرة ونظافة احترافية قبل كل إقامة",
    en: "Fully equipped, luxury finishes, and professional cleaning before every stay",
  },
  why_3_t: { ar: "حجز مباشر", en: "Direct Booking" },
  why_3_d: {
    ar: "احجز مباشرة بدون عمولات منصات، بأفضل سعر مضمون",
    en: "Book directly with no platform fees and the best rate guaranteed",
  },
  why_4_t: { ar: "دعم دائم", en: "Always-on Support" },
  why_4_d: {
    ar: "فريق متواجد على مدار الساعة عبر واتساب لأي طلب أو استفسار",
    en: "A team available 24/7 on WhatsApp for any request or question",
  },
  about_mission_t: { ar: "رسالتنا", en: "Our Mission" },
  about_mission: {
    ar: "أن نعيد تعريف الضيافة السكنية في المملكة من خلال وحدات استثنائية وخدمة شخصية ترقى لتطلعات ضيوفنا.",
    en: "To redefine residential hospitality in the Kingdom through exceptional units and personal service that exceeds our guests' expectations.",
  },
  about_vision_t: { ar: "رؤيتنا", en: "Our Vision" },
  about_vision: {
    ar: "أن نكون الخيار الأول للإقامة الفاخرة قصيرة وطويلة الأمد في الرياض بحلول 2030.",
    en: "To be the first choice for luxury short and long stays in Riyadh by 2030.",
  },

  // Contact
  contact_title: { ar: "تواصل معنا", en: "Contact Us" },
  contact_lead: {
    ar: "فريقنا جاهز للرد على استفساراتك على مدار الساعة",
    en: "Our team is ready to answer your questions around the clock",
  },
  contact_whatsapp: { ar: "واتساب", en: "WhatsApp" },
  contact_whatsapp_d: { ar: "الطريقة الأسرع للحجز والاستفسار", en: "The fastest way to book and inquire" },
  contact_hours: { ar: "ساعات العمل", en: "Working Hours" },
  contact_hours_d: { ar: "على مدار الساعة، طوال أيام الأسبوع", en: "24/7, every day of the week" },
  contact_location: { ar: "الموقع", en: "Location" },
  contact_location_d: { ar: "الرياض، المملكة العربية السعودية", en: "Riyadh, Saudi Arabia" },
  start_chat: { ar: "ابدأ المحادثة", en: "Start Chat" },

  // Footer
  footer_tag: {
    ar: "إقامة فاخرة بمعايير فندقية في أرقى أحياء الرياض",
    en: "Luxury hotel-grade stays in Riyadh's finest districts",
  },
  footer_links: { ar: "روابط سريعة", en: "Quick Links" },
  footer_contact: { ar: "التواصل", en: "Contact" },
  footer_rights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
} as const;

export type StrKey = keyof typeof STR;

type LangCtx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (k: StrKey) => string;
  setLang: (l: Lang) => void;
};

const Ctx = createContext<LangCtx>({
  lang: "ar",
  dir: "rtl",
  t: (k) => STR[k]?.ar ?? k,
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("hs_lang");
    return saved === "en" ? "en" : "ar";
  });
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    localStorage.setItem("hs_lang", l);
    setLangState(l);
  };

  const t = (k: StrKey) => STR[k]?.[lang] ?? k;

  return <Ctx.Provider value={{ lang, dir, t, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

/** Localized property name */
export function propName(p: { name_ar: string; name_en: string }, lang: Lang): string {
  return lang === "ar" ? p.name_ar || p.name_en : p.name_en || p.name_ar;
}

/** Format date -> YYYY-MM-DD */
export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Month names for calendar */
export const MONTHS = {
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export const WEEKDAYS = {
  ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** Arabic amenity translation (DB amenities are English) */
const AMENITY_AR: Record<string, string> = {
  "wifi": "واي فاي",
  "fast wifi": "واي فاي سريع",
  "kitchen": "مطبخ",
  "full kitchen": "مطبخ كامل",
  "washer": "غسالة",
  "free parking": "موقف مجاني",
  "parking": "موقف سيارات",
  "air conditioning": "تكييف",
  "ac": "تكييف",
  "tv": "تلفزيون",
  "smart tv": "تلفزيون ذكي",
  "70 inch tv": "شاشة 70 بوصة",
  "75 inch tv": "شاشة 75 بوصة",
  "pool": "مسبح",
  "shared pool": "مسبح مشترك",
  "private pool": "مسبح خاص",
  "hot tub": "جاكوزي",
  "jacuzzi": "جاكوزي",
  "gym": "صالة رياضية",
  "elevator": "مصعد",
  "self check-in": "دخول ذاتي",
  "self checkin": "دخول ذاتي",
  "smart lock": "قفل ذكي",
  "workspace": "مساحة عمل",
  "dedicated workspace": "مساحة عمل مخصصة",
  "balcony": "بلكونة",
  "patio": "فناء",
  "garden": "حديقة",
  "rooftop": "سطح خاص",
  "city view": "إطلالة على المدينة",
  "pool view": "إطلالة على المسبح",
  "coffee maker": "ماكينة قهوة",
  "nespresso": "مكينة نسبريسو",
  "dishwasher": "غسالة صحون",
  "dryer": "نشافة",
  "iron": "مكواة",
  "hair dryer": "مجفف شعر",
  "essentials": "مستلزمات أساسية",
  "towels": "مناشف",
  "bed linens": "بياضات أسرّة",
  "hangers": "علاقات ملابس",
  "heating": "تدفئة",
  "security cameras": "كاميرات أمنية",
  "smoke alarm": "كاشف دخان",
  "first aid kit": "حقيبة إسعافات أولية",
  "fire extinguisher": "طفاية حريق",
  "sound system": "نظام صوتي",
  "game console": "جهاز ألعاب",
  "gaming area": "منطقة ألعاب",
  "cinema": "سينما منزلية",
  "home theater": "سينما منزلية",
  "projector": "بروجكتر",
  "bathtub": "حوض استحمام",
  "luxury bath": "حمام فاخر",
  "soundproofing": "عزل صوتي",
  "long term stays allowed": "إقامات طويلة",
  "luggage dropoff allowed": "تخزين أمتعة",
  "microwave": "مايكروويف",
  "refrigerator": "ثلاجة",
  "oven": "فرن",
  "stove": "موقد",
  "outdoor seating": "جلسة خارجية",
  "outdoor dining area": "جلسة طعام خارجية",
  "bbq grill": "شواية",
  "crib": "سرير أطفال",
  "high chair": "كرسي أطفال",
  "fully equipped kitchen": "مطبخ مجهز",
  "high-speed wifi": "واي فاي سريع",
  "outdoor area": "جلسة خارجية",
  "outdoor jacuzzi": "جاكوزي خارجي",
  "cinema room": "غرفة سينما",
  "kafd view": "إطلالة KAFD",
  '75" tv': "شاشة 75 بوصة",
  '70" tv': "شاشة 70 بوصة",
  "private entrance": "مدخل خاص",
  "hockey table": "طاولة هوكي",
  "netflix": "نتفلكس",
  "board games": "ألعاب طاولة",
};

export function localizeAmenity(a: string, lang: Lang): string {
  if (lang === "en") return a;
  const key = a.trim().toLowerCase();
  return AMENITY_AR[key] || a;
}
