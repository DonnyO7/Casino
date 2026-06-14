import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setMasterVolume } from '../lib/sound'
import { setReducedMotion } from '../lib/confetti'
import { startMusic, stopMusic } from '../lib/music'

export const THEMES: Record<string, { name: string; a: string; b: string }> = {
  violet: { name: 'Nova Violet', a: '#7c5cff', b: '#23e0c8' },
  aqua: { name: 'Deep Aqua', a: '#23e0c8', b: '#5c8aff' },
  sunset: { name: 'Sunset', a: '#ff7a52', b: '#ff5c8a' },
  gold: { name: 'High Roller', a: '#ffd15c', b: '#ff7a52' },
  crimson: { name: 'Crimson', a: '#ff5470', b: '#b15cff' },
  emerald: { name: 'Emerald', a: '#2fd47a', b: '#23e0c8' },
}

function applyAccent(key: string) {
  const t = THEMES[key] ?? THEMES.violet
  const r = document.documentElement
  r.style.setProperty('--brand', t.a)
  r.style.setProperty('--brand-2', t.b)
}

interface SettingsState {
  volume: number // 0..1
  reducedMotion: boolean
  music: boolean
  accent: string
  setVolume: (v: number) => void
  setReducedMotion: (v: boolean) => void
  setMusic: (v: boolean) => void
  setAccent: (k: string) => void
  apply: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      volume: 0.8,
      reducedMotion: false,
      music: false,
      accent: 'violet',
      setAccent: (k) => {
        set({ accent: k })
        applyAccent(k)
      },
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
        applyAccent(get().accent)
        if (get().music) startMusic()
      },
    }),
    { name: 'nova-settings' },
  ),
)
