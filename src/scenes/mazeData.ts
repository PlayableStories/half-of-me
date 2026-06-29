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
  /** Edge stays closed until this node has been visited. */
  requires?: string
  /** Which level the `requires` node lives on (defaults to the edge's level). */
  requiresMap?: MapId
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
//   S4 (0,2) decoy stair — at the end of the near stair's basement pocket;
//            climbing it surfaces in an isolated dead corner of the ground, so
//            the near route only reveals itself as a dead end after a round trip.
//   S5 (3,4) key stair — a branch off the far route in the basement; climbing
//            it surfaces at an isolated KEY island on the ground. The key must
//            be fetched (go down, then up) before the far route's blocked path
//            opens. The key lives on the GROUND, so the basement lock requires
//            it via requiresMap: 'A'.
//
// Both levels are grid mazes that spread across the 7×7 lattice. Every edge
// joins *adjacent* cells (one step), so a node sits on each cell along a
// corridor and there are no two-cell jumps. Plain corridor/branch nodes are
// named by grid position (ground "p<col><row>", basement "q<col><row>"); the
// special nodes (stairs, key, house, start) keep readable ids. The near stair
// is one step from the start; the far stair is a long winding walk away.
const GROUND: MazeMap = {
  id: 'A',
  nodes: [
    { id: 'start', col: 0, row: 6, role: 'start' },
    { id: 'S1', col: 2, row: 6, role: 'stair' }, // near stair, by the start
    { id: 'S2', col: 6, row: 4, role: 'stair' }, // far stair
    // main spine: start → far stair (long winding walk)
    { id: 'p16', col: 1, row: 6 },
    { id: 'p05', col: 0, row: 5 },
    { id: 'p04', col: 0, row: 4 },
    { id: 'p14', col: 1, row: 4 },
    { id: 'p24', col: 2, row: 4 },
    { id: 'p23', col: 2, row: 3 },
    { id: 'p22', col: 2, row: 2 },
    { id: 'p32', col: 3, row: 2 },
    { id: 'p42', col: 4, row: 2 },
    { id: 'p43', col: 4, row: 3 },
    { id: 'p44', col: 4, row: 4 },
    { id: 'p54', col: 5, row: 4 },
    // long false corridor up col 1 (off p14)
    { id: 'p13', col: 1, row: 3 },
    { id: 'p12', col: 1, row: 2 },
    { id: 'p11', col: 1, row: 1 },
    // long detour off p22: up col 2, across the top, down col 4 — dead-ends
    // one cell from the spine (p42), so it looks like it should connect
    { id: 'p21', col: 2, row: 1 },
    { id: 'p20', col: 2, row: 0 },
    { id: 'p30', col: 3, row: 0 },
    { id: 'p40', col: 4, row: 0 },
    { id: 'p41', col: 4, row: 1 },
    // false corridor up col 5 (off p54)
    { id: 'p53', col: 5, row: 3 },
    { id: 'p52', col: 5, row: 2 },
    { id: 'p51', col: 5, row: 1 },
    // forked false branch in the bottom-right (off p44)
    { id: 'p45', col: 4, row: 5 },
    { id: 'p46', col: 4, row: 6 },
    { id: 'p56', col: 5, row: 6 },
    { id: 'p66', col: 6, row: 6 },
    { id: 'p55', col: 5, row: 5 },
    { id: 'p65', col: 6, row: 5 },
    // Isolated decoy island — reached only by climbing the decoy stair S4.
    { id: 'S4', col: 0, row: 2, role: 'stair' },
    { id: 'p01', col: 0, row: 1 },
    { id: 'giso', col: 0, row: 0 }, // dead corner — the wasted trip
    // Isolated key island — reached only by climbing the key stair S5.
    { id: 'S5', col: 3, row: 4, role: 'stair' },
    { id: 'p35', col: 3, row: 5 },
    { id: 'key', col: 3, row: 6, role: 'key' },
    // Isolated house island — reached only by climbing the return stair S3.
    { id: 'S3', col: 6, row: 1, role: 'stair' },
    { id: 'house', col: 6, row: 0, role: 'house' },
  ],
  edges: [
    // spine
    ['start', 'p16'],
    ['p16', 'S1'],
    ['start', 'p05'],
    ['p05', 'p04'],
    ['p04', 'p14'],
    ['p14', 'p24'],
    ['p24', 'p23'],
    ['p23', 'p22'],
    ['p22', 'p32'],
    ['p32', 'p42'],
    ['p42', 'p43'],
    ['p43', 'p44'],
    ['p44', 'p54'],
    ['p54', 'S2'],
    // long false corridor up col 1
    ['p14', 'p13'],
    ['p13', 'p12'],
    ['p12', 'p11'],
    // long top detour (dead-ends at p41, beside the spine)
    ['p22', 'p21'],
    ['p21', 'p20'],
    ['p20', 'p30'],
    ['p30', 'p40'],
    ['p40', 'p41'],
    // false corridor up col 5
    ['p54', 'p53'],
    ['p53', 'p52'],
    ['p52', 'p51'],
    // bottom-right fork
    ['p44', 'p45'],
    ['p45', 'p46'],
    ['p46', 'p56'],
    ['p56', 'p66'],
    ['p45', 'p55'],
    ['p55', 'p65'],
    // islands (each disconnected from the main maze)
    ['S4', 'p01'],
    ['p01', 'giso'],
    ['S5', 'p35'],
    ['p35', 'key'],
    ['S3', 'house'],
  ],
  locks: [],
}

