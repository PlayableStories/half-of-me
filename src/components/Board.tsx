import { content } from '../content'
import type { Card } from '../game/types'
import { CardView } from './CardView'

interface BoardProps {
  cards: Card[]
  inputLocked: boolean
  onSelect: (id: string) => void
}

export function Board({ cards, inputLocked, onSelect }: BoardProps) {
  return (
    <div className="board" role="grid" aria-label={content.ui.boardLabel}>
      {cards.map((card) => (
        <CardView
          key={card.id}
          card={card}
          disabled={inputLocked}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
