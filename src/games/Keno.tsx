import { useMemo, useState } from 'react'
import { shuffle } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const N = 40
const DRAW = 10
const MAX_PICK = 10

function comb(n: number, k: number) {
  if (k < 0 || k > n) return 0
  let c = 1
  for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1)
  return c
}
function hyper(spots: number, h: number) {
  return (comb(spots, h) * comb(N - spots, DRAW - h)) / comb(N, DRAW)
}

// Fair payout table for a given number of spots picked (EV == 1, no edge).
function fairTable(spots: number): number[] {
  if (spots === 0) return []
  const minHit = Math.ceil(spots / 2)
  const raw = Array.from({ length: spots + 1 }, (_, h) => (h >= minHit ? Math.pow(2.6, h - minHit + 1) : 0))
  const ev = raw.reduce((acc, r, h) => acc + r * hyper(spots, h), 0)
  const scale = ev > 0 ? 1 / ev : 0
  return raw.map((r) => Math.round(r * scale * 100) / 100)
}

export default function Keno() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [picks, setPicks] = useState<number[]>([])
  const [drawn, setDrawn] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ hits: number; m: number } | null>(null)

  const table = useMemo(() => fairTable(picks.length), [picks.length])

  function toggle(n: number) {
    if (busy) return
    setResult(null)
    setPicks((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length < MAX_PICK ? [...p, n] : p))
  }

  function quickPick() {
    if (busy) return
    setResult(null)
    setPicks(shuffle(Array.from({ length: N }, (_, i) => i + 1)).slice(0, 8).sort((a, b) => a - b))
  }

  function play() {
    if (busy || picks.length === 0) return
    if (!wallet.placeBet(bet)) return
    setBusy(true)
    setDrawn([])
    setResult(null)
    const draw = shuffle(Array.from({ length: N }, (_, i) => i + 1)).slice(0, DRAW)
    draw.forEach((num, i) => {
      setTimeout(() => {
        setDrawn((d) => [...d, num])
        if (i === DRAW - 1) {
          const hits = draw.filter((x) => picks.includes(x)).length
          const m = table[hits] ?? 0
          wallet.payout('Keno', bet, m)
          setResult({ hits, m })
          setBusy(false)
        }
      }, i * 160)
    })
  }

  return (
    <GameShell name="Keno" emoji="🔢" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <div className="flex gap-s">
            <button className="btn ghost" style={{ flex: 1 }} disabled={busy} onClick={quickPick}>
              ⚡ Quick Pick
            </button>
            <button className="btn ghost" style={{ flex: 1 }} disabled={busy} onClick={() => setPicks([])}>
              Clear
            </button>
          </div>
          <StatRow k="Spots selected" v={`${picks.length} / ${MAX_PICK}`} />
          <div className="panel tight">
            {table.map((m, h) =>
              m > 0 ? (
                <StatRow
                  key={h}
                  k={`${h} hits`}
                  v={mult(m)}
                  color={result?.hits === h ? 'var(--green)' : undefined}
                />
              ) : null,
            )}
            {picks.length === 0 && <div className="muted" style={{ fontSize: 13 }}>Pick numbers to see payouts.</div>}
          </div>
          <button className="btn green block lg" disabled={busy || picks.length === 0 || bet <= 0} onClick={play}>
            {busy ? 'Drawing…' : 'Play'}
          </button>
          {result && (
            <div className={'result-flash ' + (result.m >= 1 ? 'win' : 'lose')}>
              {result.hits} hits · {result.m >= 1 ? `+${money(bet * result.m - bet)}` : `−${money(bet)}`}
            </div>
          )}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, width: '100%', maxWidth: 520 }}>
            {Array.from({ length: N }, (_, i) => i + 1).map((n) => {
              const picked = picks.includes(n)
              const hit = drawn.includes(n)
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  className={hit ? 'pop' : ''}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 10,
                    border: '1px solid var(--line)',
                    fontWeight: 800,
                    fontSize: 15,
                    color: picked || hit ? '#0c0f17' : 'var(--text)',
                    background:
                      picked && hit
                        ? 'radial-gradient(circle at 40% 30%,#5cffb1,#149e57)'
                        : hit
                          ? 'linear-gradient(180deg,#ffd15c,#ffb15c)'
                          : picked
                            ? 'linear-gradient(180deg,#7c5cff,#5e7bff)'
                            : 'var(--panel-2)',
                  }}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </GameShell>
  )
}
