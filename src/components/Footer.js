import { CONTACT } from '../contactInfo'

export default function Footer() {
  const telHref = `tel:+${CONTACT.phoneE164}`

  return (
    <footer id="contact" className="mt-auto border-t border-stone-200 bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-ink">ZoonPashmina</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
              Heritage luxury from Kashmir. Guest checkout — we confirm every order personally.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Visit
            </h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-ink-muted">
              {CONTACT.addressLine}
            </address>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500">
              Contact
            </h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li>
                <a
                  href={telHref}
                  className="font-medium text-ink underline decoration-stone-300 decoration-1 underline-offset-4 transition hover:decoration-amber-700/60"
                >
                  {CONTACT.phoneDisplay}
                </a>
                <span className="text-ink-muted"> · {CONTACT.phoneLocal}</span>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all text-ink underline decoration-stone-300 decoration-1 underline-offset-4 transition hover:decoration-amber-700/60"
                >
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-stone-200 pt-8 text-xs text-ink-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Pashmina2026. All rights reserved.</p>
          <p>Pahalgam, Jammu &amp; Kashmir — 192126</p>
        </div>
      </div>
    </footer>
  )
}
