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
      <rect x="32" y="16" width="36" height="28" rx="1" />
      <path d="M50 16 V44 M32 30 H68" />
      <path d="M28 66 V56 Q28 52 32 52 H68 Q72 52 72 56 V66" />
      <path d="M24 66 Q24 62 28 62 H72 Q76 62 76 66 V74 H24 Z" />
      <path d="M30 74 V80 M70 74 V80" />
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
      <path d="M30 73 L3 81" />
    </svg>
  )
}

// — Arrival & departure —

function Departure() {
  return (
    <svg {...common}>
      <path d="M22 60 L78 28 L54 72 L46 56 Z" />
      <path d="M46 56 L78 28" />
      <path d="M24 80 H72" />
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

// — Ferris wheel & ferry —

function FerrisWheel() {
  return (
    <svg {...common}>
      <circle cx="50" cy="42" r="22" />
      <circle cx="50" cy="42" r="2.5" fill="currentColor" />
      <path d="M50 20 V64 M28 42 H72 M34 26 L66 58 M66 26 L34 58" />
      <path d="M50 64 L40 80 M50 64 L60 80" />
      <path d="M36 80 H64" />
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
      <path d="M16 28 H84" />
      <rect x="22" y="28" width="56" height="52" rx="2" />
      <rect x="34" y="42" width="32" height="38" />
      <path d="M50 79 C44 74 44 64 50 58 C50 63 55 63 55 58 C55 51 52 48 57 44 C57 52 64 58 61 68 C59 74 55 79 50 79 Z" />
      <path d="M50 75 C46 72 46 66 50 62 C52 66 56 67 53 73 C52 75 51 75 50 75 Z" />
    </svg>
  )
}

function ChristmasTree() {
  return (
    <svg {...common}>
      {/* star topper */}
      <path d="M50 3 L52.5 8.5 L58 11 L52.5 13.5 L50 19 L47.5 13.5 L42 11 L47.5 8.5 Z" />
      {/* three-tier tree */}
      <path d="M50 22 L37 42 L44 42 L31 60 L39 60 L25 78 L75 78 L61 60 L69 60 L56 42 L63 42 Z" />
      {/* trunk */}
      <path d="M44 78 V87 H56 V78" />
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
  ferriswheel: FerrisWheel,
  ferry: Ferry,
  fireplace: Fireplace,
  tree: ChristmasTree,
}

export function ObjectIcon({ member }: { member: MemberType }) {
  const Icon = ICONS[member]
  return <Icon />
}
