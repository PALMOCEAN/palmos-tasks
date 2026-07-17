import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (props: P) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export function NoteIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h9l5 5v13H6z" />
      <path d="M14 3v6h6" />
      <path d="M9 13h6M9 17h6M9 9h2" />
    </svg>
  )
}

export function BoardIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="6" height="16" rx="1" />
      <rect x="9.5" y="4" width="6" height="10" rx="1" />
      <rect x="16" y="4" width="5" height="13" rx="1" />
    </svg>
  )
}

export function FocusIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function CheckIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

export function ClockIcon(props: P) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function FlagIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M4 4v16M4 4h13l-3 4 3 4H4" />
    </svg>
  )
}

export function XIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function PlayIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  )
}

export function PauseIcon(props: P) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

export function DotsIcon(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  )
}

export function PlusIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ChevronLeftIcon(props: P) {
  return (
    <svg {...base(props)}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}
