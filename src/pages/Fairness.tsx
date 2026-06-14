import { seedHex } from '../lib/rng'
import { useEffect, useMemo, useState } from 'react'

async function sha256Hex(msg: string): Promise<string> {
  const data = new TextEncoder().encode(msg)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

function Verifier() {
  const [server, setServer] = useState(() => seedHex(32))
  const [client, setClient] = useState(() => seedHex(8))
  const [nonce, setNonce] = useState(0)
  const [hash, setHash] = useState('')

  useEffect(() => {
    let alive = true
    sha256Hex(`${server}:${client}:${nonce}`).then((h) => alive && setHash(h))
    return () => {
      alive = false
    }
  }, [server, client, nonce])

  // first 8 hex chars -> float in [0,1) -> dice roll 0.00–100.00 (exactly how Dice resolves)
  const intVal = hash ? parseInt(hash.slice(0, 8), 16) : 0
  const float = intVal / 0x100000000
  const roll = Math.floor(float * 10001) / 100

  return (
    <div className="panel" style={{ marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>🔍 Verify a roll yourself</h3>
      <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
        We hash <code className="mono">server:client:nonce</code> with SHA-256, take the first 8 hex
        characters and map them to a number — the same deterministic process a real provably-fair
        casino uses. Change any field and watch the outcome recompute.
      </p>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field">
          <label>Server seed</label>
          <div className="input-group">
            <input value={server} onChange={(e) => setServer(e.target.value)} style={{ fontSize: 12 }} />
          </div>
        </div>
        <div className="field">
          <label>Client seed</label>
          <div className="input-group">
            <input value={client} onChange={(e) => setClient(e.target.value)} style={{ fontSize: 12 }} />
          </div>
        </div>
      </div>
      <div className="field" style={{ marginTop: 4 }}>
        <label>Nonce (bet number)</label>
        <div className="input-group">
          <input type="number" value={nonce} onChange={(e) => setNonce(parseInt(e.target.value) || 0)} />
          <div className="adorn">
            <button className="mini" onClick={() => setNonce((n) => n + 1)}>
              +1
            </button>
            <button className="mini" onClick={() => setServer(seedHex(32))}>
              NEW SEED
            </button>
          </div>
        </div>
      </div>
      <div className="mono" style={{ fontSize: 11, wordBreak: 'break-all', background: 'var(--bg-2)', padding: 10, borderRadius: 8, marginTop: 8 }}>
        SHA-256 = {hash}
      </div>
      <div className="flex between center" style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg-2)', borderRadius: 10 }}>
        <span className="muted">Resulting Dice roll</span>
        <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--brand-2)' }}>{roll.toFixed(2)}</span>
      </div>
    </div>
  )
}

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

      <Verifier />

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
