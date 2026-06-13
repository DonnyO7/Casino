import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BetRecord {
  id: string
  game: string
  bet: number
  multiplier: number
  payout: number
  profit: number
  time: number
}

interface WalletState {
  balance: number
  totalWagered: number
  totalWon: number
  totalBets: number
  biggestWin: number
  history: BetRecord[]
  level: number
  xp: number

  // actions
  deposit: (amount: number) => void
  reset: () => void
  /** Settle a finished bet. Returns the net profit. */
  settle: (game: string, bet: number, multiplier: number) => number
  /** Try to remove the bet up-front (returns false if insufficient funds). */
  placeBet: (bet: number) => boolean
  /** Pay a multiplier on a bet that was already deducted via placeBet. */
  payout: (game: string, bet: number, multiplier: number) => void
}

const START_BALANCE = 10000

function xpForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(level, 1.4))
}

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: START_BALANCE,
      totalWagered: 0,
      totalWon: 0,
      totalBets: 0,
      biggestWin: 0,
      history: [],
      level: 1,
      xp: 0,

      deposit: (amount) => set((s) => ({ balance: s.balance + amount })),

      reset: () =>
        set({
          balance: START_BALANCE,
          totalWagered: 0,
          totalWon: 0,
          totalBets: 0,
          biggestWin: 0,
          history: [],
          level: 1,
          xp: 0,
        }),

      placeBet: (bet) => {
        if (bet <= 0) return false
        if (get().balance < bet) return false
        set((s) => ({ balance: s.balance - bet }))
        return true
      },

      payout: (game, bet, multiplier) => {
        const pay = bet * multiplier
        const profit = pay - bet
        set((s) => {
          let xp = s.xp + bet
          let level = s.level
          while (xp >= xpForLevel(level)) {
            xp -= xpForLevel(level)
            level += 1
          }
          const rec: BetRecord = {
            id: Math.random().toString(36).slice(2),
            game,
            bet,
            multiplier,
            payout: pay,
            profit,
            time: Date.now(),
          }
          return {
            balance: s.balance + pay,
            totalWagered: s.totalWagered + bet,
            totalWon: s.totalWon + (pay > bet ? pay - bet : 0),
            totalBets: s.totalBets + 1,
            biggestWin: Math.max(s.biggestWin, profit),
            history: [rec, ...s.history].slice(0, 200),
            xp,
            level,
          }
        })
      },

      settle: (game, bet, multiplier) => {
        const ok = get().placeBet(bet)
        if (!ok) return 0
        get().payout(game, bet, multiplier)
        return bet * multiplier - bet
      },
    }),
    {
      name: 'nova-casino-wallet',
      version: 1,
    },
  ),
)

export { xpForLevel }
