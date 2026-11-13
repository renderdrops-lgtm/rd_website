import React from 'react';

// Shared building blocks for the admin dashboard (/admin/dashboard)

export const fmt = (n) => (typeof n === 'number' && !Number.isNaN(n) ? n.toLocaleString('en-IN') : '-');

export const fmtMoney = (n) => `₹${fmt(Math.round(n || 0))}`;

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '-';

export const fmtDateTimeFull = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    : '';

// WhatsApp link for the first Indian mobile number found in the text
// (contact fields can also hold an email), or null if there isn't one
export const waLink = (text) => {
  const m = String(text || '').match(/(?:\+?91[\s-]?|0)?([6-9]\d{4})[\s-]?(\d{5})(?!\d)/);
  return m ? `https://wa.me/91${m[1]}${m[2]}` : null;
};

export function Tile({ label, value, note }) {
  return (
    <div className="bg-rd-card border border-rd-card-border px-5 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none text-white tabular-nums">{value}</p>
      {note && <p className="mt-2 text-xs text-zinc-500">{note}</p>}
    </div>
  );
}

export function Panel({ title, children, right }) {
  return (
    <section className="bg-rd-card border border-rd-card-border p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

// `base` is what the % is out of: total people for multi-choice answers, or
// the sum of items for single-choice lists.
export function Breakdown({ items, emptyText, base }) {
  const total = base ?? items.reduce((s, x) => s + x.count, 0);
  if (!items.length) return <p className="text-sm text-zinc-500">{emptyText}</p>;
  const max = Math.max(...items.map((x) => x.count));
  return (
    <ul className="space-y-3">
      {items.map((x) => (
        <li key={x.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="capitalize text-zinc-300">{x.label}</span>
            <span className="shrink-0 tabular-nums text-zinc-400">
              <span className="font-semibold text-white">{fmt(x.count)}</span>
              {total > 0 && <span className="ml-2 text-zinc-500">{Math.round((x.count / total) * 100)}%</span>}
            </span>
          </div>
          <div className="h-2 bg-zinc-800">
            <div className="h-full rounded-r-[4px]" style={{ width: `${(x.count / max) * 100}%`, backgroundColor: '#E31B2E' }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Count how often each value appears; arrays count each item once
export function countBy(rows, get, limit = 8) {
  const counts = new Map();
  rows.forEach((r) => {
    const v = get(r);
    (Array.isArray(v) ? v : [v]).forEach((x) => {
      const key = x == null || x === '' ? 'Not given' : String(x).trim();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function csvCell(value) {
  let s = Array.isArray(value) ? value.join(', ') : value == null ? '' : String(value);
  // Stop spreadsheet apps treating text as a formula
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// columns: [[header, row => value], ...]
export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map(([h]) => csvCell(h)).join(',')];
  rows.forEach((r) => lines.push(columns.map(([, get]) => csvCell(get(r))).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Phone numbers as plain text for spreadsheets: "98765 43210"
export const phoneForCsv = (p) =>
  String(p || '')
    .replace(/\D/g, '')
    .replace(/^91(?=\d{10}$)/, '')
    .replace(/^(\d{5})(\d{5})$/, '$1 $2');
