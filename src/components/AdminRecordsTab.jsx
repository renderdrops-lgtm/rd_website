import React, { useMemo, useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  Tile,
  Panel,
  Breakdown,
  countBy,
  downloadCsv,
  fmt,
  fmtMoney,
  fmtDateTime,
  fmtDateTimeFull,
  phoneForCsv,
  waLink,
} from './adminUi';

// Admin dashboard tabs for the older tables: Join Us recruitment applications
// and Freshers Party Pass tickets. Rows arrive all at once (these tables are
// small), and searching / paging happens here in the browser.

const PAGE_SIZE = 25;
const DAY_MS = 864e5;

const asText = (v) => (v == null ? '' : Array.isArray(v) ? v.join(', ') : String(v));

/* ─── Generic searchable, expandable table ──────────────────────────────── */

function RecordsTable({ title, rows, columns, details, searchText, searchPlaceholder, csv, emptyText }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [openKey, setOpenKey] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows;
  }, [rows, query, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const from = filtered.length ? current * PAGE_SIZE + 1 : 0;
  const to = Math.min(filtered.length, (current + 1) * PAGE_SIZE);

  return (
    <Panel
      title={`${title} (${fmt(filtered.length)}${query ? ' matching' : ''})`}
      right={
        <button
          onClick={() => downloadCsv(csv.filename, csv.columns, filtered)}
          disabled={!filtered.length}
          className="inline-flex items-center gap-1.5 bg-rd-offwhite px-3 py-2 text-xs font-bold uppercase tracking-wider text-rd-dark-text hover:bg-white disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      }
    >
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder={searchPlaceholder}
          className="w-full border border-zinc-700 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              {columns.map((c) => (
                <th key={c.label} className={`py-2 pr-3 font-bold ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.label}
                </th>
              ))}
              <th className="py-2 font-bold" aria-label="Details" />
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-zinc-500">
                  {query ? 'Nothing matches that search.' : emptyText}
                </td>
              </tr>
            )}
            {shown.map((r) => {
              const key = r.__key;
              const open = openKey === key;
              return (
                <React.Fragment key={key}>
                  <tr
                    onClick={() => setOpenKey(open ? null : key)}
                    className="border-b border-zinc-800/70 align-top hover:bg-white/[0.03]"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.label}
                        className={`py-3 pr-3 ${c.className || 'text-zinc-300'} ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}
                      >
                        {c.render ? c.render(r) : asText(c.get(r)) || '-'}
                      </td>
                    ))}
                    <td className="py-3 text-zinc-500">
                      <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-zinc-800/70 bg-zinc-950/60">
                      <td colSpan={columns.length + 1} className="px-1 py-4">
                        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          {details.map(([label, get]) => {
                            const v = get(r);
                            const text = asText(v);
                            return (
                              <div key={label}>
                                <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">{label}</dt>
                                <dd className="mt-1 whitespace-pre-wrap break-words text-zinc-200">
                                  {/^https?:\/\//i.test(text) ? (
                                    <a href={text} target="_blank" rel="noreferrer" className="text-rd-red underline">
                                      {text}
                                    </a>
                                  ) : (
                                    text || '-'
                                  )}
                                </dd>
                              </div>
                            );
                          })}
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
          {fmt(from)}–{fmt(to)} of {fmt(filtered.length)}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            className="inline-flex items-center gap-1 border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Newer
          </button>
          <button
            onClick={() => setPage(current + 1)}
            disabled={current >= pages - 1}
            className="inline-flex items-center gap-1 border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
          >
            Older <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Panel>
  );
}

function TabState({ loading, error, children }) {
  if (error) {
    return (
      <p role="alert" className="border-l-[3px] border-rd-red bg-rd-red/10 px-4 py-3 text-sm text-zinc-200">
        {error}
      </p>
    );
  }
  if (loading) return <p className="py-10 text-center text-sm text-zinc-500">Loading…</p>;
  return children;
}

const PhoneLink = ({ phone }) => {
  const href = waLink(phone);
  if (!phone) return '-';
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:text-white"
    >
      {phone}
    </a>
  ) : (
    phone
  );
};

// Newest first, whatever the date column is called
const byDateDesc = (getDate) => (a, b) =>
  (new Date(getDate(b) || 0) - new Date(getDate(a) || 0)) || (Number(b.id) || 0) - (Number(a.id) || 0);

