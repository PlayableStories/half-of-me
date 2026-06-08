import { content } from '../content'
import type { Card, ColourType, MemberType, ObjectType } from './types'

/** Player-visible member labels (one per card), derived from content.ts. */
export const MEMBER_LABELS = Object.fromEntries(
  content.objects.flatMap((o) => o.members.map((m) => [m.id, m.label])),
) as Record<MemberType, string>

/** Maps each member id back to the theme it belongs to (for matching). */
const MEMBER_THEME = Object.fromEntries(
  content.objects.flatMap((o) => o.members.map((m) => [m.id, o.id])),
) as Record<MemberType, ObjectType>

/** Player-visible colour labels, derived from content.ts. */
export const COLOUR_LABELS = Object.fromEntries(
  content.colours.map((c) => [c.id, c.label]),
) as Record<ColourType, string>

/**
 * Builds a fresh deck of face-down cards from `content.deck`. Each theme
 * contributes its two members and each colour appears three times, so both
 * theme-matches and colour-matches are always possible. Card front colours live
 * in theme.css as `--colour-<id>`.
 */
export function createDeck(): Card[] {
  return content.deck.map(([member, colour], index) => ({
    id: `${member}-${colour}-${index}`,
    object: MEMBER_THEME[member as MemberType],
    member: member as MemberType,
    colour: colour as ColourType,
    state: 'facedown',
  }))
}
