import { content } from '../content'
import type { ColourType, MatchInfo, ObjectType } from './types'

const OBJECT_FRAGMENTS = Object.fromEntries(
  content.objects.map((o) => [o.id, o.story]),
) as Record<ObjectType, string>

const COLOUR_FRAGMENTS = Object.fromEntries(
  content.colours.map((c) => [c.id, c.story]),
) as Record<ColourType, string>

/**
 * The fragment for a completed match. An object-match remembers the thing but
 * loses the feeling; a colour-match remembers the feeling but loses the thing.
 * Edit the text in `content.ts`.
 */
export function storyFor(match: MatchInfo): string {
  return match.kind === 'object'
    ? OBJECT_FRAGMENTS[match.object]
    : COLOUR_FRAGMENTS[match.colour]
}
