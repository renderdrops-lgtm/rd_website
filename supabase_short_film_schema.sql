-- ==============================================================================
-- RENDERDROPS SHORT FILM CREW & CAST APPLICATIONS
-- Run this once in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.short_film_applications (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  srn TEXT,
  contact TEXT NOT NULL,
  branch TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  experience TEXT NOT NULL,
  work_link TEXT,
  why_join TEXT,
  availability TEXT NOT NULL,
  can_travel BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe to re-run: adds columns introduced after the table was first created
ALTER TABLE public.short_film_applications ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.short_film_applications ADD COLUMN IF NOT EXISTS srn TEXT;

ALTER TABLE public.short_film_applications ENABLE ROW LEVEL SECURITY;

-- Visitors on the website can submit an application, but cannot read anyone's data
DROP POLICY IF EXISTS "Anyone can submit a short film application" ON public.short_film_applications;
CREATE POLICY "Anyone can submit a short film application"
  ON public.short_film_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
