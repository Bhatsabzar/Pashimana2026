import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import ProductCard from '../components/ProductCard'
import OrderFormModal from '../components/OrderFormModal'

const HERO_SINCE_YEAR = 1998
const OCCASIONS = ['Wedding', 'Festival', 'Gifting', 'Casual']

/** Hero — sharp full-width still (Unsplash). Change URL to your own asset anytime. */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2560&q=90'

const WHY = [
  { title: 'Pure Pashmina', body: 'Fine natural fibres, sourced and finished with care for a soft, lasting drape.' },
  { title: 'Handmade', body: 'Traditional Kashmir craftsmanship — subtle texture you can feel, not factory-perfect flatness.' },
  { title: 'Global Shipping', body: 'Careful packing from Pahalgam to your doorstep, with clear communication on dispatch.' },
  { title: 'Trusted Service', body: 'Guest checkout: your order is saved, then WhatsApp opens so we can confirm details personally.' },
]

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-ink-muted">{description}</p>}
    </div>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderProduct, setOrderProduct] = useState(null)
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const showToast = (message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      if (!isSupabaseConfigured) {
        setLoading(false)
        setProducts([])
        setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart npm run dev.')
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('id, name, description, price, image_url, category, is_featured')
          .order('name', { ascending: true })

        if (cancelled) return

        if (fetchError) {
          setError(fetchError.message)
          setProducts([])
        } else {
          setProducts(data ?? [])
        }
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        const msg = err?.message || String(err)
        if (msg === 'Failed to fetch' || err?.name === 'TypeError') {
          setError(
            'Cannot reach Supabase (network). Check: Supabase project is not Paused, VPN/firewall, and that VITE_SUPABASE_URL is reachable in your browser, then restart npm run dev.'
          )
        } else {
          setError(msg)
        }
        setProducts([])
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const prevProductCount = useRef(0)

  useEffect(() => {
    if (products.length === 0) {
      prevProductCount.current = 0
      return
    }
    const wasEmpty = prevProductCount.current === 0
    prevProductCount.current = products.length
    if (!wasEmpty) return
    const first = OCCASIONS.find((o) =>
      products.some((p) => (p.category || '').toLowerCase() === o.toLowerCase())
    )
    if (first) setOccasion(first)
  }, [products])

  const featured = useMemo(
    () => products.filter((p) => p.is_featured === true),
    [products]
  )

  const byOccasion = useMemo(() => {
    const o = occasion.toLowerCase()
    return products.filter((p) => (p.category || '').toLowerCase() === o)
  }, [products, occasion])

  const occasionCounts = useMemo(() => {
    const map = {}
    for (const o of OCCASIONS) {
      map[o] = products.filter((p) => (p.category || '').toLowerCase() === o.toLowerCase()).length
    }
    return map
  }, [products])

  return (
    <div className="w-full">
      <section
        id="site-hero"
        className="relative -mt-[4.5rem] min-h-[min(88vh,52rem)] overflow-hidden border-b border-white/25 pt-[4.5rem] sm:-mt-[4.75rem] sm:pt-[4.75rem]"
      >
        <img
          src={HERO_IMAGE}
          alt=""
          width={2560}
          height={1440}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          aria-hidden
        />
        {/* Light tint for brand warmth — keeps photo visible */}
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-br from-stone-900/12 via-transparent to-amber-950/8"
          aria-hidden
        />
        {/* Soft top vignette for navbar contrast */}
        <div
          className="absolute inset-x-0 top-0 z-[2] h-36 bg-gradient-to-b from-stone-950/25 to-transparent sm:h-40"
          aria-hidden
        />
        {/* Cream fade at bottom for headline readability */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[32%] z-[2] bg-gradient-to-b from-transparent via-cream-100/40 to-cream-100 sm:top-[36%]"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_100%_65%_at_50%_0%,rgba(255,255,255,0.1),transparent_48%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:pb-28 lg:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-950/90 drop-shadow-[0_1px_8px_rgba(255,255,255,0.95)]">
            Heritage luxury
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink drop-shadow-[0_2px_14px_rgba(255,253,250,0.95)] sm:text-5xl lg:text-[3.25rem]">
            <span className="bg-gradient-to-r from-violet-900 via-rose-800 to-amber-800 bg-clip-text text-transparent">
              ZoonPashmina
            </span>
            <span className="text-ink"> – Luxury Pashmina Shawls</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/95 drop-shadow-[0_1px_10px_rgba(255,253,250,0.9)] sm:text-xl">
            Since {HERO_SINCE_YEAR}, handcrafted Kashmir pashmina.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#best-sellers"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-700 via-rose-600 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              View best sellers
            </a>
            <a
              href="#all-products"
              className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/35 px-6 py-3 text-sm font-semibold text-ink shadow-sm backdrop-blur-md transition hover:border-violet-200 hover:bg-white/55"
            >
              Shop all
            </a>
          </div>
        </div>
      </section>

      <section id="best-sellers" className="border-b border-stone-200/90 bg-cream-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Curated"
            title="Best Sellers"
            description="Pieces our clients love — updated from your Supabase catalogue (is_featured = true)."
          />
          {loading && <p className="text-ink-muted">Loading…</p>}
          {!loading && !error && featured.length === 0 && (
            <p className="rounded-2xl border border-dashed border-stone-200 bg-white/60 px-5 py-8 text-ink-muted">
              No featured products yet. In Supabase, set <code className="text-ink">is_featured</code> to true for
              select rows in <code className="text-ink">products</code>.
            </p>
          )}
          {!loading && featured.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} onOrder={() => setOrderProduct(product)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="by-occasion" className="border-b border-stone-200/90 bg-cream-100 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Shop the mood"
            title="By Occasion"
            description="Wedding, festival, gifting, or everyday ease — tap a category to explore matching pieces."
          />
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOccasion(o)}
                className={[
                  'rounded-full border px-4 py-2 text-sm font-medium transition',
                  occasion === o
                    ? 'border-stone-900 bg-stone-900 text-cream-50 shadow-md shadow-stone-900/10'
                    : 'border-stone-200 bg-white text-ink-muted hover:border-stone-300 hover:text-ink',
                ].join(' ')}
              >
                {o}
                <span className="ml-1.5 text-xs opacity-70">({occasionCounts[o] ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="mt-10">
            {!loading && byOccasion.length === 0 && (
              <p className="rounded-2xl border border-stone-200 bg-white/70 px-5 py-8 text-ink-muted">
                No products tagged <strong className="text-ink">{occasion}</strong> yet. Assign{' '}
                <code className="text-ink">category</code> in Supabase to match these labels.
              </p>
            )}
            {byOccasion.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {byOccasion.map((product) => (
                  <ProductCard key={product.id} product={product} onOrder={() => setOrderProduct(product)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="why-us" className="border-b border-stone-200/90 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Why Pashmina2026?"
            title="Made to feel special"
            description="A calm, gallery-like shopping experience — clear information, honest photography, and human follow-up."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200/90 bg-cream-50 p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
              >
                <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="all-products" className="bg-cream-100 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="The shop"
            title="All products"
            description="Every piece in your Supabase catalogue — two per row on desktop, one on mobile."
          />
          {error && !loading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
              <p className="font-medium">Could not load products</p>
              <p className="mt-1 text-sm text-red-800/90">{error}</p>
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="text-ink-muted">
              No products yet. Run the SQL in <code className="text-ink">supabase/schema.sql</code> and refresh.
            </p>
          )}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onOrder={() => setOrderProduct(product)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <OrderFormModal
        product={orderProduct}
        onClose={() => setOrderProduct(null)}
        onOrderSuccess={() => showToast('Order placed. WhatsApp opened with your details.')}
      />

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-center text-sm font-medium text-ink shadow-card-hover"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
