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
//   S1 (2,6) near stair   S2 (6,4) far stair   S3 (6,1) return stair
//   S4 (0,2) decoy stair  — hidden at the end of the near stair's basement
//                           pocket; climbing it surfaces in an isolated dead
//                           corner of the ground, so the near route only
//                           reveals itself as a dead end after a round trip.
//
// Both levels are proper little mazes that spread across the 7×7 grid, with
// several dead-ends. The near stair is one step from the start; the far stair
// is a long winding walk away.
const GROUND: MazeMap = {
  id: 'A',
  nodes: [
    { id: 'start', col: 0, row: 6, role: 'start' },
    { id: 'S1', col: 2, row: 6, role: 'stair' }, // near stair, by the start
    { id: 'g1', col: 0, row: 4 },
    { id: 'g2', col: 2, row: 4 },
    { id: 'g3', col: 2, row: 2 },
    { id: 'g6', col: 4, row: 2 },
    { id: 'g7', col: 4, row: 0 },
    { id: 'g8', col: 2, row: 0 }, // dead-end (top)
    { id: 'g9', col: 4, row: 4 },
    { id: 'S2', col: 6, row: 4, role: 'stair' }, // far stair
    { id: 'g10', col: 4, row: 6 },
    { id: 'g11', col: 6, row: 6 }, // dead-end (bottom-right)
    // Isolated decoy pocket — only reachable by climbing the decoy stair S4.
    { id: 'S4', col: 0, row: 2, role: 'stair' },
    { id: 'giso', col: 0, row: 0 }, // dead corner — the wasted trip
    { id: 'S3', col: 6, row: 1, role: 'stair' }, // return stair (house island)
    { id: 'house', col: 6, row: 0, role: 'house' },
  ],
  edges: [
    ['start', 'S1'],
    ['start', 'g1'],
    ['g1', 'g2'],
    ['g2', 'g3'],
    ['g3', 'g6'],
    ['g6', 'g7'],
    ['g7', 'g8'],
    ['g6', 'g9'],
    ['g9', 'S2'],
    ['g9', 'g10'],
    ['g10', 'g11'],
    ['S4', 'giso'], // isolated: you arrive here from below, and it goes nowhere
    ['S3', 'house'], // the house island — only reached by climbing S3
  ],
  locks: [],
}

const BASEMENT: MazeMap = {
  id: 'B',
  nodes: [
    { id: 'S1', col: 2, row: 6, role: 'stair' },
    { id: 'bd1', col: 0, row: 6 }, // dead-end stub off the near stair
    { id: 'bd2', col: 2, row: 4 },
    { id: 'bd3', col: 0, row: 4 },
    { id: 'S4', col: 0, row: 2, role: 'stair' }, // looks like a way out…
    { id: 'S2', col: 6, row: 4, role: 'stair' },
    { id: 'b1', col: 4, row: 4 },
    { id: 'b2', col: 4, row: 2 },
    { id: 'key', col: 2, row: 2, role: 'key' },
    { id: 'bk1', col: 2, row: 0 }, // dead-end past the key
    { id: 'b3', col: 4, row: 0 },
    { id: 'b4', col: 6, row: 0 },
    { id: 'S3', col: 6, row: 1, role: 'stair' },
  ],
  edges: [
    ['S1', 'bd1'], // near stair → dead-end stub
    ['S1', 'bd2'],
    ['bd2', 'bd3'],
    ['bd3', 'S4'], // …the pocket leads to the decoy stair, not to the route
    ['S2', 'b1'],
    ['b1', 'b2'],
    ['b2', 'key'],
    ['key', 'bk1'],
    ['b2', 'b3'],
    ['b3', 'b4'], // the blocked path: faint/closed until the key is found
    ['b4', 'S3'],
  ],
  locks: [{ a: 'b3', b: 'b4', requires: 'key' }],
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
  [
    { map: 'A', id: 'S4' },
    { map: 'B', id: 'S4' },
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
