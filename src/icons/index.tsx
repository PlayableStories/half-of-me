import type { ReactElement } from 'react'
import type { MemberType } from '../game/types'

/**
 * Minimal line-art SVG icons, one per card member. They share a 0..100 viewBox,
 * use currentColor for strokes, and carry no fill so they read clearly over the
 * coloured card faces. Each theme's two members get two distinct icons (e.g.
 * Sun and Rain) so the pairing is discovered, not given.
 */

const common = {
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

// — Home & living room —

function House() {
  return (
    <svg {...common}>
      <path d="M20 47 L50 22 L80 47" />
      <path d="M28 44 V78 H72 V44" />
      <rect x="44" y="58" width="12" height="20" />
    </svg>
  )
}

function LivingRoom() {
  return (
    <svg {...common}>
      <path d="M26 62 V48 Q26 44 30 44 H70 Q74 44 74 48 V62" />
      <path d="M22 62 Q22 56 28 56 H72 Q78 56 78 62 V70 H22 Z" />
      <path d="M28 70 V76 M72 70 V76" />
    </svg>
  )
}

// — Sun & rain —

function Sun() {
  return (
    <svg {...common}>
      <circle cx="50" cy="50" r="14" />
      <path d="M50 20 V30 M50 70 V80 M20 50 H30 M70 50 H80 M29 29 L36 36 M64 64 L71 71 M71 29 L64 36 M29 71 L36 64" />
    </svg>
  )
}

function Rain() {
  return (
    <svg {...common}>
      <path d="M32 54 H64 Q73 54 73 45 Q73 37 64 37 Q62 28 51 28 Q40 28 38 37 Q30 37 30 45 Q30 54 32 54 Z" />
      <path d="M38 62 L34 72 M52 62 L48 72 M66 60 L62 70" />
    </svg>
  )
}

// — Books & pen —

function Books() {
  return (
    <svg {...common}>
      <rect x="26" y="36" width="46" height="11" rx="2" />
      <rect x="24" y="49" width="50" height="11" rx="2" />
      <rect x="29" y="62" width="42" height="11" rx="2" />
      <path d="M34 36 V47 M64 49 V60 M40 62 V73" />
    </svg>
  )
}

function Pen() {
  return (
    <svg {...common}>
      <path d="M66 30 L42 54" />
      <path d="M42 54 L36 68 L50 62 Z" />
      <path d="M58 28 L70 40" />
    </svg>
  )
}

// — Arrival & departure —

function Departure() {
  return (
    <svg {...common}>
      <path d="M22 60 L78 28 L54 72 L46 56 Z" />
      <path d="M46 56 L78 28" />
    </svg>
  )
}

function Arrival() {
  return (
    <svg {...common}>
      <path d="M22 40 L78 68 L54 28 L46 44 Z" />
      <path d="M46 44 L78 68" />
      <path d="M24 80 H72" />
    </svg>
  )
}

// — Carousel & ferry —

function Carousel() {
  return (
    <svg {...common}>
      <path d="M50 20 L74 42 H26 Z" />
      <circle cx="50" cy="20" r="2.5" fill="currentColor" />
      <path d="M32 42 V70 M50 42 V70 M68 42 V70" />
      <path d="M26 70 H74" />
    </svg>
  )
}

function Ferry() {
  return (
    <svg {...common}>
      <path d="M22 58 H78 L70 72 H30 Z" />
      <path d="M34 58 V46 H62 V58" />
      <path d="M52 46 V38 H58 V46" />
      <path d="M40 52 H46 M50 52 H56" />
    </svg>
  )
}

// — Fireplace & TV —

function Fireplace() {
  return (
    <svg {...common}>
      <path d="M50 78 C36 71 36 55 46 45 C46 53 52 53 52 47 C52 37 48 31 56 25 C56 39 70 47 66 63 C63 73 56 78 50 78 Z" />
      <path d="M50 73 C44 69 44 61 50 55 C52 61 58 63 54 71 C53 74 51 74 50 73 Z" />
    </svg>
  )
}

function Tv() {
  return (
    <svg {...common}>
      <rect x="24" y="36" width="52" height="36" rx="3" />
      <path d="M40 72 V78 H60 V72" />
      <path d="M42 36 L33 24 M58 36 L67 24" />
    </svg>
  )
}

const ICONS: Record<MemberType, () => ReactElement> = {
  house: House,
  livingroom: LivingRoom,
  sun: Sun,
  rain: Rain,
  books: Books,
  pen: Pen,
  arrival: Arrival,
  departure: Departure,
  carousel: Carousel,
  ferry: Ferry,
  fireplace: Fireplace,
  tv: Tv,
}

export function ObjectIcon({ member }: { member: MemberType }) {
  const Icon = ICONS[member]
  return <Icon />
}
