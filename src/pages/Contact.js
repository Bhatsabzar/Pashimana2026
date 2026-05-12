import { Link } from 'react-router-dom'
import { CONTACT } from '../contactInfo'

export default function Contact() {
  const telHref = `tel:+${CONTACT.phoneE164}`

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-[#0c0a09] via-[#12100e] to-cream-100 text-stone-200">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a227]/90">Concierge</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#f5e6c8] sm:text-5xl">Contact</h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-400 sm:text-base">
          For bespoke orders, trunk shows, or wholesale enquiries, reach our team. Guest checkout on the home page still
          routes through WhatsApp for instant confirmation.
        </p>
        <ul className="mt-10 space-y-4 text-sm text-stone-300">
          <li>
            <span className="text-stone-500">Phone · </span>
            <a href={telHref} className="font-semibold text-[#e8d4a8] underline decoration-[#c9a227]/40 underline-offset-4 hover:decoration-[#c9a227]">
              {CONTACT.phoneDisplay}
            </a>
          </li>
          <li>
            <span className="text-stone-500">Email · </span>
            <a href={`mailto:${CONTACT.email}`} className="font-semibold text-[#e8d4a8] hover:underline">
              {CONTACT.email}
            </a>
          </li>
          <li className="max-w-md leading-relaxed text-stone-400">
            <span className="text-stone-500">Atelier · </span>
            {CONTACT.addressLine}
          </li>
        </ul>
        <Link
          to="/"
          className="mt-12 inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#c9a227]/40"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
