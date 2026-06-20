'use client';
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-hs-muted font-medium">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-hs-bg2 border border-hs-border rounded-md px-3 py-2 text-hs-text placeholder:text-hs-muted',
          'focus:outline-none focus:border-hs-primary focus:ring-1 focus:ring-hs-primary/30',
          'transition-colors duration-200',
          error && 'border-hs-red focus:border-hs-red focus:ring-hs-red/30',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-hs-red">{error}</span>}
      {hint && !error && <span className="text-xs text-hs-muted">{hint}</span>}
    </div>
  )
);
Input.displayName = 'Input';
