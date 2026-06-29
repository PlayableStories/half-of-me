import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import { playFailBeep } from '../audio/failBeep'
import {
  MAPS,
  START,
  VIEW,
  edgeLockOf,
  gx,
  gy,
  neighboursOf,
  nodeOf,
  stairTarget,
  type MapId,
} from './mazeData'
import type { SceneProps } from './types'

/**
 * A two-level SMB3-style overworld: a ground level and a basement below it,
 * joined by staircases. Each level is a graph of places joined by dotted paths;
 * the traveller steps node-to-node with arrows / WASD / clicks. The house is
 * visible on the ground but has no direct path — the way to it runs down
 * through the basement. One path is blocked until a key is found. Staircases
 * sit at the same spot on both levels, so you drop straight down (or climb
 * straight up) without moving. Arriving on the house switches to the house
 * scene at once — no button, no extra keypress.
 *
 * The maze itself (nodes / edges / locks / stairs) lives in mazeData.ts.
 */
const STEP_MS = 420

interface AvatarState {
  x: number
  y: number
  walking: boolean
}

interface Transition {
  fromMap: MapId
  fromId: string
  toMap: MapId
  toId: string
}

function visitKey(map: MapId, id: string) {
  return `${map}:${id}`
}

function nodeRadius(map: MapId, id: string) {
  return nodeOf(map, id).role === 'house' ? 5 : 2.5
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function WorldMapScene({ goTo }: SceneProps) {
  const [activeMap, setActiveMap] = useState<MapId>(START.map)
  const [current, setCurrent] = useState<string>(START.id)
  const startNode = nodeOf(START.map, START.id)
  const [pos, setPos] = useState({ x: gx(startNode.col), y: gy(startNode.row) })
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set([visitKey(START.map, START.id)]),
  )
  const walkingRef = useRef(false)
  const [walking, setWalking] = useState(false)
  const [transition, setTransition] = useState<Transition | null>(null)

  const busy = () => walkingRef.current || transition !== null

  /** Open unless still gated by `requires`, or already shut by `closesAfter`. */
  function isEdgeOpen(map: MapId, a: string, b: string) {
    const lock = edgeLockOf(map, a, b)
    if (!lock) return true
    if (lock.requires && !visited.has(visitKey(map, lock.requires))) return false
    if (lock.closesAfter && visited.has(visitKey(map, lock.closesAfter)))
      return false
    return true
  }

  function openNeighbours(map: MapId, id: string) {
    return neighboursOf(map, id).filter((n) => isEdgeOpen(map, id, n))
  }

  /** Change level via a staircase, landing on its far end (same coordinates). */
  function settleOnLevel(toMap: MapId, toId: string) {
    const land = nodeOf(toMap, toId)
    setActiveMap(toMap)
    setCurrent(toId)
    setPos({ x: gx(land.col), y: gy(land.row) })
    setVisited((prev) => new Set(prev).add(visitKey(toMap, toId)))
    setTransition(null)
  }

  function beginStair(fromId: string, toMap: MapId, toId: string) {
    if (prefersReducedMotion()) {
      settleOnLevel(toMap, toId)
      return
    }
    setTransition({ fromMap: activeMap, fromId, toMap, toId })
  }

  function stepTo(targetId: string) {
    if (busy()) return
    if (!openNeighbours(activeMap, current).includes(targetId)) {
      // Beep when the blocked move is a gated edge that's currently closed.
      const lock = edgeLockOf(activeMap, current, targetId)
      if (lock && !isEdgeOpen(activeMap, current, targetId)) playFailBeep()
      return
    }
    const from = nodeOf(activeMap, current)
    const to = nodeOf(activeMap, targetId)
    const fromX = gx(from.col)
    const fromY = gy(from.row)
    const toX = gx(to.col)
    const toY = gy(to.row)

    const finish = () => {
      setCurrent(targetId)
      setVisited((prev) => new Set(prev).add(visitKey(activeMap, targetId)))
      walkingRef.current = false
      setWalking(false)
      // Arriving at the house ends the level; a staircase changes level.
      if (to.role === 'house') {
        goTo('house')
        return
      }
      const stair = stairTarget(activeMap, targetId)
      if (stair) beginStair(targetId, stair.map, stair.id)
    }

    if (prefersReducedMotion()) {
      setPos({ x: toX, y: toY })
      finish()
      return
    }

    walkingRef.current = true
    setWalking(true)
    let startTs: number | null = null
    function step(ts: number) {
      if (startTs === null) startTs = ts
      const k = Math.min(1, (ts - startTs) / STEP_MS)
      const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      setPos({ x: fromX + (toX - fromX) * eased, y: fromY + (toY - fromY) * eased })
      if (k < 1) requestAnimationFrame(step)
      else finish()
    }
    requestAnimationFrame(step)
  }

  /** Step toward the neighbour that best matches a unit direction (dx, dy). */
  function walkDir(dx: number, dy: number) {
    if (busy()) return
    const cur = nodeOf(activeMap, current)
    let best: string | null = null
    let bestScore = 0.5 // require a clear match, not a near-perpendicular one
    // All neighbours, not just open ones: stepTo() rejects a closed edge and
    // beeps, so pressing toward a blocked path gives feedback.
    for (const nId of neighboursOf(activeMap, current)) {
      const n = nodeOf(activeMap, nId)
      const vx = gx(n.col) - gx(cur.col)
      const vy = gy(n.row) - gy(cur.row)
      const len = Math.hypot(vx, vy) || 1
      const score = (vx / len) * dx + (vy / len) * dy
      if (score > bestScore) {
        bestScore = score
        best = nId
      }
    }
    if (best) stepTo(best)
    // No path that way at all — sound the blocked-way beep.
    else playFailBeep()
  }

  // Keyboard: arrows / WASD walk. Arriving on the house auto-advances, so there
  // is no enter/confirm key. Re-bound each render to read the latest state.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          walkDir(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          walkDir(1, 0)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          walkDir(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          walkDir(0, 1)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /** Render one level's ground/earth, paths and places. */
  function renderMap(
    map: MapId,
    currentId: string,
    interactive: boolean,
    avatar: AvatarState | null,
  ) {
    return (
      <svg
        className="worldmap__svg"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="img"
        aria-label={content.worldMap.ariaLabel}
      >
        {/* paths between places */}
        {MAPS[map].edges.map(([a, b]) => {
          const na = nodeOf(map, a)
          const nb = nodeOf(map, b)
          const ax = gx(na.col)
          const ay = gy(na.row)
          const bx = gx(nb.col)
          const by = gy(nb.row)
          const len = Math.hypot(bx - ax, by - ay) || 1
          const ux = (bx - ax) / len
          const uy = (by - ay) / len
          const locked = !isEdgeOpen(map, a, b)
          return (
            <line
              key={`${a}-${b}`}
              x1={ax + ux * nodeRadius(map, a)}
              y1={ay + uy * nodeRadius(map, a)}
              x2={bx - ux * nodeRadius(map, b)}
              y2={by - uy * nodeRadius(map, b)}
              className={`worldmap__edge ${locked ? 'is-locked' : ''}`}
            />
          )
        })}

        {/* places */}
        {MAPS[map].nodes.map((n) => {
          const x = gx(n.col)
          const y = gy(n.row)
          const visCls = visited.has(visitKey(map, n.id)) ? 'is-visited' : ''
          const curCls = currentId === n.id ? 'is-current' : ''
          const onClick = interactive ? () => stepTo(n.id) : undefined

          if (n.role === 'house') {
            return (
              <g key={n.id} className="worldmap__place" onClick={onClick}>
                {/* invisible hit area: the stroke-only house is hard to click */}
                <circle cx={x} cy={y} r={7} fill="transparent" />
                <g
                  transform={`translate(${x} ${y})`}
                  className={`worldmap__house ${curCls}`}
                >
                  <path d="M -4 1 L 0 -4 L 4 1" />
                  <path d="M -3 0.5 V 5 H 3 V 0.5" />
                  <rect x="-1" y="2" width="2" height="3" />
                </g>
              </g>
            )
          }

          const cls = [
            'worldmap__node',
            n.role === 'stair' ? 'is-stair' : '',
            n.role === 'key' ? 'is-key' : '',
            visCls,
            curCls,
          ]
            .join(' ')
            .trim()
          return (
            <g key={n.id} className="worldmap__place" onClick={onClick}>
              <circle cx={x} cy={y} r={2.3} className={cls} />
            </g>
          )
        })}

        {avatar && (
          <circle
            cx={avatar.x}
            cy={avatar.y}
            r={1.9}
            className={`worldmap__avatar ${avatar.walking ? 'is-walking' : ''}`}
          />
        )}
      </svg>
    )
  }

  // During a level change, cross-fade the two levels over each other with a
  // slight zoom — the levels sit at different depths, so one recedes as the
  // other settles in. The traveller stays at the same spot through it.
  let body
  if (transition) {
    const fromNode = nodeOf(transition.fromMap, transition.fromId)
    const toNode = nodeOf(transition.toMap, transition.toId)
    body = (
      <div className="worldmap__viewport worldmap__viewport--xfade">
        <div className="worldmap__panel worldmap__panel--out" key="from">
          {renderMap(transition.fromMap, transition.fromId, false, {
            x: gx(fromNode.col),
            y: gy(fromNode.row),
            walking: false,
          })}
        </div>
        <div
          className="worldmap__panel worldmap__panel--in"
          key="to"
          onAnimationEnd={() => settleOnLevel(transition.toMap, transition.toId)}
        >
          {renderMap(transition.toMap, transition.toId, false, {
            x: gx(toNode.col),
            y: gy(toNode.row),
            walking: false,
          })}
        </div>
      </div>
    )
  } else {
    body = (
      <div className="worldmap__viewport">
        {renderMap(activeMap, current, true, { x: pos.x, y: pos.y, walking })}
      </div>
    )
  }

  return (
    <main className="stage worldmap">
      <p className="worldmap__caption">{content.worldMap.caption}</p>
      {body}
      <p className="overlay__hint worldmap__hint">{content.worldMap.walkHint}</p>
    </main>
  )
}
