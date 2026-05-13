import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  buildOrderMessage,
  DEFAULT_WHATSAPP_NUMBER_E164,
  formatINR,
  openWhatsApp,
} from '../utils/whatsapp'

const phoneDigits = (value) => value.replace(/\D/g, '')

export default function OrderFormModal({ product, onClose, onOrderSuccess }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const open = Boolean(product)

  useEffect(() => {
    if (!open) {
      setName('')
      setPhone('')
      setAddress('')
      setQuantity(1)
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
    const qty = Number(quantity)

    if (!trimmedName) next.name = 'Name is required.'
    if (!trimmedAddress) next.address = 'Address is required.'
    if (!/^\d{10}$/.test(digits)) {
      next.phone = 'Enter a valid 10-digit Indian mobile number (digits only).'
    }
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) {
      next.quantity = 'Enter a quantity between 1 and 99.'
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
    const qty = Number(quantity)

    setSubmitting(true)

    const { error: insertError } = await supabase.from('orders').insert({
      name: trimmedName,
      phone: digits,
      address: trimmedAddress,
      product_id: product.id,
    })

    setSubmitting(false)

    if (insertError) {
      setFormError(insertError.message)
      return
    }

    const text = buildOrderMessage({
      productName: product.name ?? '',
      price: product.price ?? null,
      quantity: qty,
      name: trimmedName,
      phone: digits,
      address: trimmedAddress,
    })

    openWhatsApp({ phoneE164: DEFAULT_WHATSAPP_NUMBER_E164, text })

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
          <div className="rounded-2xl border border-stone-200 bg-white/70 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Order summary</p>
                <p className="mt-1 truncate text-sm font-semibold text-ink">{product.name || 'Selected product'}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-ink">₹{formatINR(product.price)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label htmlFor="order-qty" className="text-sm font-medium text-ink">
                Quantity
              </label>
              <input
                id="order-qty"
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`${inputClass} w-28 text-right ${errRing('quantity')}`}
                aria-invalid={Boolean(fieldErrors.quantity)}
                aria-describedby={fieldErrors.quantity ? 'err-qty' : undefined}
              />
            </div>
            {fieldErrors.quantity && (
              <p id="err-qty" className="mt-1 text-sm text-red-600">
                {fieldErrors.quantity}
              </p>
            )}
          </div>

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
