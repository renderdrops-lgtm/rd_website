import React from 'react';

// Collective members data with direct Supabase image placeholders and safe fallbacks for blanks
const collectiveMembers = [
  {
    name: "Sanskrithi M",
    role: "Founder & Chief Executive Officer",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/san%20(1).jpeg"
  },
  {
    name: "Ravi Kumar N",
    role: "Chief Operating Officer",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%202.27.55%20PM.jpeg"
  },
  {
    name: "Sinchana P",
    role: "Director - Business & Client Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%2012.48.17%20PM%20(1).jpeg"
  },
  {
    name: "Tejas B S",
    role: "Director - Brand & Communication Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%202.27.10%20PM.jpeg"
  },
  {
    name: "Yogesh Sharanavasappa Koti",
    role: "Co-Director Business & Client Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-21%20at%2011.19.00%20PM.jpeg"
  },
  {
    name: "Adith Aby Raj",
    role: "Co-Director Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-21%20at%2010.50.10%20PM.jpeg"
  },
  {
    name: "Danush GG",
    role: "Director Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%2011.52.11%20PM.jpeg"
  },
  {
    name: "Srujan Umachangi",
    role: "Core Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-23%20at%208.25.48%20AM.jpeg"
  },
  {
    name: "Ankith Raj K S",
    role: "Core Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/ankith.webp"
  },
  {
    name: "Anush Kiran K S",
    role: "Core Brand & Communication Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%2010.44.02%20PM.jpeg"
  },
  {
    name: "Preetham M",
    role: "Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/IMG_3743.JPG%20(1).jpeg"
  },
  {
    name: "Shekar T",
    role: "Production & Operations Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/shekar.webp"
  },
  {
    name: "Rajat N Gouda",
    role: "Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%203.32.13%20PM.jpeg"
  },
  {
    name: "Amoghavarsha H A",
    role: "Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rd_media/WhatsApp%20Image%202026-09-22%20at%2010.12.51%20PM.jpeg"
  },
  {
    name: "Aditya Naravi",
    role: "Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/aditya%20(1).webp"
  },
  {
    name: "Vivek",
    role: "Creative & Media Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/vivek.webp"
  },
  {
    name: "Yashas",
    role: "Brand & Communication Division",
    image: ""
  },
  {
    name: "Ankitha Hiremath",
    role: "Creative & Media Division",
    image: ""
  },
  {
    name: "Prajwal Sagar",
    role: "Brand & Communication Division",
    image: "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/prajwal.webp"
  },
  {
    name: "Tejaswini",
    role: "Brand & Communication Division",
    image: ""
  }
];

export default function CollectiveSection() {
  return (
    <section id="collective" className="py-28 px-4 sm:px-6 lg:px-8 bg-rd-black relative" style={{overflowX:'clip'}}>
      {/* Ambient bottom-right glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[450px] bg-rd-red/6 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-rd-red/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 pb-10 border-b border-white/8">
          <div className="section-label mb-5">
            <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
            05 / THE COLLECTIVE
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
              THE HANDS BEHIND{' '}
              <br className="hidden sm:inline" />
              <span className="text-rd-red">THE DROPS</span>
            </h2>
            <p className="max-w-sm text-zinc-600 text-sm leading-relaxed lg:text-right">
              A rotating roster of designers, editors, shooters and fixers — plugged in per project, dialled in to full send.
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {collectiveMembers.map((member, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden bg-rd-card border border-white/8 hover:border-rd-red/50 transition-all duration-400 cursor-pointer flex flex-col card-top-bar hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
            >
              {/* Photo or Blank Fallback */}
              <div className="relative aspect-square overflow-hidden bg-zinc-900">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-600"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-700 font-mono text-[9px] uppercase tracking-wider">
                    [ No Photo ]
                  </div>
                )}

                {/* Colour overlay on hover */}
                <div className="absolute inset-0 bg-rd-red/0 group-hover:bg-rd-red/15 transition-all duration-400" />

                {/* Slide-up hover info */}
                <div className="absolute inset-0 flex items-end p-3 translate-y-full group-hover:translate-y-0 transition-all duration-400 bg-gradient-to-t from-rd-black/90 via-rd-black/50 to-transparent">
                  <div className="space-y-1 w-full">
                    <div className="text-[9px] font-black tracking-widest text-rd-red uppercase">{member.experience || "Active Member"}</div>
                    <div className="text-[10px] text-zinc-300 leading-tight">{member.speciality || member.role}</div>
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="p-3 sm:p-4 flex flex-col gap-1 flex-grow">
                <h4 className="font-display text-sm sm:text-base uppercase tracking-tight text-white group-hover:text-rd-red transition-colors duration-300 leading-tight">
                  {member.name}
                </h4>
                <p className="text-[10px] text-zinc-600 leading-tight">{member.role}</p>
              </div>

              {/* Bottom red accent */}
              <div className="h-[1.5px] w-0 group-hover:w-full bg-rd-red transition-all duration-500 ease-out" />
            </div>
          ))}
        </div>

        {/* Decorative bottom watermark */}
        <div className="mt-20 pt-10 border-t border-white/5 text-center overflow-hidden">
          <p className="font-display text-[clamp(2rem,7vw,6rem)] text-white/4 tracking-tight uppercase select-none leading-none">
            THE COLLECTIVE
          </p>
        </div>
      </div>
    </section>
  );
}