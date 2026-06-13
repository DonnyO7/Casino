import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { rand } from '../lib/rng'

const SEED = 25000

interface JackpotState {
  amount: number
  lastDrop: { amount: number; time: number } | null
  // grow the pot and roll for a lucky drop. Returns the amount won (0 if none).
  // House-funded bonus — it never reduces your bet's payout, so games stay fair.
  onBet: (bet: number) => number
  tick: () => void
}

export const useJackpot = create<JackpotState>()(
  persist(
    (set, get) => ({
      amount: SEED + Math.floor(rand() * 50000),
      lastDrop: null,
      onBet: (bet) => {
        // grows with activity (cosmetic, house-funded)
        set((s) => ({ amount: s.amount + bet * 0.5 + 2 }))
        // tiny chance to drop, scaled a little by bet size
        const p = 0.00018 * Math.min(6, 1 + bet / 250)
        if (rand() < p) {
          const won = Math.round(get().amount)
          set({ amount: SEED, lastDrop: { amount: won, time: Date.now() } })
          return won
        }
        return 0
      },
      tick: () => set((s) => ({ amount: s.amount + 7 })),
    }),
    { name: 'nova-jackpot' },
  ),
)
