import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import type { SceneProps } from './types'

/**
 * A short SMB3-style overworld: a graph of connected places joined by paths.
 * The traveller steps node-to-node with the arrow keys (or WASD, or by clicking
 * an adjacent node). The woods branch — right to the bridge (a dead-end detour)
 * or down toward the house — so there's a real choice and you can walk around
 * and backtrack. Arriving on the house switches to the house scene at once —
 * no button, no extra keypress.
 *
 * Deliberately one short scene, not a large explorable map (GDD §8). The SMB3
 * reference is structural, not literal.
 */
const VIEW_W = 100
const VIEW_H = 60
const STEP_MS = 420

type NodeId = keyof typeof content.worldMap.places

interface MapNode {
  id: NodeId
  x: number
  y: number
}

const NODES: MapNode[] = [
  { id: 'road', x: 12, y: 18 },
  { id: 'woods', x: 38, y: 18 },
  { id: 'bridge', x: 66, y: 18 },
  { id: 'well', x: 38, y: 44 },
  { id: 'house', x: 72, y: 44 },
]

const EDGES: [NodeId, NodeId][] = [
  ['road', 'woods'],
  ['woods', 'bridge'],
  ['woods', 'well'],
  ['well', 'house'],
]

/**
 * Gated edges. `requires` keeps the edge closed until that node is visited;
 * `closesAfter` re-closes it once that node is reached. The path from the gap
 * (woods) to the other side (well) opens only after the key (bridge), then locks
 * behind the traveller once they reach the other side — a one-way crossing.
 */
const EDGE_LOCKS: {
  a: NodeId
  b: NodeId
  requires?: NodeId
  closesAfter?: NodeId
}[] = [{ a: 'woods', b: 'well', requires: 'bridge', closesAfter: 'well' }]

function edgeLock(a: NodeId, b: NodeId) {
  return EDGE_LOCKS.find(
    (l) => (l.a === a && l.b === b) || (l.a === b && l.b === a),
  )
}

const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<
  NodeId,
  MapNode
>

