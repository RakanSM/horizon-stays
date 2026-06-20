import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface KPICardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
  highlight?: boolean;
}
export function KPICard({ value, label, trend, trendValue, icon, className, highlight }: KPICardProps) {
  return (
    <div className={cn('bg-hs-bg2 border border-hs-border rounded-xl p-5 flex flex-col gap-3 hover:border-hs-primary/40 transition-colors', highlight && 'border-hs-primary/30 bg-hs-bg3', className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs text-hs-muted uppercase tracking-wider font-medium">{label}</span>
        {icon && <span className="text-hs-primary opacity-70">{icon}</span>}
      </div>
      <span className="text-2xl font-bold text-hs-primary font-serif">{typeof value === 'number' ? value.toLocaleString('ar-SA') : value}</span>
      {trend && trendValue && (
        <span className={cn('text-xs flex items-center gap-1', trend === 'up' ? 'text-hs-green' : trend === 'down' ? 'text-hs-red' : 'text-hs-muted')}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
        </span>
      )}
    </div>
  );
}
