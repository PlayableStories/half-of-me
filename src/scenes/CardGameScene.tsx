import { useState } from 'react'
import { content } from '../content'
import type { Card, GamePhase, MatchInfo } from '../game/types'
import { createDeck } from '../game/deck'
import { allMatched, evaluate, hasValidPair, shuffle } from '../game/logic'
import { Board } from '../components/Board'
import { Hud } from '../components/Hud'
import { StoryOverlay } from '../components/StoryOverlay'
import { EndScreen } from '../components/EndScreen'

const TOTAL_PAIRS = content.deck.length / 2
const REVEAL_MATCH_MS = 700
const REVEAL_MISS_MS = 1050

/** A freshly shuffled deck shown face up for the preview phase. */
function newPreviewCards(): Card[] {
  return shuffle(createDeck()).map((c) => ({ ...c, state: 'faceup' }))
}

/**
 * The memory card game. Self-contained: it owns its preview →
 * playing → story → end loop and restarts in place. Phase 5 will route the end
 * state out via `goTo('ending')` instead of showing EndScreen here.
 * It takes no props yet but stays assignable to ComponentType<SceneProps>.
 */
export function CardGameScene() {
  const [cards, setCards] = useState<Card[]>(newPreviewCards)
  const [phase, setPhase] = useState<GamePhase>('preview')
  const [selected, setSelected] = useState<string[]>([])
  const [currentMatch, setCurrentMatch] = useState<MatchInfo | null>(null)
  const [moves, setMoves] = useState(0)
  const [inputLocked, setInputLocked] = useState(false)

  const matchedPairs = cards.filter((c) => c.state === 'matched').length / 2

  function startGame() {
    setCards((prev) => prev.map((c) => ({ ...c, state: 'facedown' })))
    setPhase('playing')
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

  function dismissStory() {
    setCurrentMatch(null)
    // `cards` already reflects the just-matched pair here.
    if (allMatched(cards) || !hasValidPair(cards)) {
      setPhase('end')
    } else {
      setPhase('playing')
    }
  }

  function restart() {
    setCards(newPreviewCards())
    setPhase('preview')
    setSelected([])
    setCurrentMatch(null)
    setMoves(0)
    setInputLocked(false)
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
          onRestart={restart}
        />
      )}
    </>
  )
}
