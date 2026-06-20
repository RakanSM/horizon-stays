'use client';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab { key: string; label: string; icon?: ReactNode; }
interface TabsProps { tabs: Tab[]; active: string; onChange: (key: string) => void; className?: string; }

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-hs-border', className)}>
      {tabs.map(tab => (
        <button key={tab.key} onClick={() => onChange(tab.key)}
          className={cn('flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            active === tab.key ? 'border-hs-primary text-hs-primary' : 'border-transparent text-hs-muted hover:text-hs-text hover:border-hs-border'
          )}>
          {tab.icon}{tab.label}
        </button>
      ))}
    </div>
  );
}
