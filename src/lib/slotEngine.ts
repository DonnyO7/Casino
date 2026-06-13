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

export interface SpinResult {
  rawMult: number // total-bet multiplier before global RTP scaling
  scatters: number
  lineWins: LineWin[]
  scatterCells: [number, number][]
  freeSpinsAwarded: number
}

export function evalGrid(cfg: SlotConfig, grid: Grid, inFree: boolean): SpinResult {
  const pool = buildPool(cfg)
  let rawLine = 0
  const lineWins: LineWin[] = []

  for (let li = 0; li < LINES.length; li++) {
    const rows = LINES[li]
    const syms = rows.map((row, reel) => grid[reel][row])
    // target = first non-wild, non-scatter symbol
    let target: string | null = null
    for (const s of syms) {
      if (s !== WILD && s !== SCATTER) {
        target = s
        break
      }
    }
    if (target === null) target = WILD // entire line of wilds
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
      lineWins.push({
        line: li,
        symbol: target,
        count,
        raw,
        cells: rows.slice(0, count).map((row, reel) => [reel, row] as [number, number]),
      })
    }
  }

  // scatters anywhere
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

  const mult = (rawLine + rawScatter) * (inFree ? FS_MULT : 1)
  return { rawMult: mult, scatters, lineWins, scatterCells, freeSpinsAwarded }
}

// Simulate one full round (base + any free spins) and return raw total mult.
function simulateRound(cfg: SlotConfig): number {
  const base = spinGrid(cfg)
  const r = evalGrid(cfg, base, false)
  let total = r.rawMult
  if (r.freeSpinsAwarded > 0) {
    let remaining = r.freeSpinsAwarded
    let used = 0
    while (remaining > 0 && used < MAX_FREE) {
      remaining--
      used++
      const fr = evalGrid(cfg, spinGrid(cfg), true)
      total += fr.rawMult
      if (fr.freeSpinsAwarded > 0) remaining = Math.min(remaining + fr.freeSpinsAwarded, MAX_FREE - used)
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
  const N = 30000
  let sum = 0
  for (let i = 0; i < N; i++) sum += simulateRound(cfg)
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
  const M = 12000
  let sum = 0
  for (let i = 0; i < M; i++) {
    let left = startSpins
    let used = 0
    let acc = 0
    while (left > 0 && used < MAX_FREE) {
      left--
      used++
      const r = evalGrid(cfg, spinGrid(cfg), true)
      acc += r.rawMult
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
