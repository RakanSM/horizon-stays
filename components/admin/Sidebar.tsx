'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: '⬛' },
  { href: '/admin/bookings', label: 'الحجوزات', icon: '📅' },
  { href: '/admin/calendar', label: 'التقويم', icon: '🗓️' },
  { href: '/admin/properties', label: 'الوحدات', icon: '🏢' },
  { href: '/admin/messages', label: 'الرسائل', icon: '💬' },
  { href: '/admin/financials', label: 'المالية', icon: '📊' },
  { href: '/admin/cleaning', label: 'التنظيف', icon: '🧹' },
  { href: '/admin/maintenance', label: 'الصيانة', icon: '🔧' },
  { href: '/admin/locks', label: 'الأقفال الذكية', icon: '🔒' },
  { href: '/admin/banners', label: 'مكتبة البانرات', icon: '🖼️' },
];
const financeItems = [
  { href: '/admin/claims', label: 'المطالبات', icon: '⚠️' },
  { href: '/admin/expenses', label: 'المصروفات', icon: '💰' },
];
const bottomItems = [
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <aside className={cn('flex flex-col bg-hs-bg2 border-e border-hs-border h-screen sticky top-0 transition-all duration-300 z-40', collapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-hs-border">
        {!collapsed && <span className="text-hs-primary font-serif font-bold text-lg tracking-wide">Horizon Stays</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-hs-muted hover:text-hs-primary transition-colors p-1 rounded">
          {collapsed ? '→' : '←'}
        </button>
      </div>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-0.5">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              isActive(item.href) ? 'bg-hs-primary/15 text-hs-primary' : 'text-hs-muted hover:text-hs-text hover:bg-hs-bg3'
            )}>
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
        {/* Gold divider */}
        <div className="my-2 border-t border-hs-primary/20" />
        {financeItems.map(item => (
          <Link key={item.href} href={item.href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              isActive(item.href) ? 'bg-hs-primary/15 text-hs-primary' : 'text-hs-muted hover:text-hs-text hover:bg-hs-bg3'
            )}>
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      {/* Bottom */}
      <div className="border-t border-hs-border px-2 py-3 flex flex-col gap-0.5">
        {bottomItems.map(item => (
          <Link key={item.href} href={item.href}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              isActive(item.href) ? 'bg-hs-primary/15 text-hs-primary' : 'text-hs-muted hover:text-hs-text hover:bg-hs-bg3'
            )}>
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}
