import { useEffect, useMemo, useState } from 'react'
import { useTournament, botField, cycleStart, CYCLE, PRIZE_POOL } from '../store/tournament'
import { useWallet } from '../store/wallet'
import { money, compact } from '../lib/format'
import { fireConfetti } from '../lib/confetti'
import { sound } from '../lib/sound'

const PRIZES = [0.4, 0.22, 0.13, 0.08, 0.06, 0.04, 0.03, 0.02, 0.012, 0.008] // share of pool by rank

export default function Tournaments() {
  const t = useTournament()
  const deposit = useWallet((s) => s.deposit)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    t.ensureCycle()
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cycle = cycleStart(now)
  const elapsed = Math.min(1, (now - cycle) / CYCLE)
  const remaining = Math.max(0, cycle + CYCLE - now)

  const standings = useMemo(() => {
    const bots = botField(cycle).map((b) => ({ name: b.name, score: Math.round(b.target * elapsed) }))
    const rows = [...bots, { name: 'You', score: Math.round(t.points) }]
    return rows.sort((a, b) => b.score - a.score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle, elapsed, t.points])

  const myRank = standings.findIndex((r) => r.name === 'You') + 1
  const prizeShare = PRIZES[myRank - 1] ?? 0
  const myPrize = Math.round(PRIZE_POOL * (PRIZES[Math.min(myRank - 1, PRIZES.length - 1)] ?? 0.005)) + 1000
  const canClaim = t.claimedCycle !== cycle

  function claim() {
    if (!canClaim) return
    deposit(myPrize)
    t.claim(cycle)
    sound.jackpot()
    fireConfetti({ count: 160, power: 14 })
  }

  const hrs = Math.floor(remaining / 3600000)
  const mins = Math.floor((remaining % 3600000) / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  return (
    <div>
      <h1 className="page-title">🥇 Daily Wager Race</h1>
      <p className="page-sub">Every chip you wager scores points. Climb the board before the clock runs out.</p>

      <div className="panel" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'linear-gradient(120deg,#2a1640,#101f3a)' }}>
        <div>
          <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PRIZE POOL</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gold)' }}>{money(PRIZE_POOL)} 🪙</div>
        </div>
        <div className="right">
          <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>ENDS IN</div>
          <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{hrs}h {mins}m {secs}s</div>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 20 }}>
        <div className="stat-card"><div className="label">Your Rank</div><div className="num">#{myRank}</div></div>
        <div className="stat-card"><div className="label">Your Points</div><div className="num">{compact(t.points)}</div></div>
        <div className="stat-card"><div className="label">Prize Share</div><div className="num">{(prizeShare * 100 || 0.5).toFixed(1)}%</div></div>
        <div className="stat-card">
          <div className="label">Daily Reward</div>
          <button className="btn gold" style={{ marginTop: 6 }} disabled={!canClaim} onClick={claim}>
            {canClaim ? `Claim ${money(myPrize)}` : 'Claimed ✓'}
          </button>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th style={{ width: 60 }}>#</th><th>Player</th><th className="right">Points</th><th className="right">Prize</th></tr>
          </thead>
          <tbody>
            {standings.map((r, i) => (
              <tr key={r.name} style={r.name === 'You' ? { background: 'rgba(124,92,255,0.12)' } : undefined}>
                <td style={{ fontWeight: 800 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                <td style={{ fontWeight: r.name === 'You' ? 800 : 600, color: r.name === 'You' ? 'var(--brand-2)' : undefined }}>{r.name}</td>
                <td className="right">{compact(r.score)}</td>
                <td className="right" style={{ color: 'var(--gold)' }}>{PRIZES[i] ? money(Math.round(PRIZE_POOL * PRIZES[i])) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