/* ─── Join Us recruitment applications (table: applications) ────────────── */

const rec = {
  date: (r) => r.submitted_at || r.created_at,
  contact: (r) => r.contact || r.phone || r.email,
};

const RECRUITMENT_DETAILS = [
  ['Contact', rec.contact],
  ['Year & branch', (r) => r.year_branch],
  ['Primary role', (r) => r.primary_role],
  ['Second pick', (r) => r.second_pick],
  ['Skill level', (r) => r.skill_level],
  ['Tools', (r) => r.tools],
  ['Portfolio', (r) => r.portfolio],
  ['Proud project', (r) => r.proud_project],
  ['Why RenderDrops', (r) => r.why_renderdrops],
  ['What they bring', (r) => r.bringing_to_table],
  ['Skill to learn', (r) => r.skill_to_learn],
  ['Creative personality', (r) => r.creative_personality],
  ['Time commitment', (r) => r.time_commitment],
  ['Deadlines & teamwork', (r) => r.deadlines_attitude],
  ['Outside role comfort', (r) => r.outside_role_comfort],
  ['Why remember them', (r) => r.final_reason],
];

export function RecruitmentTab({ rows: rawRows, loading, error }) {
  const rows = useMemo(
    () =>
      (rawRows || [])
        .map((r, i) => ({ ...r, __key: r.id ?? `r${i}` }))
        .sort(byDateDesc(rec.date)),
    [rawRows]
  );
  const weekAgo = Date.now() - 7 * DAY_MS;
  const lastWeek = rows.filter((r) => new Date(rec.date(r) || 0).getTime() >= weekAgo).length;
  const roles = countBy(rows, (r) => r.primary_role);
  const time = countBy(rows, (r) => r.time_commitment);

  return (
    <TabState loading={loading} error={error}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label="Applications" value={fmt(rows.length)} note="All time" />
          <Tile label="Last 7 days" value={fmt(lastWeek)} note="New applications this week" />
          <Tile
            label="Top role"
            value={<span className="text-2xl">{roles[0]?.label || '-'}</span>}
            note={roles[0] ? `${fmt(roles[0].count)} applicants` : 'No applications yet'}
          />
          <Tile
            label="Latest"
            value={<span className="text-2xl">{rows[0] ? fmtDateTime(rec.date(rows[0])) : '-'}</span>}
            note={rows[0]?.full_name || ''}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Primary role">
            <Breakdown items={roles} emptyText="No applications yet." />
          </Panel>
          <Panel title="Hours per week">
            <Breakdown items={time} emptyText="No applications yet." />
          </Panel>
        </div>

        <RecordsTable
          title="Join Us applications"
          rows={rows}
          emptyText="No Join Us applications yet."
          searchPlaceholder="Search name, contact, branch or role"
          searchText={(r) => [r.full_name, rec.contact(r), r.year_branch, r.primary_role, r.second_pick].map(asText).join(' ')}
          columns={[
            { label: 'Name', get: (r) => r.full_name, className: 'font-semibold text-white' },
            { label: 'Contact', render: (r) => <PhoneLink phone={rec.contact(r)} /> },
            { label: 'Year & branch', get: (r) => r.year_branch },
            { label: 'Primary role', get: (r) => r.primary_role },
            { label: 'Skill level', get: (r) => r.skill_level },
            { label: 'Submitted', get: (r) => fmtDateTime(rec.date(r)), className: 'whitespace-nowrap text-zinc-400' },
          ]}
          details={RECRUITMENT_DETAILS}
          csv={{
            filename: 'join-us-applications',
            columns: [
              ['Submitted (IST)', (r) => fmtDateTimeFull(rec.date(r))],
              ['Full name', (r) => r.full_name],
              ...RECRUITMENT_DETAILS.map(([label, get]) => [label, get]),
            ],
          }}
        />
      </div>
    </TabState>
  );
}

/* ─── Freshers Party Pass tickets (table: tickets) ──────────────────────── */

