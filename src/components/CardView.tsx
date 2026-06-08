import type { CSSProperties } from 'react'
import { content } from '../content'
import type { Card } from '../game/types'
import { COLOUR_LABELS, MEMBER_LABELS } from '../game/deck'
import { ObjectIcon } from '../icons'

interface CardViewProps {
  card: Card
  disabled: boolean
  onSelect: (id: string) => void
}

export function CardView({ card, disabled, onSelect }: CardViewProps) {
  const faceUp = card.state === 'faceup'
  const matched = card.state === 'matched'

  const label = `${COLOUR_LABELS[card.colour]} ${MEMBER_LABELS[card.member]}`

  return (
    <button
      type="button"
      className={`card ${faceUp ? 'is-faceup' : ''} ${matched ? 'is-matched' : ''}`}
      style={{ '--card-colour': `var(--colour-${card.colour})` } as CSSProperties}
      onClick={() => onSelect(card.id)}
      disabled={disabled || matched || faceUp}
      aria-label={faceUp || matched ? label : content.ui.faceDownLabel}
    >
      <span className="card__inner">
        <span className="card__face card__back" aria-hidden="true" />
        <span className="card__face card__front">
          <span className="card__icon">
            <ObjectIcon member={card.member} />
          </span>
        </span>
      </span>
    </button>
  )
}
