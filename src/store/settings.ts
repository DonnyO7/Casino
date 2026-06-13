import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setMasterVolume } from '../lib/sound'
import { setReducedMotion } from '../lib/confetti'

interface SettingsState {
  volume: number // 0..1
  reducedMotion: boolean
  setVolume: (v: number) => void
  setReducedMotion: (v: boolean) => void
  apply: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      volume: 0.8,
      reducedMotion: false,
      setVolume: (v) => {
        set({ volume: v })
        setMasterVolume(v)
      },
      setReducedMotion: (v) => {
        set({ reducedMotion: v })
        setReducedMotion(v)
      },
      apply: () => {
        setMasterVolume(get().volume)
        setReducedMotion(get().reducedMotion)
      },
    }),
    { name: 'nova-settings' },
  ),
)
