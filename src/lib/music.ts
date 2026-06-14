// Gentle generative ambient pad — synthesised, looping chord progression.
let ctx: AudioContext | null = null
let master: GainNode | null = null
let playing = false
let timer: number | undefined

// Am – F – C – G voicings (root, third, fifth) in Hz
const CHORDS = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [261.63, 329.63, 392.0],
  [196.0, 246.94, 293.66],
]
let idx = 0

function playChord() {
  if (!ctx || !master) return
  const now = ctx.currentTime
  const dur = 4.2
  const chord = CHORDS[idx % CHORDS.length]
  idx++
  for (const f of chord) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.05, now + 1.4)
    g.gain.linearRampToValueAtTime(0, now + dur)
    osc.connect(g).connect(master)
    osc.start(now)
    osc.stop(now + dur + 0.1)
    // soft detuned layer for warmth
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.value = f / 2
    g2.gain.setValueAtTime(0, now)
    g2.gain.linearRampToValueAtTime(0.025, now + 1.6)
    g2.gain.linearRampToValueAtTime(0, now + dur)
    osc2.connect(g2).connect(master)
    osc2.start(now)
    osc2.stop(now + dur + 0.1)
  }
  timer = window.setTimeout(playChord, 3600)
}

export function startMusic() {
  if (playing) return
  try {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
    playing = true
    if (ctx.state === 'suspended') ctx.resume()
    playChord()
  } catch {
    playing = false
  }
}

export function stopMusic() {
  playing = false
  if (timer) clearTimeout(timer)
  if (ctx) {
    ctx.close()
    ctx = null
    master = null
  }
}

export function isMusicPlaying() {
  return playing
}
