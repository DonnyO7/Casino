import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Achievement {
  id: string
  name: string
  desc: string
  icon: string
  xp: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-bet', name: 'Welcome Aboard', desc: 'Place your first bet', icon: '🎰', xp: 100 },
  { id: 'bets-100', name: 'Getting Warmed Up', desc: 'Place 100 bets', icon: '🔥', xp: 500 },
  { id: 'bets-1000', name: 'Degen Certified', desc: 'Place 1,000 bets', icon: '🃏', xp: 2500 },
  { id: 'high-roller', name: 'High Roller', desc: 'Place a single bet of 1,000+', icon: '💸', xp: 500 },
  { id: 'whale', name: 'Whale Alert', desc: 'Place a single bet of 10,000+', icon: '🐋', xp: 2000 },
  { id: 'win-1k', name: 'Nice Hit', desc: 'Win 1,000+ on a single bet', icon: '💰', xp: 500 },
  { id: 'win-10k', name: 'Big Money', desc: 'Win 10,000+ on a single bet', icon: '🤑', xp: 2000 },
  { id: 'mult-10', name: 'Double Digits', desc: 'Hit a 10× multiplier', icon: '✨', xp: 400 },
  { id: 'mult-50', name: 'Mega Multiplier', desc: 'Hit a 50× multiplier', icon: '🚀', xp: 1500 },
  { id: 'mult-100', name: 'To The Moon', desc: 'Hit a 100× multiplier', icon: '🌙', xp: 4000 },
  { id: 'mult-500', name: 'Legendary Spin', desc: 'Hit a 500× multiplier', icon: '👑', xp: 10000 },
  { id: 'bonus', name: 'Bonus Hunter', desc: 'Trigger a slot Free Spins round', icon: '🌈', xp: 1000 },
  { id: 'wager-100k', name: 'Volume Player', desc: 'Wager 100,000 total', icon: '📊', xp: 1500 },
  { id: 'wager-1m', name: 'Millionaire Mover', desc: 'Wager 1,000,000 total', icon: '🏦', xp: 6000 },
  { id: 'level-5', name: 'Rising Star', desc: 'Reach Level 5', icon: '⭐', xp: 800 },
  { id: 'level-10', name: 'Silver Status', desc: 'Reach Level 10', icon: '🥈', xp: 2000 },
  { id: 'level-25', name: 'Gold Status', desc: 'Reach Level 25', icon: '🥇', xp: 8000 },
  { id: 'jackpot', name: 'Lucky Drop', desc: 'Win the progressive jackpot', icon: '🎉', xp: 5000 },
]

export interface AchievementEvent {
  totalBets: number
  biggestWin: number
  totalWagered: number
  level: number
  lastBet: number
  lastMultiplier: number
  bonus?: boolean
  jackpot?: boolean
}

interface AchState {
  unlocked: Record<string, number> // id -> timestamp
  recent: Achievement | null
  check: (e: AchievementEvent) => void
  unlock: (id: string) => void
  clearRecent: () => void
}

function qualifies(id: string, e: AchievementEvent): boolean {
  switch (id) {
    case 'first-bet': return e.totalBets >= 1
    case 'bets-100': return e.totalBets >= 100
    case 'bets-1000': return e.totalBets >= 1000
    case 'high-roller': return e.lastBet >= 1000
    case 'whale': return e.lastBet >= 10000
    case 'win-1k': return e.biggestWin >= 1000
    case 'win-10k': return e.biggestWin >= 10000
    case 'mult-10': return e.lastMultiplier >= 10
    case 'mult-50': return e.lastMultiplier >= 50
    case 'mult-100': return e.lastMultiplier >= 100
    case 'mult-500': return e.lastMultiplier >= 500
    case 'bonus': return !!e.bonus
    case 'wager-100k': return e.totalWagered >= 100000
    case 'wager-1m': return e.totalWagered >= 1000000
    case 'level-5': return e.level >= 5
    case 'level-10': return e.level >= 10
    case 'level-25': return e.level >= 25
    case 'jackpot': return !!e.jackpot
    default: return false
  }
}

export const useAchievements = create<AchState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      recent: null,
      check: (e) => {
        const unlocked = get().unlocked
        let newest: Achievement | null = null
        const additions: Record<string, number> = {}
        for (const a of ACHIEVEMENTS) {
          if (!unlocked[a.id] && qualifies(a.id, e)) {
            additions[a.id] = Date.now()
            newest = a
          }
        }
        if (newest) {
          set({ unlocked: { ...unlocked, ...additions }, recent: newest })
        }
      },
      unlock: (id) => {
        if (get().unlocked[id]) return
        const a = ACHIEVEMENTS.find((x) => x.id === id)
        if (!a) return
        set((s) => ({ unlocked: { ...s.unlocked, [id]: Date.now() }, recent: a }))
      },
      clearRecent: () => set({ recent: null }),
    }),
    { name: 'nova-achievements' },
  ),
)
