import type { Card, MatchKind } from './types'

/** Fisher–Yates shuffle, returning a new array (input untouched). */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * The core rule of Half of Me: two cards match if they share the same OBJECT
 * or the same COLOUR. Object takes priority (the deck holds no exact
 * duplicates, so the two never compete). Identical card ids never match.
 */
export function evaluate(a: Card, b: Card): MatchKind {
  if (a.id === b.id) return null
  if (a.object === b.object) return 'object'
  if (a.colour === b.colour) return 'colour'
  return null
}

/**
 * True if any two not-yet-matched cards could still form a valid pair. Lets the
 * game end gracefully when nothing left can connect.
 */
export function hasValidPair(cards: readonly Card[]): boolean {
  const remaining = cards.filter((c) => c.state !== 'matched')
  for (let i = 0; i < remaining.length; i++) {
    for (let j = i + 1; j < remaining.length; j++) {
      if (evaluate(remaining[i], remaining[j])) return true
    }
  }
  return false
}

/** True once every card has been matched. */
export function allMatched(cards: readonly Card[]): boolean {
  return cards.every((c) => c.state === 'matched')
}
