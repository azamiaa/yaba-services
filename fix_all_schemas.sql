-- Comprehensive Schema Alignment Migration (V2 - Idempotent)
-- Re-aligns all tables with front-end code expectations

-- 1. FIX APPOINTMENTS
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
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create appointments" ON public.appointments;
CREATE POLICY "Public can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read appointments" ON public.appointments;
CREATE POLICY "Authenticated users can read appointments" ON public.appointments FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
CREATE POLICY "Authenticated users can update appointments" ON public.appointments FOR UPDATE USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS on_appointments_updated ON public.appointments;
CREATE TRIGGER on_appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- 2. FIX NOTICES
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notices' AND column_name='expires_at') THEN
        ALTER TABLE public.notices RENAME COLUMN expires_at TO end_date;
    END IF;
END $$;

ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS start_date timestamp with time zone DEFAULT now();

ALTER TABLE public.notices DROP CONSTRAINT IF EXISTS notices_type_check;
ALTER TABLE public.notices ADD CONSTRAINT notices_type_check CHECK (type IN ('info', 'alert', 'warning', 'success'));

-- 3. FIX INQUIRIES
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE public.inquiries ADD CONSTRAINT inquiries_status_check CHECK (status IN ('new', 'responded', 'closed', 'read', 'replied', 'archived'));

DROP POLICY IF EXISTS "Public can create inquiries" ON public.inquiries;
CREATE POLICY "Public can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

-- 4. FIX TESTIMONIALS
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='role_title') THEN
        ALTER TABLE public.testimonials RENAME COLUMN role_title TO role;
    END IF;
END $$;

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- 5. FIX CMS PAGES
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cms_pages' AND column_name='meta_title') THEN
        ALTER TABLE public.cms_pages RENAME COLUMN meta_title TO seo_title;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cms_pages' AND column_name='meta_description') THEN
        ALTER TABLE public.cms_pages RENAME COLUMN meta_description TO seo_description;
    END IF;
END $$;

-- 6. FIX SERVICES
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS requirements text[] DEFAULT '{}';

-- Final RLS Check (ensure all have public insert where needed)
DROP POLICY IF EXISTS "Public can create inquiries" ON public.inquiries;
CREATE POLICY "Public can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create appointments" ON public.appointments;
CREATE POLICY "Public can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
