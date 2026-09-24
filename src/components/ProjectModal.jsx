import React from 'react';
import { X, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-rd-black/90 backdrop-blur-xl animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-rd-dark border border-white/15 shadow-2xl p-6 sm:p-8 z-10 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-rd-card hover:bg-rd-red text-zinc-300 hover:text-white border border-white/10 transition-colors"
          aria-label="Close Project Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-rd-red text-white text-[11px] font-black tracking-widest uppercase">
            {project.category}
          </span>
          <span className="px-3 py-1 bg-rd-card text-zinc-300 text-[11px] font-bold tracking-widest uppercase border border-white/10">
            YEAR: {project.year}
          </span>
          <span className="text-zinc-400 text-xs font-mono">
            {project.stats}
          </span>
        </div>

        {/* Project Title */}
        <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-tight mb-3 text-white">
          {project.title}
        </h2>
        
        <p className="text-lg text-rd-red font-medium mb-6">
          {project.tagline}
        </p>

        {/* Main Showcase Image */}
        <div className="relative aspect-video w-full overflow-hidden mb-6 border border-white/10 bg-rd-black">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rd-black via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-black tracking-[0.25em] text-zinc-400 uppercase">
            OVERVIEW & EXECUTION
          </h3>
          <p className="text-zinc-300 text-base leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tags / Capabilities */}
        <div className="mb-8">
          <h4 className="text-xs font-black tracking-[0.25em] text-zinc-400 uppercase mb-3">
            DELIVERABLES & DISCIPLINES
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300"
              >
                ✦ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <CheckCircle2 className="w-4 h-4 text-rd-red" />
            <span>Executed by RenderDrops Collective</span>
          </div>
          <a
            href="#contact"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-rd-red hover:bg-rd-red-hover text-white text-xs font-extrabold tracking-widest uppercase transition-all"
          >
            <span>COMMISSION A PROJECT LIKE THIS</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
