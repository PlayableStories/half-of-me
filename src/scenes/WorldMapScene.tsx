import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { content } from '../content'
import type { SceneProps } from './types'

/**
 * A short SMB3-style overworld: a winding path with a few nodes ending at a
 * small house. The traveller walks node-to-node ALONG the path (sampled with
 * SVG `getPointAtLength`), and entering the final house node leads inside.
 *
 * Deliberately one short scene, not an explorable map (GDD §8). The reference
 * to SMB3's spade-panel walk is structural, not literal.
 */
const VIEW_W = 100
const VIEW_H = 60
// A gentle S-curve from lower-left to the house at upper-right.
const PATH_D = 'M 8 50 C 20 50 24 34 36 34 S 58 40 68 28 S 86 16 90 16'
// Stops along the path, as fractions of its total length (last = the house).
const NODE_FRACS = [0, 0.34, 0.67, 1]
const WALK_MS = 750

interface Point {
  x: number
  y: number
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function WorldMapScene({ goTo }: SceneProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const lengthsRef = useRef<number[]>([])
  const [nodes, setNodes] = useState<Point[]>([])
  const [pos, setPos] = useState<Point | null>(null)
  const [nodeIndex, setNodeIndex] = useState(0)
  const [walking, setWalking] = useState(false)

  const lastIndex = NODE_FRACS.length - 1
  const atHouse = nodeIndex >= lastIndex

  // Measure the path once it is in the DOM and place the nodes + traveller.
  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return
    const total = path.getTotalLength()
    const lengths = NODE_FRACS.map((f) => f * total)
    lengthsRef.current = lengths
    const points = lengths.map((l) => {
      const p = path.getPointAtLength(l)
      return { x: p.x, y: p.y }
    })
    setNodes(points)
    setPos(points[0])
  }, [])

  function advance() {
    if (walking) return
    if (atHouse) {
      goTo('house')
      return
    }
    const path = pathRef.current
    const lengths = lengthsRef.current
    if (!path || lengths.length === 0) return

    const from = lengths[nodeIndex]
    const to = lengths[nodeIndex + 1]

    if (prefersReducedMotion()) {
      const p = path.getPointAtLength(to)
      setPos({ x: p.x, y: p.y })
      setNodeIndex((i) => i + 1)
      return
    }

    setWalking(true)
    let startTs: number | null = null
    function step(ts: number) {
      if (startTs === null) startTs = ts
      const k = Math.min(1, (ts - startTs) / WALK_MS)
      const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2 // easeInOutQuad
      const l = from + (to - from) * eased
      const p = path!.getPointAtLength(l)
      setPos({ x: p.x, y: p.y })
      if (k < 1) {
        requestAnimationFrame(step)
      } else {
        setNodeIndex((i) => i + 1)
        setWalking(false)
      }
    }
    requestAnimationFrame(step)
  }

  // Space / Enter walks on (re-bound each render so it sees current state).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const house = nodes[lastIndex]

  return (
    <main className="stage worldmap">
      <p className="worldmap__caption">{content.worldMap.caption}</p>

      <svg
        className="worldmap__svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={content.worldMap.ariaLabel}
        onClick={advance}
      >
        <path
          ref={pathRef}
          d={PATH_D}
          className="worldmap__path"
          fill="none"
          pathLength={1}
        />

        {/* stops along the way */}
        {nodes.map((n, i) =>
          i === lastIndex ? null : (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={1.4}
              className={`worldmap__node ${i <= nodeIndex ? 'is-visited' : ''}`}
            />
          ),
        )}

        {/* the house at the final node */}
        {house && (
          <g
            transform={`translate(${house.x} ${house.y})`}
            className="worldmap__house"
          >
            <path d="M -4 1 L 0 -4 L 4 1" />
            <path d="M -3 0.5 V 5 H 3 V 0.5" />
            <rect x="-1" y="2" width="2" height="3" />
          </g>
        )}

        {/* the traveller */}
        {pos && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r={1.8}
            className={`worldmap__avatar ${walking ? 'is-walking' : ''}`}
          />
        )}
      </svg>

      <button type="button" className="button" onClick={advance} disabled={walking}>
        {atHouse ? content.worldMap.enterLabel : content.worldMap.walkOn}
      </button>
      <p className="overlay__hint worldmap__hint">{content.worldMap.walkHint}</p>
    </main>
  )
}
