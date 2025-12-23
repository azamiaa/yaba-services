-- RLS Policies for Admin Access
-- Execute this in your Supabase SQL Editor

-- Helper function to check admin/editor role
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles 
    where user_id = auth.uid() 
    and role in ('admin', 'editor')
  );
end;
$$ language plpgsql security definer;

-- Apply to tables

-- Hero Services
create policy "Admins can manage hero services" on public.hero_services
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Services
create policy "Admins can manage services" on public.services
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Service Categories
create policy "Admins can manage categories" on public.service_categories
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- CMS Pages
create policy "Admins can manage pages" on public.cms_pages
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Appointments
create policy "Admins can manage appointments" on public.appointments
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Notices
create policy "Admins can manage notices" on public.notices
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Testimonials
create policy "Admins can manage testimonials" on public.testimonials
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Inquiries
create policy "Admins can manage inquiries" on public.inquiries
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- Site Settings
create policy "Admins can manage settings" on public.site_settings
  for all to authenticated
  using ( is_admin() )
  with check ( is_admin() );

-- User Roles (Super Admin only - simplistic check same as admin for now, or refine)
create policy "Admins can read user roles" on public.user_roles
  for select to authenticated
  using ( is_admin() );

create policy "Admins can update user roles" on public.user_roles
  for update to authenticated
  using ( is_admin() )
  with check ( is_admin() );
