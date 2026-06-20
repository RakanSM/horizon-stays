import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

const locales = ['ar', 'en', 'fr', 'zh', 'es'];

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();
  return children;
}
