import React from 'react';
import { manifestoPillars } from '../data/studioData';

export default function ManifestoSection() {
  return (
    <section id="about" className="py-28 px-4 sm:px-6 lg:px-8 bg-rd-black relative" style={{overflowX:'clip'}}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-rd-red/7 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 pb-10 border-b border-white/8">
          <div className="section-label mb-5">
            <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
            03 / MANIFESTO
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none max-w-4xl">
              BORN IN A COMMITTEE.<br />
              <span
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.7)', color: 'transparent' }}
              >BUILT LIKE A STUDIO.</span>
            </h2>
            <p className="max-w-xs text-zinc-600 text-sm leading-relaxed lg:text-right">
              We're the creative unit you didn't know existed — wired for impact, built for deadlines, running on obsession.
            </p>
          </div>
        </div>

        {/* Three Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {manifestoPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="group bg-rd-card border border-white/8 hover:border-rd-red/40 p-8 flex flex-col justify-between transition-all duration-400 relative overflow-hidden card-top-bar hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            >
              {/* Subtle corner glow */}
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-rd-red/6 group-hover:bg-rd-red/12 rounded-full blur-3xl transition-all duration-600 pointer-events-none" />

              <div className="relative z-10">
                {/* Tag + Number row */}
                <div className="flex items-center justify-between mb-8">
                  <span className="px-3 py-1.5 bg-rd-red/12 border border-rd-red/25 text-rd-red text-[10px] font-black tracking-[0.3em] uppercase">
                    {pillar.tag}
                  </span>
                  <span
                    className="font-display text-5xl font-black leading-none"
                    style={{ WebkitTextStroke: '1px rgba(255,255,255,0.12)', color: 'transparent' }}
                  >
                    0{idx + 1}
                  </span>
                </div>

                {/* Subtitle */}
                <div className="text-[10px] font-black tracking-[0.28em] text-zinc-600 uppercase mb-3">
                  {pillar.title}
                </div>

                {/* Big Headline */}
                <h3 className="font-display text-2xl sm:text-3xl uppercase text-white group-hover:text-rd-red transition-colors duration-400 leading-tight mb-5">
                  {pillar.headline}
                </h3>

                {/* Body */}
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Bottom divider that fills red on hover */}
              <div className="mt-8 pt-5 border-t border-white/8 relative z-10">
                <div className="w-0 group-hover:w-full h-[2px] bg-gradient-to-r from-rd-red to-rd-red/30 transition-all duration-600 ease-out" />
              </div>
            </div>
          ))}
        </div>

        {/* Watermark text */}
        <div className="mt-20 text-center overflow-hidden">
          <p className="font-display text-[clamp(2.5rem,8vw,7rem)] text-white/5 tracking-tight uppercase select-none leading-none">
            RENDERDROPS.CO
          </p>
        </div>
      </div>
    </section>
  );
}