function neighbours(id: NodeId): NodeId[] {
  const out: NodeId[] = []
  for (const [a, b] of EDGES) {
    if (a === id) out.push(b)
    else if (b === id) out.push(a)
  }
  return out
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function WorldMapScene({ goTo }: SceneProps) {
  const start = NODES[0]
  const [current, setCurrent] = useState<NodeId>(start.id)
  const [pos, setPos] = useState({ x: start.x, y: start.y })
  const [visited, setVisited] = useState<Set<NodeId>>(() => new Set([start.id]))
  const walkingRef = useRef(false)
  const [walking, setWalking] = useState(false)
  // True only while flying the gap↔other-side crossing (avatar shown as a plane).
  const [crossing, setCrossing] = useState(false)

  /** Open unless still gated by `requires`, or already shut by `closesAfter`. */
  function isEdgeOpen(a: NodeId, b: NodeId) {
    const lock = edgeLock(a, b)
    if (!lock) return true
    if (lock.requires && !visited.has(lock.requires)) return false
    if (lock.closesAfter && visited.has(lock.closesAfter)) return false
    return true
  }

  /** Neighbours reachable right now (locked edges excluded). */
  function openNeighbours(id: NodeId) {
    return neighbours(id).filter((n) => isEdgeOpen(id, n))
  }

  function stepTo(targetId: NodeId) {
    if (walkingRef.current) return
    if (!openNeighbours(current).includes(targetId)) return
    const from = NODE_BY_ID[current]
    const to = NODE_BY_ID[targetId]
    // The gap↔other-side step is "flown": show the traveller as a plane.
    const crossingGap =
      (current === 'woods' && targetId === 'well') ||
      (current === 'well' && targetId === 'woods')

    const finish = () => {
      setCurrent(targetId)
      setVisited((prev) => new Set(prev).add(targetId))
      walkingRef.current = false
      setWalking(false)
      setCrossing(false)
      // Arriving at the house ends the map: switch scenes immediately.
      if (targetId === 'house') goTo('house')
    }

    if (prefersReducedMotion()) {
      setPos({ x: to.x, y: to.y })
      finish()
      return
    }

    walkingRef.current = true
    setWalking(true)
    if (crossingGap) setCrossing(true)
    let startTs: number | null = null
    function step(ts: number) {
      if (startTs === null) startTs = ts
      const k = Math.min(1, (ts - startTs) / STEP_MS)
      const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
      setPos({
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
      })
      if (k < 1) requestAnimationFrame(step)
      else finish()
    }
    requestAnimationFrame(step)
  }

  /** Step toward the neighbour that best matches a unit direction (dx, dy). */
  function walkDir(dx: number, dy: number) {
    if (walkingRef.current) return
    const cur = NODE_BY_ID[current]
    let best: NodeId | null = null
    let bestScore = 0.5 // require a clear match, not a near-perpendicular one
    for (const nId of openNeighbours(current)) {
      const n = NODE_BY_ID[nId]
      const vx = n.x - cur.x
      const vy = n.y - cur.y
      const len = Math.hypot(vx, vy) || 1
      const score = (vx / len) * dx + (vy / len) * dy
      if (score > bestScore) {
        bestScore = score
        best = nId
      }
    }
    if (best) stepTo(best)
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

  function onNodeClick(id: NodeId) {
    stepTo(id)
  }

  const { places } = content.worldMap

  return (
    <main className="stage worldmap">
      <p className="worldmap__caption">{content.worldMap.caption}</p>

      <svg
        className="worldmap__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={content.worldMap.ariaLabel}
      >
        {/* paths between places */}
        {EDGES.map(([a, b]) => {
          const na = NODE_BY_ID[a]
          const nb = NODE_BY_ID[b]
          const locked = !isEdgeOpen(a, b)
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className={`worldmap__edge ${locked ? 'is-locked' : ''}`}
            />
          )
        })}

        {/* places */}
        {NODES.map((n) => {
          const isHouse = n.id === 'house'
          const cls = [
            'worldmap__node',
            visited.has(n.id) ? 'is-visited' : '',
            current === n.id ? 'is-current' : '',
          ]
            .join(' ')
            .trim()
          return (
            <g
              key={n.id}
              className="worldmap__place"
              onClick={() => onNodeClick(n.id)}
            >
              {isHouse ? (
                <g
                  transform={`translate(${n.x} ${n.y})`}
                  className={`worldmap__house ${cls}`}
                >
                  <path d="M -4 1 L 0 -4 L 4 1" />
                  <path d="M -3 0.5 V 5 H 3 V 0.5" />
                  <rect x="-1" y="2" width="2" height="3" />
                </g>
              ) : (
                <circle cx={n.x} cy={n.y} r={2} className={cls} />
              )}
              <text x={n.x} y={n.y + 8} className="worldmap__label">
                {places[n.id]}
              </text>
            </g>
          )
        })}

        {/* the traveller — a dot, or a plane (nose south) flying the gap */}
        {crossing ? (
          <g
            transform={`translate(${pos.x} ${pos.y})`}
            className="worldmap__avatar worldmap__plane"
          >
            <path d="M0 3.4 C0.7 2 0.7 -2.4 0 -3.2 C-0.7 -2.4 -0.7 2 0 3.4 Z" />
            <path d="M-3.4 0.9 L3.4 0.9 L1.1 -0.5 L-1.1 -0.5 Z" />
            <path d="M-1.3 -2.3 L1.3 -2.3 L0.6 -3.1 L-0.6 -3.1 Z" />
          </g>
        ) : (
          <circle
            cx={pos.x}
            cy={pos.y}
            r={1.9}
            className={`worldmap__avatar ${walking ? 'is-walking' : ''}`}
          />
        )}
      </svg>

      <p className="overlay__hint worldmap__hint">
        {content.worldMap.walkHint}
      </p>
    </main>
  )
}
