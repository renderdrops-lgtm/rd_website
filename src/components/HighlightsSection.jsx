import React from 'react';
import { highlightsData, brandPartners } from '../data/studioData';
import { Star, Building2 } from 'lucide-react';

export default function HighlightsSection() {
  // Update stats data locally if highlightsData contains the sponsor wins count
  const updatedHighlights = highlightsData.map((item) => {
    if (item.title?.toLowerCase().includes('sponsor')) {
      return { ...item, stat: '4' };
    }
    return item;
  });

  const customPartners = [
    {
      role: 'TITLE PARTNER — AURAFESTA 2.0',
      name: 'THE INDIAN GARAGE CO',
      location: 'Bangalore',
      highlight: 'Unapologetic Indian high-street rebellion'
    },
    {
      role: 'TITLE PARTNER — AURAFESTA 2.0',
      name: 'PERIMETER SALON',
      location: 'Bangalore',
      highlight: 'Luxury grooming & lifestyle chain'
    },
    {
      role: 'SUPPORT PARTNER — AURAFESTA 2.0',
      name: 'FUSION GROOVE',
      location: 'Bangalore',
      highlight: 'Artful Café Experience to Savor'
    },
    {
      role: 'SUPPORT PARTNER — AURAFESTA 2.0',
      name: 'CAMPA COLA',
      location: 'Bangalore',
      highlight: 'Sweet Spark of Retro India'
    }
  ];

  return (
    <section id="highlights" className="py-28 px-4 sm:px-6 lg:px-8 bg-rd-dark border-y border-white/6 relative" style={{overflowX:'clip'}}>
      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-noise opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 pb-10 border-b border-white/8">
          <div className="section-label mb-5">
            <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
            04 / HIGHLIGHTS
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
              PROOF,{' '}
              <span
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.7)', color: 'transparent' }}
              >NOT PROMISES.</span>
            </h2>
            <p className="max-w-xs text-zinc-600 text-sm leading-relaxed lg:text-right">
              Numbers that show up. Work that delivers. Clients that return.
            </p>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {updatedHighlights.map((item, idx) => (
            <div
              key={idx}
              className="group bg-rd-card border border-white/8 hover:border-rd-red/50 p-7 flex flex-col gap-5 transition-all duration-400 relative overflow-hidden card-top-bar hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              {/* Subtle corner glow */}
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-rd-red/5 group-hover:bg-rd-red/10 rounded-full blur-2xl transition-all duration-500 pointer-events-none" />

              {/* Badge */}
              <div className="inline-flex items-center">
                <span className="px-2.5 py-1 bg-rd-red/12 border border-rd-red/20 text-rd-red text-[10px] font-black tracking-[0.25em] uppercase">
                  {item.badge}
                </span>
              </div>

              {/* Stat — metallic red gradient */}
              <div>
                <div className="font-display text-6xl sm:text-7xl text-white group-hover:text-rd-red transition-colors duration-400 leading-none tracking-tight">
                  {item.stat}
                  <span className="text-zinc-600 text-3xl ml-1 group-hover:text-rd-red/60 transition-colors">{item.label}</span>
                </div>
              </div>

              {/* Description */}
              <div className="relative z-10">
                <h4 className="font-black text-sm uppercase tracking-widest text-white mb-1.5">
                  {item.title}
                </h4>
                <p className="text-zinc-600 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom red accent */}
              <div className="h-[1.5px] w-0 group-hover:w-full bg-rd-red transition-all duration-500 ease-out" />
            </div>
          ))}
        </div>

        {/* Brand Partners */}
        <div className="border-t border-white/8 pt-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-[1px] bg-rd-red inline-block" />
            <span className="text-[11px] font-black tracking-[0.35em] text-zinc-500 uppercase">
              TRUSTED BY
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-rd-red fill-rd-red" />
              <Star className="w-3 h-3 text-rd-red fill-rd-red" />
              <Star className="w-3 h-3 text-rd-red fill-rd-red" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {customPartners.map((partner, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-5 bg-rd-card border border-white/8 hover:border-rd-red/40 p-6 transition-all duration-400 relative overflow-hidden red-strip hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 bg-rd-black border border-white/8 group-hover:border-rd-red/50 group-hover:bg-rd-red/5 flex items-center justify-center shrink-0 transition-all duration-300">
                  <Building2 className="w-4 h-4 text-zinc-600 group-hover:text-rd-red transition-colors" />
                </div>

                <div>
                  <span className="text-[10px] font-black tracking-[0.25em] text-rd-red uppercase block mb-1">
                    {partner.role}
                  </span>
                  <h4 className="font-display text-lg text-white uppercase tracking-tight mb-0.5 group-hover:text-rd-red transition-colors duration-300">
                    {partner.name}
                  </h4>
                  <p className="text-[11px] text-zinc-600">{partner.location}</p>
                  <p className="text-xs text-zinc-400 mt-2 font-medium">{partner.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chief Guest Callout */}
        <div className="mt-8 border border-rd-red/20 bg-rd-card relative overflow-hidden">
          {/* Ambient red glow */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-rd-red/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 bg-rd-red flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(227,27,46,0.5)]">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase mb-1">VIP PRODUCTION — AURAFESTA 2.0</div>
                <h4 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  BROGOWDA SHAMANTH
                </h4>
                <p className="text-xs text-zinc-500 mt-1">Chief Guest Feature</p>
              </div>
            </div>
            <div className="shrink-0 px-5 py-2.5 border border-rd-red/40 bg-rd-red/10 text-rd-red text-[10px] font-black tracking-[0.25em] uppercase whitespace-nowrap">
              1 CHIEF GUEST SPOTLIGHT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}