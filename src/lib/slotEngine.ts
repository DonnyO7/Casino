import { SlotConfig, TARGET_RTP } from '../data/slots'
import { rand } from './rng'

export const REELS = 5
export const ROWS = 3
export const WILD = '🃏'
export const SCATTER = '🌈'
export const FS_MULT = 3 // all wins x3 during free spins
export const WILD_BASE = 60 // line value of the wild symbol
export const MAX_FREE = 120 // safety cap on accumulated free spins

// 20 fixed paylines over a 5x3 grid (row index 0=top .. 2=bottom per reel)
export const LINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 2, 2, 2, 1],
  [1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 2, 1, 0, 1],
  [1, 0, 1, 2, 1],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 1, 2, 1, 1],
  [1, 1, 0, 1, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [0, 2, 0, 2, 0],
]
export const NUM_LINES = LINES.length

const SCATTER_PAY: Record<number, number> = { 3: 3, 4: 12, 5: 60 }
export const FREE_SPINS_AWARD: Record<number, number> = { 3: 10, 4: 15, 5: 25 }

// count of a kind -> multiplier of the symbol's base value
function tier(count: number): number {
  return count >= 5 ? 10 : count === 4 ? 2.8 : count === 3 ? 1 : 0
}

interface Pool {
  icons: string[]
  cum: number[]
  total: number
  baseOf: Record<string, number>
}

const poolCache = new Map<string, Pool>()
const scaleCache = new Map<string, number>()

function buildPool(cfg: SlotConfig): Pool {
  const cached = poolCache.get(cfg.slug)
  if (cached) return cached
  const totalReg = cfg.symbols.reduce((s, x) => s + x.weight, 0)
  const entries: { icon: string; weight: number; base: number }[] = cfg.symbols.map((s) => ({
    icon: s.icon,
    weight: s.weight,
    base: s.pay,
  }))
  entries.push({ icon: WILD, weight: Math.max(3, Math.round(totalReg * 0.05)), base: WILD_BASE })
  entries.push({ icon: SCATTER, weight: Math.max(3, Math.round(totalReg * 0.045)), base: 0 })

  const icons: string[] = []
  const cum: number[] = []
  const baseOf: Record<string, number> = {}
  let acc = 0
  for (const e of entries) {
    icons.push(e.icon)
    acc += e.weight
    cum.push(acc)
    baseOf[e.icon] = e.base
  }
  const pool: Pool = { icons, cum, total: acc, baseOf }
  poolCache.set(cfg.slug, pool)
  return pool
}

function drawIcon(pool: Pool): string {
  const r = rand() * pool.total
  for (let i = 0; i < pool.cum.length; i++) if (r < pool.cum[i]) return pool.icons[i]
  return pool.icons[pool.icons.length - 1]
}

export type Grid = string[][] // grid[reel][row]

export function spinGrid(cfg: SlotConfig): Grid {
  const pool = buildPool(cfg)
  return Array.from({ length: REELS }, () => Array.from({ length: ROWS }, () => drawIcon(pool)))
}

export interface LineWin {
  line: number
  symbol: string
  count: number
  raw: number // contribution to the total-bet multiplier (pre global scale)
  cells: [number, number][] // [reel,row]
}

export interface CascadeStep {
  grid: Grid
  winCells: [number, number][]
  lineWins: LineWin[]
  rawLine: number
}

export interface BoardResult {
  steps: CascadeStep[] // each winning evaluation (1 for non-tumble, N for cascades)
  finalGrid: Grid // resting board after the last collapse
  rawLine: number // summed line multiplier across all cascades
  rawScatter: number
  scatters: number
  scatterCells: [number, number][]
  freeSpinsAwarded: number
}

function evalLines(cfg: SlotConfig, grid: Grid): { rawLine: number; lineWins: LineWin[] } {
  const pool = buildPool(cfg)
  let rawLine = 0
  const lineWins: LineWin[] = []
  for (let li = 0; li < LINES.length; li++) {
    const rows = LINES[li]
    const syms = rows.map((row, reel) => grid[reel][row])
    let target: string | null = null
    for (const s of syms) {
      if (s !== WILD && s !== SCATTER) {
        target = s
        break
      }
    }
    if (target === null) target = WILD
    let count = 0
    for (let r = 0; r < syms.length; r++) {
      if (syms[r] === target || syms[r] === WILD) count++
      else break
    }
    const t = tier(count)
    if (t > 0) {
      const base = pool.baseOf[target] ?? 0
      const raw = (base * t) / NUM_LINES
      rawLine += raw
      lineWins.push({ line: li, symbol: target, count, raw, cells: rows.slice(0, count).map((row, reel) => [reel, row] as [number, number]) })
    }
  }
  return { rawLine, lineWins }
}

