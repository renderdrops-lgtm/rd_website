-- ==============================================================================
-- RENDERDROPS FRESHERS PARTY PASS: SUPABASE SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tickets (
  id BIGSERIAL PRIMARY KEY,
  ticket_serial TEXT UNIQUE,
  serial_number TEXT UNIQUE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  pass_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  amount NUMERIC NOT NULL,
  original_amount NUMERIC,
  promo_discount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  promo_code TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  payment_id TEXT,
  order_id TEXT,
  group_members JSONB DEFAULT '[]'::jsonb,
  event_date TEXT DEFAULT 'November 7th',
  venue TEXT DEFAULT 'Finn – The Luxury Club',
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Secondary alias columns for maximum client compatibility
  name TEXT,
  email TEXT,
  phone TEXT,
  confirmation_id TEXT
);

-- Idempotent column additions for existing tables
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_serial TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS serial_number TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS promo_discount NUMERIC DEFAULT 0;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS group_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS confirmation_id TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow anonymous ticket booking inserts from the frontend
DROP POLICY IF EXISTS "Allow public insert on tickets" ON public.tickets;
CREATE POLICY "Allow public insert on tickets" 
ON public.tickets FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow public anonymous queries for ticket validation and admin verification
DROP POLICY IF EXISTS "Allow public select on tickets" ON public.tickets;
CREATE POLICY "Allow public select on tickets" 
ON public.tickets FOR SELECT 
TO public 
USING (true);

-- Create fast lookup indexes
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_serial ON public.tickets(ticket_serial);
CREATE INDEX IF NOT EXISTS idx_tickets_serial_number ON public.tickets(serial_number);
CREATE INDEX IF NOT EXISTS idx_tickets_buyer_phone ON public.tickets(buyer_phone);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
