import { useEffect, useRef, useState } from 'react'
import { useFeed } from '../store/feed'
import { money } from '../lib/format'
import { fireConfetti } from '../lib/confetti'
import { sound } from '../lib/sound'

const TIERS = [
  { min: 150, label: 'LEGENDARY WIN', grad: 'linear-gradient(90deg,#ffd15c,#ff5c8a,#7c5cff)' },
  { min: 75, label: 'EPIC WIN', grad: 'linear-gradient(90deg,#b15cff,#5c8aff)' },
  { min: 30, label: 'MEGA WIN', grad: 'linear-gradient(90deg,#23e0c8,#5cffb1)' },
  { min: 15, label: 'BIG WIN', grad: 'linear-gradient(90deg,#ffd15c,#ffb15c)' },
]

export default function BigWinOverlay() {
  const last = useRef<string | null>(null)
  const [active, setActive] = useState<{ label: string; grad: string; amount: number } | null>(null)
  const [shown, setShown] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    return useFeed.subscribe((s) => {
      const w = s.wins[0]
      if (!w || w.id === last.current) return
      last.current = w.id
      const tier = TIERS.find((t) => w.multiplier >= t.min)
      if (!tier) return
      setActive({ label: tier.label, grad: tier.grad, amount: w.profit })
      sound.jackpot()
      fireConfetti({ count: 200, power: 15 })
      // count up the amount
      cancelAnimationFrame(raf.current!)
      const t0 = performance.now()
      const dur = 1300
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        setShown(w.profit * (1 - Math.pow(1 - t, 3)))
        if (t < 1) raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
      setTimeout(() => setActive(null), 2600)
    })
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current!), [])

  if (!active) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.5), transparent 60%)',
      }}
    >
      <div className="rise" style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 'clamp(34px, 7vw, 72px)',
            fontWeight: 900,
            letterSpacing: 2,
            background: active.grad,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 6px 30px rgba(0,0,0,0.6))',
            animation: 'winPulse 0.7s ease',
          }}
        >
          {active.label}
        </div>
        <div style={{ fontSize: 'clamp(26px,5vw,46px)', fontWeight: 800, color: '#fff', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
          +{money(shown)} 🪙
        </div>
      </div>
    </div>
  )
}
