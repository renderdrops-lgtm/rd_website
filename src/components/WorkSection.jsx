import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import ProjectModal from './ProjectModal';

// Projects data with direct Supabase image placeholders
const portfolioProjects = [
  {
    id: 1,
    title: "AURAFESTA 2.0 Aftermovie",
    category: "VFX / VIDEO",
    year: "2026",
    stats: "10,000+ Attendees • 48H Turnaround",
    tagline: "High-octane festival recap with 48h turnaround",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/IMG_1074.PNG"
  },
  {
    id: 2,
    title: "Flashmob Identity",
    category: "DESIGN",
    year: "2026",
    stats: "15K+ Impressions",
    tagline: "Complete visual system and graphics",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/IMG_0218.PNG"
  },
  {
    id: 3,
    title: "Sponsor Pulse",
    category: "PR / EVENT",
    year: "2026",
    stats: "4 Brand Deals • 1.5 Lakh+ Value",
    tagline: "High-conversion brand partnership deck & media activation",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/ChatGPT%20Image%20Sep%2022,%202026,%2012_03_00%20PM.png"
  }
];

export default function WorkSection() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);

  const filterCategories = [
    { label: 'ALL', key: 'ALL' },
    { label: 'DESIGN', key: 'DESIGN' },
    { label: 'VFX / VIDEO', key: 'VFX / VIDEO' },
    { label: 'PHOTOGRAPHY', key: 'PHOTOGRAPHY' },
    { label: 'PR / EVENT', key: 'PR / EVENT' },
  ];

  const filteredProjects = activeFilter === 'ALL'
    ? portfolioProjects
    : portfolioProjects.filter((p) => p.category === activeFilter);

  return (
    <section id="work" className="py-28 px-4 sm:px-6 lg:px-8 bg-rd-black relative" style={{overflowX:'clip'}}>
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-rd-red/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 pb-8 border-b border-white/8 gap-6">
          <div>
            <div className="section-label mb-4">
              <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
              01 / SELECTED WORK
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
              WORK THAT REFUSES{' '}
              <br className="hidden sm:inline" />
              <span className="text-outline hover:text-rd-red/10 transition-all duration-500">TO BLEND IN</span>
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 text-[11px] font-black tracking-widest uppercase transition-all duration-300 border ${
                  activeFilter === filter.key
                    ? 'bg-rd-red text-white border-rd-red shadow-[0_0_20px_rgba(227,27,46,0.55)]'
                    : 'bg-rd-card text-zinc-500 border-white/8 hover:text-white hover:border-white/20 hover:bg-rd-card/80'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group cursor-pointer bg-rd-card border border-white/8 hover:border-rd-red/50 transition-all duration-400 flex flex-col justify-between overflow-hidden relative card-top-bar hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-900">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-106 transition-all duration-600"
                  loading="lazy"
                />

                {/* Dark scrim that lifts on hover */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all duration-500" />

                {/* Corner Badges */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-rd-black/90 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-white">
                  {project.category}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-rd-black/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
                  {project.year}
                </div>

                {/* Arrow reveal on hover */}
                <div className="absolute bottom-3 right-3 w-9 h-9 bg-rd-red text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-400 shadow-[0_0_20px_rgba(227,27,46,0.6)]">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <div className="text-[11px] font-mono text-rd-red font-semibold mb-2 tracking-wider">
                    {project.stats}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl text-white uppercase tracking-tight group-hover:text-rd-red transition-colors duration-300 mb-2 leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                    {project.tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/6 group-hover:border-rd-red/25 transition-colors duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-black tracking-widest text-zinc-600 group-hover:text-rd-red uppercase transition-colors duration-300">
                    <span>EXPLORE</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <span className="text-zinc-700 font-mono text-xs">0{index + 1}</span>
                </div>
              </div>

              {/* Bottom red accent bar */}
              <div className="h-[2px] w-0 group-hover:w-full bg-rd-red transition-all duration-500 ease-out" />
            </div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}