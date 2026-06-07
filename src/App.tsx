import { useState } from 'react'
import type { ComponentType } from 'react'
import { CardGameScene } from './scenes/CardGameScene'
import type { SceneId, SceneProps } from './scenes/types'

/**
 * Scene manager. The whole game is a small state machine over `SceneId`. To add
 * a scene (Phases 2 & 5): write its component, register it in SCENES, and call
 * `goTo('<id>')` from wherever the flow advances.
 *
 * Phase 0 enters straight into the card game. Phase 2 will set INITIAL_SCENE to
 * 'title' and chain title → worldmap → house → cards → ending.
 */
const INITIAL_SCENE: SceneId = 'cards'

const SCENES: Partial<Record<SceneId, ComponentType<SceneProps>>> = {
  cards: CardGameScene,
  // title, worldmap, house  → Phase 2
  // ending                  → Phase 5
}

export default function App() {
  const [scene, setScene] = useState<SceneId>(INITIAL_SCENE)
  const Active = SCENES[scene]

  return (
    <div className="app">
      {Active ? (
        <Active goTo={setScene} />
      ) : (
        <main className="stage">
          <p className="preview-cta__text">Scene “{scene}” is not built yet.</p>
        </main>
      )}
    </div>
  )
}
