import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setMasterVolume } from '../lib/sound'
import { setReducedMotion } from '../lib/confetti'
import { startMusic, stopMusic } from '../lib/music'

interface SettingsState {
  volume: number // 0..1
  reducedMotion: boolean
  music: boolean
  setVolume: (v: number) => void
  setReducedMotion: (v: boolean) => void
  setMusic: (v: boolean) => void
  apply: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      volume: 0.8,
      reducedMotion: false,
      music: false,
      setVolume: (v) => {
        set({ volume: v })
        setMasterVolume(v)
      },
      setReducedMotion: (v) => {
        set({ reducedMotion: v })
        setReducedMotion(v)
      },
      setMusic: (v) => {
        set({ music: v })
        if (v) startMusic()
        else stopMusic()
      },
      apply: () => {
        setMasterVolume(get().volume)
        setReducedMotion(get().reducedMotion)
        if (get().music) startMusic()
      },
    }),
    { name: 'nova-settings' },
  ),
)
