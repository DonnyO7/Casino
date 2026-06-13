import { useEffect, useState } from 'react'
import { useFeed } from '../store/feed'
import { money, mult } from '../lib/format'
import { pick, randFloat, randInt } from '../lib/rng'

const BOTS = ['CryptoKnight', 'LuckyLuna', 'NeonNinja', 'MidasTouch', 'HighRoller99', 'FrostByte', 'GoldRush', 'MoonShot', 'ZeroEdge', 'PixelPirate']
const GAMES = ['Dice', 'Limbo', 'Plinko', 'Crash', 'Mines', 'Norse Fury', 'Galaxy Spin', 'Mount Olympus', 'Roulette', 'Keno']

interface Row {
  id: string
  who: string
  game: string
  multiplier: number
  payout: number
}

function botRow(): Row {
  const bet = pick([5, 10, 25, 50, 100, 250])
  const m = +randFloat(1.1, 24).toFixed(2)
  return { id: Math.random().toString(36).slice(2), who: pick(BOTS), game: pick(GAMES), multiplier: m, payout: bet * m }
}

export default function LiveWins() {
  const wins = useFeed((s) => s.wins)
  const [rows, setRows] = useState<Row[]>(() => Array.from({ length: 8 }, botRow))

  useEffect(() => {
    const iv = setInterval(() => {
      setRows((r) => [botRow(), ...r].slice(0, 8))
    }, randInt(1800, 3200))
    return () => clearInterval(iv)
  }, [])

  // blend real wins in at the top
  const real: Row[] = wins.slice(0, 3).map((w) => ({
    id: w.id,
    who: 'You',
    game: w.game,
    multiplier: w.multiplier,
    payout: w.bet * w.multiplier,
  }))
  const merged = [...real, ...rows].slice(0, 9)

  return (
    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="flex between center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
        <strong>🟢 Live Wins</strong>
        <span className="muted" style={{ fontSize: 12 }}>real-time feed</span>
      </div>
      <div>
        {merged.map((r) => (
          <div
            key={r.id}
            className="flex between center"
            style={{
              padding: '9px 16px',
              borderBottom: '1px solid rgba(40,51,73,0.4)',
              background: r.who === 'You' ? 'rgba(124,92,255,0.1)' : undefined,
            }}
          >
            <span style={{ fontWeight: r.who === 'You' ? 800 : 600, color: r.who === 'You' ? 'var(--brand-2)' : undefined, minWidth: 110 }}>
              {r.who}
            </span>
            <span className="muted" style={{ flex: 1, fontSize: 13 }}>{r.game}</span>
            <span className="chip" style={{ background: 'rgba(47,212,122,0.14)', color: 'var(--green)', marginRight: 10 }}>{mult(r.multiplier)}</span>
            <span style={{ fontWeight: 700, color: 'var(--green)' }}>+{money(r.payout - r.payout / r.multiplier)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
