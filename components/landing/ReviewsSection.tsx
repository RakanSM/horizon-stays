'use client';

import { useRef } from 'react';
import type { LandingReview } from './types';

const fallbackReviews: LandingReview[] = [
  { id: 'r1', guest_name: 'عبدالله', rating: 5, review_text: 'تجربة راقية جداً، التفاصيل والخدمة كانت بمستوى فندقي ممتاز.', created_at: '2024-05-18' },
  { id: 'r2', guest_name: 'Sarah', rating: 5, review_text: 'Beautiful apartment, spotless check-in, and a stunning Riyadh view.', created_at: '2024-04-22' },
  { id: 'r3', guest_name: 'نورة', rating: 5, review_text: 'الموقع مثالي والخصوصية عالية. سأكرر التجربة بالتأكيد.', created_at: '2024-03-11' },
];

export function ReviewsSection({ reviews, locale }: { reviews: LandingReview[]; locale: string }) {
  const isAr = locale === 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayReviews = reviews.length ? reviews : fallbackReviews;
  const scroll = (direction: 'next' | 'previous') => {
    const amount = direction === 'next' ? 380 : -380;
    scrollRef.current?.scrollBy({ left: isAr ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-hs-bg px-6 py-24">
      {/* @section: reviews */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-hs-primary">
              {isAr ? 'آراء الضيوف' : 'Guest reviews'}
            </p>
            <h2 className="font-serif text-4xl font-semibold text-hs-text md:text-6xl">
              {isAr ? 'إقامات يتحدث عنها ضيوفنا' : 'Stays our guests remember'}
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scroll('previous')} className="h-11 w-11 rounded-full border border-hs-border text-hs-primary transition hover:bg-hs-bg3" aria-label="Previous reviews">‹</button>
            <button onClick={() => scroll('next')} className="h-11 w-11 rounded-full border border-hs-border text-hs-primary transition hover:bg-hs-bg3" aria-label="Next reviews">›</button>
          </div>
        </div>
        <div ref={scrollRef} className="flex snap-x gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {displayReviews.map((review, index) => {
            const name = review.guest_name || review.name || (isAr ? 'ضيف Horizon' : 'Horizon Guest');
            const text = review.review_text || review.comment || '';
            const rating = Math.max(1, Math.min(5, Number(review.rating || 5)));
            const date = review.created_at || review.date;
            return (
              <article key={review.id || index} className="min-w-[310px] snap-start rounded-3xl border border-hs-border bg-hs-bg2 p-6 md:min-w-[380px]">
                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hs-primary text-lg font-bold text-hs-bg">
                    {name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-hs-text">{name}</h3>
                    <p className="text-xs text-hs-muted">{date ? new Date(date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : isAr ? 'ضيف موثق' : 'Verified guest'}</p>
                  </div>
                </div>
                <div className="mb-4 text-lg text-hs-primary" aria-label={`${rating} stars`}>
                  {'★'.repeat(rating)}<span className="text-hs-muted">{'★'.repeat(5 - rating)}</span>
                </div>
                <p className="leading-8 text-hs-muted">“{text}”</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
