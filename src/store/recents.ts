import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentItem {
  to: string
  name: string
  emoji: string
  accent: string
}

interface RecentsState {
  items: RecentItem[]
  add: (item: RecentItem) => void
}

export const useRecents = create<RecentsState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [item, ...s.items.filter((x) => x.to !== item.to)].slice(0, 10),
        })),
    }),
    { name: 'nova-recents' },
  ),
)
