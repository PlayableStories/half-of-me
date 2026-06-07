import { content } from '../content'

/** Object / colour ids are derived from `content.ts` — edit the deck there. */
export type ObjectType = (typeof content.objects)[number]['id']

export type ColourType = (typeof content.colours)[number]['id']

export type CardState = 'faceup' | 'facedown' | 'matched'

/** Phases internal to the card game scene. */
export type GamePhase = 'preview' | 'playing' | 'story' | 'end'

export interface Card {
  id: string
  object: ObjectType
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
