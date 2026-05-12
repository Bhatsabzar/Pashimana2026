-- Admin: allow signed-in users to insert / update / delete products.
-- Prereq: Supabase → Authentication → enable Email. Create one admin user (Users → Add user).
-- Any authenticated user can manage products. To restrict to one email, use the commented policies.

drop policy if exists "products_insert_authenticated" on public.products;
create policy "products_insert_authenticated"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "products_update_authenticated" on public.products;
create policy "products_update_authenticated"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "products_delete_authenticated" on public.products;
create policy "products_delete_authenticated"
  on public.products for delete
  to authenticated
  using (true);

-- Let signed-in admins read recent orders (guests still cannot list orders).
drop policy if exists "orders_select_authenticated" on public.orders;
create policy "orders_select_authenticated"
  on public.orders for select
  to authenticated
  using (true);

-- Optional: replace the three policies above with email-scoped versions, then drop the broad ones.
-- Example (uncomment and set your email):
-- drop policy if exists "products_insert_authenticated" on public.products;
-- create policy "products_insert_admin_email" on public.products for insert to authenticated
--   with check ( (auth.jwt() ->> 'email') = 'you@example.com' );
-- (repeat for update/delete with same using ( ... ) )
