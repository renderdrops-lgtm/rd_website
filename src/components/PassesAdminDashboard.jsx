import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Search, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Ticket, 
  IndianRupee, 
  Percent, 
  ArrowLeft, 
  ExternalLink, 
  Eye, 
  Copy, 
  Check, 
  ShieldAlert,
  Sparkles,
  QrCode,
  Calendar,
  MapPin,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import CustomCursor from './CustomCursor';

export default function PassesAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('rd_passes_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schemaNotice, setSchemaNotice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');
  const [selectedPromoFilter, setSelectedPromoFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [inspectTicket, setInspectTicket] = useState(null);
  const [doorCheckSearch, setDoorCheckSearch] = useState('');
  const [checkedInIds, setCheckedInIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('rd_gate_checked_in') || '[]'));
    } catch {
      return new Set();
    }
  });

  const SECRET_PASSCODE = 'AftDarkPassAdmin#2026';

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === SECRET_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rd_passes_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect admin passkey. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rd_passes_admin_auth');
    setPasscode('');
  };

  // Fetch live tickets data from Supabase
  const fetchTickets = async () => {
    setIsLoading(true);
    setSchemaNotice(false);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
          setSchemaNotice(true);
        }
        throw error;
      }

      setTickets(data || []);
    } catch (err) {
      console.warn('Supabase tickets query warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);

  // Copy to clipboard helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle check-in verification at the venue gate
  const toggleCheckIn = (serial) => {
    const next = new Set(checkedInIds);
    if (next.has(serial)) {
      next.delete(serial);
    } else {
      next.add(serial);
    }
    setCheckedInIds(next);
    localStorage.setItem('rd_gate_checked_in', JSON.stringify(Array.from(next)));
  };

  const TRACKED_PROMO_CODES = ['VELVET-VIBE', 'GOLDENHOUR', 'AFTER.DARK', 'LUXE-ACCESS', 'TXJAS.AFTDARK7'];

  // Compute live analytics
  const analytics = useMemo(() => {
    const totalRev = tickets.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalAdmit = tickets.reduce((sum, t) => sum + (Number(t.quantity) || 1), 0);
    
    // Promo codes aggregation & analytics
    const promoBreakdown = {};
    TRACKED_PROMO_CODES.forEach(code => {
      promoBreakdown[code] = { count: 0, discount: 0, revenue: 0 };
    });

    tickets.forEach(t => {
      if (t.promo_code) {
        const code = String(t.promo_code).trim().toUpperCase();
        if (!promoBreakdown[code]) {
          promoBreakdown[code] = { count: 0, discount: 0, revenue: 0 };
        }
        promoBreakdown[code].count += 1;
        promoBreakdown[code].discount += (Number(t.discount_amount) || 0);
        promoBreakdown[code].revenue += (Number(t.amount) || 0);
      }
    });

    const totalPromoUsed = tickets.filter(t => t.promo_code).length;
    const totalDiscountSaved = tickets.reduce((sum, t) => sum + (Number(t.discount_amount) || 0), 0);

    // Exact Tier breakdown: Early Bird, Stag Entry, Couple Pass, Group of 5, Group of 10
    const tiers = {
      'Early Bird': { count: 0, admits: 0, revenue: 0 },
      'Stag Entry': { count: 0, admits: 0, revenue: 0 },
      'Couple Pass': { count: 0, admits: 0, revenue: 0 },
      'Group of 5': { count: 0, admits: 0, revenue: 0 },
      'Group of 10': { count: 0, admits: 0, revenue: 0 }
    };

    tickets.forEach(t => {
      const type = t.pass_type || 'Other';
      if (!tiers[type]) {
        tiers[type] = { count: 0, admits: 0, revenue: 0 };
      }
      tiers[type].count += 1;
      tiers[type].admits += (Number(t.quantity) || 1);
      tiers[type].revenue += (Number(t.amount) || 0);
    });

    return {
      totalRev,
      totalAdmit,
      totalPromoUsed,
      totalDiscountSaved,
      promoBreakdown,
      tiers,
      checkedInCount: checkedInIds.size
    };
  }, [tickets, checkedInIds]);

  // Filtered tickets based on search and filters
  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tickets.filter(t => {
      // Tier filter
      if (selectedTierFilter !== 'ALL' && t.pass_type !== selectedTierFilter) {
        return false;
      }
      // Promo filter
      if (selectedPromoFilter === 'WITH_PROMO' && !t.promo_code) return false;
      if (selectedPromoFilter === 'NO_PROMO' && t.promo_code) return false;
      if (selectedPromoFilter !== 'ALL' && selectedPromoFilter !== 'WITH_PROMO' && selectedPromoFilter !== 'NO_PROMO') {
        if ((t.promo_code || '').trim().toUpperCase() !== selectedPromoFilter) return false;
      }

      if (!query) return true;

      // Group member names & phones search
      let membersStr = '';
      if (Array.isArray(t.group_members)) {
        membersStr = t.group_members.map(m => `${m.name || ''} ${m.phone || ''}`).join(' ').toLowerCase();
      } else if (typeof t.group_members === 'string') {
        membersStr = t.group_members.toLowerCase();
      }

      const matchSerial = (t.serial_number || t.confirmation_id || '').toLowerCase().includes(query);
      const matchBuyer = (t.buyer_name || t.name || '').toLowerCase().includes(query);
      const matchEmail = (t.buyer_email || t.email || '').toLowerCase().includes(query);
      const matchPhone = (t.buyer_phone || t.phone || '').toLowerCase().includes(query);
      const matchPayment = (t.payment_id || '').toLowerCase().includes(query);
      const matchPromo = (t.promo_code || '').toLowerCase().includes(query);
      const matchMembers = membersStr.includes(query);

      return matchSerial || matchBuyer || matchEmail || matchPhone || matchPayment || matchPromo || matchMembers;
    });
  }, [tickets, searchQuery, selectedTierFilter, selectedPromoFilter]);

  // Door check quick match result
  const doorQuickMatch = useMemo(() => {
    if (!doorCheckSearch.trim()) return null;
    const q = doorCheckSearch.trim().toLowerCase();
    return tickets.find(t => 
      (t.serial_number || '').toLowerCase() === q ||
      (t.buyer_phone || t.phone || '').replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, '')
    );
  }, [tickets, doorCheckSearch]);

  // Export gate list to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const headers = [
      'Serial Number',
      'Buyer Name',
      'Buyer Phone',
      'Buyer Email',
      'Pass Type',
      'Admits Quantity',
      'Amount (INR)',
      'Promo Code',
      'Payment ID',
      'Group Attendees',
      'Checked In',
      'Booking Date'
    ];

    const rows = tickets.map(t => {
      let members = '';
      if (Array.isArray(t.group_members)) {
        members = t.group_members.map((m, i) => `G${i+1}: ${m.name} (${m.phone})`).join(' | ');
      }
      return [
        `"${t.serial_number || t.confirmation_id || ''}"`,
        `"${t.buyer_name || t.name || ''}"`,
        `"${t.buyer_phone || t.phone || ''}"`,
        `"${t.buyer_email || t.email || ''}"`,
        `"${t.pass_type || ''}"`,
        `"${t.quantity || 1}"`,
        `"${t.amount || 0}"`,
        `"${t.promo_code || 'None'}"`,
        `"${t.payment_id || ''}"`,
        `"${members.replace(/"/g, '""')}"`,
        `"${checkedInIds.has(t.serial_number) ? 'YES' : 'NO'}"`,
        `"${t.created_at || ''}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `renderdrops_freshers_guestlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 selection:bg-amber-500 selection:text-black">
        <CustomCursor />
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="relative z-10 w-full max-w-md bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block mb-1">
                // VENUE GATE & DOOR DESK
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Freshers Pass Portal
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your administrative key to access live booking data, revenue metrics & door verification.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                Security PIN / Key *
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-xs font-mono text-red-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              Authenticate Portal
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
            <a 
              href="/freshers-pass" 
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/freshers-pass');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Freshers Pass
            </a>
            <a href="/" className="hover:text-zinc-300 transition-colors">
              Studio Home →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MAIN ADMIN PORTAL & VENUE DOOR SCANNER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black pb-20">
      <CustomCursor />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-amber-500/20 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-sm">
              🎟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg uppercase tracking-tight text-white">
                  Freshers Passes Console
                </h1>
                <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  FINN LUXURY CLUB
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                November 7th Event • Live Supabase Sync
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <button
              onClick={fetchTickets}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={tickets.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <a
              href="/freshers-pass"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/freshers-pass');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Passes</span>
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg bg-red-950/60 border border-red-800/60 text-xs font-mono text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Schema Notification if Supabase table is not yet created */}
        {schemaNotice && (
          <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-5 text-amber-300 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold flex items-center gap-2 text-amber-400 text-sm">
                <ShieldAlert className="w-4 h-4" /> Supabase 'tickets' Table Pending
              </span>
              <p className="text-zinc-300">
                The database table <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-300">public.tickets</code> has not yet been executed in your Supabase project. We have created <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-300">supabase_tickets_schema.sql</code> in the repo.
              </p>
            </div>
            <a
              href="https://supabase.com/dashboard/project/_/sql"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-lg text-[11px] shrink-0 inline-flex items-center gap-1.5"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* ── Section 1: Venue Gate Door Quick Verification Scanner ── */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block">
                // VENUE ENTRANCE VERIFICATION
              </span>
              <h2 className="text-xl font-bold uppercase tracking-tight text-white mt-0.5">
                Fast Gate Check-In & Scanner
              </h2>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Admitted: <span className="text-emerald-400 font-bold">{checkedInIds.size}</span> / {analytics.totalAdmit} Total Guests
            </div>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Type or scan Serial Number (e.g. RD-PASS-2026-...) or Buyer Phone to verify immediately..."
              value={doorCheckSearch}
              onChange={(e) => setDoorCheckSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-600 text-sm focus:outline-none"
            />
            {doorCheckSearch && (
              <button
                onClick={() => setDoorCheckSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Match Banner */}
          {doorCheckSearch && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              {doorQuickMatch ? (
                <div className="bg-zinc-950 p-4 rounded-xl border border-emerald-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        VALID PASS MATCH ✓
                      </span>
                      <span className="font-mono text-sm font-black text-amber-400">
                        {doorQuickMatch.serial_number || doorQuickMatch.confirmation_id}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">
                      {doorQuickMatch.buyer_name || doorQuickMatch.name} • {doorQuickMatch.pass_type} (Admits {doorQuickMatch.quantity || 1})
                    </p>
                    <p className="text-xs text-zinc-400 font-mono">
                      Phone: {doorQuickMatch.buyer_phone || doorQuickMatch.phone} | Paid: ₹{doorQuickMatch.amount}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCheckIn(doorQuickMatch.serial_number || doorQuickMatch.confirmation_id)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        checkedInIds.has(doorQuickMatch.serial_number || doorQuickMatch.confirmation_id)
                          ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      }`}
                    >
                      {checkedInIds.has(doorQuickMatch.serial_number || doorQuickMatch.confirmation_id)
                        ? 'Admitted ✓ (Click to Undo)'
                        : 'Admit Through Door'}
                    </button>
                    <button
                      onClick={() => setInspectTicket(doorQuickMatch)}
                      className="px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-red-400 py-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No pass found matching "{doorCheckSearch}". Check spelling or ask attendee for their digital confirmation pass.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 2: Analytics Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Revenue */}
          <div className="bg-zinc-900/70 border border-amber-500/20 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
              <span>TOTAL REVENUE</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              ₹{analytics.totalRev.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              Collected securely via Razorpay
            </p>
          </div>

          {/* Total Attendees */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
              <span>TOTAL ATTENDEES</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {analytics.totalAdmit}
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              Across all single & squad tiers
            </p>
          </div>

          {/* Bookings Count */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
              <span>CONFIRMED ORDERS</span>
              <Ticket className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {tickets.length}
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              {analytics.checkedInCount} verified at gate
            </p>
          </div>

          {/* Promo Code Savings */}
          <div className="bg-zinc-900/70 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase mb-2">
              <span>PROMO CODE USED</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {analytics.totalPromoUsed}
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              ₹{analytics.totalDiscountSaved.toLocaleString('en-IN')} discounted
            </p>
          </div>

        </div>

        {/* ── Section 2.5: Breakdown by Pass Type & Promo Code Analytics ── */}
        <div className="space-y-6">
          {/* 1. Pass Type Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="uppercase tracking-wider font-bold text-white flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                PASS CATEGORY BREAKDOWN
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Live Categories • Finn Nov 7th
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
              {/* Early Bird */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Early Bird</span>
                <div className="text-xl font-bold text-white">
                  {analytics.tiers['Early Bird']?.count || 0} <span className="text-xs text-zinc-500 font-normal">passes</span>
                </div>
                <div className="text-[11px] text-amber-400">
                  ₹{(analytics.tiers['Early Bird']?.revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Stag Entry */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Stag Entry</span>
                <div className="text-xl font-bold text-white">
                  {analytics.tiers['Stag Entry']?.count || 0} <span className="text-xs text-zinc-500 font-normal">passes</span>
                </div>
                <div className="text-[11px] text-amber-400">
                  ₹{(analytics.tiers['Stag Entry']?.revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Couple Pass */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Couple Pass</span>
                <div className="text-xl font-bold text-white">
                  {analytics.tiers['Couple Pass']?.count || 0} <span className="text-xs text-zinc-500 font-normal">passes</span>
                </div>
                <div className="text-[11px] text-amber-400">
                  ₹{(analytics.tiers['Couple Pass']?.revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Group of 5 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Group of 5</span>
                <div className="text-xl font-bold text-white">
                  {analytics.tiers['Group of 5']?.count || 0} <span className="text-xs text-zinc-500 font-normal">passes</span>
                </div>
                <div className="text-[11px] text-amber-400">
                  ₹{(analytics.tiers['Group of 5']?.revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Group of 10 */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Group of 10</span>
                <div className="text-xl font-bold text-white">
                  {analytics.tiers['Group of 10']?.count || 0} <span className="text-xs text-zinc-500 font-normal">passes</span>
                </div>
                <div className="text-[11px] text-amber-400">
                  ₹{(analytics.tiers['Group of 10']?.revenue || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Promo Codes Performance Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                PROMO CODE PERFORMANCE & REDEMPTIONS
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {analytics.totalPromoUsed} Total Redemptions (-₹{analytics.totalDiscountSaved.toLocaleString('en-IN')} Saved)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
              {Object.keys(analytics.promoBreakdown).map((code) => {
                const data = analytics.promoBreakdown[code];
                return (
                  <div key={code} className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold block uppercase truncate" title={code}>
                      {code}
                    </span>
                    <div className="text-xl font-bold text-emerald-300">
                      {data.count} <span className="text-xs text-emerald-500/70 font-normal">used</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-0.5">
                      <span>-₹{(data.discount || 0).toLocaleString('en-IN')}</span>
                      <span className="text-zinc-500">₹{(data.revenue || 0).toLocaleString('en-IN')} rev</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Section 3: Search, Filters & Main Data Table ── */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by buyer, phone, email, serial, promo, attendee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 text-xs font-mono focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedTierFilter}
                onChange={(e) => setSelectedTierFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Categories</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Stag Entry">Stag Entry</option>
                <option value="Couple Pass">Couple Pass</option>
                <option value="Group of 5">Group of 5</option>
                <option value="Group of 10">Group of 10</option>
              </select>

              <select
                value={selectedPromoFilter}
                onChange={(e) => setSelectedPromoFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Promo Status</option>
                <option value="WITH_PROMO">With Any Promo</option>
                <option value="NO_PROMO">No Promo Code</option>
                <option value="VELVET-VIBE">Code: VELVET-VIBE</option>
                <option value="GOLDENHOUR">Code: GOLDENHOUR</option>
                <option value="AFTER.DARK">Code: AFTER.DARK</option>
                <option value="LUXE-ACCESS">Code: LUXE-ACCESS</option>
                <option value="TXJAS.AFTDARK7">Code: TXJAS.AFTDARK7</option>
              </select>
            </div>

          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 px-3">Serial / Status</th>
                  <th className="pb-3 px-3">Buyer Contact</th>
                  <th className="pb-3 px-3">Pass Category</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Promo Code</th>
                  <th className="pb-3 px-3">Group Guest List</th>
                  <th className="pb-3 px-3">Payment ID</th>
                  <th className="pb-3 px-3 text-right">Door Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredTickets.map((t) => {
                  const serial = t.serial_number || t.confirmation_id || `RD-${t.id}`;
                  const isCheckedIn = checkedInIds.has(serial);
                  const members = Array.isArray(t.group_members) ? t.group_members : [];

                  return (
                    <tr key={t.id || serial} className="hover:bg-zinc-800/30 transition-colors">
                      
                      {/* Serial Number */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-400 select-all">{serial}</span>
                          <button
                            onClick={() => handleCopy(serial, serial)}
                            className="p-1 hover:text-white text-zinc-500 transition-colors"
                            title="Copy Serial"
                          >
                            {copiedId === serial ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <span className={`text-[10px] uppercase font-bold inline-block px-1.5 py-0.5 rounded ${
                          isCheckedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {isCheckedIn ? 'Admitted' : 'Pending Gate'}
                        </span>
                      </td>

                      {/* Buyer Details */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-white text-sm">{t.buyer_name || t.name || 'Anonymous'}</div>
                        <a 
                          href={`https://wa.me/91${(t.buyer_phone || t.phone || '').replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-emerald-400 transition-colors text-[11px] block"
                        >
                          +{t.buyer_phone || t.phone || 'N/A'} (WhatsApp)
                        </a>
                        <div className="text-zinc-500 text-[10px] truncate max-w-[150px]">{t.buyer_email || t.email}</div>
                      </td>

                      {/* Pass Category & Admits */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="bg-zinc-950 border border-zinc-800 px-2 py-1 rounded text-zinc-200 font-bold block w-fit">
                          {t.pass_type}
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block">
                          Admits: {t.quantity || 1} Person(s)
                        </span>
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-emerald-400 font-bold text-sm">₹{t.amount}</div>
                        {t.original_amount && Number(t.original_amount) > Number(t.amount) && (
                          <div className="text-zinc-500 text-[10px] line-through">₹{t.original_amount}</div>
                        )}
                      </td>

                      {/* Promo Code */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {t.promo_code ? (
                          <span className="bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            {t.promo_code} (-₹{t.discount_amount || 0})
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Group Guest List Breakdown */}
                      <td className="py-3 px-3">
                        {members.length > 0 ? (
                          <div className="space-y-1 max-w-xs">
                            <button
                              onClick={() => setInspectTicket(t)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                            >
                              <Users className="w-3 h-3" />
                              <span>View {members.length} Attendees</span>
                            </button>
                            <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                              {members.map(m => m.name).filter(Boolean).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Primary Only</span>
                        )}
                      </td>

                      {/* Payment ID */}
                      <td className="py-3 px-3 whitespace-nowrap text-zinc-400 text-[10px]">
                        <span className="select-all">{t.payment_id || 'N/A'}</span>
                        <div className="text-zinc-600 text-[9px]">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      {/* Gate Actions */}
                      <td className="py-3 px-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => toggleCheckIn(serial)}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                            isCheckedIn
                              ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                          }`}
                        >
                          {isCheckedIn ? 'Admitted' : 'Admit Door'}
                        </button>
                      </td>

                    </tr>
                  );
                })}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Fetching booking records from Supabase...</span>
                        </div>
                      ) : (
                        <span>No ticket passes found matching your filters.</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* ── Attendee Details Modal ── */}
      {inspectTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl my-8">
            <button
              onClick={() => setInspectTicket(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-zinc-800 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400">
                ATTENDEE GUEST LIST BREAKDOWN
              </span>
              <h3 className="text-xl font-bold uppercase mt-1">
                {inspectTicket.pass_type}
              </h3>
              <p className="font-mono text-xs text-amber-400 font-bold mt-1">
                Serial: {inspectTicket.serial_number || inspectTicket.confirmation_id}
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 text-[10px] uppercase block mb-1">Primary Buyer</span>
                <p className="font-bold text-white text-sm">{inspectTicket.buyer_name || inspectTicket.name}</p>
                <p className="text-zinc-300">Phone: {inspectTicket.buyer_phone || inspectTicket.phone}</p>
                <p className="text-zinc-400 text-[11px]">Email: {inspectTicket.buyer_email || inspectTicket.email}</p>
              </div>

              {Array.isArray(inspectTicket.group_members) && inspectTicket.group_members.length > 0 && (
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-2">
                    Group Attendees ({inspectTicket.group_members.length} Guests)
                  </span>
                  <div className="space-y-2">
                    {inspectTicket.group_members.map((member, i) => (
                      <div key={i} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold block">GUEST {i + 1}</span>
                          <span className="font-bold text-white">{member.name || `Guest ${i + 1}`}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-zinc-300 block">{member.phone || 'Phone Pending'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setInspectTicket(null)}
                className="px-5 py-2.5 bg-amber-500 text-black font-bold uppercase text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
