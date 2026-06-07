import { content } from '../content'
import type { Card, ColourType, ObjectType } from './types'

/** Player-visible object labels, derived from content.ts. */
export const OBJECT_LABELS = Object.fromEntries(
  content.objects.map((o) => [o.id, o.label]),
) as Record<ObjectType, string>

/** Player-visible colour labels, derived from content.ts. */
export const COLOUR_LABELS = Object.fromEntries(
  content.colours.map((c) => [c.id, c.label]),
) as Record<ColourType, string>

/**
 * Builds a fresh deck of face-down cards from `content.deck`. Each object
 * appears twice and each colour three times, so both object-matches and
 * colour-matches are always possible. Card front colours live in theme.css as
 * `--colour-<id>`.
 */
export function createDeck(): Card[] {
  return content.deck.map(([object, colour], index) => ({
    id: `${object}-${colour}-${index}`,
    object: object as ObjectType,
    colour: colour as ColourType,
    state: 'facedown',
  }))
}
