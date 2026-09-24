import React, { useState, useEffect } from 'react';
import { Lock, Trash2, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import CustomCursor from './CustomCursor';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [applications, setApplications] = useState([]);
  const [filterRole, setFilterRole] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Secret passcode configured for RenderDrops admin
  const SECRET_PIN = "renderdrops2026";

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');

      if (error) throw error;
      
      // Format data fields if necessary to match camelCase/snake_case consistency
      const formattedData = (data || []).map(app => ({
        fullName: app.full_name,
        contact: app.contact,
        yearBranch: app.year_branch,
        primaryRole: app.primary_role,
        secondPick: app.second_pick,
        skillLevel: app.skill_level,
        tools: app.tools,
        portfolio: app.portfolio,
        proudProject: app.proud_project,
        whyRenderDrops: app.why_renderdrops,
        bringingToTable: app.bringing_to_table,
        skillToLearn: app.skill_to_learn,
        creativePersonality: app.creative_personality,
        timeCommitment: app.time_commitment,
        deadlinesAttitude: app.deadlines_attitude,
        outsideRoleComfort: app.outside_role_comfort,
        finalReason: app.final_reason,
        submittedAt: app.submitted_at || app.created_at
      }));

      setApplications(formattedData);
    } catch (err) {
      console.error('Error fetching from Supabase, falling back to localStorage:', err.message);
      const savedApps = JSON.parse(localStorage.getItem('rd_recruitment_apps') || '[]');
      setApplications(savedApps);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === SECRET_PIN) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid passcode. Access denied.");
    }
  };

  const clearApplications = () => {
    if (window.confirm("Are you sure you want to clear stored local data?")) {
      localStorage.removeItem('rd_recruitment_apps');
      setApplications([]);
    }
  };

  const filteredApps = filterRole === 'ALL' 
    ? applications 
    : applications.filter(app => app.primaryRole === filterRole);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 sm:px-6 relative overflow-hidden select-none">
        <CustomCursor />
        <div className="absolute w-full max-w-[500px] h-[300px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-600/15 border border-red-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-[10px] font-mono text-red-500 uppercase tracking-[0.3em] block mb-1">
              // RESTRICTED ACCESS
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Admin Terminal</h1>
            <p className="text-xs text-zinc-400 mt-1">RenderDrops Talent Acquisition Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Admin Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:outline-none text-base sm:text-sm transition-colors"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider rounded-xl transition-colors text-xs shadow-lg shadow-red-600/20"
            >
              Unlock Dashboard
            </button>
            <div className="text-center pt-2">
              <a 
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Website</span>
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6 md:p-12 relative overflow-x-clip">
      <CustomCursor />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 pb-6 border-b border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-red-500 uppercase tracking-[0.3em]">
                // SECURE TERMINAL ACTIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
              <span>Recruitment Submissions</span>
              <span className="text-red-500">({applications.length})</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchApplications}
              disabled={isLoading}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Refresh Data'}</span>
            </button>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Site</span>
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Lock Terminal
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {applications.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 uppercase mr-2">Filter Role:</span>
            {['ALL', 'Graphic Design', 'Motion Graphics & VFX', 'Video Editing', 'Photography', 'Videography', 'Digital Marketing', 'Social Media & Content', 'Branding & Creative Strategy', 'Other'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-3 py-1.5 text-[11px] font-black tracking-wider uppercase rounded-lg transition-all border ${
                  filterRole === role 
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        {/* Submissions List */}
        {filteredApps.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
            <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold uppercase text-zinc-400">No applications found</h3>
            <p className="text-xs text-zinc-600 mt-1">Applications synced from Supabase will show up here instantly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApps.map((app, index) => (
              <div key={index} className="bg-zinc-900/50 border border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl space-y-6 hover:border-zinc-700 transition-all">
                
                {/* Header row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-red-500 uppercase">#{filteredApps.length - index}</span>
                      <span className="px-2.5 py-0.5 bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-wider rounded-md">
                        {app.primaryRole}
                      </span>
                      {app.secondPick && (
                        <span className="px-2.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-mono rounded-md">
                          2nd: {app.secondPick}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{app.fullName}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-zinc-400 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800">
                      {app.yearBranch}
                    </div>
                    {app.submittedAt && (
                      <div className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
                        {new Date(app.submittedAt).toLocaleDateString()} {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Contact (Email / WhatsApp)</span>
                    <p className="text-zinc-200 font-medium select-text">{app.contact}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Tools & Software</span>
                    <p className="text-zinc-200 font-medium select-text">{app.tools}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-mono block mb-1">Portfolio Link</span>
                    {app.portfolio ? (
                      <a href={app.portfolio.startsWith('http') ? app.portfolio : `https://${app.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline break-all font-medium">
                        {app.portfolio} ↗
                      </a>
                    ) : (
                      <span className="text-zinc-600 italic">Not provided</span>
                    )}
                  </div>
                </div>

                {/* Q&A Highlights */}
                <div className="space-y-4 text-sm">
                  <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60">
                    <span className="text-red-500 font-mono text-xs uppercase block mb-1 font-bold">Proud Project:</span>
                    <p className="text-zinc-300 leading-relaxed select-text">{app.proudProject}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60">
                      <span className="text-red-500 font-mono text-xs uppercase block mb-1 font-bold">Why RenderDrops?</span>
                      <p className="text-zinc-300 leading-relaxed select-text">{app.whyRenderDrops}</p>
                    </div>
                    <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800/60">
                      <span className="text-red-500 font-mono text-xs uppercase block mb-1 font-bold">Bringing to Table:</span>
                      <p className="text-zinc-300 leading-relaxed select-text">{app.bringingToTable}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs font-mono text-zinc-400">
                    <div className="bg-zinc-950 px-3 py-2.5 rounded-lg border border-zinc-800">
                      Skill Level: <strong className="text-white block mt-0.5">{app.skillLevel}</strong>
                    </div>
                    <div className="bg-zinc-950 px-3 py-2.5 rounded-lg border border-zinc-800">
                      Want to Learn: <strong className="text-white block mt-0.5">{app.skillToLearn}</strong>
                    </div>
                    <div className="bg-zinc-950 px-3 py-2.5 rounded-lg border border-zinc-800">
                      Personality: <strong className="text-white block mt-0.5">{app.creativePersonality}</strong>
                    </div>
                    <div className="bg-zinc-950 px-3 py-2.5 rounded-lg border border-zinc-800">
                      Time Commitment: <strong className="text-white block mt-0.5">{app.timeCommitment}</strong>
                    </div>
                  </div>

                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs font-mono text-zinc-400">
                    <div className="flex flex-wrap gap-4">
                      <span>Deadlines & Teamwork: <strong className="text-white">{app.deadlinesAttitude}</strong></span>
                      <span>Outside Role Comfort: <strong className="text-white">{app.outsideRoleComfort}</strong></span>
                    </div>
                    <div className="w-full md:w-auto bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                      <span className="text-red-500 block mb-0.5">Final Pitch:</span>
                      <strong className="text-white font-sans select-text">{app.finalReason}</strong>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}