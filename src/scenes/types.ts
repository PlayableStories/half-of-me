/**
 * Scene graph for Half of Me. Register a component in App.tsx's SCENES map and
 * navigate with `goTo('<id>')`.
 *
 *   title    → Phase 2  (opening screen)            ← implemented
 *   worldmap → Phase 2  (SMB3-style path to house)  ← implemented
 *   house    → Phase 2  (arrival / NPC conversation)← implemented
 *   cards    → Phase 1  (the memory card game)      ← implemented
 *   ending   → Phase 5  (poetic ending + simplified deck)
 */
export type SceneId = 'title' | 'worldmap' | 'house' | 'cards' | 'ending'

export interface SceneProps {
  /** Navigate to another scene. */
  goTo: (scene: SceneId) => void
}
