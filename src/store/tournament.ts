import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const CYCLE = 24 * 60 * 60 * 1000 // daily race
export const PRIZE_POOL = 100000

export function cycleStart(now = Date.now()): number {
  return Math.floor(now / CYCLE) * CYCLE
}

interface TournamentState {
  points: number
  cycle: number
  claimedCycle: number
  addWager: (bet: number) => void
  ensureCycle: () => void
  claim: (cycle: number) => void
}

export const useTournament = create<TournamentState>()(
  persist(
    (set, get) => ({
      points: 0,
      cycle: cycleStart(),
      claimedCycle: 0,
      ensureCycle: () => {
        const c = cycleStart()
        if (c !== get().cycle) set({ cycle: c, points: 0 })
      },
      addWager: (bet) => {
        get().ensureCycle()
        set((s) => ({ points: s.points + bet }))
      },
      claim: (cycle) => set({ claimedCycle: cycle }),
    }),
    { name: 'nova-tournament' },
  ),
)

// deterministic bot field per cycle
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const BOT_NAMES = ['CryptoKnight', 'LuckyLuna', 'NeonNinja', 'MidasTouch', 'FrostByte', 'GoldRush', 'MoonShot', 'ZeroEdge', 'PixelPirate', 'HighRoller99', 'QuantumDice', 'SilkRoad', 'AceVentura', 'TheGambler']

export function botField(cycle: number): { name: string; target: number }[] {
  const rnd = mulberry32(cycle / CYCLE)
  return BOT_NAMES.map((name) => ({ name, target: Math.round(8000 + rnd() * 380000) }))
}
