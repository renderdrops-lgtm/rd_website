import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, LogOut, Download, Search, ChevronLeft, ChevronRight, ChevronDown, Lock } from 'lucide-react';
import { Tile, Panel, Breakdown, downloadCsv, fmt, fmtDateTime, fmtDateTimeFull, phoneForCsv } from './adminUi';
import { RecruitmentTab, TicketsTab } from './AdminRecordsTab';

// Admin dashboard at /admin/dashboard: website visitors, short film
// applications, Join Us applications and Freshers tickets.
// All data comes from /api/admin, which checks the password on the server.

const TABS = [
  { id: 'film', label: 'Short film' },
  { id: 'recruitment', label: 'Join Us' },
  { id: 'tickets', label: 'Freshers tickets' },
];

const PW_KEY = 'rd_site_admin_pw';
const PAGE_SIZE = 25;
const REFRESH_MS = 60_000;

const fmtDay = (ymd, opts = { day: 'numeric', month: 'short' }) =>
  new Date(`${ymd}T00:00:00+05:30`).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opts });

async function callAdmin(password, payload) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, ...payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    const err = new Error(data.error || `Server returned ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ─── Small pieces ──────────────────────────────────────────────────────── */

// Single-series daily bar chart with a hover tooltip on every day
function DailyBars({ days, field, unit }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d[field]));
  const total = days.reduce((s, d) => s + d[field], 0);
  const active = hover !== null ? days[hover] : null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-xs text-zinc-500">
        <span>
          {active ? (
            <>
              <span className="text-zinc-300">{fmtDay(active.day, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              {' · '}
              <span className="font-semibold text-white tabular-nums">{fmt(active[field])}</span> {unit}
            </>
          ) : (
            <>
              <span className="font-semibold text-white tabular-nums">{fmt(total)}</span> {unit} in 30 days
            </>
          )}
        </span>
        <span className="tabular-nums">max {fmt(max)}</span>
      </div>

      <div
        className="relative flex h-40 items-end gap-[2px] border-b border-zinc-700"
        role="img"
        aria-label={`${unit} per day for the last 30 days, ${fmt(total)} in total`}
        onMouseLeave={() => setHover(null)}
      >
        {/* recessive gridlines at 50% and 100% */}
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-zinc-800" />
        <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-zinc-800" />
        {days.map((d, i) => {
          const h = d[field] === 0 ? 0 : Math.max(2, (d[field] / max) * 100);
          return (
            <div
              key={d.day}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              tabIndex={0}
              aria-label={`${fmtDay(d.day)}: ${d[field]} ${unit}`}
            >
              <div
                className={`w-full rounded-t-[4px] transition-opacity ${
                  hover === null || hover === i ? 'opacity-100' : 'opacity-40'
                }`}
                style={{ height: `${h}%`, backgroundColor: '#E31B2E' }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[11px] text-zinc-500">
        <span>{days[0] && fmtDay(days[0].day)}</span>
        <span>{days[14] && fmtDay(days[14].day)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

const FILM_CSV_COLUMNS = [
  ['Submitted (IST)', (r) => fmtDateTimeFull(r.submitted_at)],
  ['Full name', (r) => r.full_name],
  ['SRN', (r) => r.srn],
  ['WhatsApp (+91)', (r) => phoneForCsv(r.contact)],
  ['Branch', (r) => r.branch],
  ['Roles', (r) => r.roles],
  ['Languages', (r) => r.languages],
  ['Experience', (r) => r.experience],
  ['Work link', (r) => r.work_link],
  ['Why they want to join', (r) => r.why_join],
  ['Availability', (r) => r.availability],
  ['Can travel', (r) => (r.can_travel ? 'Yes' : 'No')],
];

/* ─── Login ─────────────────────────────────────────────────────────────── */

function Login({ onLogin, error, busy }) {
  const [pw, setPw] = useState('');
  return (
    <div className="flex min-h-screen items-center justify-center bg-rd-black px-4 text-white">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.trim()) onLogin(pw);
        }}
        className="w-full max-w-sm border border-rd-card-border bg-rd-card p-7"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rd-red">RenderDrops</p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none">Admin</h1>
        <p className="mt-3 text-sm text-zinc-400">Website visitors, short film and Join Us applications, and Freshers tickets.</p>
        <label className="mt-6 block">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500">Password</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mt-1.5 block w-full border border-zinc-700 bg-zinc-950 px-3.5 py-3 text-white focus:border-rd-red focus:outline-none"
          />
        </label>
        {error && <p className="mt-3 text-sm font-semibold text-rd-red">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-rd-red px-5 py-3.5 text-sm font-extrabold uppercase tracking-widest text-white hover:bg-rd-red-hover disabled:opacity-60"
        >
          <Lock className="h-4 w-4" />
          {busy ? 'Checking…' : 'Open dashboard'}
        </button>
      </form>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────────────── */

export default function SiteAdminDashboard() {
  const [password, setPassword] = useState(() => {
    try {
      return sessionStorage.getItem(PW_KEY) || '';
    } catch {
      return '';
    }
  });
  const [stats, setStats] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [openRow, setOpenRow] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [tab, setTab] = useState('film');
  // Older tables load once (all rows) and are searched in the browser
  const emptyTable = { rows: [], loading: true, error: '' };
  const [others, setOthers] = useState({ recruitment: emptyTable, tickets: emptyTable });

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(PW_KEY);
    } catch {
      /* ignore */
    }
    setPassword('');
    setStats(null);
    setRows([]);
    setOthers({ recruitment: emptyTable, tickets: emptyTable });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthError = useCallback(
    (err) => {
      if (err.status === 401) {
        logout();
        setLoginError('Wrong password.');
        return true;
      }
      return false;
    },
    [logout]
  );

  const loadStats = useCallback(
    async (pw = password) => {
      const data = await callAdmin(pw, { action: 'stats' });
      setStats(data.stats);
      setUpdatedAt(new Date());
      setLoadError('');
    },
    [password]
  );

  const loadRows = useCallback(
    async (pw = password, p = page, q = search) => {
      const data = await callAdmin(pw, { action: 'applications', page: p, pageSize: PAGE_SIZE, search: q });
      setRows(data.rows);
      setTotal(data.total);
    },
    [password, page, search]
  );

  const loadOtherTable = useCallback(
    async (name, pw = password) => {
      setOthers((o) => ({ ...o, [name]: { ...o[name], loading: !o[name].rows.length, error: '' } }));
      try {
        const all = [];
        for (let p = 0; ; p += 1) {
          const data = await callAdmin(pw, { action: 'table', table: name, page: p, pageSize: 1000 });
          all.push(...data.rows);
          if (all.length >= data.total || data.rows.length === 0) break;
        }
        setOthers((o) => ({ ...o, [name]: { rows: all, loading: false, error: '' } }));
      } catch (err) {
        if (handleAuthError(err)) return;
        setOthers((o) => ({
          ...o,
          [name]: { ...o[name], loading: false, error: `Couldn't load this table: ${err.message}` },
        }));
      }
    },
    [password, handleAuthError]
  );

  const login = async (pw) => {
    setBusy(true);
    setLoginError('');
    try {
      await loadStats(pw);
      try {
        sessionStorage.setItem(PW_KEY, pw);
      } catch {
        /* ignore */
      }
      setPassword(pw);
    } catch (err) {
      setLoginError(err.status === 401 ? 'Wrong password.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  // Restore a session after a page reload
  useEffect(() => {
    if (password && !stats) {
      loadStats().catch((err) => {
        if (!handleAuthError(err)) setLoadError(err.message);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Applications table follows page + search
  useEffect(() => {
    if (!password || !stats) return;
    loadRows().catch((err) => {
      if (!handleAuthError(err)) setLoadError(err.message);
    });
  }, [password, stats === null, page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join Us + Freshers tickets: load once after logging in
  useEffect(() => {
    if (!password || !stats) return;
    loadOtherTable('recruitment');
    loadOtherTable('tickets');
  }, [password, stats === null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep numbers fresh while the page is open
  useEffect(() => {
    if (!password || !stats) return undefined;
    const t = setInterval(() => {
      loadStats().catch((err) => {
        if (!handleAuthError(err)) setLoadError(err.message);
      });
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [password, stats === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    setBusy(true);
    try {
      await Promise.all([loadStats(), loadRows(), loadOtherTable('recruitment'), loadOtherTable('tickets')]);
    } catch (err) {
      if (!handleAuthError(err)) setLoadError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = [];
      for (let p = 0; ; p += 1) {
        const data = await callAdmin(password, { action: 'applications', page: p, pageSize: 1000, search });
        all.push(...data.rows);
        if (all.length >= data.total || data.rows.length === 0) break;
      }
      downloadCsv('short-film-applications', FILM_CSV_COLUMNS, all);
    } catch (err) {
      if (!handleAuthError(err)) setLoadError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const conversion = useMemo(() => {
    if (!stats || !stats.visitors_total) return null;
    return ((stats.applications_total / stats.visitors_total) * 100).toFixed(1);
  }, [stats]);

  if (!password || !stats) {
    if (password && !stats && !loginError && !loadError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-rd-black text-sm text-zinc-500">Loading…</div>
      );
    }
    return <Login onLogin={login} error={loginError || loadError} busy={busy} />;
  }

  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-rd-black pb-16 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-rd-card-border bg-rd-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <a href="/" className="text-[11px] font-bold uppercase tracking-[0.2em] text-rd-red">
              RenderDrops
            </a>
            <span className="font-display text-xl uppercase">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-zinc-500 sm:inline">
              Updated {updatedAt ? updatedAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '-'}
            </span>
            <button
              onClick={refresh}
              disabled={busy}
              className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-zinc-500 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-zinc-500 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 pt-6 sm:px-6">
        {loadError && (
          <p role="alert" className="border-l-[3px] border-rd-red bg-rd-red/10 px-4 py-3 text-sm text-zinc-200">
            {loadError}
          </p>
        )}

        {/* Website */}
        <div>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Website</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Visitors today" value={fmt(stats.visitors_today)} note={`${fmt(stats.visits_today)} visits`} />
            <Tile label="Total visitors" value={fmt(stats.visitors_total)} note="Unique browsers, all time" />
            <Tile label="Total visits" value={fmt(stats.visits_total)} note="One per browser tab session" />
            <Tile
              label="Visits per visitor"
              value={stats.visitors_total ? (stats.visits_total / stats.visitors_total).toFixed(1) : '-'}
              note="How often people come back"
            />
          </div>
        </div>

        {/* Charts: one measure each, never two scales on one chart */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="Visitors per day">
              <DailyBars days={stats.days || []} field="visitors" unit="visitors" />
            </Panel>
          </div>
          <Panel title="Visitor devices">
            <Breakdown items={stats.devices || []} emptyText="No visits recorded yet." />
          </Panel>
        </div>

        {/* Tabs: one per kind of sign-up */}
        <div role="tablist" aria-label="Sign-ups" className="flex gap-1 overflow-x-auto border-b border-rd-card-border">
          {TABS.map((t) => {
            const count =
              t.id === 'film'
                ? stats.applications_total
                : others[t.id].loading
                  ? null
                  : others[t.id].rows.length;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  active ? 'border-rd-red text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t.label}
                <span className={`tabular-nums ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {count === null ? '…' : fmt(count)}
                </span>
              </button>
            );
          })}
        </div>

        {tab === 'film' && (
          <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Applications" value={fmt(stats.applications_total)} note="All time" />
            <Tile label="Applied today" value={fmt(stats.applications_today)} note="Since midnight IST" />
            <Tile
              label="Visitors who applied"
              value={conversion === null ? '-' : `${conversion}%`}
              note="Applications ÷ total visitors"
            />
            <Tile
              label="Top role"
              value={<span className="text-2xl">{stats.roles?.[0]?.label || '-'}</span>}
              note={stats.roles?.[0] ? `${fmt(stats.roles[0].count)} applicants` : 'No applications yet'}
            />
          </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Applications per day">
            <DailyBars days={stats.days || []} field="applications" unit="applications" />
          </Panel>
          <Panel title="Roles applied for" right={<span className="text-[11px] text-zinc-500">% of applicants</span>}>
            <Breakdown items={stats.roles || []} base={stats.applications_total} emptyText="No applications yet." />
          </Panel>
          <Panel title="Languages" right={<span className="text-[11px] text-zinc-500">% of applicants</span>}>
            <Breakdown items={stats.languages || []} base={stats.applications_total} emptyText="No applications yet." />
          </Panel>
        </div>

        {/* Applications table */}
        <Panel
          title={`Applications (${fmt(total)}${search ? ' matching' : ''})`}
          right={
            <button
              onClick={exportCsv}
              disabled={exporting || total === 0}
              className="inline-flex items-center gap-1.5 bg-rd-offwhite px-3 py-2 text-xs font-bold uppercase tracking-wider text-rd-dark-text hover:bg-white disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              setSearch(searchInput.trim());
            }}
            className="mb-4 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, SRN, WhatsApp or branch"
                className="w-full border border-zinc-700 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <button type="submit" className="border border-zinc-700 px-4 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white">
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(0);
                }}
                className="px-2 text-xs text-zinc-500 underline hover:text-white"
              >
                Clear
              </button>
            )}
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
                  <th className="py-2 pr-3 font-bold">Name</th>
                  <th className="py-2 pr-3 font-bold">SRN</th>
                  <th className="py-2 pr-3 font-bold">WhatsApp</th>
                  <th className="py-2 pr-3 font-bold">Branch</th>
                  <th className="py-2 pr-3 font-bold">Roles</th>
                  <th className="py-2 pr-3 font-bold">Languages</th>
                  <th className="py-2 pr-3 font-bold">Submitted</th>
                  <th className="py-2 font-bold" aria-label="Details" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      {search ? 'No applications match that search.' : 'No applications yet.'}
                    </td>
                  </tr>
                )}
                {rows.map((r) => {
                  const open = openRow === r.id;
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        onClick={() => setOpenRow(open ? null : r.id)}
                        className="border-b border-zinc-800/70 align-top hover:bg-white/[0.03]"
                      >
                        <td className="py-3 pr-3 font-semibold text-white">{r.full_name}</td>
                        <td className="py-3 pr-3 font-mono text-xs text-zinc-300">{r.srn || '-'}</td>
                        <td className="py-3 pr-3">
                          <a
                            href={`https://wa.me/${(r.contact || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:text-white"
                          >
                            {r.contact}
                          </a>
                        </td>
                        <td className="py-3 pr-3 text-zinc-300">{r.branch}</td>
                        <td className="py-3 pr-3 text-zinc-300">{(r.roles || []).join(', ')}</td>
                        <td className="py-3 pr-3 text-zinc-300">{(r.languages || []).join(', ')}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-zinc-400">{fmtDateTime(r.submitted_at)}</td>
                        <td className="py-3 text-zinc-500">
                          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-zinc-800/70 bg-zinc-950/60">
                          <td colSpan={8} className="px-1 py-4">
                            <dl className="grid gap-4 text-sm sm:grid-cols-2">
                              {[
                                ['Experience', r.experience],
                                ['Why they want to join', r.why_join],
                                ['Work link', r.work_link],
                                ['Availability', `${r.availability || '-'} · ${r.can_travel ? 'Can travel' : "Can't travel"}`],
                              ].map(([k, v]) => (
                                <div key={k}>
                                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">{k}</dt>
                                  <dd className="mt-1 whitespace-pre-wrap break-words text-zinc-200">
                                    {k === 'Work link' && v && /^https?:\/\//i.test(v) ? (
                                      <a href={v} target="_blank" rel="noreferrer" className="text-rd-red underline">
                                        {v}
                                      </a>
                                    ) : (
                                      v || '-'
                                    )}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <span className="tabular-nums">
              {fmt(from)}–{fmt(to)} of {fmt(total)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Newer
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={to >= total}
                className="inline-flex items-center gap-1 border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                Older <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Panel>
          </div>
        )}

        {tab === 'recruitment' && <RecruitmentTab {...others.recruitment} />}
        {tab === 'tickets' && <TicketsTab {...others.tickets} />}
      </main>
    </div>
  );
}
