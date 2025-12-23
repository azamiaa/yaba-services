# Yaba Online Services - Premium Service Portal

This is a premium, CMS-driven website for Yaba Online Services, built with Next.js, Tailwind CSS, and Supabase.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema
Run the following SQL in your Supabase SQL Editor to set up the required tables:

```sql
-- Hero Services Table
create table hero_services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  image_folder_url text not null, -- Path to WebP frames
  index_number integer not null,
  active boolean default true,
  cta_text text,
  cta_link text,
  theme_color text 
);

-- Services Table
create table services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  short_description text,
  icon text,
  category text not null,
  processing_time text,
  price numeric,
  requirements text[],
  description text,
  active boolean default true,
  index_number integer default 0
);

-- Notices Table
create table notices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  priority text check (priority in ('low', 'normal', 'high')) default 'normal',
  is_active boolean default true,
  expires_at timestamp with time zone
);

-- Appointments Table
create table appointments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_name text not null,
  user_email text not null,
  user_phone text not null,
  service_id uuid references services(id),
  requested_date timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  admin_notes text
);

-- RLS Policies (Example: Allow public read, secure write)
alter table hero_services enable row level security;
create policy "Public Read Hero" on hero_services for select using (active = true);

alter table services enable row level security;
create policy "Public Read Services" on services for select using (active = true);

alter table notices enable row level security;
create policy "Public Read Notices" on notices for select using (is_active = true);

alter table appointments enable row level security;
create policy "Allow Public Insert Appointment" on appointments for insert with check (true);
-- Note: Real apps should restrict view of appointments to owners or admins.
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features implemented
- **Cinematic Hero**: Scroll-driven WebP frame sequence animation.
- **Service Catalog**: Filterable and searchable grid of services.
- **Service Details**: Dynamic routing with rich details and requirements.
- **Appointment Booking**: Integrated form connected to Supabase.
- **Notices System**: Dynamic alerts and updates.
- **Premium UI**: Black & White aesthetic with smooth animations.
