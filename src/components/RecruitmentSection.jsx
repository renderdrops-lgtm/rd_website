import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, X, ArrowRight, Ticket, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RecruitmentSection({ isOpen, mode = 'teaser', onClose, onNavigateToFreshers }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    contact: '',
    yearBranch: '',
    primaryRole: '',
    secondPick: '',
    skillLevel: '',
    tools: '',
    portfolio: '',
    proudProject: '',
    whyRenderDrops: '',
    bringingToTable: '',
    skillToLearn: '',
    creativePersonality: '',
    timeCommitment: '',
    deadlinesAttitude: '',
    outsideRoleComfort: '',
    finalReason: ''
  });

  // Whenever the modal opens, set whether to show the form directly or the teaser based on the mode prop
  useEffect(() => {
    if (isOpen) {
      setShowForm(mode === 'form');
      setSubmitted(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newApp = {
      full_name: formData.fullName,
      contact: formData.contact,
      year_branch: formData.yearBranch,
      primary_role: formData.primaryRole,
      second_pick: formData.secondPick,
      skill_level: formData.skillLevel,
      tools: formData.tools,
      portfolio: formData.portfolio,
      proud_project: formData.proudProject,
      why_renderdrops: formData.whyRenderDrops,
      bringing_to_table: formData.bringingToTable,
      skill_to_learn: formData.skillToLearn,
      creative_personality: formData.creativePersonality,
      time_commitment: formData.timeCommitment,
      deadlines_attitude: formData.deadlinesAttitude,
      outside_role_comfort: formData.outsideRoleComfort,
      final_reason: formData.finalReason,
      submitted_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('applications').insert([newApp]);
      if (error) throw error;
    } catch (err) {
      console.error('Supabase error, saving to local storage fallback:', err.message);
      // Fallback to browser localStorage if offline
      const existingApps = JSON.parse(localStorage.getItem('rd_recruitment_apps') || '[]');
      const updatedApps = [newApp, ...existingApps];
      localStorage.setItem('rd_recruitment_apps', JSON.stringify(updatedApps));
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleCloseAll = () => {
    setShowForm(false);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto">
      
      {/* Modal Container */}
      <div className={`relative w-full ${!showForm && !submitted ? 'max-w-4xl lg:max-w-5xl' : 'max-w-2xl'} bg-zinc-950 border border-zinc-800 text-white rounded-2xl sm:rounded-3xl shadow-2xl my-4 sm:my-8 p-5 sm:p-7 md:p-9 overflow-hidden transition-all duration-300`}>
        
        {/* Close Button */}
        <button
          onClick={handleCloseAll}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Background Glow Accent */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[220px] bg-red-600/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative z-10">
          
          {!showForm && !submitted ? (
            /* STEP 1: DUAL SPLIT MODAL (Recruitment + Freshers Party Pass) */
            <div className="py-2 sm:py-3">
              <div className="text-center mb-6 sm:mb-8 space-y-2">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-mono text-zinc-400 inline-block bg-zinc-900/90 px-3.5 py-1.5 rounded-full border border-zinc-800">
                  // RENDERDROPS DISPATCH
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                  CHOOSE YOUR ACCESS
                </h2>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto">
                  Step into the RenderDrops ecosystem. Join our creative agency or reserve your spot at the biggest party of the semester.
                </p>
              </div>

              {/* Side-by-Side Dual Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                {/* LEFT CARD: Recruitment Teaser */}
                <div className="relative group bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-red-600/50 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-red-400 font-bold bg-red-950/60 border border-red-800/40 px-2.5 py-1 rounded-full">
                        RECRUITMENT 2026
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">CORE TEAM</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2 leading-snug">
                      Join The Collective
                    </h3>
                    
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
                      Talent acquisition for Design, VFX, Strategy, PR, Content & Production. Bring your energy and build culture with us.
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {['VFX', '3D Design', 'Strategy', 'PR & Media', 'Content', 'Audio'].map((role) => (
                        <span key={role} className="text-[10px] font-mono bg-zinc-950/80 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 group/btn text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* RIGHT CARD: Freshers Party Pass Banner */}
                <div className="relative group bg-gradient-to-b from-zinc-900/80 via-zinc-900/60 to-zinc-950 border border-amber-500/40 hover:border-amber-400/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.09)]">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-amber-400 font-bold bg-amber-950/70 border border-amber-600/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        EXCLUSIVE NIGHT 🎟️
                      </span>
                      <span className="text-xs text-amber-400 font-black font-mono">FROM ₹399</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2 leading-snug">
                      Freshers Party Pass
                    </h3>
                    
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-4">
                      The official high-octane luxury freshers celebration. VIP perks, celebrity DJ vibes & premium club experience.
                    </p>

                    <div className="space-y-1.5 mb-6 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-semibold text-white">November 7th</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-zinc-400">Finn – The Luxury Club</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleCloseAll();
                      if (onNavigateToFreshers) {
                        onNavigateToFreshers();
                      } else {
                        window.history.pushState({}, '', '/freshers-pass');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group/pass text-xs sm:text-sm cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-black" />
                    <span>Get Party Passes</span>
                    <ArrowRight className="w-4 h-4 group-hover/pass:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

              {/* Bottom Subtle Dismiss */}
              <div className="text-center mt-5">
                <button
                  onClick={handleCloseAll}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors py-1 cursor-pointer"
                >
                  Explore Website First
                </button>
              </div>
            </div>
          ) : submitted ? (
            /* SUCCESS MESSAGE */
            <div className="text-center py-8 space-y-6">
              <CheckCircle2 className="w-16 h-16 text-red-500 mx-auto" />
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Application Received</h3>
              <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
                We’ve got your transmission. Our team will review your work and get back to you soon. Stay loud.
              </p>
              <button
                onClick={handleCloseAll}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-extrabold uppercase tracking-wider text-xs hover:bg-red-600 hover:text-white transition-colors rounded-xl"
              >
                Close & Return to Site
              </button>
            </div>
          ) : (
            /* STEP 2: ACTUAL APPLICATION FORM (Opens directly on Navbar JOIN US click) */
            <div className="max-h-[78vh] sm:max-h-[75vh] overflow-y-auto pr-1 sm:pr-2">
              {mode === 'teaser' && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Options</span>
                </button>
              )}
              <div className="text-center mb-6 sm:mb-8">
                <span className="text-xs uppercase tracking-[0.3em] font-mono text-red-500 mb-2 block">
                  // RECRUITMENT APPLICATION
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">
                  TELL US ABOUT YOURSELF
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                
                {/* SECTION 1 */}
                <div>
                  <h3 className="text-sm font-mono text-red-500 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    01. Let's Get To Know You
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Email ID + WhatsApp *</label>
                      <input
                        type="text"
                        name="contact"
                        required
                        value={formData.contact}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Year & Branch *</label>
                      <input
                        type="text"
                        name="yearBranch"
                        required
                        value={formData.yearBranch}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2 */}
                <div>
                  <h3 className="text-sm font-mono text-red-500 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    02. What's Your Thing?
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Primary Role *</label>
                      <select
                        name="primaryRole"
                        required
                        value={formData.primaryRole}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      >
                        <option value="">Select role...</option>
                        <option value="Graphic Design">Graphic & Visual Design</option>
                        <option value="Motion Graphics & VFX">Motion Graphics & VFX</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="Photography">Photography</option>
                        <option value="Videography">Videography</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Social Media & Content">Social Media & Content Creation</option>
                        <option value="Branding & Creative Strategy">Brand Strategy & PR</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Second Pick</label>
                      <input
                        type="text"
                        name="secondPick"
                        value={formData.secondPick}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Skill Level *</label>
                      <select
                        name="skillLevel"
                        required
                        value={formData.skillLevel}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      >
                        <option value="">Select level...</option>
                        <option value="Just getting started">Just getting started</option>
                        <option value="I know my way around">I know my way around</option>
                        <option value="Pretty good at it">Pretty good at it</option>
                        <option value="I can teach others">I can teach others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Tools / Software *</label>
                      <input
                        type="text"
                        name="tools"
                        required
                        value={formData.tools}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3 */}
                <div>
                  <h3 className="text-sm font-mono text-red-500 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    03. Show Us What You Got
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Portfolio / Link</label>
                      <input
                        type="text"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Proud Project *</label>
                      <textarea
                        name="proudProject"
                        required
                        rows="2"
                        value={formData.proudProject}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4 */}
                <div>
                  <h3 className="text-sm font-mono text-red-500 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    04. A Little About You
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Why RenderDrops? *</label>
                        <textarea
                          name="whyRenderDrops"
                          required
                          rows="2"
                          value={formData.whyRenderDrops}
                          onChange={handleChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">What you bring *</label>
                        <textarea
                          name="bringingToTable"
                          required
                          rows="2"
                          value={formData.bringingToTable}
                          onChange={handleChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm resize-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Skill to learn *</label>
                        <input
                          type="text"
                          name="skillToLearn"
                          required
                          value={formData.skillToLearn}
                          onChange={handleChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Creative personality (3 words) *</label>
                        <input
                          type="text"
                          name="creativePersonality"
                          required
                          value={formData.creativePersonality}
                          onChange={handleChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5 */}
                <div>
                  <h3 className="text-sm font-mono text-red-500 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    05. The Real Talk
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Time Commitment *</label>
                      <select
                        name="timeCommitment"
                        required
                        value={formData.timeCommitment}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      >
                        <option value="">Select hours...</option>
                        <option value="1–3 hrs">1–3 hrs</option>
                        <option value="3–5 hrs">3–5 hrs</option>
                        <option value="5–8 hrs">5–8 hrs</option>
                        <option value="8+ hrs">8+ hrs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Deadlines & Teamwork *</label>
                      <select
                        name="deadlinesAttitude"
                        required
                        value={formData.deadlinesAttitude}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      >
                        <option value="">Select option...</option>
                        <option value="Absolutely">Absolutely</option>
                        <option value="Yep, I'll manage">Yep, I'll manage</option>
                        <option value="Depends 😭">Depends 😭</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Outside Role Comfort *</label>
                      <select
                        name="outsideRoleComfort"
                        required
                        value={formData.outsideRoleComfort}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm"
                      >
                        <option value="">Select option...</option>
                        <option value="Yes">Yes</option>
                        <option value="Maybe">Maybe</option>
                        <option value="Not really">Not really</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 6 */}
                <div>
                  <h3 className="text-sm font-mono text-red-500 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
                    06. And Finally...
                  </h3>
                  <div>
                    <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Why remember you? *</label>
                    <textarea
                      name="finalReason"
                      required
                      rows="2"
                      value={formData.finalReason}
                      onChange={handleChange}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-1/3 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-wider rounded-xl text-xs sm:text-sm transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-2/3 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider rounded-xl text-xs sm:text-sm transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Application Form'}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}