-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Function to handle updated_at timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. User Roles (RBAC)
-- Links to Supabase Auth Users
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'editor', 'staff', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 2. Site Settings
-- Global configuration storage
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb, -- Flexible value storage
  label text,
  description text,
  input_type text default 'text', -- 'text', 'textarea', 'toggle', 'image', 'json'
  group_name text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Service Categories
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text, -- Icon name or URL
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories(id) on delete set null,
  title text not null,
  slug text unique not null,
  short_description text,
  description text, -- Main rich text content
  thumbnail_url text,
  price numeric(10, 2),
  processing_time text,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  seo_title text,
  seo_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Service Details (Extension of Services for structural data)
create table public.service_details (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade not null unique,
  requirements jsonb default '[]', -- List of required documents/criteria
  process_steps jsonb default '[]', -- Step-by-step guide
  faqs jsonb default '[]', -- Question/Answer pairs
  downloadable_forms jsonb default '[]', -- List of PDF links
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Hero Services (For the Cinematic Hero)
create table public.hero_services (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null, -- Optional link to real service
  title text not null,
  description text,
  image_folder_url text not null, -- For frame sequences
  cta_text text default 'Learn More',
  cta_link text,
  active boolean default true,
  sort_order integer default 0,
  theme_color text, -- Optional override
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. CMS Pages (Custom Pages)
create table public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  content jsonb not null, -- Structured content blocks
  hero_image_url text,
  meta_title text,
  meta_description text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Notices
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  type text default 'info' check (type in ('info', 'alert', 'warning', 'success')),
  priority text default 'normal' check (priority in ('low', 'normal', 'high')),
  is_active boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  role_title text,
  company text,
  content text not null,
  avatar_url text,
  rating integer default 5 check (rating >= 1 and rating <= 5),
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null, -- Null for guest users
  guest_details jsonb, -- { "name": "...", "email": "...", "phone": "..." }
  appointment_date timestamp with time zone not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  admin_notes text,
  user_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Inquiries (Contact Form Submissions)
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Triggers for updated_at
create trigger on_user_roles_updated before update on public.user_roles for each row execute procedure handle_updated_at();
create trigger on_site_settings_updated before update on public.site_settings for each row execute procedure handle_updated_at();
create trigger on_service_categories_updated before update on public.service_categories for each row execute procedure handle_updated_at();
create trigger on_services_updated before update on public.services for each row execute procedure handle_updated_at();
create trigger on_service_details_updated before update on public.service_details for each row execute procedure handle_updated_at();
create trigger on_hero_services_updated before update on public.hero_services for each row execute procedure handle_updated_at();
create trigger on_cms_pages_updated before update on public.cms_pages for each row execute procedure handle_updated_at();
create trigger on_notices_updated before update on public.notices for each row execute procedure handle_updated_at();
create trigger on_testimonials_updated before update on public.testimonials for each row execute procedure handle_updated_at();
create trigger on_appointments_updated before update on public.appointments for each row execute procedure handle_updated_at();
create trigger on_inquiries_updated before update on public.inquiries for each row execute procedure handle_updated_at();

-- Enable RLS on all tables
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_details enable row level security;
alter table public.hero_services enable row level security;
alter table public.cms_pages enable row level security;
alter table public.notices enable row level security;
alter table public.testimonials enable row level security;
alter table public.appointments enable row level security;
alter table public.inquiries enable row level security;

-- Basic Policies (Adjust as needed for specific security requirements)
-- Public Read Access where appropriate
create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Public can read active categories" on public.service_categories for select using (is_active = true);
create policy "Public can read active services" on public.services for select using (is_active = true);
create policy "Public can read service details" on public.service_details for select using (true); -- implicitly via service
create policy "Public can read active hero services" on public.hero_services for select using (active = true);
create policy "Public can read published pages" on public.cms_pages for select using (is_published = true);
create policy "Public can read active notices" on public.notices for select using (is_active = true);
create policy "Public can read active testimonials" on public.testimonials for select using (is_active = true);

-- Public Write Access (e.g. Inquiries, Appointments)
create policy "Public can create inquiries" on public.inquiries for insert with check (true);
create policy "Public can create appointments" on public.appointments for insert with check (true);

-- Admin Access (Assuming a more complex setup in real-world, here simplified to authenticated for demo or explicit check on user_roles)
-- For strict security, you would add policies checking exists(select 1 from user_roles where user_id = auth.uid() and role = 'admin')
