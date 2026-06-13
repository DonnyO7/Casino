// Lightweight canvas confetti + screen-flash. Self-managing global canvas.

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  size: number
  color: string
  shape: 'rect' | 'circle'
  life: number
  decay: number
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let running = false

const COLORS = ['#7c5cff', '#23e0c8', '#ff5c8a', '#ffd15c', '#5cffb1', '#5c8aff', '#ff7a52']

function ensureCanvas() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function loop() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles = particles.filter((p) => p.life > 0)
  for (const p of particles) {
    p.vy += 0.18 // gravity
    p.vx *= 0.99
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vr
    p.life -= p.decay
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life))
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    if (p.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
    }
    ctx.restore()
  }
  if (particles.length > 0) {
    requestAnimationFrame(loop)
  } else {
    running = false
  }
}

export function fireConfetti(opts: { count?: number; originX?: number; originY?: number; power?: number } = {}) {
  ensureCanvas()
  if (!canvas) return
  const { count = 120, originX = 0.5, originY = 0.35, power = 12 } = opts
  const cx = canvas.width * originX
  const cy = canvas.height * originY
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * power + power * 0.3
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - power * 0.4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 8 + 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      life: 1,
      decay: Math.random() * 0.012 + 0.008,
    })
  }
  if (!running) {
    running = true
    requestAnimationFrame(loop)
  }
}

let flashEl: HTMLDivElement | null = null
export function screenFlash(color = 'rgba(124,92,255,0.35)') {
  if (!flashEl) {
    flashEl = document.createElement('div')
    flashEl.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:0;transition:opacity .12s'
    document.body.appendChild(flashEl)
  }
  flashEl.style.background = `radial-gradient(circle at 50% 40%, ${color}, transparent 70%)`
  flashEl.style.opacity = '1'
  setTimeout(() => flashEl && (flashEl.style.opacity = '0'), 130)
}

export function screenShake() {
  const root = document.getElementById('root')
  if (!root) return
  root.style.animation = 'shake 0.4s'
  setTimeout(() => root && (root.style.animation = ''), 420)
}
