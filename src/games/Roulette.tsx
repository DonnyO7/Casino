import { useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money } from '../lib/format'

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])
const TOTAL = 37 // 0..36

function covers(key: string): number[] {
  if (key === 'red') return [...RED]
  if (key === 'black') return Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => !RED.has(n))
  if (key === 'even') return Array.from({ length: 18 }, (_, i) => (i + 1) * 2)
  if (key === 'odd') return Array.from({ length: 18 }, (_, i) => i * 2 + 1)
  if (key === 'low') return Array.from({ length: 18 }, (_, i) => i + 1)
  if (key === 'high') return Array.from({ length: 18 }, (_, i) => i + 19)
  if (key === 'd1') return Array.from({ length: 12 }, (_, i) => i + 1)
  if (key === 'd2') return Array.from({ length: 12 }, (_, i) => i + 13)
  if (key === 'd3') return Array.from({ length: 12 }, (_, i) => i + 25)
  if (key.startsWith('n')) return [parseInt(key.slice(1))]
  return []
}

export default function Roulette() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [bets, setBets] = useState<Record<string, number>>({})
  const [result, setResult] = useState<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const total = Object.values(bets).reduce((a, b) => a + b, 0)

  function addBet(key: string) {
    if (spinning) return
    setBets((b) => ({ ...b, [key]: (b[key] || 0) + bet }))
    setMsg(null)
  }

  function spin() {
    if (spinning || total <= 0) return
    if (!wallet.placeBet(total)) return
    setSpinning(true)
    setMsg(null)
    const n = randInt(0, 36)
    setTimeout(() => {
      let ret = 0
      for (const [key, stake] of Object.entries(bets)) {
        const c = covers(key)
        if (c.includes(n)) ret += stake * (TOTAL / c.length) // fair payout incl. stake
      }
      wallet.payout('Roulette', total, ret / total)
      setResult(n)
      setSpinning(false)
      setMsg(ret > total ? `Win +${money(ret - total)}` : ret > 0 ? `Returned ${money(ret)}` : `Lost ${money(total)}`)
      setBets({})
    }, 900)
  }

  const numColor = (n: number) =>
    n === 0 ? '#149e57' : RED.has(n) ? '#c0273f' : '#1c2536'

  const outside: { key: string; label: string }[] = [
    { key: 'low', label: '1-18' },
    { key: 'even', label: 'EVEN' },
    { key: 'red', label: 'RED' },
    { key: 'black', label: 'BLACK' },
    { key: 'odd', label: 'ODD' },
    { key: 'high', label: '19-36' },
  ]

  return (
    <GameShell name="Roulette" emoji="🎯" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={spinning} />
          <StatRow k="Total staked" v={money(total)} color="var(--gold)" />
          <div className="panel tight" style={{ maxHeight: 150, overflow: 'auto' }}>
            {Object.entries(bets).length === 0 && <div className="muted" style={{ fontSize: 13 }}>Click the table to place chips.</div>}
            {Object.entries(bets).map(([k, v]) => (
              <StatRow key={k} k={k.startsWith('n') ? `Number ${k.slice(1)}` : k} v={money(v)} />
            ))}
          </div>
          <button className="btn green block lg" disabled={spinning || total <= 0} onClick={spin}>
            {spinning ? 'No more bets…' : 'Spin'}
          </button>
          <button className="btn ghost block" disabled={spinning} onClick={() => setBets({})}>
            Clear bets
          </button>
          {msg && <div className={'result-flash ' + (msg.startsWith('Win') ? 'win' : msg.startsWith('Lost') ? 'lose' : '')}>{msg}</div>}
        </div>

        <div className="stage">
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div
              className={result !== null ? 'pop' : ''}
              key={result ?? 'x'}
              style={{
                display: 'inline-grid',
                placeItems: 'center',
                width: 86,
                height: 86,
                borderRadius: '50%',
                fontSize: 34,
                fontWeight: 800,
                color: '#fff',
                background: result === null ? 'var(--panel-2)' : numColor(result),
                boxShadow: '0 0 0 6px #10141f',
              }}
            >
              {result === null ? '—' : result}
            </div>
          </div>

          {/* number grid 0 + 1..36 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(12, 1fr)', gap: 4 }}>
            <button
              onClick={() => addBet('n0')}
              style={{ gridRow: 'span 3', background: '#149e57', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 800 }}
            >
              0
            </button>
            {[3, 2, 1].map((rowStart) =>
              Array.from({ length: 12 }, (_, c) => {
                const n = c * 3 + rowStart
                return (
                  <button
                    key={n}
                    onClick={() => addBet('n' + n)}
                    style={{
                      background: numColor(n),
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '10px 0',
                      fontWeight: 700,
                      fontSize: 13,
                      position: 'relative',
                    }}
                  >
                    {n}
                    {bets['n' + n] && (
                      <span style={{ position: 'absolute', top: 1, right: 2, fontSize: 9, color: 'var(--gold)' }}>●</span>
                    )}
                  </button>
                )
              }),
            )}
          </div>

          <div className="flex gap-s" style={{ marginTop: 8 }}>
            {[
              { key: 'd1', label: '1st 12' },
              { key: 'd2', label: '2nd 12' },
              { key: 'd3', label: '3rd 12' },
            ].map((o) => (
              <button key={o.key} className="btn ghost" style={{ flex: 1 }} onClick={() => addBet(o.key)}>
                {o.label} {bets[o.key] ? `(${money(bets[o.key])})` : ''}
              </button>
            ))}
          </div>
          <div className="flex gap-s" style={{ marginTop: 8 }}>
            {outside.map((o) => (
              <button key={o.key} className="btn ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => addBet(o.key)}>
                {o.label} {bets[o.key] ? `(${money(bets[o.key])})` : ''}
              </button>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
            Fair payouts: straight 37×, red/black & even/odd ≈2.06×, dozens ≈3.08× (zero edge — true 1/probability odds).
          </div>
        </div>
      </div>
    </GameShell>
  )
}
