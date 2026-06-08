import { content } from '../content'
import type { GamePhase } from '../game/types'

interface HudProps {
  phase: GamePhase
  moves: number
  matchedPairs: number
  totalPairs: number
}

export function Hud({ phase, moves, matchedPairs, totalPairs }: HudProps) {
  const { ui } = content
  return (
    <header className="hud">
      {/* Title and tagline are hidden in the card scene (see styles.css) but
          kept in the DOM for document structure / screen readers. */}
      <h1 className="hud__title">{content.title}</h1>
      {phase === 'playing' || phase === 'story' ? (
        <p className="hud__stats">
          <span>
            {matchedPairs} / {totalPairs} {ui.remembered}
          </span>
          <span className="hud__dot" aria-hidden="true">
            ·
          </span>
          <span>
            {moves} {moves === 1 ? ui.turnSingular : ui.turnPlural}
          </span>
        </p>
      ) : (
        <p className="hud__subtitle">{content.tagline}</p>
      )}
    </header>
  )
}
