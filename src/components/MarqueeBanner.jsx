import React from 'react';

const MARQUEE_ITEMS = [
  { text: 'VFX / VIDEO', color: 'red' },
  { text: 'PHOTOGRAPHY', color: 'white' },
  { text: 'PR / EVENT', color: 'red' },
  { text: 'DESIGN', color: 'white' },
];

function SparkleIcon() {
  return (
    <svg
      className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-rd-red fill-current mx-6 sm:mx-10 md:mx-14 shrink-0"
      viewBox="0 0 24 24"
    >
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
    </svg>
  );
}

function MarqueeContent() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="flex items-center shrink-0">
      {items.map((item, idx) => (
        <span key={idx} className="inline-flex items-center">
          <span
            className={`font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider select-none uppercase ${
              item.color === 'red'
                ? 'text-transparent [-webkit-text-stroke:1.5px_#E31B2E]'
                : 'text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.45)]'
            }`}
          >
            {item.text}
          </span>
          <SparkleIcon />
        </span>
      ))}
    </div>
  );
}

export default function MarqueeBanner() {
  return (
    <div className="relative w-full bg-[#090909] py-8 sm:py-12 select-none overflow-hidden" style={{ overflowX: 'clip' }}>
      {/* Gradient edge masks for smooth bleed */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 sm:w-44 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #090909 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 sm:w-44 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #090909 0%, transparent 100%)' }}
      />

      {/* Single Marquee Row */}
      <div className="flex w-fit">
        <div className="flex shrink-0 items-center animate-marquee whitespace-nowrap will-change-transform">
          <MarqueeContent />
        </div>
        <div className="flex shrink-0 items-center animate-marquee whitespace-nowrap will-change-transform" aria-hidden="true">
          <MarqueeContent />
        </div>
      </div>
    </div>
  );
}
