// Vercel Serverless Function: Admin dashboard data
// POST /api/admin   body: { password, action: 'stats' | 'applications' | 'table', table?, page?, pageSize?, search? }
//
// The admin password and the Supabase service role key live only here on the
// server, never in the website's code, so nobody can read applicants' details
// from the browser.
//
// Required Vercel environment variables:
//   ADMIN_PASSWORD             the password typed on /admin/dashboard
//   SUPABASE_SERVICE_ROLE_KEY  Supabase → Project Settings → API → service_role key
// Optional:
//   SUPABASE_URL               defaults to VITE_SUPABASE_URL / the project URL

import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://drslbdiwzpfsgzmishhq.supabase.co';
const MAX_PAGE_SIZE = 1000;

// Only these tables can be read through action 'table'
const OTHER_TABLES = {
  recruitment: 'applications',
  tickets: 'tickets',
};

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();

function passwordMatches(given, expected) {
  if (!given || !expected) return false;
  return crypto.timingSafeEqual(sha256(given), sha256(expected));
}

// Keep search text safe for Supabase's filter syntax
const cleanSearch = (s) =>
  typeof s === 'string' ? s.replace(/[^\p{L}\p{N}@+.\- ]/gu, '').trim().slice(0, 60) : '';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const expected = process.env.ADMIN_PASSWORD;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!expected || !serviceKey) {
    console.error('admin: ADMIN_PASSWORD / SUPABASE_SERVICE_ROLE_KEY are not set');
    return res.status(500).json({ success: false, error: 'Admin dashboard is not configured on the server' });
  }

  const body = req.body || {};
  if (!passwordMatches(body.password, expected)) {
    // Slow down password guessing
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ success: false, error: 'Wrong password' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  try {
    if (body.action === 'stats') {
      const { data, error } = await supabase.rpc('admin_dashboard_stats', { tz: 'Asia/Kolkata' });
      if (error) throw error;
      return res.status(200).json({ success: true, stats: data });
    }

    if (body.action === 'applications') {
      const pageSize = Math.min(Math.max(parseInt(body.pageSize, 10) || 25, 1), MAX_PAGE_SIZE);
      const page = Math.max(parseInt(body.page, 10) || 0, 0);
      const search = cleanSearch(body.search);

      let query = supabase
        .from('short_film_applications')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (search) {
        const p = `%${search}%`;
        query = query.or(
          `full_name.ilike.${p},srn.ilike.${p},contact.ilike.${p},branch.ilike.${p}`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, rows: data || [], total: count ?? 0, page, pageSize });
    }

    // Older tables (Join Us recruitment, Freshers tickets): their columns vary
    // between versions, so send rows page by page and let the dashboard sort
    // and search them.
    if (body.action === 'table') {
      const table = OTHER_TABLES[body.table];
      if (!table) return res.status(400).json({ success: false, error: 'Unknown table' });
      const pageSize = Math.min(Math.max(parseInt(body.pageSize, 10) || 500, 1), MAX_PAGE_SIZE);
      const page = Math.max(parseInt(body.page, 10) || 0, 0);
      const from = page * pageSize;
      const to = from + pageSize - 1;
      let { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range(from, to);
      // Table without an `id` column: fall back to its natural order
      if (error && (error.code === '42703' || /column .*id/i.test(error.message || ''))) {
        ({ data, count, error } = await supabase.from(table).select('*', { count: 'exact' }).range(from, to));
      }
      if (error) throw error;
      return res.status(200).json({ success: true, rows: data || [], total: count ?? 0, page, pageSize });
    }

    return res.status(400).json({ success: false, error: 'Unknown action' });
  } catch (err) {
    console.error('admin: Supabase error', err);
    const hint = /admin_dashboard_stats|site_visits/.test(err?.message || '')
      ? 'Run supabase_admin_dashboard.sql in Supabase first'
      : 'Could not load data from Supabase';
    return res.status(502).json({ success: false, error: hint });
  }
}
