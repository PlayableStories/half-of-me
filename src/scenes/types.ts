/**
 * Scene graph for Half of Me. Phase 0 only implements `cards`; the rest are
 * declared here so later phases register a component and wire navigation
 * without reworking the manager (App.tsx).
 *
 *   title    → Phase 2  (opening screen)
 *   worldmap → Phase 2  (SMB3-style overworld path to the house)
 *   house    → Phase 2  (arrival / NPC conversation)
 *   cards    → Phase 0  (the memory card game) ← implemented
 *   ending   → Phase 5  (poetic ending + simplified deck)
 */
export type SceneId = 'title' | 'worldmap' | 'house' | 'cards' | 'ending'

export interface SceneProps {
  /** Navigate to another scene. */
  goTo: (scene: SceneId) => void
}
