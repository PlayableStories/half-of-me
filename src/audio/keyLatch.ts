import { Howl } from 'howler'
import unlockWebm from '../assets/audio/key-unlock.webm'
import unlockMp3 from '../assets/audio/key-unlock.mp3'
import lockWebm from '../assets/audio/key-lock.webm'
import lockMp3 from '../assets/audio/key-lock.mp3'

/**
 * The key's mechanical lock sounds. Stepping onto the key node toggles between
 * the two: the first arrival unlocks (the way home opens), and re-entering the
 * node locks / unlocks again, alternately.
 *
 * Lazily created, like the fail beep and fire loop, so no AudioContext is spun
 * up until first play. By the time the player reaches the key they have already
 * pressed a key / clicked to walk, so the gesture has unlocked audio.
 *
 * Source: "100 CC0 SFX #2" by rubberduck (CC0) via OpenGameArt
 * (sfx100v2_lock_open_01); the lock sound is that same clip reversed. Re-encoded
 * to webm/mp3.
 */
const VOLUME = 0.6

let unlock: Howl | null = null
let lock: Howl | null = null

export function playKeyUnlock() {
  if (!unlock) unlock = new Howl({ src: [unlockWebm, unlockMp3], volume: VOLUME })
  unlock.play()
}

export function playKeyLock() {
  if (!lock) lock = new Howl({ src: [lockWebm, lockMp3], volume: VOLUME })
  lock.play()
}
