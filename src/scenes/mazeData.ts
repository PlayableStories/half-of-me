/**
 * Maze layout for a two-level world: a **ground** level (map A) and a
 * **basement** below it (map B), joined by **staircases**. Each level is a
 * graph of nodes on a 7×7 lattice joined by edges drawn as dotted paths. The
 * "maze" is simply which edges exist — a missing edge means you can't go that
 * way (no walls). One gated edge ("requires" a key node) is the blocked path
 * the player must open.
 *
 * Staircases link the two levels. A staircase pair shares the SAME grid
 * coordinates, so descending/ascending keeps the traveller in the same spot —
 * you drop straight down (or climb straight up) a level.
 *
 * This is the shape a procedural generator would emit later (nodes / edges /
 * locks / stairs), so hand-authored and generated layouts stay interchangeable.
 *
 * The intended — and only — route to the house:
 *   ground:start → ground:S2 (far stair) ↓ basement:S2 → bMid → key  (get key)
 *   → back to bMid → opened bMid–bturn → bturn → basement:S3 ↑ ground:S3
 *   → ground:house
 * The near stair (S1) drops only into a dead-end basement pocket.
 */

export type MapId = 'A' | 'B'

export type NodeRole = 'start' | 'house' | 'stair' | 'key'

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

export interface StairEnd {
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

// ---- the two levels -------------------------------------------------------
// Staircase coordinates are shared between the levels (same col,row) so the
// traveller stays in place when changing level:
//   S1 (3,5) — near stair    S2 (3,1) — far stair    S3 (5,1) — return stair
const GROUND: MazeMap = {
  id: 'A',
  nodes: [
    { id: 'start', col: 1, row: 5, role: 'start' },
    { id: 'S1', col: 3, row: 5, role: 'stair' },
    { id: 'gUp1', col: 1, row: 3 },
    { id: 'gUp2', col: 1, row: 1 },
    { id: 'S2', col: 3, row: 1, role: 'stair' },
    { id: 'S3', col: 5, row: 1, role: 'stair' },
    { id: 'house', col: 5, row: 0, role: 'house' },
  ],
  edges: [
    ['start', 'S1'],
    ['start', 'gUp1'],
    ['gUp1', 'gUp2'],
    ['gUp2', 'S2'],
    ['S3', 'house'], // the house island — only reached by climbing S3
  ],
  locks: [],
}

const BASEMENT: MazeMap = {
  id: 'B',
  nodes: [
    { id: 'S1', col: 3, row: 5, role: 'stair' },
    { id: 'd1', col: 5, row: 5 },
    { id: 'd2', col: 1, row: 5 },
    { id: 'S2', col: 3, row: 1, role: 'stair' },
    { id: 'bMid', col: 3, row: 3 },
    { id: 'key', col: 1, row: 3, role: 'key' },
    { id: 'bturn', col: 5, row: 3 },
    { id: 'S3', col: 5, row: 1, role: 'stair' },
  ],
  edges: [
    ['S1', 'd1'],
    ['S1', 'd2'], // near stair → dead-end pocket, both ways lead nowhere
    ['S2', 'bMid'],
    ['bMid', 'key'],
    ['bMid', 'bturn'], // the blocked path: faint/closed until the key is found
    ['bturn', 'S3'],
  ],
  locks: [{ a: 'bMid', b: 'bturn', requires: 'key' }],
}

export const MAPS: Record<MapId, MazeMap> = { A: GROUND, B: BASEMENT }

/** The level the traveller starts on, and the starting node. */
export const START: StairEnd = { map: 'A', id: 'start' }

/**
 * Two-way staircases. Stepping onto either end changes level. Both ends share
 * the same grid coordinates, so the traveller stays in place.
 */
export const STAIRS: [StairEnd, StairEnd][] = [
  [
    { map: 'A', id: 'S1' },
    { map: 'B', id: 'S1' },
  ],
  [
    { map: 'A', id: 'S2' },
    { map: 'B', id: 'S2' },
  ],
  [
    { map: 'A', id: 'S3' },
    { map: 'B', id: 'S3' },
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

export function edgeLockOf(
  map: MapId,
  a: string,
  b: string,
): EdgeLock | undefined {
  return MAPS[map].locks.find(
    (l) => (l.a === a && l.b === b) || (l.a === b && l.b === a),
  )
}

/** The far end of a staircase at (map, id), or null if that node isn't one. */
export function stairTarget(map: MapId, id: string): StairEnd | null {
  for (const [p, q] of STAIRS) {
    if (p.map === map && p.id === id) return q
    if (q.map === map && q.id === id) return p
  }
  return null
}
