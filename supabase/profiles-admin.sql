-- =============================================================================
-- Admin profile in public.profiles (links to auth.users)
-- Run in Supabase → SQL Editor after you create the user under Authentication → Users
-- =============================================================================

-- 1) Table: one row per auth user (optional but useful for roles / display name)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));

alter table public.profiles enable row level security;

-- Signed-in users can read and update only their own profile row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Optional: allow users to insert their own row only (if you ever create profiles from the client)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 2) Upsert profile for YOUR admin — change the email to the one you used in Supabase Auth
--    (must match exactly what appears in Authentication → Users, usually lowercased)

insert into public.profiles (id, email, full_name, is_admin)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  true
from auth.users u
where lower(u.email) = lower('REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com')
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(excluded.full_name, public.profiles.full_name),
  is_admin = true,
  updated_at = now();

-- 3) (Optional) Auto-create a non-admin profile for every NEW signup after this
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Note: Your admin user was created BEFORE this trigger existed, so step (2) is what
-- created their row. New users get a profile with is_admin = false; promote them in SQL:
--   update public.profiles set is_admin = true where email = '...';
