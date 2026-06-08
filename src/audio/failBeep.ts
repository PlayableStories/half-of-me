import { Howl } from 'howler'
import beepWebm from '../assets/audio/fail-beep.webm'
import beepMp3 from '../assets/audio/fail-beep.mp3'

/**
 * A short "denied" beep, played when the player attempts a move that isn't
 * allowed (currently: crossing the closed gap↔other-side path on the world map).
 *
 * Lazily created, like the fire loop, so no AudioContext is spun up until the
 * first beep. A fresh sound id is started per call, so rapid taps overlap
 * cleanly rather than cutting each other off.
 */
let howl: Howl | null = null

function get(): Howl {
  if (!howl) {
    howl = new Howl({
      src: [beepWebm, beepMp3],
      volume: 0.5,
    })
  }
  return howl
}

export function playFailBeep() {
  get().play()
}
