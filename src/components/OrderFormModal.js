import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const WHATSAPP_E164 = '917889431806'

function buildWhatsAppUrl({ productName, name, phone, address }) {
  const lines = [
    `Hi, I want to order Pashmina: ${productName}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
  ]
  const text = lines.join('\n')
  return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`
}

const phoneDigits = (value) => value.replace(/\D/g, '')

export default function OrderFormModal({ product, onClose, onOrderSuccess }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const open = Boolean(product)

  useEffect(() => {
    if (!open) {
      setName('')
      setPhone('')
      setAddress('')
      setFormError(null)
      setFieldErrors({})
      setSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!product) return null

  function validate() {
    const next = {}
    const trimmedName = name.trim()
    const trimmedAddress = address.trim()
    const digits = phoneDigits(phone)

    if (!trimmedName) next.name = 'Name is required.'
    if (!trimmedAddress) next.address = 'Address is required.'
    if (!/^\d{10}$/.test(digits)) {
      next.phone = 'Enter a valid 10-digit Indian mobile number (digits only).'
    }

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    if (!validate()) return

    const trimmedName = name.trim()
    const trimmedAddress = address.trim()
    const digits = phoneDigits(phone)

    // Open before any await (and before setState) so popup counts as user-initiated.
    let popup = null
    try {
      popup = window.open('about:blank', '_blank', 'noopener,noreferrer')
    } catch {
      popup = null
    }

    setSubmitting(true)

    const { error: insertError } = await supabase.from('orders').insert({
      name: trimmedName,
      phone: digits,
      address: trimmedAddress,
      product_id: product.id,
    })

    setSubmitting(false)

    if (insertError) {
      try {
        popup?.close()
      } catch {
        /* ignore */
      }
      setFormError(insertError.message)
      return
    }

    const url = buildWhatsAppUrl({
      productName: product.name ?? '',
      name: trimmedName,
      phone: digits,
      address: trimmedAddress,
    })

    try {
      if (popup && !popup.closed) {
        popup.location.href = url
      } else {
        const w = window.open(url, '_blank', 'noopener,noreferrer')
        if (!w || w.closed) window.location.href = url
      }
    } catch {
      window.location.href = url
    }

    onOrderSuccess?.()
    onClose()
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700/40 focus:ring-2 focus:ring-amber-600/20'
  const errRing = (key) => (fieldErrors[key] ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : '')

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-full rounded-t-3xl border border-stone-200 bg-cream-50 p-5 text-stone-900 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 pr-2">
            <h2 id="order-modal-title" className="font-display text-xl font-semibold text-ink sm:text-2xl">
              Place Order – {product.name || 'Selected product'}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">Guest checkout · no payment on site</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-ink-muted transition hover:bg-cream-200 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="order-name" className="block text-sm font-medium text-ink">
              Name
            </label>
            <input
              id="order-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClass} ${errRing('name')}`}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'err-name' : undefined}
            />
            {fieldErrors.name && (
              <p id="err-name" className="mt-1 text-sm text-red-600">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="order-phone" className="block text-sm font-medium text-ink">
              Phone number
            </label>
            <input
              id="order-phone"
              type="tel"
              inputMode="numeric"
              maxLength={15}
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${inputClass} ${errRing('phone')}`}
              autoComplete="tel"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
            />
            {fieldErrors.phone && (
              <p id="err-phone" className="mt-1 text-sm text-red-600">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="order-address" className="block text-sm font-medium text-ink">
              Address
            </label>
            <textarea
              id="order-address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${inputClass} resize-none ${errRing('address')}`}
              autoComplete="street-address"
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={fieldErrors.address ? 'err-address' : undefined}
            />
            {fieldErrors.address && (
              <p id="err-address" className="mt-1 text-sm text-red-600">
                {fieldErrors.address}
              </p>
            )}
          </div>

          {formError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-stone-900 py-3 text-sm font-semibold text-cream-50 shadow-lg shadow-stone-900/15 transition enabled:hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  )
}
