import { useEffect, useMemo, useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { money } from '../lib/format'
import { sound } from '../lib/sound'
import { fireConfetti } from '../lib/confetti'

const REWARDS = [500, 1000, 250, 2500, 500, 5000, 1000, 250]
const COLORS = ['#7c5cff', '#23e0c8', '#ff5c8a', '#ffd15c', '#5cffb1', '#5c8aff', '#ff7a52', '#b15cff']
const KEY = 'nova-daily-wheel'
const COOLDOWN = 24 * 60 * 60 * 1000

export default function DailyWheel() {
  const deposit = useWallet((s) => s.deposit)
  const [last, setLast] = useState<number>(() => Number(localStorage.getItem(KEY) || 0))
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  const ready = now - last >= COOLDOWN
  const remaining = Math.max(0, COOLDOWN - (now - last))
  const seg = 360 / REWARDS.length

  const conic = useMemo(
    () => `conic-gradient(${REWARDS.map((_, i) => `${COLORS[i]} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')})`,
    [seg],
  )

  function spin() {
    if (spinning || !ready) return
    setSpinning(true)
    setWon(null)
    const target = randInt(0, REWARDS.length - 1)
    const final = 360 * 6 + (360 - (target * seg + seg / 2))
    setAngle((a) => a - (a % 360) + final)
    setTimeout(() => {
      const prize = REWARDS[target]
      deposit(prize)
      setWon(prize)
      setSpinning(false)
      const t = Date.now()
      setLast(t)
      localStorage.setItem(KEY, String(t))
      sound.jackpot()
      fireConfetti({ count: 160, power: 14 })
    }, 4200)
  }

  const hrs = Math.floor(remaining / 3600000)
  const mins = Math.floor((remaining % 3600000) / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  return (
    <div className="panel" style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', background: 'linear-gradient(120deg,#1b1640,#0c2030)' }}>
      <div style={{ position: 'relative', width: 220, height: 220 }}>
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '18px solid #fff',
            zIndex: 5,
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: conic,
            transform: `rotate(${angle}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.15,0.85,0.2,1)' : 'none',
            boxShadow: '0 0 0 8px #10141f, 0 14px 40px rgba(0,0,0,0.5)',
          }}
        />
        <div style={{ position: 'absolute', inset: '38%', borderRadius: '50%', background: 'var(--panel)', border: '2px solid var(--line)', display: 'grid', placeItems: 'center', fontSize: 26 }}>
          🎡
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 240 }}>
        <div className="flex center gap-s">
          <span style={{ fontSize: 30 }}>🎁</span>
          <h2 style={{ margin: 0 }}>Daily Reward Wheel</h2>
        </div>
        <p className="muted" style={{ fontSize: 14 }}>Spin once every 24 hours for a free pile of chips — up to {money(5000)}.</p>
        {won !== null && <div className="result-flash win" style={{ marginBottom: 10 }}>You won {money(won)} 🪙!</div>}
        {ready ? (
          <button className="btn gold lg" disabled={spinning} onClick={spin}>
            {spinning ? 'Spinning…' : 'Spin the Wheel'}
          </button>
        ) : (
          <div>
            <button className="btn lg" disabled>
              Next spin in {hrs}h {mins}m {secs}s
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
