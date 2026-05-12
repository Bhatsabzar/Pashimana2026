import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-[#0c0a09] via-[#12100e] to-cream-100 text-stone-200">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a227]/90">Our story</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#f5e6c8] sm:text-5xl">About ZoonPashmina</h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
          ZoonPashmina celebrates Kashmir&apos;s weaving heritage — fine pashmina fibres, patient handwork, and silhouettes
          made for weddings, festivals, and everyday grace. This page is ready for your brand story, atelier imagery, and
          founder letter.
        </p>
        <Link
          to="/collection"
          className="mt-10 inline-flex rounded-full bg-gradient-to-r from-[#9a7b2c] via-[#c9a227] to-[#9a7b2c] px-6 py-3 text-sm font-semibold text-[#0c0a09] shadow-lg shadow-amber-900/20 transition hover:brightness-110"
        >
          Explore the collection
        </Link>
      </div>
    </div>
  )
}
