import { useEffect, useRef, useState } from 'react'
import { content } from '../content'
import type { SceneProps } from './types'

/**
 * A short SMB3-style overworld: a graph of connected places joined by paths.
 * The traveller steps node-to-node with the arrow keys (or WASD, or by clicking
 * an adjacent node). The woods branch — right to the bridge (a dead-end detour)
 * or down toward the house — so there's a real choice and you can walk around
 * and backtrack. Stepping onto the house and pressing Enter goes inside.
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

  const atHouse = current === 'house'

  function stepTo(targetId: NodeId) {
    if (walkingRef.current) return
    if (!neighbours(current).includes(targetId)) return
    const from = NODE_BY_ID[current]
    const to = NODE_BY_ID[targetId]

    const finish = () => {
      setCurrent(targetId)
      setVisited((prev) => new Set(prev).add(targetId))
      walkingRef.current = false
      setWalking(false)
    }

    if (prefersReducedMotion()) {
      setPos({ x: to.x, y: to.y })
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
    for (const nId of neighbours(current)) {
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

  function enterHouse() {
    if (!walkingRef.current && atHouse) goTo('house')
  }

  // Keyboard: arrows / WASD walk; Enter or Space enters the house when on it.
  // Re-bound each render so it reads the latest current/walking state.
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
        case 'Enter':
        case ' ':
          e.preventDefault()
          enterHouse()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function onNodeClick(id: NodeId) {
    if (id === current) enterHouse()
    else stepTo(id)
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
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              className="worldmap__edge"
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

        {/* the traveller */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={1.9}
          className={`worldmap__avatar ${walking ? 'is-walking' : ''}`}
        />
      </svg>

      {atHouse ? (
        <button type="button" className="button" onClick={enterHouse}>
          {content.worldMap.enterLabel}
        </button>
      ) : null}
      <p className="overlay__hint worldmap__hint">
        {atHouse ? content.worldMap.enterHint : content.worldMap.walkHint}
      </p>
    </main>
  )
}
