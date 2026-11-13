-- ==============================================================================
-- RENDERDROPS ADMIN DASHBOARD: VISIT TRACKING + STATS
-- Run this once in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- Needs the short_film_applications table (supabase_short_film_schema.sql) to exist first.
-- Safe to re-run.
-- ==============================================================================

-- 1. One row per website visit (one per browser tab session).
--    No names, emails or IP addresses: just a random browser id.
CREATE TABLE IF NOT EXISTS public.site_visits (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  device TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_visits_visited_at_idx ON public.site_visits (visited_at);
CREATE INDEX IF NOT EXISTS site_visits_visitor_id_idx ON public.site_visits (visitor_id);
CREATE INDEX IF NOT EXISTS short_film_applications_submitted_at_idx ON public.short_film_applications (submitted_at);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Visitors' browsers may add a visit, but nobody can read visits from the website.
-- Only the admin dashboard's server (service role key) can read them.
DROP POLICY IF EXISTS "Anyone can record a visit" ON public.site_visits;
CREATE POLICY "Anyone can record a visit"
  ON public.site_visits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(visitor_id) BETWEEN 8 AND 64
    AND coalesce(char_length(path), 0) <= 200
    AND coalesce(char_length(referrer), 0) <= 200
    AND coalesce(device, '') IN ('', 'mobile', 'tablet', 'desktop')
  );

-- 2. All dashboard numbers in one call. Days are counted in India time.
CREATE OR REPLACE FUNCTION public.admin_dashboard_stats(tz TEXT DEFAULT 'Asia/Kolkata')
RETURNS JSON
LANGUAGE SQL
STABLE
AS $$
  WITH bounds AS (
    SELECT
      (date_trunc('day', now() AT TIME ZONE tz) AT TIME ZONE tz) AS today_start,
      (date_trunc('day', now() AT TIME ZONE tz) AT TIME ZONE tz) - INTERVAL '29 days' AS range_start
  )
  SELECT json_build_object(
    'visits_total',     (SELECT count(*) FROM site_visits),
    'visitors_total',   (SELECT count(DISTINCT visitor_id) FROM site_visits),
    'visits_today',     (SELECT count(*) FROM site_visits, bounds WHERE visited_at >= today_start),
    'visitors_today',   (SELECT count(DISTINCT visitor_id) FROM site_visits, bounds WHERE visited_at >= today_start),
    'applications_total', (SELECT count(*) FROM short_film_applications),
    'applications_today', (SELECT count(*) FROM short_film_applications, bounds WHERE submitted_at >= today_start),
    'days', (
      SELECT coalesce(json_agg(json_build_object(
        'day', to_char(d.day, 'YYYY-MM-DD'),
        'visits', coalesce(v.visits, 0),
        'visitors', coalesce(v.visitors, 0),
        'applications', coalesce(a.applications, 0)
      ) ORDER BY d.day), '[]'::json)
      FROM bounds
      CROSS JOIN LATERAL generate_series(
        (range_start AT TIME ZONE tz)::date,
        (today_start AT TIME ZONE tz)::date,
        INTERVAL '1 day'
      ) AS d(day)
      LEFT JOIN (
        SELECT (visited_at AT TIME ZONE tz)::date AS day, count(*) AS visits, count(DISTINCT visitor_id) AS visitors
        FROM site_visits GROUP BY 1
      ) v ON v.day = d.day::date
      LEFT JOIN (
        SELECT (submitted_at AT TIME ZONE tz)::date AS day, count(*) AS applications
        FROM short_film_applications GROUP BY 1
      ) a ON a.day = d.day::date
    ),
    'devices', (
      SELECT coalesce(json_agg(json_build_object('label', label, 'count', n) ORDER BY n DESC), '[]'::json)
      FROM (SELECT coalesce(nullif(device, ''), 'unknown') AS label, count(*) AS n FROM site_visits GROUP BY 1) x
    ),
    'roles', (
      SELECT coalesce(json_agg(json_build_object('label', label, 'count', n) ORDER BY n DESC), '[]'::json)
      FROM (SELECT unnest(roles) AS label, count(*) AS n FROM short_film_applications GROUP BY 1) x
    ),
    'languages', (
      SELECT coalesce(json_agg(json_build_object('label', label, 'count', n) ORDER BY n DESC), '[]'::json)
      FROM (SELECT unnest(languages) AS label, count(*) AS n FROM short_film_applications GROUP BY 1) x
    )
  );
$$;

-- Only the server (service role) may run it; the public website cannot.
REVOKE ALL ON FUNCTION public.admin_dashboard_stats(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats(TEXT) TO service_role;