// Ticket columns changed over time, so read whichever one is present
const tix = {
  date: (r) => r.created_at,
  serial: (r) => r.ticket_serial || r.serial_number || r.confirmation_id,
  name: (r) => r.buyer_name || r.name,
  email: (r) => r.buyer_email || r.email,
  phone: (r) => r.buyer_phone || r.phone,
  amount: (r) => Number(r.amount_paid ?? r.amount) || 0,
  discount: (r) => Number(r.discount_applied ?? r.discount_amount ?? r.promo_discount) || 0,
  promo: (r) => r.promo_code_used || r.promo_code,
  payment: (r) => r.razorpay_payment_id || r.payment_id,
  members: (r) => {
    const m = r.group_members;
    if (Array.isArray(m)) {
      return m
        .map((x) => (typeof x === 'string' ? x : [x?.name, x?.phone, x?.email].filter(Boolean).join(' · ')))
        .filter(Boolean);
    }
    return typeof m === 'string' && m ? [m] : [];
  },
};

const TICKET_DETAILS = [
  ['Email', tix.email],
  ['Phone', tix.phone],
  ['Group members', (r) => tix.members(r).join('\n')],
  ['Amount paid', (r) => fmtMoney(tix.amount(r))],
  ['Discount', (r) => (tix.discount(r) ? fmtMoney(tix.discount(r)) : '')],
  ['Promo code', tix.promo],
  ['Razorpay payment ID', tix.payment],
  ['Status', (r) => r.status],
  ['Event', (r) => [r.event_date, r.venue].filter(Boolean).join(' · ')],
];

export function TicketsTab({ rows: rawRows, loading, error }) {
  const rows = useMemo(
    () =>
      (rawRows || [])
        .map((r, i) => ({ ...r, __key: r.id ?? `t${i}` }))
        .sort(byDateDesc(tix.date)),
    [rawRows]
  );
  const revenue = rows.reduce((s, r) => s + tix.amount(r), 0);
  const discounts = rows.reduce((s, r) => s + tix.discount(r), 0);
  const withPromo = rows.filter((r) => tix.promo(r)).length;
  const passTypes = countBy(rows, (r) => r.pass_type);
  const promos = countBy(rows.filter((r) => tix.promo(r)), tix.promo);

  return (
    <TabState loading={loading} error={error}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label="Tickets sold" value={fmt(rows.length)} note="Paid bookings" />
          <Tile label="Revenue" value={fmtMoney(revenue)} note="Total amount paid" />
          <Tile label="Discounts given" value={fmtMoney(discounts)} note="Through promo codes" />
          <Tile label="Used a promo code" value={fmt(withPromo)} note={rows.length ? `${Math.round((withPromo / rows.length) * 100)}% of bookings` : ''} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Pass types">
            <Breakdown items={passTypes} emptyText="No tickets yet." />
          </Panel>
          <Panel title="Promo codes">
            <Breakdown items={promos} emptyText="No promo codes used." />
          </Panel>
        </div>

        <RecordsTable
          title="Freshers tickets"
          rows={rows}
          emptyText="No tickets yet."
          searchPlaceholder="Search name, phone, email, ticket number or promo code"
          searchText={(r) => [tix.name(r), tix.phone(r), tix.email(r), tix.serial(r), tix.promo(r), ...tix.members(r)].map(asText).join(' ')}
          columns={[
            { label: 'Ticket', get: tix.serial, className: 'font-mono text-xs text-zinc-300' },
            { label: 'Name', get: tix.name, className: 'font-semibold text-white' },
            { label: 'Phone', render: (r) => <PhoneLink phone={tix.phone(r)} /> },
            { label: 'Pass', get: (r) => r.pass_type },
            { label: 'Paid', get: (r) => fmtMoney(tix.amount(r)), align: 'right' },
            { label: 'Promo', get: tix.promo },
            { label: 'Booked', get: (r) => fmtDateTime(tix.date(r)), className: 'whitespace-nowrap text-zinc-400' },
          ]}
          details={TICKET_DETAILS}
          csv={{
            filename: 'freshers-tickets',
            columns: [
              ['Booked (IST)', (r) => fmtDateTimeFull(tix.date(r))],
              ['Ticket', tix.serial],
              ['Name', tix.name],
              ['Phone', (r) => phoneForCsv(tix.phone(r))],
              ['Email', tix.email],
              ['Pass type', (r) => r.pass_type],
              ['Amount paid (₹)', tix.amount],
              ['Discount (₹)', tix.discount],
              ['Promo code', tix.promo],
              ['Group members', (r) => tix.members(r).join(' | ')],
              ['Razorpay payment ID', tix.payment],
            ],
          }}
        />
      </div>
    </TabState>
  );
}
