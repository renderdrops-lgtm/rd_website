import React from 'react';
import { Mail, ArrowUpRight, Lock } from 'lucide-react';
import logoImg from '../assets/logo.png';

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const footerLinks = [
  { name: 'Work', href: '#work' },
  { name: 'Services', href: '#services' },
  { name: 'About', href: '#about' },
  { name: 'Highlights', href: '#highlights' },
  { name: 'Collective', href: '#collective' },
  { name: 'Contact', href: '#contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/6 pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative" style={{overflowX:'clip'}}>
      {/* Subtle red gradient at top-left */}
      <div className="absolute top-0 left-0 w-[400px] h-[200px] bg-rd-red/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-14">

          {/* Logo & Descriptor */}
          <div className="space-y-5">
            <a href="#" className="inline-block group">
              <img
                src={logoImg}
                alt="Render Drops"
                className="h-14 sm:h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_4px_20px_rgba(227,27,46,0.3)]"
              />
            </a>
            <p className="text-zinc-600 text-sm leading-relaxed max-w-xs">
              Creative studio building visuals, motion, media and experiences. Student energy. Production muscle. Real-world results.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="mailto:renderdrops@gmail.com"
                className="w-9 h-9 border border-white/10 hover:border-rd-red/60 hover:bg-rd-red/8 flex items-center justify-center text-zinc-600 hover:text-rd-red transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com/renderdropsco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-white/10 hover:border-rd-red/60 hover:bg-rd-red/8 flex items-center justify-center text-zinc-600 hover:text-rd-red transition-all duration-300"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-[10px] font-black tracking-[0.35em] text-zinc-600 uppercase mb-6">NAVIGATE</div>
            <nav className="grid grid-cols-2 gap-y-3 gap-x-4">
              {footerLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-zinc-500 hover:text-white text-sm font-medium transition-colors duration-200 hover:text-rd-red group flex items-center gap-1.5"
                >
                  <span className="w-0 group-hover:w-2.5 h-[1.5px] bg-rd-red transition-all duration-300 shrink-0" />
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact & Social */}
          <div>
            <div className="text-[10px] font-black tracking-[0.35em] text-zinc-600 uppercase mb-6">CONNECT</div>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:renderdrops@gmail.com"
                className="flex items-center gap-3 text-zinc-500 hover:text-rd-red transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm font-medium">renderdrops@gmail.com</span>
              </a>
              <a
                href="https://instagram.com/renderdropsco"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-zinc-500 hover:text-rd-red transition-colors group"
              >
                <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sm font-medium">@renderdropsco</span>
              </a>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rd-red hover:bg-rd-red-hover text-white text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(227,27,46,0.3)] hover:shadow-[0_0_32px_rgba(227,27,46,0.55)] shimmer-btn group"
            >
              <span>WORK WITH US</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-rd-red/30 to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-zinc-700 text-xs tracking-wider font-mono">
            © 2025 RENDERDROPS — ALL FRAMES RESERVED.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/admin';
              }}
              className="text-zinc-600 hover:text-rd-red transition-colors tracking-[0.2em] uppercase font-mono text-[11px] flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              <span>ADMIN TERMINAL</span>
            </a>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-zinc-800 font-mono text-[11px]">V1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}