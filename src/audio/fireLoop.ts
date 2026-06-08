import { Howl } from 'howler'
import fireWebm from '../assets/audio/fire-loop.webm'
import fireMp3 from '../assets/audio/fire-loop.mp3'

/**
 * The fire-crackle ambience. Used only on the title scene for now (Phase 6).
 *
 * The Howl is created lazily so no AudioContext is spun up until the loop is
 * first needed. Browsers block audio until a user gesture; Howler's autoUnlock
 * starts a queued play on the first click/keypress, so on a fresh load the loop
 * begins as soon as the player interacts with the title screen.
 */
const TARGET_VOLUME = 0.4
const FADE_MS = 1800

let howl: Howl | null = null
let activeId: number | null = null

function get(): Howl {
  if (!howl) {
    howl = new Howl({
      src: [fireWebm, fireMp3],
      loop: true,
      volume: 0,
    })
  }
  return howl
}

/** Start the loop (if not already playing) and fade it in. */
export function startFireLoop() {
  const h = get()
  if (activeId !== null && h.playing(activeId)) return
  activeId = h.play()
  h.fade(0, TARGET_VOLUME, FADE_MS, activeId)
}

/** Fade the loop out, then stop it. */
export function stopFireLoop() {
  if (!howl || activeId === null) return
  const h = howl
  const id = activeId
  activeId = null
  h.fade(TARGET_VOLUME, 0, FADE_MS, id)
  h.once('fade', () => h.stop(id), id)
}
