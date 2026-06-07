import { useEffect } from 'react'
import { content } from '../content'
import type { SceneProps } from './types'

/**
 * Title screen — quiet and minimal. Title + tagline, and one way forward.
 * Begin via the button, Space, or Enter.
 */
export function TitleScene({ goTo }: SceneProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        goTo('worldmap')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  return (
    <main className="stage title">
      <div className="title__inner">
        <h1 className="title__name">{content.title}</h1>
        <p className="title__sub">{content.tagline}</p>
      </div>
      <button
        type="button"
        className="button"
        onClick={() => goTo('worldmap')}
      >
        {content.intro.beginButton}
      </button>
      <p className="overlay__hint title__hint">{content.intro.beginHint}</p>
    </main>
  )
}
