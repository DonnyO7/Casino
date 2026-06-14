import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavState {
  favs: string[] // route paths, e.g. /game/dice
  toggle: (to: string) => void
  has: (to: string) => boolean
}

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      favs: [],
      toggle: (to) =>
        set((s) => ({ favs: s.favs.includes(to) ? s.favs.filter((x) => x !== to) : [to, ...s.favs] })),
      has: (to) => get().favs.includes(to),
    }),
    { name: 'nova-favorites' },
  ),
)
