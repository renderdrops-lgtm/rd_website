import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RecruitmentSection({ isOpen, mode = 'teaser', onClose }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 text-white rounded-2xl shadow-2xl my-8 p-8 md:p-12 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={handleCloseAll}
          className="absolute top-6 right-6 p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Background Glow Accent */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-red-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10">
          
          {!showForm && !submitted ? (
            /* STEP 1: TEASER / WELCOME POPUP (On Page Load) */
            <div className="text-center py-6 space-y-8">
              <span className="text-xs uppercase tracking-[0.3em] font-mono text-red-500 inline-block bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20">
                // JOIN THE COLLECTIVE
              </span>
              
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                  WE'RE ON THE LOOKOUT
                </h2>
                <p className="text-zinc-300 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
                  Talent Acquisition for Design, VFX, Strategy, PR, Content & Production. Bring your energy.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-3 group text-sm"
                >
                  <span>APPLY NOW</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleCloseAll}
                  className="w-full sm:w-auto px-6 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold uppercase tracking-wider rounded-xl transition-colors text-sm"
                >
                  Explore Website First
                </button>
              </div>
            </div>
          ) : submitted ? (
            /* SUCCESS MESSAGE */
            <div className="text-center py-8 space-y-6">
              <CheckCircle2 className="w-16 h-16 text-red-500 mx-auto" />
              <h3 className="text-3xl font-bold uppercase tracking-tight">Application Received</h3>
              <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
                We’ve got your transmission. Our team will review your work and get back to you soon. Stay loud.
              </p>
              <button
                onClick={handleCloseAll}
                className="px-8 py-3.5 bg-white text-black font-extrabold uppercase tracking-wider text-xs hover:bg-red-600 hover:text-white transition-colors rounded-xl"
              >
                Close & Return to Site
              </button>
            </div>
          ) : (
            /* STEP 2: ACTUAL APPLICATION FORM (Opens directly on Navbar JOIN US click) */
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-[0.3em] font-mono text-red-500 mb-2 block">
                  // RECRUITMENT APPLICATION
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  TELL US ABOUT YOURSELF
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">Skill Level *</label>
                      <select
                        name="skillLevel"
                        required
                        value={formData.skillLevel}
                        onChange={handleChange}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm resize-none"
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
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm resize-none"
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
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm resize-none"
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
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm"
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-1/3 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold uppercase tracking-wider rounded-xl text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider rounded-xl text-xs transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
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