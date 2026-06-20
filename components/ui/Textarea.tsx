'use client';
import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-hs-muted font-medium">{label}</label>}
      <textarea ref={ref} rows={4}
        className={cn('w-full bg-hs-bg2 border border-hs-border rounded-md px-3 py-2 text-hs-text placeholder:text-hs-muted focus:outline-none focus:border-hs-primary focus:ring-1 focus:ring-hs-primary/30 transition-colors resize-y', error && 'border-hs-red', className)}
        {...props}
      />
      {error && <span className="text-xs text-hs-red">{error}</span>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
