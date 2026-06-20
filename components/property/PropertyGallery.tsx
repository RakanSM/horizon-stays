'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  name: string;
}

export function PropertyGallery({ images, name }: PropertyGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  ];

  return (
    <div className="relative">
      {/* Main image */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        <div className="absolute inset-0 bg-hs-bg3">
          <Image src={displayImages[activeIdx]} alt={`${name} - ${activeIdx + 1}`} fill className="object-cover" priority={activeIdx === 0} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-hs-bg/80" />
        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setActiveIdx(i => (i - 1 + displayImages.length) % displayImages.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-hs-bg/60 hover:bg-hs-bg border border-hs-border rounded-full flex items-center justify-center text-hs-text transition-colors">
              ‹
            </button>
            <button onClick={(e) => { e.stopPropagation(); setActiveIdx(i => (i + 1) % displayImages.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-hs-bg/60 hover:bg-hs-bg border border-hs-border rounded-full flex items-center justify-center text-hs-text transition-colors">
              ›
            </button>
          </>
        )}
        {/* Counter */}
        <div className="absolute bottom-4 right-4 bg-hs-bg/70 text-hs-muted text-xs px-3 py-1 rounded-full">
          {activeIdx + 1} / {displayImages.length}
        </div>
      </div>
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 px-4 py-3 bg-hs-bg2 overflow-x-auto">
          {displayImages.map((img, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={cn('relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors', activeIdx === i ? 'border-hs-primary' : 'border-hs-border')}>
              <Image src={img} alt={`thumb ${i}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-hs-primary" onClick={() => setLightboxOpen(false)}>✕</button>
          <div className="relative w-full max-w-5xl h-[80vh] mx-4">
            <Image src={displayImages[activeIdx]} alt={name} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
