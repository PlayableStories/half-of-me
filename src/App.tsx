import { useState } from 'react'
import type { ComponentType } from 'react'
import { TitleScene } from './scenes/TitleScene'
import { WorldMapScene } from './scenes/WorldMapScene'
import { HouseScene } from './scenes/HouseScene'
import { CardGameScene } from './scenes/CardGameScene'
import type { SceneId, SceneProps } from './scenes/types'

/**
 * Scene manager. The whole game is a small state machine over `SceneId`. To add
 * a scene: write its component, register it in SCENES, and call `goTo('<id>')`
 * from wherever the flow advances.
 *
 * Phase 2 flow: title → worldmap → house → cards. The card game still ends in
 * place; Phase 5 adds the `ending` scene and routes the end state to it.
 */
const INITIAL_SCENE: SceneId = 'title'

const SCENES: Partial<Record<SceneId, ComponentType<SceneProps>>> = {
  title: TitleScene,
  worldmap: WorldMapScene,
  house: HouseScene,
  cards: CardGameScene,
  // ending → Phase 5
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
