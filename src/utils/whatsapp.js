const DEFAULT_TIMEOUT_MS = 1400

export const DEFAULT_WHATSAPP_NUMBER_E164 = '917889431806'

export function isMobileDevice() {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor || window.opera || ''
  // Covers iOS/Android + common mobile tokens
  return /android|iphone|ipad|ipod|iemobile|opera mini|mobile/i.test(ua)
}

export function formatINR(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return n.toLocaleString('en-IN')
}

export function buildOrderMessage({ productName, price, quantity, name, phone, address }) {
  const safeQty = Number.isFinite(Number(quantity)) ? Number(quantity) : 1
  const unit = Number(price)
  const total = Number.isFinite(unit) ? unit * safeQty : null
  const lines = [
    `Hi, I want to order: ${productName || 'Pashmina'}`,
    `Qty: ${safeQty}`,
    unit ? `Price: ₹${formatINR(unit)} each` : null,
    total !== null ? `Total: ₹${formatINR(total)}` : null,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
  ].filter(Boolean)

  return lines.join('\n')
}

export function buildWhatsAppWebUrl({ phoneE164, text }) {
  const encoded = encodeURIComponent(text)
  // Works on desktop and mobile browsers
  return `https://wa.me/${phoneE164}?text=${encoded}`
}

export function buildWhatsAppApiUrl({ phoneE164, text }) {
  const encoded = encodeURIComponent(text)
  // Often more reliable on mobile when switching into the app
  return `https://api.whatsapp.com/send?phone=${phoneE164}&text=${encoded}`
}

export function buildWhatsAppDeepLink({ phoneE164, text }) {
  const encoded = encodeURIComponent(text)
  // App deep link (best effort; fallback to web urls)
  return `whatsapp://send?phone=${phoneE164}&text=${encoded}`
}

/**
 * Production-ready open logic:
 * - Desktop: open web URL in new tab (or same tab fallback)
 * - Mobile: try deep link first, then fallback to api.whatsapp.com, then wa.me
 * Avoids the "blank tab" pattern on mobile by not pre-opening about:blank.
 */
export function openWhatsApp({ phoneE164, text }) {
  const webUrl = buildWhatsAppWebUrl({ phoneE164, text })
  const apiUrl = buildWhatsAppApiUrl({ phoneE164, text })
  const deepLink = buildWhatsAppDeepLink({ phoneE164, text })

  if (!isMobileDevice()) {
    const w = window.open(webUrl, '_blank', 'noopener,noreferrer')
    if (!w || w.closed) window.location.href = webUrl
    return
  }

  let navigated = false
  const start = Date.now()

  const fallback = () => {
    if (navigated) return
    navigated = true
    // Prefer api.whatsapp.com on mobile
    window.location.href = apiUrl
    // secondary fallback if api is blocked
    window.setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - start > DEFAULT_TIMEOUT_MS + 300) {
        window.location.href = webUrl
      }
    }, 600)
  }

  // If WhatsApp opens, tab becomes hidden quickly; cancel fallback.
  const onVis = () => {
    if (document.visibilityState === 'hidden') {
      navigated = true
      window.clearTimeout(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }
  document.addEventListener('visibilitychange', onVis)

  // Attempt deep link (best-effort)
  window.location.href = deepLink
  const t = window.setTimeout(fallback, DEFAULT_TIMEOUT_MS)
}

