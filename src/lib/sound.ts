// Tiny Web-Audio sound engine — no asset files, everything is synthesised.
// Centralised so games don't each re-implement audio.

let ctx: AudioContext | null = null
const MUTE_KEY = 'nova-muted'
let muted = localStorage.getItem(MUTE_KEY) === '1'

const listeners = new Set<(m: boolean) => void>()

export function isMuted() {
  return muted
}
export function setMuted(m: boolean) {
  muted = m
  localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  listeners.forEach((l) => l(m))
}
export function toggleMuted() {
  setMuted(!muted)
}
export function onMuteChange(cb: (m: boolean) => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function ac(): AudioContext | null {
  if (muted) return null
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.06, delay = 0) {
  const a = ac()
  if (!a) return
  const t0 = a.currentTime + delay
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

// a short upward arpeggio over a pentatonic-ish scale
const SCALE = [523, 587, 659, 784, 880, 1046, 1175, 1318, 1568, 1760]

export const sound = {
  click: () => tone(420, 0.05, 'square', 0.04),
  tick: () => tone(900, 0.03, 'square', 0.025),
  bet: () => {
    tone(280, 0.07, 'sine', 0.05)
    tone(420, 0.06, 'sine', 0.03, 0.02)
  },
  coin: () => {
    tone(1320, 0.05, 'square', 0.03)
    tone(1760, 0.07, 'square', 0.03, 0.04)
  },
  cashout: () => {
    tone(660, 0.08, 'triangle', 0.06)
    tone(990, 0.1, 'triangle', 0.06, 0.07)
    tone(1320, 0.12, 'triangle', 0.05, 0.14)
  },
  win: () => {
    tone(523, 0.12, 'triangle', 0.06, 0)
    tone(659, 0.12, 'triangle', 0.06, 0.08)
    tone(784, 0.18, 'triangle', 0.06, 0.16)
  },
  bigWin: () => {
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, 'triangle', 0.07, i * 0.09))
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f * 1.5, 0.25, 'sine', 0.04, 0.36 + i * 0.08))
  },
  jackpot: () => {
    SCALE.forEach((f, i) => tone(f, 0.18, 'triangle', 0.06, i * 0.06))
    setTimeout(() => SCALE.slice().reverse().forEach((f, i) => tone(f, 0.14, 'square', 0.03, i * 0.04)), 0)
  },
  lose: () => {
    tone(220, 0.18, 'sawtooth', 0.045, 0)
    tone(160, 0.24, 'sawtooth', 0.045, 0.1)
  },
  reel: () => tone(660, 0.04, 'square', 0.02),
}

/** Play the appropriate result cue from a settled multiplier. */
export function playResult(multiplier: number) {
  if (multiplier >= 50) sound.jackpot()
  else if (multiplier >= 10) sound.bigWin()
  else if (multiplier > 1) {
    // arpeggio whose length scales with how big the win is
    const notes = Math.min(SCALE.length, 2 + Math.floor(Math.log2(multiplier + 1)))
    for (let i = 0; i < notes; i++) tone(SCALE[i], 0.13, 'triangle', 0.06, i * 0.07)
  } else if (multiplier === 1) sound.tick()
  else sound.lose()
}
