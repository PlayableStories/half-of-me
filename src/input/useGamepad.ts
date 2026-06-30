import { useEffect } from 'react'

/**
 * Gamepad → keyboard bridge.
 *
 * Game Poems Magazine requires gamepad input support. Rather than thread a
 * second input path through every scene, we poll the Gamepad API once and
 * translate controller input into the SAME synthetic keyboard events the scenes
 * already listen for:
 *
 *   d-pad / left stick → Arrow{Up,Down,Left,Right}
 *   south button (A / Cross) or Start → Enter
 *
 * So every scene that already handles arrows / Enter (title, world map, house,
 * story overlay, card board, end screen) gains gamepad control for free. Held
 * directions auto-repeat (DAS-style) so the board and menus can be driven by
 * holding a direction. Mounted once, in App.
 *
 * MDN: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

const DEADZONE = 0.5
const REPEAT_DELAY_MS = 420 // hold this long before a direction auto-repeats
const REPEAT_RATE_MS = 180 // then repeat this often while held

type Dir = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | null

// Standard-mapping button indices we treat as "confirm" (Enter).
const CONFIRM_BUTTONS = [0, 9] // A / Cross, and Start

function sendKey(key: string) {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  )
}

/** Resolve the active 4-way direction from d-pad buttons or the left stick. */
function readDirection(gp: Gamepad): Dir {
  const b = gp.buttons
  const x = gp.axes[0] ?? 0
  const y = gp.axes[1] ?? 0
  const up = b[12]?.pressed || y < -DEADZONE
  const down = b[13]?.pressed || y > DEADZONE
  const left = b[14]?.pressed || x < -DEADZONE
  const right = b[15]?.pressed || x > DEADZONE

  // One direction at a time: prefer whichever axis is pushed further so a
  // diagonal resolves cleanly (matches the world map's single-step movement).
  const vert = up || down
  const horiz = left || right
  if (vert && (!horiz || Math.abs(y) >= Math.abs(x))) {
    return up ? 'ArrowUp' : 'ArrowDown'
  }
  if (horiz) return left ? 'ArrowLeft' : 'ArrowRight'
  return null
}

export function useGamepad() {
  useEffect(() => {
    let raf = 0
    let dir: Dir = null
    let nextRepeat = 0
    const heldConfirm = new Set<number>()

    function poll(ts: number) {
      const pads = navigator.getGamepads?.() ?? []
      let gp: Gamepad | null = null
      for (const p of pads) {
        if (p) {
          gp = p
          break
        }
      }

      if (gp) {
        // Confirm buttons — fire once on the rising edge, not while held.
        for (const i of CONFIRM_BUTTONS) {
          const pressed = gp.buttons[i]?.pressed ?? false
          if (pressed && !heldConfirm.has(i)) {
            heldConfirm.add(i)
            sendKey('Enter')
          } else if (!pressed) {
            heldConfirm.delete(i)
          }
        }

        // Directions — fire on change, then auto-repeat while still held.
        const d = readDirection(gp)
        if (d !== dir) {
          dir = d
          if (d) {
            sendKey(d)
            nextRepeat = ts + REPEAT_DELAY_MS
          }
        } else if (d && ts >= nextRepeat) {
          sendKey(d)
          nextRepeat = ts + REPEAT_RATE_MS
        }
      } else {
        dir = null
        heldConfirm.clear()
      }

      raf = requestAnimationFrame(poll)
    }

    raf = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(raf)
  }, [])
}
