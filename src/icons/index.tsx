import type { ReactElement } from 'react'
import type { ObjectType } from '../game/types'

/**
 * Minimal line-art SVG icons, one per object. They share a 0..100 viewBox, use
 * currentColor for strokes, and carry no fill so they read clearly over the
 * coloured card faces. Placeholder silhouettes — Phase 4 adds detailed and
 * simplified variants for the "image becomes symbol" transformation.
 */

const common = {
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function House() {
  return (
    <svg {...common}>
      <path d="M20 47 L50 22 L80 47" />
      <path d="M28 44 V78 H72 V44" />
      <rect x="44" y="58" width="12" height="20" />
    </svg>
  )
}

function Trees() {
  return (
    <svg {...common}>
      <path d="M50 18 L34 46 H66 Z" />
      <path d="M50 34 L30 64 H70 Z" />
      <path d="M50 64 V82" />
    </svg>
  )
}

function Dog() {
  return (
    <svg {...common}>
      <path d="M28 44 V72 H72 V50" />
      <path d="M28 44 L24 30 L36 38" />
      <path d="M72 50 L80 40 V58" />
      <path d="M34 72 V80 M64 72 V80" />
      <circle cx="30" cy="40" r="1.5" fill="currentColor" />
    </svg>
  )
}

function Table() {
  return (
    <svg {...common}>
      <path d="M22 44 H78" />
      <path d="M30 44 V76 M70 44 V76" />
      <path d="M40 44 V58 M60 44 V58" />
    </svg>
  )
}

function Suitcase() {
  return (
    <svg {...common}>
      <rect x="26" y="40" width="48" height="36" rx="4" />
      <path d="M40 40 V30 H60 V40" />
      <path d="M26 56 H74" />
    </svg>
  )
}

function Photobook() {
  return (
    <svg {...common}>
      <path d="M50 30 V76" />
      <path d="M50 30 C40 24 28 24 24 28 V72 C28 68 40 68 50 74" />
      <path d="M50 30 C60 24 72 24 76 28 V72 C72 68 60 68 50 74" />
    </svg>
  )
}

const ICONS: Record<ObjectType, () => ReactElement> = {
  house: House,
  trees: Trees,
  dog: Dog,
  table: Table,
  suitcase: Suitcase,
  photobook: Photobook,
}

export function ObjectIcon({ object }: { object: ObjectType }) {
  const Icon = ICONS[object]
  return <Icon />
}
