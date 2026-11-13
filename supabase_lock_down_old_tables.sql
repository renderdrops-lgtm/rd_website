-- ==============================================================================
-- RENDERDROPS: STOP THE PUBLIC WEBSITE KEY FROM READING PEOPLE'S DETAILS
-- Run once in your Supabase SQL Editor. Safe to re-run.
--
-- The old admin pages read these tables with the public (anon) key, so anyone
-- could download ticket buyers' and applicants' details. The new admin
-- dashboard reads them on the server instead, so public read access can go.
-- ==============================================================================

-- Freshers tickets: nothing on the website reads or writes this table any more.
-- Turn on row level security and remove every policy that lets the public key in.
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tickets'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.tickets', p.policyname);
  END LOOP;
END $$;

-- Join Us applications: the Join Us form still ADDS rows, so keep insert
-- policies and only remove the ones that let the public key READ rows.
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'applications' AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.applications', p.policyname);
  END LOOP;
END $$;