function evalScatter(grid: Grid) {
  const scatterCells: [number, number][] = []
  for (let reel = 0; reel < REELS; reel++)
    for (let row = 0; row < ROWS; row++) if (grid[reel][row] === SCATTER) scatterCells.push([reel, row])
  const scatters = scatterCells.length
  let rawScatter = 0
  let freeSpinsAwarded = 0
  if (scatters >= 3) {
    const k = Math.min(5, scatters)
    rawScatter = SCATTER_PAY[k] ?? SCATTER_PAY[5]
    freeSpinsAwarded = FREE_SPINS_AWARD[k] ?? FREE_SPINS_AWARD[5]
  }
  return { scatters, scatterCells, rawScatter, freeSpinsAwarded }
}

// remove winning cells, drop survivors down, refill the top (tumble mechanic)
function collapse(cfg: SlotConfig, grid: Grid, winCells: [number, number][]): Grid {
  const pool = buildPool(cfg)
  const dead = new Set(winCells.map(([r, ro]) => `${r}-${ro}`))
  return grid.map((col, reel) => {
    const survivors = col.filter((_, row) => !dead.has(`${reel}-${row}`))
    const missing = ROWS - survivors.length
    const fresh = Array.from({ length: missing }, () => drawIcon(pool))
    return [...fresh, ...survivors]
  })
}

// Force given positions to wild, then absorb any wilds on the grid into the set
// (mutates `sticky`). Returns the resulting grid. Used for sticky-wild free spins.
export function applySticky(grid: Grid, sticky: Set<string>): Grid {
  const g = grid.map((c) => c.slice())
  for (const p of sticky) {
    const [r, o] = p.split('-').map(Number)
    g[r][o] = WILD
  }
  for (let r = 0; r < REELS; r++)
    for (let o = 0; o < ROWS; o++) if (g[r][o] === WILD) sticky.add(`${r}-${o}`)
  return g
}

// Expanding wilds: a wild on one of the middle reels (1–3) fills that reel.
// Restricted to the centre reels so it boosts free spins without dominating
// the whole RTP (keeps the base game rewarding).
export function expandReels(grid: Grid): Grid {
  return grid.map((col, reel) => {
    if (reel === 0 || reel === REELS - 1) return col
    const hasWild = col.includes(WILD)
    const hasScatter = col.includes(SCATTER)
    return hasWild && !hasScatter ? col.map(() => WILD) : col
  })
}

// Resolve a whole board (with cascades for tumble slots). Pure — no animation.
export function resolveBoard(cfg: SlotConfig, initial: Grid): BoardResult {
  const tumble = !!cfg.tumble
  const sc = evalScatter(initial)
  let cur: Grid = initial.map((c) => c.slice())
  let rawLine = 0
  const steps: CascadeStep[] = []
  let casc = 0
  while (true) {
    const r = evalLines(cfg, cur)
    if (r.lineWins.length === 0) break
    rawLine += r.rawLine
    const winCells: [number, number][] = []
    r.lineWins.forEach((w) => w.cells.forEach((c) => winCells.push(c)))
    steps.push({ grid: cur.map((c) => c.slice()), winCells, lineWins: r.lineWins, rawLine: r.rawLine })
    if (!tumble) break
    cur = collapse(cfg, cur, winCells)
    if (++casc > 40) break
  }
  return { steps, finalGrid: cur, rawLine, rawScatter: sc.rawScatter, scatters: sc.scatters, scatterCells: sc.scatterCells, freeSpinsAwarded: sc.freeSpinsAwarded }
}

// ---- Free-spin multiplier orbs (tumble slots only, Sweet-Bonanza style) ----
const ORB_COUNT: [number, number][] = [
  [0, 0.58],
  [1, 0.27],
  [2, 0.11],
  [3, 0.04],
]
const ORB_VALS: [number, number][] = [
  [2, 30],
  [3, 22],
  [4, 14],
  [5, 12],
  [6, 8],
  [8, 6],
  [10, 4],
  [15, 2],
  [25, 1.2],
  [50, 0.6],
  [100, 0.3],
  [500, 0.05],
]
function wpick(pairs: [number, number][]): number {
  const tot = pairs.reduce((s, p) => s + p[1], 0)
  let r = rand() * tot
  for (const [v, w] of pairs) if ((r -= w) < 0) return v
  return pairs[pairs.length - 1][0]
}
export function rollOrbs(): { vals: number[]; total: number } {
  const n = wpick(ORB_COUNT)
  const vals: number[] = []
  for (let i = 0; i < n; i++) vals.push(wpick(ORB_VALS))
  return { vals, total: vals.reduce((a, b) => a + b, 0) }
}
/** Multiplier applied to a free spin: orbs for tumble slots, flat FS_MULT otherwise. */
export function freeSpinMult(cfg: SlotConfig, hasWin: boolean): { mult: number; orbs: number[] } {
  if (!cfg.tumble) return { mult: FS_MULT, orbs: [] }
  const o = rollOrbs()
  if (!hasWin || o.vals.length === 0) return { mult: 1, orbs: o.vals }
  return { mult: Math.max(1, o.total), orbs: o.vals }
}

