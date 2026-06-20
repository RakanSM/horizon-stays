import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps { title: string; subtitle?: string; actions?: ReactNode; className?: string; }

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h1 className="text-2xl font-serif font-bold text-hs-text">{title}</h1>
        {subtitle && <p className="text-sm text-hs-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
