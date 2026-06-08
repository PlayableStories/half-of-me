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
      <h2 className="end__line">{ui.endTitle}</h2>
      <p className="end__count">{complete ? ui.endComplete : partial}</p>
      <p className="end__cta-text">{ui.endCtaText}</p>
      <a
        className="button button--primary"
        href={ui.endCtaUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ui.endCtaButton} →
      </a>
      <button type="button" className="button" onClick={onRestart}>
        {ui.playAgain}
      </button>
    </div>
  )
}
