import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Reel frames data with direct Supabase image placeholders
const reelFrames = [
  {
    code: "RF-01",
    category: "VFX / VIDEO",
    title: "Cinematic Motion Frame 1",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/4a373b2e-bad2-4786-9625-fa31414a5bab.png"
  },
  {
    code: "RF-02",
    category: "DESIGN",
    title: "Cinematic Motion Frame 2",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/ChatGPT%20Image%20Sep%2022,%202026,%2012_31_31%20PM.png"
  },
  {
    code: "RF-03",
    category: "PHOTOGRAPHY",
    title: "Cinematic Motion Frame 3",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/IMG_1077%20(1).PNG"
  }
];

export default function ReelWall() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 380, behavior: 'smooth' });
    }
  };

  return (
    <section id="reel" className="py-24 bg-rd-dark/60 relative select-none overflow-hidden" style={{ overflowX: 'clip' }}>
      {/* Subtle ambient light */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-rd-red/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/8">
          <div>
            <div className="text-rd-red font-mono text-xs font-bold tracking-[0.3em] uppercase mb-3 flex items-center gap-2">
              <span className="w-6 h-[1.5px] bg-rd-red inline-block"></span>
              FRAMES FROM THE FLOOR
            </div>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
              THE REEL <br className="sm:hidden" />
              <span className="text-rd-red">KEEPS ROLLING</span>
            </h2>
          </div>
          {/* Scroll Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll(-1)}
              className="w-12 h-12 bg-rd-card border border-white/10 hover:bg-rd-red hover:border-rd-red text-white flex items-center justify-center transition-all duration-200"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-12 h-12 bg-rd-card border border-white/10 hover:bg-rd-red hover:border-rd-red text-white flex items-center justify-center transition-all duration-200"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar px-4 sm:px-8 pb-6 snap-x snap-mandatory relative z-10"
        onMouseDown={(e) => {
          const el = scrollRef.current;
          let startX = e.clientX;
          let scrollLeft = el.scrollLeft;
          const onMove = (me) => {
            el.scrollLeft = scrollLeft - (me.clientX - startX);
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            if (el) el.style.cursor = 'grab';
          };
          el.style.cursor = 'grabbing';
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        {reelFrames.map((frame, idx) => (
          <div
            key={idx}
            className="group relative flex-none w-[300px] sm:w-[360px] lg:w-[420px] aspect-[3/4] overflow-hidden bg-rd-black border border-white/10 hover:border-rd-red/60 snap-start transition-all duration-400 card-top-bar hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-grab active:cursor-grabbing flex flex-col justify-between"
          >
            {/* Image: Black & White by default, color on hover */}
            <img
              src={frame.image}
              alt={frame.title}
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              loading="lazy"
              draggable={false}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-rd-black via-rd-black/30 to-transparent opacity-85 group-hover:opacity-55 transition-opacity duration-400 pointer-events-none" />

            {/* Header badges */}
            <div className="relative z-10 flex items-center justify-between p-4">
              <div className="px-3 py-1.5 bg-rd-black/80 border border-white/15 backdrop-blur-sm">
                <span className="text-[11px] font-black text-white tracking-[0.2em] uppercase">{frame.code}</span>
              </div>
              <div className="text-zinc-500 font-mono text-xs">
                0{idx + 1}/{reelFrames.length}
              </div>
            </div>

            {/* Title (Bottom) */}
            <div className="relative z-10 p-6">
              <div className="text-[10px] font-bold tracking-[0.25em] text-rd-red uppercase mb-1">{frame.category}</div>
              <h3 className="font-display text-xl sm:text-2xl uppercase tracking-tight text-white group-hover:text-rd-red transition-colors duration-300 mb-4">
                {frame.title}
              </h3>
              {/* Bottom red accent line on hover */}
              <div className="h-[2px] w-0 group-hover:w-full bg-rd-red transition-all duration-500 ease-out" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}