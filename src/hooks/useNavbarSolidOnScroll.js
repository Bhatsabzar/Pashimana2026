import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const DEFAULT_THRESHOLD = 48

/**
 * After scrolling past `threshold` px, navbar uses “solid” styling.
 * Non-home routes start solid immediately.
 */
export function useNavbarSolidOnScroll(threshold = DEFAULT_THRESHOLD) {
  const { pathname } = useLocation()
  const [solid, setSolid] = useState(pathname !== '/')

  useEffect(() => {
    if (pathname !== '/') {
      setSolid(true)
      return
    }

    const onScroll = () => {
      setSolid(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname, threshold])

  return solid
}
