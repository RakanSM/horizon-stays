'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-hs-muted font-medium">{label}</label>}
      <input type="date" ref={ref}
        className={cn('w-full bg-hs-bg2 border border-hs-border rounded-md px-3 py-2 text-hs-text focus:outline-none focus:border-hs-primary transition-colors [color-scheme:dark]', error && 'border-hs-red', className)}
        {...props}
      />
      {error && <span className="text-xs text-hs-red">{error}</span>}
    </div>
  )
);
DatePicker.displayName = 'DatePicker';
