import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';

/* ─── Cycling words ─────────────────────────────────────────────────────── */
const CYCLING_WORDS = ['IMPOSSIBLE', 'UNFORGETTABLE', 'CINEMATIC'];

function CyclingWord() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('visible');
  useEffect(() => {
    let t;
    if (phase === 'visible') t = setTimeout(() => setPhase('exit'), 2200);
    else if (phase === 'exit') t = setTimeout(() => { setIndex(i => (i + 1) % CYCLING_WORDS.length); setPhase('enter'); }, 380);
    else if (phase === 'enter') t = setTimeout(() => setPhase('visible'), 50);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <span
      className="text-rd-red"
      style={{
        display: 'inline-block',
        filter: phase === 'visible' ? 'drop-shadow(0 0 32px rgba(227,27,46,0.7))' : 'none',
        transition: 'opacity .38s cubic-bezier(.4,0,.2,1), transform .42s cubic-bezier(.4,0,.2,1), filter .4s ease',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'translateY(-22px) skewY(-3deg)' : phase === 'enter' ? 'translateY(22px) skewY(3deg)' : 'translateY(0)',
      }}
    >
      {CYCLING_WORDS[index]}
    </span>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
export default function Hero() {
  const contentRef = useRef(null);
  const rafRef = useRef(null);
  const scrollYRef = useRef(0);

  /* Ultra-smooth scroll parallax fade via rAF */
  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    const tick = () => {
      if (contentRef.current) {
        const prog = Math.min(1, Math.max(0, (scrollYRef.current - 60) / 380));
        contentRef.current.style.opacity = String((1 - prog).toFixed(3));
        contentRef.current.style.transform = `translate3d(0,${(-prog * 45).toFixed(2)}px,0)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-[#090909]" style={{overflowX:'clip'}}>

      {/* ── Background image — full cover ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* ── Cinematic overlays ── */}
      {/* Main left-heavy dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            'linear-gradient(105deg, rgba(9,9,9,0.96) 0%, rgba(9,9,9,0.84) 38%, rgba(9,9,9,0.50) 65%, rgba(9,9,9,0.18) 100%)',
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-56"
        style={{
          zIndex: 1,
          background: 'linear-gradient(to top, rgba(9,9,9,1) 0%, rgba(9,9,9,0.75) 50%, transparent 100%)',
        }}
      />
      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-36"
        style={{
          zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(9,9,9,0.75) 0%, transparent 100%)',
        }}
      />

      {/* Editorial grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '5rem 5rem',
          maskImage: 'radial-gradient(ellipse 65% 85% at 15% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 85% at 15% 50%, black 30%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Red ambient glow bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-full max-w-[600px] h-[400px] pointer-events-none"
        style={{
          zIndex: 1,
          background: 'radial-gradient(ellipse at 15% 100%, rgba(227,27,46,0.18) 0%, transparent 70%)',
        }}
      />

      {/* ── Hero Content ── */}
      <div
        ref={contentRef}
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-24 sm:pt-28 pb-16 sm:pb-24 flex flex-col items-start"
        style={{ zIndex: 2, willChange: 'opacity, transform' }}
      >
        {/* Tagline badge */}
        <div className="animate-fade-in-up-1 inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 mb-8 sm:mb-10 border border-white/12 bg-black/70 backdrop-blur-md max-w-full">
          <span className="w-2 h-2 rounded-full bg-rd-red animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.25em] text-zinc-300 uppercase truncate">
            DESIGN — CREATE — SHOOT — EDIT
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up-2 font-display uppercase leading-[0.9] tracking-tight select-none mb-6 sm:mb-8 max-w-full break-words"
          style={{ fontSize: 'clamp(2.3rem, 8.5vw, 8.5rem)' }}
        >
          <div className="text-metallic">WE MAKE</div>
          <div
            className="my-1 tracking-wider"
            style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.75)', color: 'transparent' }}
          >
            IDEAS
          </div>
          <div className="break-words"><CyclingWord /></div>
          <div className="text-metallic">TO IGNORE.</div>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-in-up-3 max-w-xl text-sm sm:text-base md:text-lg text-zinc-400 font-normal leading-relaxed mb-8 sm:mb-10">
          RenderDrops is a creative studio building visuals, motion, media and
          experiences — student energy, production muscle, real-world results.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up-4 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 w-full sm:w-auto">
          <a
            href="#work"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-rd-red hover:bg-rd-red-hover text-white text-xs sm:text-sm font-extrabold tracking-widest uppercase transition-all duration-300 shadow-[0_0_35px_rgba(227,27,46,0.55)] hover:shadow-[0_0_60px_rgba(227,27,46,0.9)] shimmer-btn group"
          >
            <span>VIEW WORK</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/6 hover:bg-white/12 text-white text-xs sm:text-sm font-extrabold tracking-widest uppercase border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300"
          >
            <span>WORK WITH US</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        {/* Decorative bottom-right stat badge */}
        <div className="animate-fade-in-up-5 hidden lg:flex absolute right-8 bottom-8 flex-col items-end gap-1 select-none">
          <div className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">Est.</div>
          <div className="font-display text-6xl text-outline leading-none">2025</div>
          <div className="text-[10px] font-bold tracking-[0.2em] text-rd-red uppercase">RENDERDROPS</div>
        </div>
      </div>

    </section>
  );
}