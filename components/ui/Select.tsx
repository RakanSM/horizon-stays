'use client';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-hs-muted font-medium">{label}</label>}
      <select ref={ref} className={cn('w-full bg-hs-bg2 border border-hs-border rounded-md px-3 py-2 text-hs-text focus:outline-none focus:border-hs-primary transition-colors appearance-none cursor-pointer', error && 'border-hs-red', className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="text-xs text-hs-red">{error}</span>}
    </div>
  )
);
Select.displayName = 'Select';
