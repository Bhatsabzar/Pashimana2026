-- Pashmina2026 — Supabase schema (UUID) + RLS + sample products
-- Run once in Supabase SQL Editor. Adjust policies for production hardening.

-- Clean reset (optional): uncomment if you need a full rebuild
-- drop table if exists public.orders cascade;
-- drop table if exists public.products cascade;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null check (price >= 0),
  image_url text,
  category text,
  is_featured boolean not null default false
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text not null,
  product_id uuid not null references public.products (id) on delete restrict,
  created_at timestamptz not null default now()
);

-- Existing `products` from an older script: CREATE TABLE was skipped, so new
-- columns were never added. Bring the table up to date before creating indexes.
alter table public.products add column if not exists category text;
alter table public.products add column if not exists is_featured boolean not null default false;

create index if not exists products_category_idx on public.products (lower(category));
create index if not exists products_featured_idx on public.products (is_featured) where is_featured = true;

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products for select using (true);

drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public" on public.orders for insert with check (true);

-- Sample catalogue (categories align with Home.js OCCASIONS)
-- Images: Unsplash CDN (reliable). Avoid picsum.photos — often blocked in browsers / regions.
insert into public.products (name, description, price, image_url, category, is_featured)
values
  ('Ivory Sozni Shawl', 'Hand-embroidered border on soft ivory — wedding-ready drape.', 18999, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop', 'Wedding', true),
  ('Champagne Bridal Wrap', 'Wide format with a gentle sheen for photography and mandap evenings.', 27999, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80&auto=format&fit=crop', 'Wedding', true),
  ('Zari Border Dupatta', 'Metallic border detail for festive pairings.', 16999, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop', 'Festival', true),
  ('Jamawar Motif Shawl', 'Jewel tones with classic paisley repeat.', 23999, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80&auto=format&fit=crop', 'Festival', false),
  ('Gift Box — Navy Shawl', 'Folded presentation for corporate and family gifting.', 13999, 'https://images.unsplash.com/photo-1434389678769-0a32c616b94f?w=800&q=80&auto=format&fit=crop', 'Gifting', true),
  ('Ombre Stole — Dawn', 'Soft gradient; thoughtful gift under ten thousand.', 9999, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop', 'Gifting', false),
  ('Herringbone Travel Wrap', 'Compact, commuter-friendly weave.', 11999, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop', 'Casual', false),
  ('Checked Academic Scarf', 'Crisp checks for everyday layering.', 7499, 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80&auto=format&fit=crop', 'Casual', false),
  ('Solid Ring Shawl — Charcoal', 'Minimal tailoring-friendly drape.', 12999, 'https://images.unsplash.com/photo-1583292650780-1191d2960688?w=800&q=80&auto=format&fit=crop', 'Casual', true),
  ('Summer Silk Blend Stole', 'Cool touch for warm days.', 8999, 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop', 'Casual', false),
  ('Men''s Muffler — Steel', 'Shorter length for coats and trenches.', 6999, 'https://images.unsplash.com/photo-1558171813-4c088774b6cd?w=800&q=80&auto=format&fit=crop', 'Gifting', false),
  ('Lattice Jacquard Shawl', 'Tone-on-tone geometry for boardroom to dinner.', 17499, 'https://images.unsplash.com/photo-1503341450203-b1d7d7560a4d?w=800&q=80&auto=format&fit=crop', 'Wedding', false);

-- For the in-app admin at /admin, also run: supabase/admin-rls.sql
