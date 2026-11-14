import React from 'react';

// Collective members. Photos live in public/media (compressed WebP); blank image shows a fallback
const collectiveMembers = [
  {
    name: "Sanskrithi M",
    role: "Founder & Chief Executive Officer",
    image: "/media/team-sanskrithi-m.webp"
  },
  {
    name: "Ravi Kumar N",
    role: "Chief Operating Officer",
    image: "/media/team-ravi-kumar-n.webp"
  },
  {
    name: "Sinchana P",
    role: "Director - Business & Client Division",
    image: "/media/team-sinchana-p.webp"
  },
  {
    name: "Tejas B S",
    role: "Director - Brand & Communication Division",
    image: "/media/team-tejas-b-s.webp"
  },
  {
    name: "Yogesh Sharanabasappa Koti",
    role: "Co-Director Business & Client Division",
    image: "/media/team-yogesh-sharanabasappa-koti.webp"
  },
  {
    name: "Adith Aby Raj",
    role: "Co-Director Creative & Media Division",
    image: "/media/team-adith-aby-raj.webp"
  },
  {
    name: "Danush GG",
    role: "Director Creative & Media Division",
    image: "/media/team-danush-gg.webp"
  },
  {
    name: "Srujan Umachagi",
    role: "Core Creative & Media Division",
    image: "/media/team-srujan-umachagi.webp"
  },
  {
    name: "Ankith Raj K S",
    role: "Core Creative & Media Division",
    image: "/media/team-ankith-raj-k-s.webp"
  },
  {
    name: "Anush Kiran K S",
    role: "Core Brand & Communication Division",
    image: "/media/team-anush-kiran-k-s.webp"
  },
  {
    name: "Preetham M",
    role: "Creative & Media Division",
    image: "/media/team-preetham-m.webp"
  },
  {
    name: "Shekar T",
    role: "Production & Operations Division",
    image: "/media/team-shekar-t.webp"
  },
  {
    name: "Rajat N Gouda",
    role: "Creative & Media Division",
    image: "/media/team-rajat-n-gouda.webp"
  },
  {
    name: "Amoghavarsha H A",
    role: "Creative & Media Division",
    image: "/media/team-amoghavarsha-h-a.webp"
  },
  {
    name: "Aditya Naravi",
    role: "Creative & Media Division",
    image: "/media/team-aditya-naravi.webp"
  },
  {
    name: "Vivek",
    role: "Creative & Media Division",
    image: "/media/team-vivek.webp"
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
    image: "/media/team-prajwal-sagar.webp"
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
      <div className="absolute bottom-0 right-0 w-full max-w-[600px] h-[450px] bg-rd-red/6 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-full max-w-[400px] h-[300px] bg-rd-red/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="mb-16 pb-10 border-b border-white/8">
          <div className="section-label mb-5">
            <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
            05 / THE COLLECTIVE
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="font-display text-3xl sm:text-5xl md:text-7xl uppercase tracking-tight text-white leading-none">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
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
                <div className="absolute inset-0 flex items-end p-2.5 sm:p-3 translate-y-full group-hover:translate-y-0 transition-all duration-400 bg-gradient-to-t from-rd-black/90 via-rd-black/50 to-transparent">
                  <div className="space-y-1 w-full">
                    <div className="text-[9px] font-black tracking-widest text-rd-red uppercase">{member.experience || "Active Member"}</div>
                    <div className="text-[10px] text-zinc-300 leading-tight">{member.speciality || member.role}</div>
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="p-2.5 sm:p-4 flex flex-col gap-1 flex-grow">
                <h4 className="font-display text-xs sm:text-sm md:text-base uppercase tracking-tight text-white group-hover:text-rd-red transition-colors duration-300 leading-tight break-words">
                  {member.name}
                </h4>
                <p className="text-[10px] text-zinc-500 leading-tight line-clamp-2">{member.role}</p>
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