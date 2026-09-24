import React, { useState } from 'react';
import { servicesData } from '../data/studioData';
import { Layout, Video, Camera, Megaphone, ArrowUpRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

const icons = { Layout, Video, Camera, Megaphone };

/* Service images */
const serviceImages = {
  '01': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
  '02': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
  '03': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
  '04': 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
};

export default function ServicesSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section id="services" className="bg-[#f5f2ed] text-rd-dark-text py-28 px-4 sm:px-6 lg:px-8" style={{overflowX:'clip'}}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-8 border-b border-zinc-300/70 gap-6">
          <div>
            <div className="text-rd-red font-mono text-xs font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
              <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
              02 / WHAT WE DO
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-none text-rd-dark-text">
              FOUR CRAFTS.<br />
              <span className="text-rd-red">ONE STANDARD:</span>{' '}
              <span className="[-webkit-text-stroke:1.5px_#141414] text-transparent">LOUD.</span>
            </h2>
          </div>
          <p className="max-w-xs text-zinc-500 text-sm leading-relaxed md:text-right">
            Every discipline executed at full throttle. No filler, no fluff — just work that commands attention.
          </p>
        </div>

        {/* Main grid — 42% image left, service rows right */}
        <div className="flex flex-col lg:flex-row gap-0 min-h-[520px]">

          {/* Left: Image reveal pane */}
          <div className="hidden lg:block relative w-[42%] shrink-0 bg-zinc-950 overflow-hidden">
            {/* Service images — fade in on hover */}
            {servicesData.map((service) => (
              <div
                key={service.number}
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  opacity: hovered === service.number ? 1 : 0,
                  transform: hovered === service.number ? 'scale(1)' : 'scale(1.07)',
                }}
              >
                <img
                  src={serviceImages[service.number]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Info badge at bottom */}
                <div
                  className="absolute bottom-8 left-8 right-8 transition-all duration-500"
                  style={{
                    transform: hovered === service.number ? 'translateY(0)' : 'translateY(16px)',
                    opacity: hovered === service.number ? 1 : 0,
                  }}
                >
                  <div className="text-rd-red font-mono text-[11px] tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-rd-red inline-block" />
                    {service.number}
                  </div>
                  <h3 className="text-white font-display text-2xl sm:text-3xl uppercase tracking-tight leading-tight mb-2">
                    {service.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{service.summary}</p>
                </div>
              </div>
            ))}

            {/* Default state — logo */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black select-none pointer-events-none transition-all duration-700"
              style={{
                opacity: hovered ? 0 : 1,
                transform: hovered ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              <div className="absolute w-72 h-72 bg-rd-red/12 blur-[100px] rounded-full pointer-events-none" />
              <img
                src={logoImg}
                alt="Render Drops"
                className="w-52 max-w-[80%] h-auto object-contain relative z-10 drop-shadow-[0_16px_48px_rgba(227,27,46,0.4)] animate-float"
              />
              <div className="mt-8 text-zinc-600 font-mono text-[10px] tracking-[0.35em] uppercase text-center relative z-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rd-red animate-pulse" />
                HOVER A SERVICE
              </div>
            </div>
          </div>

          {/* Right: Service rows */}
          <div className="flex-1 divide-y divide-zinc-200/80 border border-zinc-200/80 lg:border-l-0">
            {servicesData.map((service) => {
              const Icon = icons[service.icon] || Layout;
              const isHov = hovered === service.number;

              return (
                <div
                  key={service.number}
                  className={`group relative transition-all duration-400 cursor-pointer ${
                    isHov ? 'bg-[#141414]' : 'bg-white hover:bg-zinc-50'
                  }`}
                  onMouseEnter={() => setHovered(service.number)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Red left strip on hover */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-rd-red transition-all duration-400 origin-bottom"
                    style={{ transform: isHov ? 'scaleY(1)' : 'scaleY(0)' }}
                  />

                  {/* Main row */}
                  <div className="flex items-center justify-between px-7 sm:px-10 py-7">
                    <div className="flex items-center gap-6 sm:gap-8 min-w-0">
                      <span className="font-mono text-xs font-black tracking-widest shrink-0 text-rd-red">{service.number}</span>
                      <h3 className={`font-display text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight truncate transition-colors duration-400 ${
                        isHov ? 'text-white' : 'text-rd-dark-text'
                      }`}>
                        {service.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className={`hidden sm:flex w-9 h-9 items-center justify-center transition-all duration-300 ${
                        isHov ? 'bg-rd-red text-white shadow-[0_0_16px_rgba(227,27,46,0.5)]' : 'bg-transparent border border-zinc-300 text-zinc-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`w-9 h-9 flex items-center justify-center border transition-all duration-300 ${
                        isHov ? 'bg-rd-red border-rd-red text-white' : 'border-zinc-300 text-zinc-400 -rotate-45'
                      }`}>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded deliverables */}
                  <div
                    className="overflow-hidden transition-all duration-500 ease-out"
                    style={{ maxHeight: isHov ? '260px' : '0px', opacity: isHov ? 1 : 0 }}
                  >
                    <div className="px-7 sm:px-10 pb-8 flex flex-col sm:flex-row gap-8">
                      <div className="flex-1">
                        <p className="text-zinc-400 text-sm leading-relaxed mb-5">{service.summary}</p>
                        <a
                          href="#contact"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rd-red text-white text-[11px] font-black tracking-widest uppercase hover:bg-rd-red-hover transition-all duration-200 shadow-[0_0_16px_rgba(227,27,46,0.4)] shimmer-btn group"
                        >
                          BRIEF US
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase mb-3">DELIVERABLES</div>
                        <ul className="space-y-2">
                          {service.deliverables.map((item, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300">
                              <span className="w-1 h-1 rounded-full bg-rd-red shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
