import { supabase } from './supabase';

// Records one row in Supabase `site_visits` per browser tab session, so the
// admin dashboard can count visits and unique visitors. No personal data is
// stored: just a random id kept in this browser, the page, the referring site
// and the device type.
const VISITOR_KEY = 'rd_visitor_id';
const SESSION_KEY = 'rd_visit_recorded';

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function deviceType() {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function referrerHost() {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).host;
    return host && host !== window.location.host ? host.slice(0, 200) : null;
  } catch {
    return null;
  }
}

export async function trackVisit() {
  // Don't count local development or the admin pages
  if (import.meta.env.DEV) return;
  if (window.location.pathname.startsWith('/admin')) return;

  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, '1');

    const { error } = await supabase.from('site_visits').insert([
      {
        visitor_id: getVisitorId(),
        path: window.location.pathname.slice(0, 200),
        referrer: referrerHost(),
        device: deviceType(),
      },
    ]);
    if (error) throw error;
  } catch (err) {
    // Counting visits must never break the site
    console.warn('Visit not recorded:', err?.message || err);
  }
}
