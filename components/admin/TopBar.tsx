'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopBarProps { title: string; breadcrumb?: { label: string; href?: string }[]; actions?: React.ReactNode; }

export function TopBar({ title, breadcrumb, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-hs-bg/80 backdrop-blur-sm border-b border-hs-border">
      <div className="flex flex-col gap-0.5">
        {breadcrumb && (
          <nav className="flex items-center gap-1.5 text-xs text-hs-muted">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {crumb.href ? <Link href={crumb.href} className="hover:text-hs-primary transition-colors">{crumb.label}</Link> : <span>{crumb.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-serif font-semibold text-hs-text">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative p-2 text-hs-muted hover:text-hs-primary transition-colors rounded-lg hover:bg-hs-bg3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.916V4a1 1 0 10-2 0v1.084A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-hs-primary/20 border border-hs-primary/40 flex items-center justify-center text-hs-primary text-sm font-semibold">A</div>
      </div>
    </header>
  );
}
