'use client';
import Link from 'next/link';
import { useState } from 'react';

export function NavBar({ locale = 'ar' }: { locale?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-transparent">
      <div className="absolute inset-0 bg-gradient-to-b from-hs-bg/80 to-transparent pointer-events-none" />
      <Link href={`/${locale}`} className="relative z-10 text-hs-primary font-serif font-bold text-xl tracking-widest">
        HORIZON STAYS
      </Link>
      <div className="relative z-10 flex items-center gap-4">
        <Link href={`/${locale === 'ar' ? 'en' : 'ar'}`} className="text-hs-muted hover:text-hs-primary text-sm transition-colors px-3 py-1.5 border border-hs-border rounded-md">
          {locale === 'ar' ? 'EN' : 'AR'}
        </Link>
        <Link href={`/${locale}#booking`} className="bg-hs-primary text-hs-bg px-4 py-2 rounded-md text-sm font-semibold hover:bg-hs-primary2 transition-colors">
          {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
        </Link>
      </div>
    </nav>
  );
}