// raw total mult of a full round (base + free spins), for calibration/sim.
function roundRaw(cfg: SlotConfig): number {
  const board = resolveBoard(cfg, spinGrid(cfg))
  let total = board.rawLine + board.rawScatter
  if (board.freeSpinsAwarded > 0) {
    let left = board.freeSpinsAwarded
    let used = 0
    const sticky = new Set<string>()
    while (left > 0 && used < MAX_FREE) {
      left--
      used++
      let fg = spinGrid(cfg)
      if (cfg.stickyWilds) fg = applySticky(fg, sticky)
      if (cfg.expandWilds) fg = expandReels(fg)
      const fb = resolveBoard(cfg, fg)
      const base = fb.rawLine + fb.rawScatter
      total += base * freeSpinMult(cfg, base > 0).mult
      if (fb.freeSpinsAwarded > 0) left = Math.min(left + fb.freeSpinsAwarded, MAX_FREE - used)
    }
  }
  return total
}

// Monte-Carlo the configured machine and return the global pay scale needed to
// hit TARGET_RTP. Cached per slot. Keeps every machine provably ~99% RTP even
// with wilds, scatters and free spins in the mix.
export function getScale(cfg: SlotConfig): number {
  const hit = scaleCache.get(cfg.slug)
  if (hit !== undefined) return hit
  const N = cfg.tumble ? 16000 : cfg.expandWilds ? 26000 : cfg.stickyWilds ? 24000 : 22000
  let sum = 0
  for (let i = 0; i < N; i++) sum += roundRaw(cfg)
  const rawRTP = sum / N || 1
  const scale = TARGET_RTP / rawRTP
  scaleCache.set(cfg.slug, scale)
  return scale
}

// Raw EV of a free-spins bonus that starts with `startSpins` spins (with
// retriggers). Used to price "buy bonus" fairly. Cached per slot.
const bonusCache = new Map<string, number>()
export function bonusRawEV(cfg: SlotConfig, startSpins = FREE_SPINS_AWARD[3]): number {
  const key = cfg.slug + ':' + startSpins
  const hit = bonusCache.get(key)
  if (hit !== undefined) return hit
  const M = 8000
  let sum = 0
  for (let i = 0; i < M; i++) {
    let left = startSpins
    let used = 0
    let acc = 0
    const sticky = new Set<string>()
    while (left > 0 && used < MAX_FREE) {
      left--
      used++
      let fg = spinGrid(cfg)
      if (cfg.stickyWilds) fg = applySticky(fg, sticky)
      if (cfg.expandWilds) fg = expandReels(fg)
      const r = resolveBoard(cfg, fg)
      const base = r.rawLine + r.rawScatter
      acc += base * freeSpinMult(cfg, base > 0).mult
      if (r.freeSpinsAwarded > 0) left = Math.min(left + r.freeSpinsAwarded, MAX_FREE - used)
    }
    sum += acc
  }
  const ev = sum / M
  bonusCache.set(key, ev)
  return ev
}

/** Fair price (× bet) to buy a base free-spins bonus. */
export function buyBonusCost(cfg: SlotConfig, scale: number): number {
  return Math.max(1, Math.round(bonusRawEV(cfg) * scale * 100) / 100)
}

// Display paytable (scaled) for the UI.
export function payTable(cfg: SlotConfig, scale: number) {
  const rows = cfg.symbols.map((s) => ({
    icon: s.icon,
    name: s.name,
    x3: (s.pay * tier(3) * scale) / NUM_LINES,
    x4: (s.pay * tier(4) * scale) / NUM_LINES,
    x5: (s.pay * tier(5) * scale) / NUM_LINES,
  }))
  rows.push({ icon: WILD, name: 'Wild', x3: (WILD_BASE * scale) / NUM_LINES, x4: (WILD_BASE * 3 * scale) / NUM_LINES, x5: (WILD_BASE * 12 * scale) / NUM_LINES })
  return rows.sort((a, b) => b.x5 - a.x5)
}
