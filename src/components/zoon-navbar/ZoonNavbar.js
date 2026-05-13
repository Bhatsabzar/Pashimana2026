import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CATEGORY_ITEMS, MAIN_NAV } from './navConfig'
import { IconCart, IconChevronDown, IconClose, IconMenu, IconSearch, IconWishlist } from './Icons'
import { useNavbarSolidOnScroll } from '../../hooks/useNavbarSolidOnScroll'

const easeLux = [0.22, 1, 0.36, 1]

function PremiumNavLink({ to, end, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center justify-center border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] transition',
          'focus:outline-none focus:ring-2 focus:ring-[#c9a36a]/60 focus:ring-offset-0',
          isActive
            ? 'border-[#c9a36a] bg-[#14110e] text-[#e6c58b] shadow-[0_0_0_1px_rgba(201,163,106,0.25)]'
            : 'border-transparent text-white/90 hover:border-[#c9a36a]/60 hover:text-white',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

function IconButton({ label, children }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className={[
        'rounded-full p-2.5 text-white/90 transition-colors duration-300 hover:bg-white/10 hover:text-white',
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}

function CategoryDropdown({ mobile, onNavigate }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)

  const clearTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearTimer()
    closeTimer.current = window.setTimeout(() => setOpen(false), 160)
  }

  useEffect(() => () => clearTimer(), [])

  const openMenu = () => {
    clearTimer()
    setOpen(true)
  }

  const baseBtn = mobile
    ? 'flex w-full items-center justify-between border border-white/10 bg-white/5 px-4 py-3.5 text-left text-[12px] font-semibold uppercase tracking-[0.22em] text-white'
    : [
        'group inline-flex items-center gap-1.5 border border-transparent px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/90 transition',
        open ? 'border-[#c9a36a]/70 text-white' : 'hover:border-[#c9a36a]/60 hover:text-white',
      ].join(' ')

  if (mobile) {
    return (
      <div className="space-y-2">
        <button type="button" className={baseBtn} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span>Categories</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <IconChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: easeLux }}
              className="overflow-hidden rounded-2xl border border-[#d4a08c]/15 bg-[#231a1f]/85"
            >
              <ul className="divide-y divide-[#d4a08c]/10 py-1">
                {CATEGORY_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="block px-4 py-3 transition hover:bg-white/5"
                      onClick={() => {
                        setOpen(false)
                        onNavigate?.()
                      }}
                    >
                      <p className="text-sm font-bold tracking-wide text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">{item.label}</p>
                      <p className="mt-0.5 text-xs font-medium text-[#d4c9c4]">{item.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
      <button type="button" className={baseBtn} aria-expanded={open} aria-haspopup="true">
        <span>Categories</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <IconChevronDown className="h-4 w-4 opacity-90" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: easeLux }}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-[70] w-[min(100vw-2rem,20rem)] origin-top"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <div className="overflow-hidden border border-[#c9a36a]/25 bg-black/95 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
              <ul className="divide-y divide-white/10">
                {CATEGORY_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.25, ease: easeLux }}
                  >
                    <Link
                      to={item.href}
                      className="block px-5 py-4 transition hover:bg-white/[0.06]"
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm font-semibold tracking-wide text-white">{item.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/55">{item.description}</p>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileDrawer({ open, onClose }) {
  const { pathname } = useLocation()

  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-[#1a0f14]/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.aside
            id="zoon-mobile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[90] flex w-[min(100%,22rem)] flex-col border-l border-[#d4a08c]/20 bg-[#1a1416]/98 shadow-2xl shadow-[#2a1518]/60 backdrop-blur-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="flex items-center justify-between border-b border-[#d4a08c]/15 px-5 py-4">
              <span className="font-display text-lg font-semibold tracking-[0.12em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.75)]">
                Menu
              </span>
              <motion.button
                type="button"
                aria-label="Close"
                whileTap={{ scale: 0.92 }}
                className="rounded-full p-2 text-[#ebe3df] [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] hover:bg-white/15 hover:text-white"
                onClick={onClose}
              >
                <IconClose className="h-6 w-6" />
              </motion.button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <div className="flex flex-col gap-1">
                {MAIN_NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3, ease: easeLux }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        [
                          'block rounded-2xl px-4 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] transition',
                          isActive
                            ? 'bg-gradient-to-r from-[#a84858]/55 to-[#d49084]/35 text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]'
                            : 'text-[#ebe3df] [text-shadow:0_1px_3px_rgba(0,0,0,0.65)] hover:bg-white/10 hover:text-white',
                        ].join(' ')
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22, duration: 0.3, ease: easeLux }}
                  className="pt-2"
                >
                  <CategoryDropdown mobile onNavigate={onClose} />
                </motion.div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 border-t border-[#d4a08c]/15 pt-6">
                <IconButton label="Search">
                  <IconSearch className="h-5 w-5" />
                </IconButton>
                <IconButton label="Wishlist">
                  <IconWishlist className="h-5 w-5" />
                </IconButton>
                <IconButton label="Shopping bag">
                  <IconCart className="h-5 w-5" />
                </IconButton>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.35, ease: easeLux }}
                className="mt-8 px-1"
              >
                <Link
                  to="/collection"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 border border-[#c9a36a] bg-[#c9a36a] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-black shadow-lg shadow-black/40 transition hover:bg-[#d9b27b]"
                >
                  SHOP NOW <span className="text-black/70">›</span>
                </Link>
              </motion.div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default function ZoonNavbar() {
  const solid = useNavbarSolidOnScroll()
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: easeLux }}
        className={[
          'sticky top-0 z-50 border-b border-white/10 bg-black/90 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.85)] backdrop-blur-xl',
        ].join(' ')}
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a36a]/55 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 flex-col"
            onClick={closeMobile}
          >
            <span className="font-display text-[1.4rem] font-semibold tracking-wide text-white sm:text-2xl">
              ZOONPASHMINA
            </span>
            <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.32em] text-white/65 sm:block">
              Kashmir · Since 1998
            </span>
            <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55 sm:block">
              Er Sabzar Bhat created
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-6 md:flex" aria-label="Primary">
            {MAIN_NAV.map((item) => (
              <PremiumNavLink key={item.to} to={item.to} end={item.end} label={item.label} />
            ))}
            <CategoryDropdown />
          </nav>

          <div className="hidden items-center justify-end gap-2 md:flex">
            <IconButton label="Search">
              <IconSearch className="h-5 w-5" />
            </IconButton>
            <IconButton label="Wishlist">
              <IconWishlist className="h-5 w-5" />
            </IconButton>
            <IconButton label="Shopping bag">
              <IconCart className="h-5 w-5" />
            </IconButton>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="ml-2">
              <Link
                to="/collection"
                className="inline-flex items-center justify-center gap-2 border border-[#c9a36a] bg-[#c9a36a] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-black shadow-[0_10px_22px_-14px_rgba(201,163,106,0.65)] transition hover:bg-[#d9b27b]"
              >
                SHOP NOW <span className="text-black/70">›</span>
              </Link>
            </motion.div>
          </div>

          <motion.button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white shadow-md backdrop-blur-md transition hover:border-white/35 hover:bg-white/10 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="zoon-mobile-drawer"
            whileTap={{ scale: 0.94 }}
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <IconMenu className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.header>

      <div id="zoon-mobile-drawer-host">
        <MobileDrawer open={mobileOpen} onClose={closeMobile} solid={solid} />
      </div>
    </>
  )
}
