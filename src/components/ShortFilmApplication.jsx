import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ROLES = ['Actor / Actress', 'Director / Assistant Director', 'Spot Corrector'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Both'];
const TRAVEL = ['Yes', 'No'];

const EMPTY_FORM = {
  fullName: '',
  contact: '',
  branch: '',
  roles: [],
  experience: '',
  workLink: '',
  whyJoin: '',
  availability: '',
  canTravel: '',
};

// Clapperboard stick: black and off-white diagonal bands
const CLAPPER_STRIPES = {
  backgroundImage:
    'repeating-linear-gradient(-55deg, #141414 0 22px, #F4F1EC 22px 44px)',
};

function validate(form) {
  const e = {};
  if (!form.fullName.trim()) e.fullName = 'Add your name';
  if (!form.contact.trim()) e.contact = 'We need some way to reach you';
  if (!form.branch.trim()) e.branch = 'Add your branch';
  if (!form.roles.length) e.roles = 'Pick at least one role';
  if (!form.experience.trim()) e.experience = 'One line is enough, even "none yet"';
  if (!form.workLink.trim() && !form.whyJoin.trim()) {
    e.work = 'Drop a link, or tell us why you want to join';
  }
  if (!form.availability) e.availability = 'Pick one';
  if (!form.canTravel) e.canTravel = 'Pick one';
  return e;
}

/* ─── Small building blocks ─────────────────────────────────────────────── */

function Section({ num, title, hint, children }) {
  return (
    <section className="grid grid-cols-[2.25rem_1fr] sm:grid-cols-[3.5rem_1fr] gap-x-2 border-t border-black/15 pt-6 pb-7">
      <span className="font-display text-xl sm:text-2xl leading-none text-rd-red pt-0.5">
        {num}
      </span>
      <div>
        <h3 className="text-[15px] sm:text-base font-bold text-rd-dark-text">{title}</h3>
        {hint && <p className="mt-1 text-[13px] leading-relaxed text-black/55">{hint}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-semibold text-rd-red" data-error="true">{children}</p>;
}

function LineInput({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">{label}</span>
      <input
        {...props}
        className={`mt-1 block w-full bg-transparent border-0 border-b-[1.5px] px-0 py-2 text-base text-rd-dark-text placeholder:text-black/30 focus:outline-none focus:ring-0 transition-colors ${
          error ? 'border-rd-red' : 'border-black/25 focus:border-rd-dark-text'
        }`}
      />
      <ErrorText>{error}</ErrorText>
    </label>
  );
}

function BoxTextarea({ error, ...props }) {
  return (
    <>
      <textarea
        {...props}
        className={`block w-full resize-none bg-white/60 border-[1.5px] px-3.5 py-3 text-[15px] leading-relaxed text-rd-dark-text placeholder:text-black/35 focus:outline-none focus:bg-white transition-colors ${
          error ? 'border-rd-red' : 'border-black/20 focus:border-rd-dark-text'
        }`}
      />
      <ErrorText>{error}</ErrorText>
    </>
  );
}

// Square tick box + label. Used for both single and multi choice.
function Choice({ label, selected, onClick, round = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2.5 border-[1.5px] px-3.5 py-2.5 text-sm font-semibold transition-colors ${
        selected
          ? 'bg-rd-dark-text border-rd-dark-text text-rd-offwhite'
          : 'bg-transparent border-black/20 text-rd-dark-text hover:border-black/60'
      }`}
    >
      <span
        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border-[1.5px] ${
          round ? 'rounded-full' : ''
        } ${selected ? 'border-rd-offwhite' : 'border-black/40'}`}
      >
        {selected && <span className={`h-1.5 w-1.5 bg-rd-red ${round ? 'rounded-full' : ''}`} />}
      </span>
      {label}
    </button>
  );
}

function ChoiceRow({ label, children, error }) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">{children}</div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ─── Popup ─────────────────────────────────────────────────────────────── */

export default function ShortFilmApplication({ isOpen, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field] || (errors.work && (field === 'workLink' || field === 'whyJoin'))) {
      setErrors((e) => {
        const next = { ...e };
        delete next[field];
        if (field === 'workLink' || field === 'whyJoin') delete next.work;
        return next;
      });
    }
  };

  const toggle = (field, value) => {
    const list = form[field];
    set(field, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      // Bring the first problem into view
      requestAnimationFrame(() => {
        const first = scrollRef.current?.querySelector('[data-error="true"]');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setStatus('sending');
    const row = {
      full_name: form.fullName.trim(),
      contact: form.contact.trim(),
      branch: form.branch.trim(),
      roles: form.roles,
      experience: form.experience.trim(),
      work_link: form.workLink.trim() || null,
      why_join: form.whyJoin.trim() || null,
      availability: form.availability,
      can_travel: form.canTravel === 'Yes',
      submitted_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('short_film_applications').insert([row]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase error, keeping a local copy:', err.message);
      try {
        const saved = JSON.parse(localStorage.getItem('rd_short_film_apps') || '[]');
        localStorage.setItem('rd_short_film_apps', JSON.stringify([row, ...saved]));
      } catch {
        /* storage unavailable */
      }
    }

    setStatus('done');
    scrollRef.current?.scrollTo({ top: 0 });
  };

  const handleClose = () => {
    onClose();
    if (status === 'done') {
      setForm(EMPTY_FORM);
      setStatus('idle');
    }
  };

  const done = status === 'done';

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-6 sm:px-6 sm:py-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="film-call-title"
        className="relative mx-auto w-full max-w-[680px] bg-rd-offwhite text-rd-dark-text shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85)] animate-fade-in-up"
      >
        {/* Clapper stick */}
        <div className="relative h-7 sm:h-8" style={CLAPPER_STRIPES}>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-0 top-0 flex h-full items-center gap-1.5 bg-rd-dark-text px-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-rd-offwhite hover:bg-rd-red transition-colors"
            aria-label="Close"
          >
            Close <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Slate board */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 border-b-[1.5px] border-rd-dark-text bg-rd-dark-text text-rd-offwhite">
          {[
            ['Production', 'RenderDrops'],
            ['Project', 'Short film'],
            ['Call', 'Crew & cast'],
            ['Status', done ? 'Received' : 'Open'],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`border-white/15 px-4 py-2.5 sm:px-5 ${i > 0 ? 'sm:border-l' : ''} ${
                i % 2 === 1 ? 'border-l' : ''
              } ${i >= 2 ? 'border-t sm:border-t-0' : ''}`}
            >
              <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">{k}</dt>
              <dd className="mt-0.5 font-display text-lg uppercase leading-tight tracking-wide">
                {k === 'Status' && !done && (
                  <span className="mr-2 inline-block h-2 w-2 -translate-y-0.5 rounded-full bg-rd-red align-middle" />
                )}
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="px-5 pb-8 pt-8 sm:px-10 sm:pt-10">
          {done ? (
            <div className="py-6 sm:py-10">
              <p className="font-display text-[13px] uppercase tracking-[0.2em] text-rd-red">Application received</p>
              <h2 id="film-call-title" className="mt-3 font-display text-5xl sm:text-6xl uppercase leading-[0.92]">
                Thanks for
                <br />
                applying!
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-black/65">
                We'll review your application and get back to you within 5 days if there's a fit for an
                upcoming shoot.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-8 inline-flex items-center gap-2 bg-rd-dark-text px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-rd-offwhite hover:bg-rd-red transition-colors"
              >
                Back to the site
              </button>
            </div>
          ) : (
            <>
              {/* Intro */}
              <div className="relative mb-8">
                <h2
                  id="film-call-title"
                  className="font-display text-[3.1rem] sm:text-7xl uppercase leading-[0.9] tracking-tight"
                >
                  Crew &amp; cast
                  <br />
                  <span className="text-rd-red">wanted.</span>
                </h2>
                <p className="mt-5 max-w-[26rem] text-[15px] leading-relaxed text-black/65">
                  Want to be part of our next short film? Tell us a bit about yourself and apply below.
                </p>

                <span className="absolute right-0 top-1 hidden sm:block rotate-[-9deg] border-[2.5px] border-rd-red px-3 py-1.5 text-center font-display text-base uppercase leading-[1.05] tracking-wider text-rd-red opacity-90">
                  Beginners
                  <br />
                  welcome
                </span>
                <p className="mt-3 sm:hidden text-[13px] font-bold text-rd-red">Beginners are welcome.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <Section num="—" title="Basic details">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <LineInput
                        label="Full name"
                        value={form.fullName}
                        onChange={(e) => set('fullName', e.target.value)}
                        autoComplete="name"
                        error={errors.fullName}
                      />
                    </div>
                    <LineInput
                      label="Email / WhatsApp number"
                      value={form.contact}
                      onChange={(e) => set('contact', e.target.value)}
                      error={errors.contact}
                    />
                    <LineInput
                      label="Branch"
                      value={form.branch}
                      onChange={(e) => set('branch', e.target.value)}
                      placeholder="e.g. CSE, 2nd year"
                      error={errors.branch}
                    />
                  </div>
                </Section>

                <Section num="01" title="Which role are you applying for?" hint="Pick one or more.">
                  <ChoiceRow error={errors.roles}>
                    {ROLES.map((r) => (
                      <Choice key={r} label={r} selected={form.roles.includes(r)} onClick={() => toggle('roles', r)} />
                    ))}
                  </ChoiceRow>
                </Section>

                <Section
                  num="02"
                  title="What experience do you have?"
                  hint={'Films, college projects, reels, or "none yet, but I\'m keen to learn".'}
                >
                  <BoxTextarea
                    rows={3}
                    value={form.experience}
                    onChange={(e) => set('experience', e.target.value)}
                    placeholder="Keep it short"
                    error={errors.experience}
                  />
                </Section>

                <Section
                  num="03"
                  title="Share your best work, or tell us why you want to join"
                  hint="A YouTube, Instagram or Drive link works. No work yet? Write 2–3 lines on why you want in."
                >
                  <div className="space-y-4">
                    <LineInput
                      label="Link (optional)"
                      type="url"
                      inputMode="url"
                      value={form.workLink}
                      onChange={(e) => set('workLink', e.target.value)}
                      placeholder="https://"
                    />
                    <BoxTextarea
                      rows={3}
                      value={form.whyJoin}
                      onChange={(e) => set('whyJoin', e.target.value)}
                      placeholder="Why do you want to join?"
                      error={errors.work}
                    />
                  </div>
                </Section>

                <Section num="04" title="When and where are you available?">
                  <div className="space-y-5">
                    <ChoiceRow label="Availability" error={errors.availability}>
                      {AVAILABILITY.map((a) => (
                        <Choice
                          key={a}
                          round
                          label={a}
                          selected={form.availability === a}
                          onClick={() => set('availability', a)}
                        />
                      ))}
                    </ChoiceRow>
                    <ChoiceRow label="Can you travel to shoot locations?" error={errors.canTravel}>
                      {TRAVEL.map((t) => (
                        <Choice
                          key={t}
                          round
                          label={t}
                          selected={form.canTravel === t}
                          onClick={() => set('canTravel', t)}
                        />
                      ))}
                    </ChoiceRow>
                  </div>
                </Section>

                <div className="flex flex-col-reverse gap-4 border-t-[1.5px] border-rd-dark-text pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm font-semibold text-black/50 underline decoration-black/25 underline-offset-4 hover:text-rd-dark-text"
                  >
                    Maybe later
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="group inline-flex items-center justify-center gap-3 bg-rd-red px-7 py-4 font-display text-lg uppercase tracking-wider text-white hover:bg-rd-red-hover disabled:opacity-60 transition-colors"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send application'}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
