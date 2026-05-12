import { Link, useSearchParams } from 'react-router-dom'

const LABELS = {
  'pashmina-shawls': 'Pashmina Shawls',
  'kashmiri-suits': 'Kashmiri Suits',
  handcrafted: 'Handcrafted Items',
}

export default function Collection() {
  const [params] = useSearchParams()
  const key = params.get('category') || ''
  const heading = LABELS[key] ?? (key ? 'Collection' : 'The Collection')

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-[#0c0a09] via-[#12100e] to-cream-100 text-stone-200">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a227]/90">ZoonPashmina</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#f5e6c8] sm:text-5xl">{heading}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
          Curated Kashmiri shawls, suits, and artisan pieces. Connect this page to your Supabase catalogue when you are ready
          to go live with category filters.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-stone-100 transition hover:border-[#c9a227]/40 hover:bg-white/10"
          >
            Back to home
          </Link>
          <Link
            to="/collection"
            className="rounded-full bg-gradient-to-r from-[#9a7b2c] via-[#c9a227] to-[#9a7b2c] px-5 py-2.5 text-sm font-semibold text-[#0c0a09] shadow-lg shadow-amber-900/20 transition hover:brightness-110"
          >
            View all categories
          </Link>
        </div>
      </div>
    </div>
  )
}
