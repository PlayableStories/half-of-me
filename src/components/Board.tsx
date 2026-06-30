import { content } from '../content'
import type { Card } from '../game/types'
import { CardView } from './CardView'

interface BoardProps {
  cards: Card[]
  inputLocked: boolean
  /** Id of the card under the keyboard / gamepad cursor, if any. */
  cursorId?: string
  onSelect: (id: string) => void
}

export function Board({ cards, inputLocked, cursorId, onSelect }: BoardProps) {
  return (
    <div className="board" role="grid" aria-label={content.ui.boardLabel}>
      {cards.map((card) => (
        <CardView
          key={card.id}
          card={card}
          disabled={inputLocked}
          isCursor={card.id === cursorId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
