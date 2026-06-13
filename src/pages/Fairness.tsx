import { seedHex } from '../lib/rng'
import { useMemo } from 'react'

export default function Fairness() {
  const serverSeed = useMemo(() => seedHex(32), [])
  const clientSeed = useMemo(() => seedHex(16), [])

  const rows = [
    { game: 'Dice', model: 'payout = 100 ÷ win-chance %', edge: '0%' },
    { game: 'Limbo / Crash', model: 'P(result ≥ m) = 1 ÷ m, payout = target', edge: '0%' },
    { game: 'Coin Flip', model: 'exact 50/50, payout 2×', edge: '0%' },
    { game: 'Mines', model: 'payout = 1 ÷ P(surviving n picks)', edge: '0%' },
    { game: 'Plinko / Wheel', model: 'multipliers normalised so EV = 1', edge: '0%' },
    { game: 'Keno', model: 'hypergeometric table scaled to EV = 1', edge: '0%' },
    { game: 'Hi-Lo / Tower', model: 'payout = 1 ÷ probability each step', edge: '0%' },
    { game: 'Roulette', model: 'single-zero, payout = 37 ÷ numbers covered', edge: '0%' },
    { game: 'Slots', model: 'payouts auto-scaled to 99% RTP', edge: '1%' },
    { game: 'Video Poker', model: '9/6 Jacks-or-Better paytable', edge: '~0.5%' },
    { game: 'Blackjack / Baccarat', model: 'standard rules, fair payouts', edge: '~0.5%' },
  ]

  return (
    <div>
      <h1 className="page-title">🛡️ Provably Fair</h1>
      <p className="page-sub">No rigged RNG. No hidden edge. Here's exactly how every game pays.</p>

      <div className="fair-banner" style={{ marginBottom: 20 }}>
        🎲 All randomness comes from your browser's cryptographic RNG (<code className="mono">crypto.getRandomValues</code>).
      </div>

      <div className="card-row" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: 16, marginBottom: 20 }}>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>The "no scam" promise</h3>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
            Most real casinos bake in a house edge — every payout is shaved a few percent below the true odds.
            NOVA's originals do the opposite: every multiplier is set to{' '}
            <strong style={{ color: 'var(--text)' }}>exactly 1 ÷ probability</strong>, so the expected value of
            every bet is break-even. Over millions of spins you'd neither gain nor lose — pure variance, full 50/50.
          </p>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Your session seeds</h3>
          <p className="muted" style={{ fontSize: 13 }}>Server seed (hashed)</p>
          <div className="mono" style={{ wordBreak: 'break-all', fontSize: 12, background: 'var(--bg-2)', padding: 10, borderRadius: 8 }}>
            {serverSeed}
          </div>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Client seed</p>
          <div className="mono" style={{ wordBreak: 'break-all', fontSize: 12, background: 'var(--bg-2)', padding: 10, borderRadius: 8 }}>
            {clientSeed}
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Fairness model</th>
              <th className="right">House edge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.game}>
                <td style={{ fontWeight: 700 }}>{r.game}</td>
                <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.model}</td>
                <td className="right" style={{ color: r.edge === '0%' ? 'var(--green)' : 'var(--gold)', fontWeight: 700 }}>
                  {r.edge}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
