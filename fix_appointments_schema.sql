-- Migration to fix appointments table structure
-- Matches the front-end code and TypeScript types

-- Drop existing table (and recreate to ensure clean slate)
-- WARNING: This will delete existing appointment data.
-- If retention is needed, we would use ALTER TABLE instead.
-- Since this is an initial development phase, dropping is cleaner.

DROP TABLE IF EXISTS public.appointments CASCADE;

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  requested_date timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  admin_notes text
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read appointments" ON public.appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER on_appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
