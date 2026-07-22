'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { href: '#hero',       arLabel: 'الرئيسية',  enLabel: 'Home' },
  { href: '#properties', arLabel: 'الوحدات',   enLabel: 'Properties' },
  { href: '#contact',    arLabel: 'تواصل معنا', enLabel: 'Contact' },
];

export function NavBar({ locale = 'ar' }: { locale?: string }) {
  const isAr = locale === 'ar';
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [activeHash, setActiveHash] = useState('');

  /* ── scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── active section via IntersectionObserver ── */
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHash('#' + id); },
        { threshold: 0.45 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 px-6 transition-all duration-300 ${
        scrolled
          ? 'bg-hs-bg/95 py-3 shadow-lg shadow-black/40 backdrop-blur-xl border-b border-hs-border'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-serif text-xl font-bold tracking-widest text-hs-primary transition-opacity duration-300 hover:opacity-80"
        >
          HORIZON STAYS
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = activeHash === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`relative pb-1 text-sm font-medium transition-colors duration-300 ${
                  isActive ? 'text-hs-primary' : 'text-hs-muted hover:text-hs-text'
                }`}
              >
                {isAr ? link.arLabel : link.enLabel}
                {/* gold underline on active */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-px bg-hs-primary transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <Link
            href={`/${locale === 'ar' ? 'en' : 'ar'}`}
            className="rounded-md border border-hs-border px-3 py-1.5 text-sm text-hs-muted transition-all duration-300 hover:border-hs-primary hover:text-hs-primary"
          >
            {locale === 'ar' ? 'EN' : 'AR'}
          </Link>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Book Now */}
          <Link
            href={`/${locale}#booking`}
            className="rounded-md bg-hs-primary px-4 py-2 text-sm font-semibold text-hs-bg transition-all duration-300 hover:bg-hs-primary2 hover:scale-105"
          >
            {isAr ? 'احجز الآن' : 'Book Now'}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="flex md:hidden flex-col justify-center gap-[5px] p-2"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={`block h-px w-6 bg-hs-text transition-all duration-300 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-6 bg-hs-text transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-6 bg-hs-text transition-all duration-300 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="hs-menu-open md:hidden mt-2 rounded-xl border border-hs-border bg-hs-bg2/95 backdrop-blur-xl px-5 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-hs-muted border-b border-hs-border last:border-none hover:text-hs-primary transition-colors duration-200"
            >
              {isAr ? link.arLabel : link.enLabel}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
