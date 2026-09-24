import React, { useState } from 'react';
import { Mail, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SERVICES = ['Graphic Design', 'VFX & Video Editing', 'Photography', 'PR & Event Media', 'Full-Service Studio Package'];
const BUDGETS = ['Under ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹60,000', '₹60,000+', 'Let\'s discuss'];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', service: '', budget: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.message.trim()) errs.message = 'Tell us your idea';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
    setForm({ name: '', email: '', service: '', budget: '', message: '' });
  };

  // Premium bottom-border focus input
  const inputClass = (field) =>
    `w-full bg-rd-card text-white px-5 py-4 text-sm font-medium border-b-2 border-t-0 border-l-0 border-r-0 transition-all duration-300 outline-none focus:ring-0 placeholder-zinc-700 ${
      errors[field]
        ? 'border-red-500/60 bg-red-900/8'
        : 'border-white/10 focus:border-rd-red/70 hover:border-white/25 bg-rd-card'
    }`;

  return (
    <section id="contact" className="py-28 px-4 sm:px-6 lg:px-8 bg-rd-black relative" style={{overflowX:'clip'}}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-rd-red/8 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 pb-10 border-b border-white/8">
          <div className="section-label mb-5">
            <span className="w-8 h-[1.5px] bg-rd-red inline-block" />
            06 / WORK WITH US
          </div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none mb-4">
            GOT AN IDEA?{' '}
            <br className="hidden sm:inline" />
            <span className="text-rd-red">LET'S MAKE IT LOUD.</span>
          </h2>
          <p className="text-zinc-500 text-base sm:text-lg max-w-2xl leading-relaxed">
            Tell us what you're building — an event, a brand, a film, a launch. We'll reply within 48 hours with a plan and a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center justify-center min-h-[440px] bg-rd-card border border-rd-red/25 p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-rd-red/3 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-rd-red/10 blur-3xl rounded-full pointer-events-none" />
                <CheckCircle2 className="w-16 h-16 text-rd-red mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(227,27,46,0.6)]" />
                <h3 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-tight mb-3 relative z-10">
                  ENQUIRY RECEIVED
                </h3>
                <p className="text-zinc-400 text-base leading-relaxed max-w-sm relative z-10">
                  We've got your brief. Expect a response within <strong className="text-white">48 hours</strong> with a plan and a quote.
                </p>
                <div className="mt-8 text-xs font-black tracking-[0.3em] text-rd-red uppercase relative z-10">RENDERDROPS.CO</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="cf-name" className="block text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase mb-2">
                      Name <span className="text-rd-red">*</span>
                    </label>
                    <input
                      id="cf-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Name"
                      className={inputClass('name')}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="cf-email" className="block text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase mb-2">
                      Email <span className="text-rd-red">*</span>
                    </label>
                    <input
                      id="cf-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                      className={inputClass('email')}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Service */}
                  <div>
                    <label htmlFor="cf-service" className="block text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase mb-2">Service</label>
                    <select
                      id="cf-service"
                      value={form.service}
                      onChange={(e) => setForm({ ...form, service: e.target.value })}
                      className={`${inputClass('service')} cursor-pointer`}
                    >
                      <option value="" disabled>Select a service</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label htmlFor="cf-budget" className="block text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase mb-2">Budget Range</label>
                    <select
                      id="cf-budget"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className={`${inputClass('budget')} cursor-pointer`}
                    >
                      <option value="" disabled>Select budget range</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="cf-message" className="block text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase mb-2">
                    The Idea <span className="text-rd-red">*</span>
                  </label>
                  <textarea
                    id="cf-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="We're launching a fest in October and need the whole visual package…"
                    className={`${inputClass('message')} resize-none`}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  id="cf-submit"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-rd-red hover:bg-rd-red-hover text-white text-sm font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_35px_rgba(227,27,46,0.35)] hover:shadow-[0_0_55px_rgba(227,27,46,0.65)] shimmer-btn group"
                >
                  <span>SEND ENQUIRY</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            )}
          </div>

          {/* Right: Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Direct Channels */}
            <div>
              <div className="text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase mb-5">DIRECT CHANNELS</div>
              <div className="space-y-3">
                <a
                  href="mailto:renderdrops@gmail.com"
                  className="flex items-center gap-4 group text-white hover:text-rd-red transition-colors p-4 bg-rd-card border border-white/8 hover:border-rd-red/35 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-rd-black border border-white/10 group-hover:border-rd-red/50 group-hover:bg-rd-red/5 flex items-center justify-center shrink-0 transition-all duration-300">
                    <Mail className="w-4 h-4 group-hover:text-rd-red transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-0.5">EMAIL</div>
                    <div className="text-sm font-semibold">renderdrops@gmail.com</div>
                  </div>
                </a>
                <a
                  href="https://instagram.com/renderdropsco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group text-white hover:text-rd-red transition-colors p-4 bg-rd-card border border-white/8 hover:border-rd-red/35 transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-rd-black border border-white/10 group-hover:border-rd-red/50 group-hover:bg-rd-red/5 flex items-center justify-center shrink-0 transition-all duration-300">
                    <InstagramIcon className="w-4 h-4 group-hover:text-rd-red transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black tracking-[0.2em] text-zinc-600 uppercase mb-0.5">INSTAGRAM</div>
                    <div className="text-sm font-semibold">@renderdropsco</div>
                  </div>
                </a>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-rd-card border border-white/8 relative overflow-hidden">
              {/* Red left strip */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rd-red" />
              <div className="p-6 pl-8">
                <div className="text-[10px] font-black tracking-[0.3em] text-rd-red uppercase mb-5">WHAT HAPPENS NEXT</div>
                <ol className="space-y-5">
                  {[
                    ['48H Reply', 'We review your brief and respond with a detailed plan.'],
                    ['Free Discovery Call', 'A 15-minute call to align scope, timeline and budget.'],
                    ['Quote & Kickoff', 'Fixed-price quote delivered. Upon approval — we build.'],
                  ].map(([title, desc], i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-rd-red/12 border border-rd-red/25 flex items-center justify-center font-mono text-[11px] text-rd-red font-black">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-black text-sm text-white block mb-0.5">{title}</span>
                        <span className="text-xs text-zinc-600">{desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
