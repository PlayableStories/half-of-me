/**
 * Maze layout for a two-level world: a **ground** level (map A) and a
 * **basement** below it (map B), joined by **staircases**. Each level is a
 * graph of nodes on a 7×7 lattice; every edge joins adjacent cells (one step),
 * and a missing edge means you can't go that way (no walls). Staircase pairs
 * share the SAME grid coordinates, so changing level keeps you in place.
 *
 * This is the shape a procedural generator would emit later (nodes / edges /
 * locks / stairs), so hand-authored and generated layouts stay interchangeable.
 *
 * Shared staircase coordinates:
 *   S1 (2,6) near stair    S2 (6,4) far stair    S3 (6,1) return stair
 *   S4 (0,1) decoy stair   S5 (2,1) key stair
 *
 * The full intended route (the journey is a loop that forces you to use the
 * decoy you first dismissed):
 *   A:start → A:S2 (far stair) ↓ B → reach the blocked corridor (need the key)
 *   → B:S5 (key stair) ↑ A → collect the key
 *   → collecting it CLOSES the way back down (A:S5–key) and OPENS the key
 *     island onto the decoy cluster (A:key–c10, requires key)
 *   → cross to A:S4 (decoy stair) ↓ B → the decoy pocket now OPENS onward
 *     (B:S4–q00, requires key) → B:S3 (return stair) ↑ A → A:house
 * The near stair (S1) is an early dead-end decoy: down to the basement pocket,
 * up the decoy stair, into a dead corner — until you hold the key.
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
const GROUND: MazeMap = {
  id: 'A',
  nodes: [
    { id: 'start', col: 0, row: 6, role: 'start' },
    { id: 'S1', col: 2, row: 6, role: 'stair' }, // near stair (early decoy)
    { id: 'S2', col: 6, row: 4, role: 'stair' }, // far stair
    // main maze: start → far stair, with winding dead-ends
    { id: 'a1', col: 1, row: 6 },
    { id: 'a2', col: 0, row: 5 },
    { id: 'a3', col: 0, row: 4 },
    { id: 'a4', col: 0, row: 3 },
    { id: 'a5', col: 0, row: 2 },
    { id: 'a6', col: 1, row: 2 },
    { id: 'a7', col: 2, row: 2 },
    { id: 'a8', col: 2, row: 3 }, // long branch down…
    { id: 'a9', col: 2, row: 4 },
    { id: 'a10', col: 3, row: 4 },
    { id: 'a11', col: 3, row: 5 },
    { id: 'a12', col: 3, row: 6 }, // …dead-end
    { id: 'a13', col: 3, row: 2 },
    { id: 'a14', col: 4, row: 2 },
    { id: 'a15', col: 4, row: 1 },
    { id: 'a16', col: 4, row: 0 }, // dead-end (top)
    { id: 'a17', col: 4, row: 3 },
    { id: 'a18', col: 4, row: 4 },
    { id: 'a19', col: 5, row: 4 },
    { id: 'a20', col: 5, row: 5 },
    { id: 'a21', col: 5, row: 6 }, // dead-end (bottom-right)
    // Isolated key + decoy cluster (top-left). Reached only by the stairs; the
    // key→c10 link opens once the key is taken, and S5→key closes behind you.
    { id: 'giso', col: 0, row: 0 }, // dead corner of the decoy
    { id: 'c10', col: 1, row: 0 },
    { id: 'key', col: 2, row: 0, role: 'key' },
    { id: 'S4', col: 0, row: 1, role: 'stair' }, // decoy stair
    { id: 'c11', col: 1, row: 1 }, // dead stub
    { id: 'S5', col: 2, row: 1, role: 'stair' }, // key stair
    // Isolated house island — reached only by climbing the return stair S3.
    { id: 'S3', col: 6, row: 1, role: 'stair' },
    { id: 'house', col: 6, row: 0, role: 'house' },
  ],
  edges: [
    // main maze
    ['start', 'a1'],
    ['a1', 'S1'],
    ['start', 'a2'],
    ['a2', 'a3'],
    ['a3', 'a4'],
    ['a4', 'a5'],
    ['a5', 'a6'],
    ['a6', 'a7'],
    ['a7', 'a8'],
    ['a8', 'a9'],
    ['a9', 'a10'],
    ['a10', 'a11'],
    ['a11', 'a12'],
    ['a7', 'a13'],
    ['a13', 'a14'],
    ['a14', 'a15'],
    ['a15', 'a16'],
    ['a14', 'a17'],
    ['a17', 'a18'],
    ['a18', 'a19'],
    ['a19', 'S2'],
    ['a19', 'a20'],
    ['a20', 'a21'],
    // key + decoy cluster
    ['S5', 'key'], // climb the key stair, step up to the key…
    ['key', 'c10'], // …which then opens the way out (requires key)
    ['c10', 'giso'],
    ['giso', 'S4'], // …to the decoy stair
    ['S5', 'c11'], // dead stub
    // house island
    ['S3', 'house'],
  ],
  locks: [
    // Taking the key closes the way back down the key stair.
    { a: 'S5', b: 'key', closesAfter: 'key' },
    // …and opens the key island onto the decoy cluster.
    { a: 'key', b: 'c10', requires: 'key' },
  ],
}

const BASEMENT: MazeMap = {
  id: 'B',
  nodes: [
    { id: 'S1', col: 2, row: 6, role: 'stair' },
    { id: 'S2', col: 6, row: 4, role: 'stair' },
    { id: 'S5', col: 2, row: 1, role: 'stair' }, // up to the key island
    { id: 'S4', col: 0, row: 1, role: 'stair' }, // down here from the decoy
    { id: 'S3', col: 6, row: 1, role: 'stair' }, // up to the house
    // main route: far stair → blocked corridor → return stair
    { id: 'r1', col: 5, row: 4 },
    { id: 'r2', col: 4, row: 4 },
    { id: 'r3', col: 4, row: 3 },
    { id: 'r4', col: 4, row: 2 },
    { id: 'r5', col: 4, row: 1 },
    { id: 'r6', col: 5, row: 1 }, // beyond the blocked corridor
    { id: 'k1', col: 3, row: 1 }, // branch to the key stair
    { id: 'rb1', col: 5, row: 3 }, // dead-end branch
    { id: 'rb2', col: 5, row: 2 },
    { id: 'rb3', col: 3, row: 4 }, // dead-end branch
    { id: 'rb4', col: 2, row: 4 },
    // decoy pocket: near stair → up the left side → decoy stair
    { id: 'pa', col: 1, row: 6 },
    { id: 'pb', col: 0, row: 6 },
    { id: 'pc', col: 0, row: 5 },
    { id: 'pd', col: 0, row: 4 },
    { id: 'pe', col: 0, row: 3 },
    { id: 'pf', col: 0, row: 2 },
    { id: 'pg', col: 2, row: 5 }, // dead-end stub
    { id: 'ph', col: 3, row: 5 },
    // gated corridor (decoy pocket → return stair), opens only with the key
    { id: 'q00', col: 0, row: 0 },
    { id: 'q10', col: 1, row: 0 },
    { id: 'q20', col: 2, row: 0 },
    { id: 'q30', col: 3, row: 0 },
    { id: 'q40', col: 4, row: 0 },
    { id: 'q50', col: 5, row: 0 },
    { id: 'q60', col: 6, row: 0 },
  ],
  edges: [
    // main route
    ['S2', 'r1'],
    ['r1', 'r2'],
    ['r2', 'r3'],
    ['r3', 'r4'],
    ['r4', 'r5'],
    ['r5', 'r6'], // the blocked corridor (need the key); return stair beyond it
    ['r6', 'S3'],
    ['r5', 'k1'],
    ['k1', 'S5'], // branch to the key stair
    ['r3', 'rb1'],
    ['rb1', 'rb2'],
    ['r2', 'rb3'],
    ['rb3', 'rb4'],
    // decoy pocket
    ['S1', 'pa'],
    ['pa', 'pb'],
    ['pb', 'pc'],
    ['pc', 'pd'],
    ['pd', 'pe'],
    ['pe', 'pf'],
    ['pf', 'S4'],
    ['S1', 'pg'],
    ['pg', 'ph'],
    // gated corridor: opens onward from the decoy only once you hold the key
    ['S4', 'q00'],
    ['q00', 'q10'],
    ['q10', 'q20'],
    ['q20', 'q30'],
    ['q30', 'q40'],
    ['q40', 'q50'],
    ['q50', 'q60'],
    ['q60', 'S3'],
  ],
  locks: [
    // the blocked corridor on the main route (the key lives on the ground)
    { a: 'r5', b: 'r6', requires: 'key', requiresMap: 'A' },
    // the decoy pocket only opens onward to the return stair with the key
    { a: 'S4', b: 'q00', requires: 'key', requiresMap: 'A' },
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
