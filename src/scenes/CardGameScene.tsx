import { useEffect, useState } from 'react'
import { content } from '../content'
import type { Card, GamePhase, MatchInfo } from '../game/types'
import { createDeck } from '../game/deck'
import { allMatched, evaluate, hasValidPair, shuffle } from '../game/logic'
import { Board } from '../components/Board'
import { Hud } from '../components/Hud'
import { StoryOverlay } from '../components/StoryOverlay'
import { EndScreen } from '../components/EndScreen'
import type { SceneProps } from './types'

const TOTAL_PAIRS = content.deck.length / 2
const REVEAL_MATCH_MS = 700
const REVEAL_MISS_MS = 1050
/** Columns in the board grid — matches `--cols` in styles.css. */
const COLS = 4

/** A freshly shuffled deck shown face up for the preview phase. */
function newPreviewCards(): Card[] {
  return shuffle(createDeck()).map((c) => ({ ...c, state: 'faceup' }))
}

/**
 * The memory card game. It owns its preview → playing → story → end loop.
 * "Remember again" on the end screen returns to the title page (a fresh scene
 * mounts when the player walks back through the flow). Phase 5 will route the
 * end state out via `goTo('ending')` instead of showing EndScreen here.
 */
export function CardGameScene({ goTo }: SceneProps) {
  const [cards, setCards] = useState<Card[]>(newPreviewCards)
  const [phase, setPhase] = useState<GamePhase>('preview')
  const [selected, setSelected] = useState<string[]>([])
  const [currentMatch, setCurrentMatch] = useState<MatchInfo | null>(null)
  const [moves, setMoves] = useState(0)
  const [inputLocked, setInputLocked] = useState(false)
  // Keyboard / gamepad cursor over the board (mouse / touch ignore it).
  const [cursor, setCursor] = useState(0)
  // Show the cursor ring only when the last input was a key / gamepad, so it
  // stays hidden for players using touch or mouse. Starts hidden.
  const [usingPointer, setUsingPointer] = useState(true)

  const matchedPairs = cards.filter((c) => c.state === 'matched').length / 2

  // If the stored cursor lands on a now-matched (empty) slot, show it on the
  // first card that still exists — derived, so we never setState in an effect.
  const liveCursor =
    cards[cursor]?.state === 'matched'
      ? Math.max(0, cards.findIndex((c) => c.state !== 'matched'))
      : cursor

  function startGame() {
    setCards((prev) => prev.map((c) => ({ ...c, state: 'facedown' })))
    setPhase('playing')
  }

  /** Move the cursor one cell, stepping over already-matched (empty) slots. */
  function moveCursor(dx: number, dy: number) {
    let idx = liveCursor
    for (let step = 0; step < cards.length; step++) {
      if (dx !== 0) {
        const col = idx % COLS
        if (col + dx < 0 || col + dx >= COLS) return // row edge
        idx += dx
      } else {
        idx += dy * COLS
        if (idx < 0 || idx >= cards.length) return // column edge
      }
      if (cards[idx]?.state !== 'matched') {
        setCursor(idx)
        return
      }
    }
  }

  function handleSelect(id: string) {
    if (phase !== 'playing' || inputLocked) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.state !== 'facedown' || selected.length >= 2) return

    const nextSelected = [...selected, id]
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: 'faceup' } : c)),
    )
    setSelected(nextSelected)

    if (nextSelected.length < 2) return

    // Second card chosen: lock input and resolve the pair.
    setInputLocked(true)
    setMoves((m) => m + 1)
    const first = cards.find((c) => c.id === nextSelected[0])!
    const kind = evaluate(first, card)

    if (kind) {
      window.setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            nextSelected.includes(c.id) ? { ...c, state: 'matched' } : c,
          ),
        )
        setCurrentMatch({ kind, object: first.object, colour: first.colour })
        setPhase('story')
        setSelected([])
        setInputLocked(false)
      }, REVEAL_MATCH_MS)
    } else {
      window.setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            nextSelected.includes(c.id) ? { ...c, state: 'facedown' } : c,
          ),
        )
        setSelected([])
        setInputLocked(false)
      }, REVEAL_MISS_MS)
    }
  }

  // Keyboard / gamepad: Enter starts the preview, moves the cursor and flips
  // cards while playing. Mouse / touch keep working in parallel. Re-bound each
  // render so it reads the latest phase / cursor / lock state.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === 'preview') {
        if (e.key === 'Enter' || e.key === ' ') {
          setUsingPointer(false)
          e.preventDefault()
          startGame()
        }
        return
      }
      if (phase !== 'playing' || inputLocked) return
      setUsingPointer(false) // a nav / confirm key means we're not on pointer
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          moveCursor(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          moveCursor(1, 0)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          moveCursor(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          moveCursor(0, 1)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (cards[liveCursor]) handleSelect(cards[liveCursor].id)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Any tap / click hides the cursor ring (pointer play needs no cursor).
  useEffect(() => {
    function onPointer() {
      setUsingPointer(true)
    }
    window.addEventListener('pointerdown', onPointer)
    return () => window.removeEventListener('pointerdown', onPointer)
  }, [])

  function dismissStory() {
    setCurrentMatch(null)
    // `cards` already reflects the just-matched pair here.
    if (allMatched(cards) || !hasValidPair(cards)) {
      setPhase('end')
    } else {
      setPhase('playing')
    }
  }

  return (
    <>
      <Hud
        phase={phase}
        moves={moves}
        matchedPairs={matchedPairs}
        totalPairs={TOTAL_PAIRS}
      />

      <main className="stage">
        <Board
          cards={cards}
          inputLocked={inputLocked || phase !== 'playing'}
          cursorId={
            phase === 'playing' && !usingPointer
              ? cards[liveCursor]?.id
              : undefined
          }
          onSelect={handleSelect}
        />

        {phase === 'preview' && (
          <div className="preview-cta">
            <p className="preview-cta__text">{content.previewCaption}</p>
            <button type="button" className="button" onClick={startGame}>
              {content.startButton}
            </button>
          </div>
        )}
      </main>

      {phase === 'story' && currentMatch && (
        <StoryOverlay match={currentMatch} onDismiss={dismissStory} />
      )}

      {phase === 'end' && (
        <EndScreen
          remembered={matchedPairs}
          total={TOTAL_PAIRS}
          onRestart={() => goTo('title')}
        />
      )}
    </>
  )
}
