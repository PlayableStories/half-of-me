/**
 * Maze layout for the two-map world. Each map is a graph of nodes on a 7×7
 * lattice joined by edges (drawn as dotted paths). The "maze" is simply which
 * edges exist — a missing edge means you can't go that way (no walls). Two maps
 * are linked by warps; one gated edge ("requires" a key node) is the blocked
 * path the player must open.
 *
 * This is the shape a procedural generator would emit later (nodes / edges /
 * locks / warps), so hand-authored and generated layouts stay interchangeable.
 *
 * The intended — and only — route to the house:
 *   A:start → A:farWarp ⇒ B:farLand → B:j → B:kA → B:key   (collect key)
 *   → back to B:j → opened B:j–g1 → B:g1 → B:returnWarp
 *   ⇒ A:returnLand → A:house
 * The near warp (A:nearWarp ⇒ B:nearLand) leads only to a dead-end pocket.
 */

export type MapId = 'A' | 'B'

export type NodeRole = 'start' | 'house' | 'warp' | 'key'

export interface MazeNode {
  id: string
  /** Grid column / row, 0..6. */
  col: number
  row: number
  role?: NodeRole
}

export interface EdgeLock {
  a: string
  b: string
  /** Edge stays closed until this node (same map) has been visited. */
  requires?: string
  /** Edge re-closes once this node has been visited. */
  closesAfter?: string
}

export interface MazeMap {
  id: MapId
  nodes: MazeNode[]
  edges: [string, string][]
  locks: EdgeLock[]
}

export interface WarpEnd {
  map: MapId
  id: string
}

// ---- lattice → SVG coordinates -------------------------------------------
export const GRID = 7
const CELL = 14
const MARGIN = 8
/** Square viewBox edge: MARGIN*2 + (GRID-1)*CELL = 100. */
export const VIEW = MARGIN * 2 + (GRID - 1) * CELL

export function gx(col: number) {
  return MARGIN + col * CELL
}
export function gy(row: number) {
  return MARGIN + row * CELL
}

// ---- the two maps ---------------------------------------------------------
const MAP_A: MazeMap = {
  id: 'A',
  nodes: [
    { id: 'start', col: 1, row: 6, role: 'start' },
    { id: 'a1', col: 3, row: 6 },
    { id: 'nearWarp', col: 5, row: 6, role: 'warp' },
    { id: 'a2', col: 1, row: 4 },
    { id: 'a3', col: 1, row: 2 },
    { id: 'farWarp', col: 3, row: 2, role: 'warp' },
    { id: 'returnLand', col: 5, row: 2, role: 'warp' },
    { id: 'house', col: 5, row: 0, role: 'house' },
  ],
  edges: [
    ['start', 'a1'],
    ['a1', 'nearWarp'],
    ['start', 'a2'],
    ['a2', 'a3'],
    ['a3', 'farWarp'],
    ['returnLand', 'house'],
  ],
  locks: [],
}

const MAP_B: MazeMap = {
  id: 'B',
  nodes: [
    { id: 'nearLand', col: 1, row: 0, role: 'warp' },
    { id: 'dead1', col: 3, row: 0 },
    { id: 'dead2', col: 3, row: 2 },
    { id: 'returnWarp', col: 5, row: 0, role: 'warp' },
    { id: 'g1', col: 5, row: 2 },
    { id: 'j', col: 5, row: 4 },
    { id: 'farLand', col: 5, row: 6, role: 'warp' },
    { id: 'kA', col: 3, row: 4 },
    { id: 'key', col: 1, row: 4, role: 'key' },
  ],
  edges: [
    ['nearLand', 'dead1'],
    ['dead1', 'dead2'],
    ['farLand', 'j'],
    ['j', 'g1'],
    ['g1', 'returnWarp'],
    ['j', 'kA'],
    ['kA', 'key'],
  ],
  // The blocked path: j→g1 is faint/closed until the key is collected.
  locks: [{ a: 'j', b: 'g1', requires: 'key' }],
}

export const MAPS: Record<MapId, MazeMap> = { A: MAP_A, B: MAP_B }

/** The map the traveller starts on, and the starting node. */
export const START: WarpEnd = { map: 'A', id: 'start' }

/**
 * Two-way warp links. Stepping onto either end transports to the other end.
 */
export const WARPS: [WarpEnd, WarpEnd][] = [
  [
    { map: 'A', id: 'nearWarp' },
    { map: 'B', id: 'nearLand' },
  ],
  [
    { map: 'A', id: 'farWarp' },
    { map: 'B', id: 'farLand' },
  ],
  [
    { map: 'A', id: 'returnLand' },
    { map: 'B', id: 'returnWarp' },
  ],
]

// ---- lookups --------------------------------------------------------------
export function nodeOf(map: MapId, id: string): MazeNode {
  const n = MAPS[map].nodes.find((x) => x.id === id)
  if (!n) throw new Error(`Unknown node ${map}:${id}`)
  return n
}

export function neighboursOf(map: MapId, id: string): string[] {
  const out: string[] = []
  for (const [a, b] of MAPS[map].edges) {
    if (a === id) out.push(b)
    else if (b === id) out.push(a)
  }
  return out
}

export function edgeLockOf(map: MapId, a: string, b: string): EdgeLock | undefined {
  return MAPS[map].locks.find(
    (l) => (l.a === a && l.b === b) || (l.a === b && l.b === a),
  )
}

/** The far end of a warp at (map, id), or null if that node is not a warp. */
export function warpTarget(map: MapId, id: string): WarpEnd | null {
  for (const [p, q] of WARPS) {
    if (p.map === map && p.id === id) return q
    if (q.map === map && q.id === id) return p
  }
  return null
}
