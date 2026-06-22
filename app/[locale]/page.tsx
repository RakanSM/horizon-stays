import type { Metadata } from 'next';
import { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import { NavBar } from '@/components/landing/NavBar';
import { WhatsAppFloat } from '@/components/landing/WhatsAppFloat';
import { SearchSection } from '@/components/landing/SearchSection';
import { PropertiesSection } from '@/components/landing/PropertiesSection';
import { ReviewsSection } from '@/components/landing/ReviewsSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { HeroSection, VideoTourSection, FooterSection } from '@/components/landing/StaticSections';
import { createClient } from '@supabase/supabase-js';
import type { LandingProperty, LandingReview } from '@/components/landing/types';

export const dynamic = 'force-dynamic';

const PropertyMap = nextDynamic(() => import('@/components/landing/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl overflow-hidden flex items-center justify-center bg-hs-bg2 border border-hs-border"
      style={{ height: '400px' }}
    >
      <span className="text-hs-muted text-sm">Loading map…</span>
    </div>
  ),
});

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  const title = isAr ? 'Horizon Stays | فلل وشقق فاخرة في الرياض' : 'Horizon Stays | Luxury Villas & Apartments in Riyadh';
  const description = isAr
    ? 'وحدات سكنية فاخرة في الرياض للإيجار اليومي والأسبوعي. بنتهاوس، سويت، لوفت بأعلى مستويات الخدمة.'
    : 'Premium furnished apartments and villas in Riyadh for daily and weekly rental. Penthouse, Suite, Loft with world-class service.';
  return {
    title,
    description,
    keywords: isAr
      ? ['شقق فاخرة الرياض', 'إيجار يومي', 'بنتهاوس الرياض', 'Horizon Stays']
      : ['luxury apartments Riyadh', 'short term rental', 'furnished apartments', 'Horizon Stays'],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://horizonstays.com/${params.locale}`,
      siteName: 'Horizon Stays',
      images: [{ url: 'https://horizonstays.com/og-image.jpg', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `https://horizonstays.com/${params.locale}`,
      languages: { ar: '/ar', en: '/en', fr: '/fr', zh: '/zh', es: '/es' },
    },
  };
}

async function getLandingData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [{ data: properties }, { data: reviews }] = await Promise.all([
      supabase.from('properties').select('*').eq('status', 'available').order('base_price_night', { ascending: false }),
      supabase.from('guest_reviews' as never).select('*').order('created_at', { ascending: false }).limit(10),
    ]);
    return {
      properties: (properties ?? []) as unknown as LandingProperty[],
      reviews: (reviews ?? []) as unknown as LandingReview[],
    };
  } catch {
    return { properties: [] as LandingProperty[], reviews: [] as LandingReview[] };
  }
}

export default async function LandingPage({ params }: { params: { locale: string } }) {
  const { properties, reviews } = await getLandingData();
  const isAr = params.locale === 'ar';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Horizon Stays',
    url: 'https://horizonstays.com',
    telephone: '+966560903335',
    address: { '@type': 'PostalAddress', addressLocality: 'Riyadh', addressCountry: 'SA' },
    priceRange: '$$$$',
    description: 'Luxury furnished apartments and villas in Riyadh for short-term rental',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavBar locale={params.locale} />
      <HeroSection locale={params.locale} />
      <div className="relative z-10 -mt-16 mx-auto max-w-5xl px-6">
        <SearchSection locale={params.locale} />
      </div>
      <Suspense fallback={<div className="bg-hs-bg p-12 text-center text-hs-muted">Loading...</div>}>
        <PropertiesSection properties={properties} locale={params.locale} />
      </Suspense>
      <VideoTourSection locale={params.locale} />
      <ReviewsSection reviews={reviews} locale={params.locale} />

      {/* Interactive Price Map */}
      <section className="bg-hs-bg2/40 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-hs-primary">
              {isAr ? 'الموقع' : 'Location'}
            </p>
            <h2 className="font-serif text-4xl font-semibold text-hs-text md:text-6xl">
              {isAr ? 'وحداتنا على الخريطة' : 'Our Properties on the Map'}
            </h2>
            <p className="mt-3 text-hs-muted text-sm">
              {isAr
                ? 'اضغط على السعر لعرض تفاصيل الوحدة — قم بالتكبير لرؤية الأسماء'
                : 'Tap a price pin for details — zoom in to see property names'}
            </p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-hs-border shadow-2xl shadow-black/30">
            <PropertyMap locale={params.locale} />
          </div>
        </div>
      </section>

      <ContactSection locale={params.locale} />
      <FooterSection locale={params.locale} />
      <WhatsAppFloat />
    </>
  );
}
