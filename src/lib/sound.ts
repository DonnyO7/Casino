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

export const sound = {
  click: () => tone(420, 0.05, 'square', 0.04),
  tick: () => tone(900, 0.03, 'square', 0.025),
  bet: () => tone(300, 0.08, 'sine', 0.05),
  win: () => {
    tone(523, 0.12, 'triangle', 0.06, 0)
    tone(659, 0.12, 'triangle', 0.06, 0.08)
    tone(784, 0.18, 'triangle', 0.06, 0.16)
  },
  bigWin: () => {
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, 0.2, 'triangle', 0.07, i * 0.09))
  },
  lose: () => {
    tone(220, 0.18, 'sawtooth', 0.05, 0)
    tone(160, 0.22, 'sawtooth', 0.05, 0.1)
  },
  reel: () => tone(660, 0.04, 'square', 0.02),
}

/** Play the appropriate result cue from a settled multiplier. */
export function playResult(multiplier: number) {
  if (multiplier >= 10) sound.bigWin()
  else if (multiplier > 1) sound.win()
  else if (multiplier === 1) sound.tick()
  else sound.lose()
}
