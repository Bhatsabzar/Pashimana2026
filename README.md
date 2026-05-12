# Pashmina2026

Modern, premium e-commerce front end for **Pashmina2026** (React + Tailwind + Supabase). Guest checkout saves an order in Supabase, then opens **WhatsApp** with a prefilled message.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Environment variables

Create a `.env` file in the project root (see `.env.example`):

- `VITE_SUPABASE_URL` — Project URL from Supabase **Settings → API**
- `VITE_SUPABASE_ANON_KEY` — `anon` `public` key from the same page

## Install and run

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Supabase setup

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste and run the script in **`supabase/schema.sql`**.
   - Creates **`products`** (`id` uuid, `name`, `description`, `price`, `image_url`, `category`, `is_featured`) and **`orders`** (`id` uuid, `name`, `phone`, `address`, `product_id` → `products.id`, `created_at` default `now()`).
   - Enables **RLS** with a public **select** policy on `products` and a public **insert** policy on `orders` (guest checkout). Tighten these for production if needed.
   - Inserts sample products with categories **Wedding**, **Festival**, **Gifting**, **Casual** and several **best sellers** (`is_featured = true`).

3. In **Table Editor**, you can add or edit products; use **`is_featured`** for the **Best Sellers** section and **`category`** for **By Occasion** on the home page.

## Admin panel (`/admin`)

1. In Supabase → **Authentication** → **Providers**, ensure **Email** is enabled.
2. **Authentication** → **Users** → **Add user** — create an account (email + password) you will use only for the shop admin.
3. In **SQL Editor**, run **`supabase/admin-rls.sql`**. That adds RLS so **authenticated** users can **insert / update / delete** `products`, and **read** `orders` for the Admin **Orders** screen (guests still only insert orders).
4. Run **`supabase/storage-product-images.sql`** so the **`product-images`** Storage bucket exists with policies: **public read** (shop images) and **authenticated upload** (admin picks photos from your computer; the app stores the public URL in `products.image_url`).
5. Open **`http://localhost:5173/admin`** (or your deployed URL + `/admin`), sign in with that user, then add, edit, or delete products in the UI.

To limit writes to a single email, edit `admin-rls.sql` and use the commented JWT email checks instead of the broad `authenticated` policies.

### Optional: `public.profiles` row for your admin

If you want a **`profiles`** table linked to `auth.users` (for `is_admin`, display name, etc.), open **`supabase/profiles-admin.sql`**, replace `REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com` with the same email you use in Supabase Auth, then run the script in the SQL Editor. The app’s `/admin` login does **not** require `profiles`; this is only if you want that table for later features.

If you previously created `products` / `orders` with **bigint** IDs and no `category` / `is_featured` columns, either alter the tables to match the new shape or (in development) drop those tables and re-run **`supabase/schema.sql`** so the app and database stay aligned.

**Photos missing in the shop?** Sample rows used `picsum.photos`, which is often blocked. Run **`supabase/fix-product-images.sql`** in the SQL editor to rewrite those URLs to Unsplash, or set `image_url` in **Admin** / Table Editor. **Upload from disk** in Admin needs **`storage-product-images.sql`** run once; if uploads fail with an RLS or bucket error, re-run that script or confirm the bucket **`product-images`** is **public** in **Storage**.

## WhatsApp number

Order success opens:

`https://wa.me/917889431806?text=...`

The business number is configured in **`src/components/OrderFormModal.js`** as `WHATSAPP_E164 = '917889431806'` (i.e. **+91 7889431806**). Change that constant to your own `countryCode + number` without `+` or spaces if you use a different line.

## Project layout

- `src/App.js` — Router shell, **ZoonNavbar** (luxury header), routes, **Footer**
- `src/pages/Home.js` — Hero, Best Sellers, By Occasion, Why Pashmina2026, All products
- `src/pages/Admin.js` — Sign-in + product CRUD (requires Auth + `admin-rls.sql`)
- `src/components/ProductCard.js` — Product tile + **Order Now**
- `src/components/OrderFormModal.js` — Guest order form, validation, Supabase insert, WhatsApp
- `src/components/zoon-navbar/` — Premium **ZoonPashmina** header (Framer Motion). `Footer.js` — site chrome
- `src/supabaseClient.js` — Supabase client
- `src/contactInfo.js` — Footer phone / email / address (separate from WhatsApp order line)

## Payments

This version has **no payment gateway** — only database persistence + WhatsApp handoff, as requested.
