import { content } from '../content'

/** Theme / member / colour ids are derived from `content.ts` — edit there. */

/** A theme id (the matchable unit; keys the theme fragment). */
export type ObjectType = (typeof content.objects)[number]['id']

/** A member id — one of the two cards that make up a theme (keys icon + label). */
export type MemberType =
  (typeof content.objects)[number]['members'][number]['id']

export type ColourType = (typeof content.colours)[number]['id']

export type CardState = 'faceup' | 'facedown' | 'matched'

/** Phases internal to the card game scene. */
export type GamePhase = 'preview' | 'playing' | 'story' | 'end'

export interface Card {
  id: string
  /** The theme this card belongs to — two cards match if their themes match. */
  object: ObjectType
  /** This card's specific identity within the theme (its icon and label). */
  member: MemberType
  colour: ColourType
  state: CardState
}

/** Which dimension a pair matched on, or null if it did not match. */
export type MatchKind = 'object' | 'colour' | null

/** Details of the most recent successful match, used by the story overlay. */
export interface MatchInfo {
  kind: Exclude<MatchKind, null>
  object: ObjectType
  colour: ColourType
}