const BASEMENT: MazeMap = {
  id: 'B',
  nodes: [
    { id: 'S1', col: 2, row: 6, role: 'stair' },
    { id: 'S2', col: 6, row: 4, role: 'stair' },
    { id: 'S5', col: 3, row: 4, role: 'stair' }, // up to the ground key island
    // near-stair pocket (isolated): a winding warren that leads only to the
    // decoy stair, with a long dead-end arm of its own.
    { id: 'q16', col: 1, row: 6 },
    { id: 'bd1', col: 0, row: 6 },
    { id: 'qb5', col: 0, row: 5 },
    { id: 'bd3', col: 0, row: 4 },
    { id: 'q03', col: 0, row: 3 },
    { id: 'S4', col: 0, row: 2, role: 'stair' }, // the decoy stair
    { id: 'q25', col: 2, row: 5 },
    { id: 'bd2', col: 2, row: 4 },
    { id: 'q14', col: 1, row: 4 },
    { id: 'q13', col: 1, row: 3 }, // long dead-end arm
    { id: 'q12', col: 1, row: 2 },
    { id: 'q35', col: 3, row: 5 }, // dead-end stub
    // main route (spine to the blocked corridor and the return stair)
    { id: 'q54', col: 5, row: 4 },
    { id: 'b1', col: 4, row: 4 },
    { id: 'q43', col: 4, row: 3 },
    { id: 'b2', col: 4, row: 2 },
    { id: 'q41', col: 4, row: 1 },
    { id: 'b3', col: 4, row: 0 },
    { id: 'q50', col: 5, row: 0 }, // on the blocked path
    { id: 'b4', col: 6, row: 0 },
    { id: 'S3', col: 6, row: 1, role: 'stair' },
    // a loop around the start side (b2 ↔ b3) plus a long top dead-end
    { id: 'q32', col: 3, row: 2 },
    { id: 'q22', col: 2, row: 2 },
    { id: 'q21', col: 2, row: 1 },
    { id: 'bdead', col: 2, row: 0 },
    { id: 'q30', col: 3, row: 0 },
    { id: 'q10', col: 1, row: 0 }, // long top dead-end
    { id: 'q00', col: 0, row: 0 },
    // false corridor up col 5 (off q43)
    { id: 'q53', col: 5, row: 3 },
    { id: 'q52', col: 5, row: 2 },
    { id: 'q51', col: 5, row: 1 },
  ],
  edges: [
    // near-stair pocket (left arm to the decoy stair)
    ['S1', 'q16'],
    ['q16', 'bd1'],
    ['bd1', 'qb5'],
    ['qb5', 'bd3'],
    ['bd3', 'q03'],
    ['q03', 'S4'], // the pocket leads to the decoy stair, not the route
    // near-stair pocket (upper arm — a long dead-end)
    ['S1', 'q25'],
    ['q25', 'bd2'],
    ['bd2', 'q14'],
    ['q14', 'q13'],
    ['q13', 'q12'],
    ['q25', 'q35'],
    // main route
    ['S2', 'q54'],
    ['q54', 'b1'],
    ['b1', 'S5'], // branch up to fetch the key from the ground
    ['b1', 'q43'],
    ['q43', 'b2'],
    ['b2', 'q41'],
    ['q41', 'b3'],
    ['b3', 'q50'], // the blocked path: faint/closed until the key (on A) is found
    ['q50', 'b4'], // (both segments of the corridor stay closed until the key)
    ['b4', 'S3'],
    // loop around the start side (does not bypass the blocked corridor)
    ['b2', 'q32'],
    ['q32', 'q22'],
    ['q22', 'q21'],
    ['q21', 'bdead'],
    ['bdead', 'q30'],
    ['q30', 'b3'],
    // long top dead-end off the loop
    ['bdead', 'q10'],
    ['q10', 'q00'],
    // false corridor up col 5
    ['q43', 'q53'],
    ['q53', 'q52'],
    ['q52', 'q51'],
  ],
  locks: [
    { a: 'b3', b: 'q50', requires: 'key', requiresMap: 'A' },
    { a: 'q50', b: 'b4', requires: 'key', requiresMap: 'A' },
  ],
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
  [
    { map: 'A', id: 'S5' },
    { map: 'B', id: 'S5' },
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
