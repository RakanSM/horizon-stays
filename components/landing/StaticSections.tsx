'use client';
import { useEffect, useRef } from 'react';

/* ──────────────────────────────────────────────
   Intersection-Observer fade-in hook
────────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('hs-fade-in');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('hs-visible');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ────────────────────────────────────────────── */

export function HeroSection({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Animated background layers with enhanced gradients */}
      <div className="absolute inset-0 bg-hs-bg">
        {/* Primary gradient animation */}
        <div className="hs-hero-gradient-anim absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(12,10,8,0.3)_34%,rgba(12,10,8,0.95)),radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.25),transparent_28%),linear-gradient(120deg,#1a1815,#050403_58%,#0f0d0a)]" />
        
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-hs-bg/30 via-hs-bg/50 to-hs-bg" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--hs-primary)_0%,_transparent_68%)]" />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-hs-bg to-transparent" />
        
        {/* Animated accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hs-primary to-transparent opacity-50" />
      </div>

      {/* Hero content with enhanced typography */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.45em] text-hs-primary animate-fade-in">
          {isAr ? 'الرياض · المملكة العربية السعودية' : 'RIYADH · SAUDI ARABIA'}
        </p>
        
        <h1 className="mb-6 font-serif text-5xl font-bold leading-none tracking-tight text-hs-text md:text-7xl lg:text-8xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Horizon<br /><span className="text-hs-primary">Stays</span>
        </h1>
        
        <p className="mb-10 text-lg font-light text-hs-text-secondary md:text-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {isAr ? 'وحدات سكنية فاخرة · إقامة استثنائية' : 'Luxury Living · Exceptional Experience'}
        </p>
        
        <a
          href="#properties"
          className="hs-cta-pulse inline-flex items-center gap-3 rounded-full bg-hs-primary px-8 py-4 text-base font-semibold text-hs-bg transition-all duration-300 hover:scale-110 md:text-lg shadow-lg hover:shadow-gold-lg"
          style={{ animationDelay: '0.3s' }}
        >
          {isAr ? 'استكشف الوحدات' : 'Explore Properties'}
          <span>↓</span>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2">
        <div className="h-12 w-px bg-gradient-to-b from-hs-primary to-transparent" />
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────── */

export function VideoTourSection({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const ref = useFadeIn();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="bg-hs-bg px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-hs-primary">
          {isAr ? 'شاهد التجربة' : 'See the experience'}
        </p>
        <h2 className="mb-8 font-serif text-4xl font-semibold text-hs-text md:text-6xl">
          {isAr ? 'جولة افتراضية' : 'Virtual Tour'}
        </h2>
        
        <div className="group relative aspect-video overflow-hidden rounded-[2rem] border border-hs-border bg-gradient-to-br from-hs-bg4 via-hs-bg3 to-hs-primary/10 shadow-2xl shadow-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_34%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="flex h-24 w-24 items-center justify-center rounded-full border border-hs-primary/40 bg-hs-bg/70 text-4xl text-hs-primary shadow-xl backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:border-hs-primary group-hover:shadow-gold-lg"
              aria-label={isAr ? 'تشغيل الجولة' : 'Play tour'}
            >
              ▶
            </button>
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-hs-border bg-hs-bg/70 p-4 text-start backdrop-blur">
            <p className="font-serif text-2xl text-hs-text">
              {isAr ? 'إطلالة الرياض · تفاصيل فندقية · خصوصية كاملة' : 'Riyadh skyline · Hotel-grade details · Complete privacy'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────── */

export function MapSection({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const ref = useFadeIn();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="bg-hs-bg px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-hs-primary">
            {isAr ? 'الموقع' : 'Location'}
          </p>
          <h2 className="font-serif text-4xl font-semibold text-hs-text md:text-6xl">
            {isAr ? 'وحداتنا على الخريطة' : 'Our Properties on the Map'}
          </h2>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-hs-border bg-hs-bg3 shadow-2xl shadow-black/30">
          <iframe
            title={isAr ? 'خريطة موقع Horizon Stays في الرياض' : 'Horizon Stays Riyadh map'}
            src="https://www.google.com/maps?q=24.7136,46.6753&z=12&output=embed"
            className="h-[420px] w-full border-0 grayscale-[25%] invert-[90%] hue-rotate-180"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────── */

export function FooterSection({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  return (
    <footer
      id="contact"
      className="bg-hs-bg px-6 py-12"
      style={{ borderTop: '1px solid rgba(212,175,55,0.25)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <h2 className="font-serif text-4xl font-bold text-hs-primary">Horizon Stays</h2>
            <p className="mt-4 max-w-sm leading-7 text-hs-muted">
              {isAr
                ? 'ضيافة فاخرة وإقامات قصيرة المدى مصممة بعناية في قلب الرياض.'
                : 'Luxury hospitality and carefully curated short-term stays in the heart of Riyadh.'}
            </p>
          </div>
          <div className="space-y-3 text-hs-muted">
            <h3 className="font-semibold text-hs-text">{isAr ? 'بيانات التواصل' : 'Contact'}</h3>
            <p>{isAr ? 'حي المرسلات، الرياض، المملكة العربية السعودية' : 'Al Mursalat District, Riyadh, Saudi Arabia'}</p>
            <p>0560903335</p>
            <p>matar@m6rsa.com</p>
          </div>
          <div className="space-y-3 text-hs-muted">
            <h3 className="font-semibold text-hs-text">{isAr ? 'تابعنا' : 'Follow'}</h3>
            <div className="flex flex-wrap gap-3">
              {['Instagram', 'X', 'Snapchat'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-full border border-hs-border px-4 py-2 text-sm transition-all duration-300 hover:border-hs-primary hover:text-hs-primary hover:bg-hs-bg3"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-hs-border pt-6 text-center text-sm text-hs-muted">
          {isAr
            ? 'جميع الحقوق محفوظة © 2025 Horizon Stays'
            : 'All rights reserved © 2025 Horizon Stays'}
        </div>
      </div>
    </footer>
  );
}
