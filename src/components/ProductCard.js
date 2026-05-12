import { useEffect, useState } from 'react'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

/** Shown when URL is missing or the remote image fails to load (blocked host, 404, etc.). */
const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop'

export default function ProductCard({ product, onOrder }) {
  const priceLabel = inr.format(Number(product.price) || 0)
  const desc = (product.description || '').replace(/\s+/g, ' ').trim()
  const rawUrl = (product.image_url || '').trim()
  const [imgSrc, setImgSrc] = useState(rawUrl || PLACEHOLDER_IMG)

  useEffect(() => {
    setImgSrc(rawUrl || PLACEHOLDER_IMG)
  }, [rawUrl, product.id])

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-card transition duration-300 ease-out hover:-translate-y-1 hover:border-stone-300 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== PLACEHOLDER_IMG) setImgSrc(PLACEHOLDER_IMG)
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-lg font-semibold leading-snug text-ink sm:text-xl">{product.name}</h2>
        <p className="mt-2 line-clamp-1 flex-1 text-sm text-ink-muted">{desc || '—'}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-base font-semibold tracking-tight text-ink sm:text-lg">{priceLabel}</span>
          <button
            type="button"
            onClick={onOrder}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-stone-900/10 transition hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/70 focus-visible:ring-offset-2 focus-visible:ring-white"
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  )
}
