import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Noto_Sans_Arabic } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './providers';

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Horizon Stays',
  description: 'Luxury stays in Riyadh managed by Horizon Stays.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale || 'ar'} dir={dir}>
      <body
        className={`${notoSansArabic.variable} ${cormorantGaramond.variable} ${inter.variable} min-h-screen bg-hs-bg text-hs-text antialiased ${
          locale === 'ar' ? 'font-arabic' : 'font-body'
        }`}
      >
        <Providers locale={locale} messages={messages}>{children}</Providers>
      </body>
    </html>
  );
}
