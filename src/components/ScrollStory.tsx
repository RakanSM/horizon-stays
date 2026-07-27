import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";
import { Reveal } from "../lib/motion";

/**
 * Hybrid "Master Scrollytelling" section — three phases in one 400vh sticky runway:
 *  Phase 1 (0–30%):  fixed hero canvas, text callouts fade over it
 *  Phase 2 (30–65%): canvas shrinks into a card; value cards stack on top
 *  Phase 3 (65–100%): pinned horizontal showcase slides banners across
 * Mobile (<768px) and reduced-motion render a plain stacked fallback.
 * No framer-motion: one passive scroll listener + rAF, transforms/opacity only.
 */

const CDN = "https://bwffhalzuvvmuzjfmdyp.supabase.co/storage/v1/object/public/property-images";

const CANVAS_IMG = `${CDN}/kafd-penthouse-3bd-2.webp`;

const SHOWCASE = [
  { slug: "kafd-penthouse-3bd", img: `${CDN}/kafd-penthouse-3bd-1.webp`, ar: "بنتهاوس KAFD", en: "KAFD Penthouse" },
  { slug: "massive-3br-2floors", img: `${CDN}/massive-3br-2floors-1.webp`, ar: "فيلا دورين", en: "Two-floor Villa" },
  { slug: "sky-lounge-suite", img: `${CDN}/sky-lounge-suite-1.webp`, ar: "جناح سكاي لاونج", en: "Sky Lounge Suite" },
  { slug: "tranquil-stay-luxury-bath", img: `${CDN}/tranquil-stay-luxury-bath-1.webp`, ar: "إقامة هادئة بحمام فاخر", en: "Tranquil Luxury Bath" },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** map progress p within [a,b] to 0..1 */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export default function ScrollStory() {
  const { t, lang, dir } = useLang();
  const { content } = useTheme();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animated = isDesktop && !reduced && content.animationsEnabled !== false;

  useEffect(() => {
    if (!animated) return;
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const rtl = dir === "rtl";
    let raf = 0;
    let lastPhase = -1;

    const q = (sel: string) => stage.querySelector<HTMLElement>(sel);
    const qa = (sel: string) => stage.querySelectorAll<HTMLElement>(sel);

    const update = () => {
      const rect = root.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp01(-rect.top / total);

      // ---- Phase 1: callouts over fixed canvas (0 → .30) ----
      const caps = qa(".ss-cap");
      caps.forEach((el, i) => {
        // each callout owns a slice of 0–0.26
        const s = 0.02 + i * 0.08;
        const e = s + 0.08;
        const local = seg(p, s, e);
        const inO = easeOut(seg(local, 0, 0.45));
        const outO = 1 - seg(local, 0.72, 1);
        el.style.opacity = String(Math.min(inO, outO));
        el.style.transform = `translateY(${(1 - inO) * 34 - seg(local, 0.72, 1) * 26}px)`;
      });

      // ---- Canvas: full-bleed → shrinks into card (0.26 → 0.38) ----
      const canvas = q(".ss-canvas");
      if (canvas) {
        const s = easeOut(seg(p, 0.26, 0.38));
        canvas.style.borderRadius = `${s * 22}px`;
        canvas.style.transform = `scale(${1 - s * 0.14}) translateY(${-s * 4}vh)`;
        canvas.style.filter = `brightness(${1 - s * 0.25})`;
      }
      // dark veil grows so stacked cards read clearly
      const veil = q(".ss-veil");
      if (veil) veil.style.opacity = String(0.25 + seg(p, 0.26, 0.4) * 0.45);

      // ---- Phase 2: stacking cards (0.32 → 0.62) ----
      const cards = qa(".ss-card");
      cards.forEach((el, i) => {
        const s = 0.32 + i * 0.1;
        const local = easeOut(seg(p, s, s + 0.09));
        el.style.transform = `translateY(${(1 - local) * 110}vh) scale(${0.94 + local * 0.06})`;
        // previous cards settle back slightly as the next stacks on
        const settle = easeOut(seg(p, s + 0.1, s + 0.19));
        if (i < cards.length - 1) {
          el.style.transform = `translateY(${(1 - local) * 110 - settle * 3}vh) scale(${
            0.94 + local * 0.06 - settle * 0.045
          })`;
          el.style.filter = `brightness(${1 - settle * 0.35})`;
        }
      });
      // card deck fades out before phase 3
      const deck = q(".ss-deck");
      if (deck) {
        const out = seg(p, 0.6, 0.68);
        deck.style.opacity = String(1 - out);
        deck.style.transform = `translateY(${-out * 8}vh)`;
        deck.style.pointerEvents = out > 0.5 ? "none" : "";
      }

      // ---- Phase 3: horizontal showcase (0.65 → 1) ----
      const rail = q(".ss-rail");
      const showcase = q(".ss-showcase");
      if (showcase) {
        const inO = seg(p, 0.63, 0.7);
        showcase.style.opacity = String(inO);
        showcase.style.pointerEvents = inO < 0.3 ? "none" : "";
      }
      if (rail) {
        const travel = rail.scrollWidth - rail.clientWidth;
        const x = easeOut(seg(p, 0.68, 0.985)) * travel;
        rail.style.transform = `translateX(${rtl ? x : -x}px)`;
      }

      // progress dots
      const ph = p < 0.3 ? 0 : p < 0.63 ? 1 : 2;
      if (ph !== lastPhase) {
        lastPhase = ph;
        setPhase(ph);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [animated, dir]);

  const CAPS = [
    { t: t("story_cap1_t"), d: t("story_cap1_d") },
    { t: t("story_cap2_t"), d: t("story_cap2_d") },
    { t: t("story_cap3_t"), d: t("story_cap3_d") },
  ];
  const CARDS = [
    { n: "01", t: t("story_card1_t"), d: t("story_card1_d") },
    { n: "02", t: t("story_card2_t"), d: t("story_card2_d") },
    { n: "03", t: t("story_card3_t"), d: t("story_card3_d") },
  ];

  /* ---------- Mobile / reduced-motion fallback: plain stacked blocks ---------- */
  if (!animated) {
    return (
      <section className="ss-fallback px-layer" aria-label={t("story_eyebrow")}>
        <div className="container">
          <Reveal className="section-head">
            <div>
              <h2>
                {t("story_eyebrow")}
                <span className="gold-line" />
              </h2>
            </div>
          </Reveal>
          <div className="ssf-hero">
            <img src={CANVAS_IMG} alt={t("story_cap1_t")} loading="lazy" />
            <div className="ssf-hero-text">
              <h3>{CAPS[0].t}</h3>
              <p>{CAPS[0].d}</p>
            </div>
          </div>
          <div className="ssf-cards">
            {CARDS.map((c) => (
              <Reveal key={c.n} className="ssf-card">
                <span className="ss-num">{c.n}</span>
                <h4>{c.t}</h4>
                <p>{c.d}</p>
              </Reveal>
            ))}
          </div>
          <h3 className="ssf-show-title">{t("story_showcase_t")}</h3>
          <div className="ssf-rail">
            {SHOWCASE.map((s) => (
              <Link key={s.slug} to={`/property/${s.slug}`} className="ss-banner">
                <img src={s.img} alt={lang === "ar" ? s.ar : s.en} loading="lazy" />
                <span>{lang === "ar" ? s.ar : s.en}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Desktop scrollytelling ---------- */
  return (
    <div ref={rootRef} className="ss-root" aria-label={t("story_eyebrow")}>
      <div ref={stageRef} className="ss-stage">
        {/* Fixed canvas */}
        <div className="ss-canvas" style={{ backgroundImage: `url(${CANVAS_IMG})` }}>
          <div className="ss-veil" />
        </div>

        {/* Phase indicator dots */}
        <div className="ss-dots" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`ss-dot ${phase === i ? "on" : ""}`} />
          ))}
        </div>

        {/* Eyebrow */}
        <span className="ss-eyebrow">{t("story_eyebrow")}</span>

        {/* Phase 1: callouts */}
        <div className="ss-caps">
          {CAPS.map((c, i) => (
            <div key={i} className="ss-cap" style={{ opacity: i === 0 ? 1 : 0 }}>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
            </div>
          ))}
        </div>

        {/* Phase 2: stacking cards */}
        <div className="ss-deck">
          {CARDS.map((c, i) => (
            <div key={c.n} className="ss-card" style={{ zIndex: i + 1, transform: "translateY(110vh)" }}>
              <span className="ss-num">{c.n}</span>
              <div>
                <h4>{c.t}</h4>
                <p>{c.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Phase 3: horizontal showcase */}
        <div className="ss-showcase" style={{ opacity: 0 }}>
          <h3>{t("story_showcase_t")}</h3>
          <div className="ss-rail">
            {SHOWCASE.map((s) => (
              <Link key={s.slug} to={`/property/${s.slug}`} className="ss-banner">
                <img src={s.img} alt={lang === "ar" ? s.ar : s.en} loading="lazy" />
                <span>{lang === "ar" ? s.ar : s.en}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
