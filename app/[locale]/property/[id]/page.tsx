import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { NavBar } from '@/components/landing/NavBar';
import { WhatsAppFloat } from '@/components/landing/WhatsAppFloat';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { BookingSidebar } from '@/components/property/BookingSidebar';
import { PropertyTabs } from '@/components/property/PropertyTabs';
import type { Property, GuestReview, Booking } from '@/types';

interface Props {
  params: { locale: string; id: string };
  searchParams: { style?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient();
  const { data } = await supabase.from('properties').select('*').eq('id', params.id).single();
  const property = data as unknown as Property | null;
  if (!property) return { title: 'Property Not Found' };
  const isAr = params.locale === 'ar';
  const title = isAr
    ? `${property.internal_name} | Horizon Stays — إيجار فاخر بالرياض`
    : `${property.internal_name} | Horizon Stays — Luxury Rental Riyadh`;
  const description = isAr
    ? `${property.type} فاخر، ${property.bedrooms} غرفة نوم، ${property.area_sqm} م²، الطابق ${property.floor}. متاح للإيجار اليومي.`
    : `Luxury ${property.type}, ${property.bedrooms} bed, ${property.area_sqm}sqm, floor ${property.floor}. Available for daily rental.`;
  return {
    title,
    description,
    openGraph: {
      title, description, type: 'website',
      url: `https://horizonstays.com/${params.locale}/property/${params.id}`,
      images: property.images?.[0] ? [{ url: property.images[0] }] : [],
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `https://horizonstays.com/${params.locale}/property/${params.id}` },
  };
}

export async function generateStaticParams() {
  // Returns empty array — uses ISR for dynamic generation
  return [];
}

export const revalidate = 3600; // ISR: regenerate every hour

export default async function PropertyPage({ params, searchParams }: Props) {
  const supabase = createServerClient();
  const [{ data: propertyData }, { data: reviewsData }, { data: bookingsData }] = await Promise.all([
    supabase.from('properties').select('*, owner:property_owners(owner_name)').eq('id', params.id).single(),
    supabase.from('guest_reviews').select('*').eq('property_id', params.id).order('created_at', { ascending: false }),
    supabase.from('bookings').select('check_in, check_out, status').eq('property_id', params.id).in('status', ['confirmed', 'checked_in']),
  ]);

  const property = propertyData as unknown as Property | null;
  const reviews = (reviewsData ?? []) as unknown as GuestReview[];
  const bookings = (bookingsData ?? []) as unknown as Pick<Booking, 'check_in' | 'check_out' | 'status'>[];

  if (!property) notFound();

  const isEditorial = searchParams.style === 'editorial';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: property.internal_name,
    description: `Luxury ${property.type} in Riyadh`,
    offers: {
      '@type': 'Offer',
      price: property.base_price_night,
      priceCurrency: 'SAR',
      availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavBar locale={params.locale} />
      {isEditorial ? (
        <EditorialLayout property={property} reviews={reviews ?? []} bookings={bookings ?? []} locale={params.locale} />
      ) : (
        <StandardLayout property={property} reviews={reviews ?? []} bookings={bookings ?? []} locale={params.locale} />
      )}
      <WhatsAppFloat />
    </>
  );
}

function StandardLayout({ property, reviews, bookings, locale }: LayoutProps) {
  const isAr = locale === 'ar';
  return (
    <main className="min-h-screen bg-hs-bg" dir={isAr ? 'rtl' : 'ltr'}>
      <PropertyGallery images={property.images} name={property.internal_name} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-hs-text">{property.internal_name}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-hs-muted">
                  <span className="capitalize">{property.type}</span>
                  <span>·</span>
                  <span>{property.bedrooms} {isAr ? 'غرف' : 'beds'}</span>
                  <span>·</span>
                  <span>{property.area_sqm} م²</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full border ${property.status === 'available' ? 'bg-hs-green/10 text-hs-green border-hs-green/30' : 'bg-hs-red/10 text-hs-red border-hs-red/30'}`}>
                {isAr ? (property.status === 'available' ? 'متاح' : 'محجوز') : property.status}
              </span>
            </div>
            <PropertyTabs property={property} reviews={reviews} bookings={bookings} locale={locale} />
          </div>
          <div className="lg:col-span-1">
            <BookingSidebar property={property} locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}

function EditorialLayout({ property, reviews, bookings, locale }: LayoutProps) {
  const isAr = locale === 'ar';
  return (
    <main className="min-h-screen bg-hs-bg" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Full-width hero */}
      <div className="relative h-screen">
        <PropertyGallery images={property.images} name={property.internal_name} />
        <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-hs-bg">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-hs-text leading-none mb-4">{property.internal_name}</h1>
          <p className="text-hs-primary text-xl font-serif italic">{property.type} · {isAr ? 'الرياض' : 'Riyadh'}</p>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <PropertyTabs property={property} reviews={reviews} bookings={bookings} locale={locale} />
        </div>
        <div>
          <BookingSidebar property={property} locale={locale} />
        </div>
      </div>
    </main>
  );
}

interface LayoutProps {
  property: Property;
  reviews: GuestReview[];
  bookings: Pick<Booking, 'check_in' | 'check_out' | 'status'>[];
  locale: string;
}
