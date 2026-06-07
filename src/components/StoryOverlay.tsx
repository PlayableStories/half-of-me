import { useEffect } from 'react'
import { content } from '../content'
import type { MatchInfo } from '../game/types'
import { storyFor } from '../game/stories'

interface StoryOverlayProps {
  match: MatchInfo
  onDismiss: () => void
}

export function StoryOverlay({ match, onDismiss }: StoryOverlayProps) {
  // Space / Enter dismiss, alongside click / tap.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        onDismiss()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const text = storyFor(match)

  return (
    <div
      className="overlay story"
      onClick={onDismiss}
      role="dialog"
      aria-live="polite"
    >
      <div className="story__text">
        {text.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <p className="overlay__hint">{content.ui.storyContinueHint}</p>
    </div>
  )
}
