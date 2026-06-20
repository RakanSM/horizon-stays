import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale = 'ar-SA') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string, locale = 'ar-SA') {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('en-CA').format(new Date(date));
}
