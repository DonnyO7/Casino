import { create } from 'zustand'

export interface FeedEntry {
  id: string
  game: string
  bet: number
  multiplier: number
  profit: number
  toast: boolean
}

interface FeedState {
  toasts: FeedEntry[]
  wins: FeedEntry[]
  push: (game: string, bet: number, multiplier: number) => void
  dismiss: (id: string) => void
}

export const useFeed = create<FeedState>((set) => ({
  toasts: [],
  wins: [],
  push: (game, bet, multiplier) => {
    const profit = bet * multiplier - bet
    const id = Math.random().toString(36).slice(2)
    const entry: FeedEntry = { id, game, bet, multiplier, profit, toast: multiplier >= 5 }
    set((s) => ({
      toasts: entry.toast ? [entry, ...s.toasts].slice(0, 4) : s.toasts,
      wins: multiplier > 1 ? [entry, ...s.wins].slice(0, 30) : s.wins,
    }))
    if (entry.toast) {
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4200)
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
