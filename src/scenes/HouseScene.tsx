import { useCallback, useEffect, useState } from 'react'
import { content } from '../content'
import type { SceneProps } from './types'

/**
 * The house — a pause in the journey where an NPC introduces the memory game.
 * Dialogue reveals letter by letter; a click/Space/Enter completes the current
 * line if it is still typing, otherwise advances. The last line leads into the
 * card preview.
 */
const TYPE_MS = 32

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Types `text` out one character at a time. Mounted with a fresh `key` per
 * line, so `count` resets to 0 without any in-effect state churn; all updates
 * happen inside async interval / rAF callbacks. `reveal` shows the full line at
 * once (used when the player clicks to skip the typing).
 */
function TypedLine({
  text,
  reveal,
  onComplete,
}: {
  text: string
  reveal: boolean
  onComplete: () => void
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      const raf = requestAnimationFrame(() => {
        setCount(text.length)
        onComplete()
      })
      return () => cancelAnimationFrame(raf)
    }
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setCount(i)
      if (i >= text.length) {
        window.clearInterval(id)
        onComplete()
      }
    }, TYPE_MS)
    return () => window.clearInterval(id)
  }, [text, onComplete])

  const shown = reveal ? text : text.slice(0, count)
  return (
    <div className="dialogue__text">
      {shown.split('\n').map((line, i) => (
        <p key={i}>{line || ' '}</p>
      ))}
    </div>
  )
}

export function HouseScene({ goTo }: SceneProps) {
  const { lines, speaker, continueHint } = content.house
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [reveal, setReveal] = useState(false)

  const handleComplete = useCallback(() => setDone(true), [])

  function next() {
    if (!done) {
      setReveal(true) // finish the current line immediately
      setDone(true)
      return
    }
    if (index < lines.length - 1) {
      setIndex((i) => i + 1)
      setDone(false)
      setReveal(false)
    } else {
      goTo('cards')
    }
  }

  // Space / Enter mirror the click (re-bound each render to see latest state).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <main className="stage house" onClick={next}>
      <div className="house__interior" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="house__art">
          <rect x="34" y="30" width="32" height="34" className="house__window" />
          <path d="M50 30 V64 M34 47 H66" className="house__mullion" />
        </svg>
      </div>

      <div className="dialogue" role="dialog" aria-live="polite">
        {speaker && <p className="dialogue__speaker">{speaker}</p>}
        <TypedLine
          key={index}
          text={lines[index]}
          reveal={reveal}
          onComplete={handleComplete}
        />
        <p className="overlay__hint dialogue__hint">{continueHint}</p>
      </div>
    </main>
  )
}
