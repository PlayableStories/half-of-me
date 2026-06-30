import { content } from '../content'

interface EndScreenProps {
  remembered: number
  total: number
  onRestart: () => void
}

export function EndScreen({ remembered, total, onRestart }: EndScreenProps) {
  const { ui } = content
  const complete = remembered === total
  const partial = ui.endPartial
    .replace('{remembered}', String(remembered))
    .replace('{total}', String(total))

  return (
    <div className="overlay end" role="dialog">
      <h2 className="end__line">
        {complete ? ui.endTitleComplete : ui.endTitlePartial}
      </h2>
      <p className="end__count">{complete ? ui.endComplete : partial}</p>
      <button type="button" className="button" onClick={onRestart}>
        {ui.playAgain}
      </button>
    </div>
  )
}
