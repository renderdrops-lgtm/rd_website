import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Navbar({ onOpenRecruitment }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'WORK', href: '#work' },
    { name: 'SERVICES', href: '#services' },
    { name: 'ABOUT', href: '#about' },
    { name: 'HIGHLIGHTS', href: '#highlights' },
    { name: 'COLLECTIVE', href: '#collective' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group tracking-tighter shrink-0"
            aria-label="RenderDrops Homepage"
          >
            <img
              src={logoImg}
              alt="Render Drops"
              className="h-9 sm:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(227,27,46,0.35)]"
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative text-xs font-bold tracking-[0.2em] text-zinc-400 hover:text-white transition-colors duration-200 uppercase group py-1"
              >
                {link.name}
                {/* Animated underline */}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-rd-red group-hover:w-full transition-all duration-300 ease-out" />
              </a>
            ))}
          </nav>

          {/* CTAs + Mobile Toggle */}
          <div className="flex items-center gap-3">
            
            {/* Join Us / Recruitment Button */}
            <button
              onClick={onOpenRecruitment}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-rd-red text-white text-xs font-extrabold tracking-widest uppercase transition-all duration-300 hover:bg-zinc-800 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-rd-red animate-pulse" />
              <span>JOIN US</span>
            </button>

            {/* Brief Us CTA */}
            <a
              href="#contact"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-rd-red hover:bg-rd-red-hover text-white text-xs font-extrabold tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(227,27,46,0.35)] hover:shadow-[0_0_32px_rgba(227,27,46,0.65)] shimmer-btn group"
            >
              <span>BRIEF US</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center border border-white/15 text-white hover:border-rd-red/60 hover:text-rd-red transition-all duration-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-nav border-t border-white/10 px-4 py-6 bg-zinc-950/95 backdrop-blur-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold tracking-widest text-zinc-300 hover:text-white uppercase py-3 px-4 border-b border-white/5 hover:bg-white/5 transition-all duration-200 flex items-center justify-between group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:text-rd-red transition-all" />
              </a>
            ))}
            
            {/* Mobile Recruitment Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRecruitment();
              }}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 border border-rd-red/60 text-white text-xs font-extrabold tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(227,27,46,0.3)]"
            >
              <Sparkles className="w-4 h-4 text-rd-red" />
              <span>JOIN THE COLLECTIVE</span>
            </button>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rd-red text-white text-xs font-extrabold tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(227,27,46,0.4)]"
            >
              BRIEF US <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}