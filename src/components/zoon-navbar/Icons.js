function iconProps(className) {
  return {
    className: className ?? 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }
}

export function IconSearch(props) {
  return (
    <svg {...iconProps(props.className)}>
      <path strokeLinecap="round" d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
      <path strokeLinecap="round" d="M16.5 16.5 21 21" />
    </svg>
  )
}

export function IconWishlist(props) {
  return (
    <svg {...iconProps(props.className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  )
}

export function IconCart(props) {
  return (
    <svg {...iconProps(props.className)}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconChevronDown(props) {
  return (
    <svg {...iconProps(props.className)} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconMenu(props) {
  return (
    <svg {...iconProps(props.className)} strokeWidth={1.75}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg {...iconProps(props.className)} strokeWidth={1.75}>
      <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
