import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { uploadProductImage } from '../uploadProductImage'

const CATEGORIES = ['Wedding', 'Festival', 'Gifting', 'Casual']

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
]

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: 'Wedding',
  is_featured: false,
}

function IconGrid({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" strokeLinejoin="round" />
    </svg>
  )
}

function IconBox({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  )
}

function IconReceipt({ className }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function navIcon(id) {
  if (id === 'dashboard') return IconGrid
  if (id === 'products') return IconBox
  return IconReceipt
}

function NavButton({ id, label, active, onClick }) {
  const I = navIcon(id)
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={[
        'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition',
        active
          ? 'bg-violet-100 text-violet-900 shadow-sm ring-2 ring-violet-500/25'
          : 'text-slate-600 hover:bg-violet-50/90 hover:text-violet-800',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
          active ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25' : 'bg-slate-100 text-violet-600',
        ].join(' ')}
      >
        <I className="h-5 w-5" />
      </span>
      {label}
    </button>
  )
}

const inputZepto =
  'mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20'

const btnPrimary =
  'rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'

const btnSecondary =
  'rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50/50'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)

  const [section, setSection] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState(null)
  const [form, setForm] = useState(emptyForm)
  /** Local file chosen for next save (uploaded to Storage). */
  const [imageFile, setImageFile] = useState(null)
  /** Blob URL preview for `imageFile`; revoked when cleared or replaced. */
  const [imagePreview, setImagePreview] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [toast, setToast] = useState(null)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [ordersCount, setOrdersCount] = useState(null)

  const goTo = useCallback((id) => {
    setSection(id)
    setMobileMenuOpen(false)
  }, [])

  useEffect(() => {
    let mounted = true
    if (!isSupabaseConfigured) {
      setAuthLoading(false)
      return () => {
        mounted = false
      }
    }
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        if (mounted) {
          setSession(s)
          setAuthLoading(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null)
          setAuthLoading(false)
        }
      })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, is_featured')
      .order('name', { ascending: true })
    setListLoading(false)
    if (error) {
      setListError(error.message)
      setProducts([])
      return
    }
    setProducts(data ?? [])
  }, [])

  useEffect(() => {
    if (session) loadProducts()
    else setProducts([])
  }, [session, loadProducts])

  useEffect(() => {
    if (!session || section !== 'orders') return
    let cancelled = false
    async function load() {
      setOrdersLoading(true)
      setOrdersError(null)
      const { data, error } = await supabase
        .from('orders')
        .select('id, name, phone, address, product_id, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      if (cancelled) return
      setOrdersLoading(false)
      if (error) {
        setOrdersError(error.message)
        setOrders([])
        return
      }
      setOrders(data ?? [])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session, section])

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  useEffect(() => {
    if (!session || section !== 'dashboard') return
    let cancelled = false
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (cancelled) return
        setOrdersCount(error ? null : count ?? 0)
      })
    return () => {
      cancelled = true
    }
  }, [session, section])

  async function handleSignIn(e) {
    e.preventDefault()
    setAuthError(null)
    if (!isSupabaseConfigured) {
      setAuthError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the project root .env (no quotes, no spaces around =), then stop and run npm run dev again.'
      )
      return
    }
    setSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) setAuthError(error.message)
    } catch (err) {
      const msg = err?.message || String(err)
      if (msg === 'Failed to fetch' || err?.name === 'TypeError') {
        setAuthError(
          'Cannot reach Supabase (network). Check VITE_SUPABASE_URL, project not Paused, VPN/firewall, and restart dev after .env changes.'
        )
      } else {
        setAuthError(msg)
      }
    } finally {
      setSigningIn(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setImageFile(null)
    setImagePreview(null)
    setForm(emptyForm)
    setEditingId(null)
    setSection('dashboard')
    setMobileMenuOpen(false)
  }

  function startCreate() {
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setForm(emptyForm)
    setSaveError(null)
  }

  function startEdit(p) {
    goTo('products')
    setImageFile(null)
    setImagePreview(null)
    setEditingId(p.id)
    setForm({
      name: p.name ?? '',
      description: p.description ?? '',
      price: String(p.price ?? ''),
      image_url: p.image_url ?? '',
      category: CATEGORIES.includes(p.category) ? p.category : 'Wedding',
      is_featured: Boolean(p.is_featured),
    })
    setSaveError(null)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError(null)
    const name = form.name.trim()
    const priceNum = Number(form.price)
    if (!name) {
      setSaveError('Name is required.')
      return
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setSaveError('Enter a valid price (0 or more).')
      return
    }

    let imageUrl = form.image_url.trim() || null
    if (imageFile && !isSupabaseConfigured) {
      setSaveError('Supabase is not configured; cannot upload images.')
      return
    }

    setSaving(true)
    if (imageFile) {
      const { publicUrl, error: uploadErr } = await uploadProductImage(supabase, imageFile)
      if (uploadErr) {
        setSaving(false)
        setSaveError(uploadErr.message || String(uploadErr))
        return
      }
      imageUrl = publicUrl
    }

    const row = {
      name,
      description: form.description.trim() || null,
      price: priceNum,
      image_url: imageUrl,
      category: form.category || null,
      is_featured: form.is_featured,
    }

    if (editingId) {
      const { error } = await supabase.from('products').update(row).eq('id', editingId)
      setSaving(false)
      if (error) {
        setSaveError(error.message)
        return
      }
      setToast('Product updated.')
    } else {
      const { error } = await supabase.from('products').insert(row)
      setSaving(false)
      if (error) {
        setSaveError(error.message)
        return
      }
      setToast('Product added.')
    }
    setTimeout(() => setToast(null), 2500)
    setImageFile(null)
    setImagePreview(null)
    setForm(emptyForm)
    setEditingId(null)
    loadProducts()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product? Orders that reference it may block deletion.')) return
    setListError(null)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      setListError(error.message)
      return
    }
    if (editingId === id) startCreate()
    setToast('Product deleted.')
    setTimeout(() => setToast(null), 2500)
    loadProducts()
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-700 via-violet-600 to-purple-900 px-4 text-lg font-semibold text-white">
        Loading…
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-violet-700 via-violet-600 to-purple-900 px-4 py-10">
        <div className="mb-8 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200">Seller console</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Pashmina2026</h1>
          <p className="mt-2 text-sm text-violet-100/90">Sign in to manage your store</p>
        </div>
        <div className="w-full max-w-md rounded-[1.75rem] bg-white p-8 shadow-2xl shadow-purple-900/40">
          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Add <code className="rounded bg-white px-1 font-mono text-xs">.env</code> with Supabase URL + anon key, then restart{' '}
              <code className="rounded bg-white px-1 font-mono text-xs">npm run dev</code>.
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-5">
            {authError && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{authError}</p>
            )}
            <div>
              <label htmlFor="admin-email" className="text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputZepto}
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputZepto}
                required
              />
            </div>
            <button type="submit" disabled={signingIn} className={`${btnPrimary} w-full py-3.5`}>
              {signingIn ? 'Signing in…' : 'Continue'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Supabase user +{' '}
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">admin-rls.sql</code>
          </p>
          <p className="mt-4 text-center">
            <Link to="/" className="text-sm font-semibold text-violet-600 underline decoration-violet-300 underline-offset-4 hover:text-violet-800">
              ← Back to store
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row">
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-center text-sm font-semibold text-violet-900 shadow-xl shadow-violet-900/10"
          role="status"
        >
          {toast}
        </div>
      )}

      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile top bar — Zepto-style purple strip */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 text-white shadow-md md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-black">P</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Pashmina2026</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-violet-100">Console</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl bg-white/15 p-2.5 transition hover:bg-white/25"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(19rem,88vw)] flex-col border-r border-slate-200/80 bg-white shadow-2xl transition-transform duration-200 ease-out md:static md:z-0 md:w-64 md:translate-x-0 md:shadow-none',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-5 md:block">
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-black text-white shadow-lg shadow-violet-600/30">
                P
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight text-slate-900">Pashmina2026</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">Seller hub</p>
              </div>
            </div>
          </div>
          <p className="font-bold text-slate-900 md:hidden">Menu</p>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-3" aria-label="Admin sections">
          {NAV.map((item) => (
            <NavButton key={item.id} {...item} active={section === item.id} onClick={goTo} />
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="mb-3 truncate rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600" title={session.user?.email ?? ''}>
            {session.user?.email}
          </p>
          <Link
            to="/"
            className="mb-2 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
          >
            View store
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6 md:py-8 lg:px-10">
        {section === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Your store at a glance</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={() => goTo('products')}
                className="group rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                  <IconBox className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-violet-600">Products</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{listLoading ? '…' : products.length}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">Manage catalogue &amp; featured</p>
              </button>
              <button
                type="button"
                onClick={() => goTo('orders')}
                className="group rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <IconReceipt className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600">Orders</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{ordersCount === null ? '…' : ordersCount}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">Guest checkouts from your site</p>
              </button>
              <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/50 p-6 sm:col-span-2 lg:col-span-1">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Tip</p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Run <code className="rounded-lg bg-white px-2 py-0.5 font-mono text-xs text-violet-800">admin-rls.sql</code> if lists stay empty after login. Run{' '}
                  <code className="rounded-lg bg-white px-2 py-0.5 font-mono text-xs text-violet-800">storage-product-images.sql</code> if photo uploads from your computer fail.
                </p>
              </div>
            </div>
          </div>
        )}

        {section === 'products' && (
          <div>
            <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Products</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">Add, edit, or remove items</p>
              </div>
              <button type="button" onClick={startCreate} className={`${btnPrimary} shrink-0 px-6`}>
                + New product
              </button>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-5">
              <section className="xl:col-span-2">
                <h2 className="text-lg font-black text-slate-900">{editingId ? 'Edit product' : 'Add product'}</h2>
                <form onSubmit={handleSave} className="mt-4 space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  {saveError && (
                    <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{saveError}</p>
                  )}
                  <div>
                    <label className="text-sm font-bold text-slate-700">Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className={inputZepto}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className={`${inputZepto} resize-y`}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-bold text-slate-700">Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        className={inputZepto}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className={`${inputZepto} bg-white`}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">Photo</label>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">Choose a file from your computer (saved to Supabase Storage), or paste a URL below.</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        e.target.value = ''
                        if (!f) return
                        setSaveError(null)
                        if (!f.type.startsWith('image/')) {
                          setSaveError('Choose a JPEG, PNG, WebP, or GIF image.')
                          return
                        }
                        if (f.size > 5 * 1024 * 1024) {
                          setSaveError('Image must be 5 MB or smaller.')
                          return
                        }
                        setImageFile(f)
                        setImagePreview(URL.createObjectURL(f))
                      }}
                      className="mt-2 block w-full text-sm font-medium text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-violet-100 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-violet-800 hover:file:bg-violet-200"
                    />
                    {(imagePreview || form.image_url.trim()) && (
                      <div className="mt-3 flex flex-wrap items-start gap-3">
                        <img
                          src={imagePreview || form.image_url.trim()}
                          alt=""
                          className="h-28 w-28 rounded-2xl border border-slate-200 object-cover shadow-sm"
                        />
                        {imageFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null)
                              setImagePreview(null)
                            }}
                            className={btnSecondary}
                          >
                            Remove selected file
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">Image URL (optional)</label>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://… if you are not uploading a file"
                      className={inputZepto}
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                      className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    Best seller (featured on home)
                  </label>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="submit" disabled={saving} className={btnPrimary}>
                      {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish product'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={startCreate} className={btnSecondary}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section className="xl:col-span-3">
                <h2 className="text-lg font-black text-slate-900">All products</h2>
                {listError && (
                  <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{listError}</p>
                )}
                {listLoading ? (
                  <p className="mt-6 font-medium text-slate-500">Loading…</p>
                ) : (
                  <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-violet-50/80 text-xs font-bold uppercase tracking-wide text-violet-900">
                          <tr>
                            <th className="px-4 py-3.5">Name</th>
                            <th className="px-4 py-3.5">Category</th>
                            <th className="px-4 py-3.5">Price</th>
                            <th className="px-4 py-3.5">Featured</th>
                            <th className="px-4 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products.map((p) => (
                            <tr key={p.id} className={editingId === p.id ? 'bg-violet-50/60' : 'hover:bg-slate-50/80'}>
                              <td className="max-w-[200px] truncate px-4 py-3.5 font-semibold text-slate-900">{p.name}</td>
                              <td className="px-4 py-3.5 text-slate-600">{p.category ?? '—'}</td>
                              <td className="px-4 py-3.5 font-bold tabular-nums text-slate-900">₹{Number(p.price).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3.5 text-slate-600">{p.is_featured ? 'Yes' : '—'}</td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => startEdit(p)}
                                  className="mr-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-800 transition hover:bg-violet-200"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(p.id)}
                                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {products.length === 0 && !listLoading && (
                      <p className="px-4 py-10 text-center font-medium text-slate-500">No products yet.</p>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {section === 'orders' && (
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Orders</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Recent checkouts</p>
            {ordersError && (
              <p className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{ordersError}</p>
            )}
            {ordersLoading ? (
              <p className="mt-8 font-medium text-slate-500">Loading…</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-slate-100 bg-violet-50/80 text-xs font-bold uppercase tracking-wide text-violet-900">
                      <tr>
                        <th className="px-4 py-3.5">When</th>
                        <th className="px-4 py-3.5">Name</th>
                        <th className="px-4 py-3.5">Phone</th>
                        <th className="px-4 py-3.5">Product ID</th>
                        <th className="px-4 py-3.5">Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/80">
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                            {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-900">{o.name}</td>
                          <td className="px-4 py-3.5 font-medium tabular-nums text-slate-800">{o.phone}</td>
                          <td className="max-w-[120px] truncate px-4 py-3.5 font-mono text-xs text-slate-500">{o.product_id}</td>
                          <td className="max-w-[220px] truncate px-4 py-3.5 text-slate-600" title={o.address}>
                            {o.address}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orders.length === 0 && !ordersLoading && !ordersError && (
                  <p className="px-4 py-10 text-center font-medium text-slate-500">No orders yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
