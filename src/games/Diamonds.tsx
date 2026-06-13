import { useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const GEMS = [
  { c: '#ff5470', n: 'Ruby' },
  { c: '#5c8aff', n: 'Sapphire' },
  { c: '#2fd47a', n: 'Emerald' },
  { c: '#ffd15c', n: 'Topaz' },
  { c: '#b15cff', n: 'Amethyst' },
  { c: '#23e0c8', n: 'Aqua' },
  { c: '#ff7a52', n: 'Amber' },
]
const COUNT = 5

function maxGroup(arr: number[]): number {
  const c: Record<number, number> = {}
  let m = 0
  for (const x of arr) {
    c[x] = (c[x] || 0) + 1
    m = Math.max(m, c[x])
  }
  return m
}

// Fair payout table by largest matching group (EV == 1). Probabilities are
// computed once (lazily) by simulation; payouts auto-scaled to remove all edge.
const RAW: Record<number, number> = { 2: 0.5, 3: 4, 4: 45, 5: 600 }
let _mult: Record<number, number> | null = null
function getMult(): Record<number, number> {
  if (_mult) return _mult
  const N = 200000
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (let i = 0; i < N; i++) {
    const a = Array.from({ length: COUNT }, () => Math.floor(Math.random() * GEMS.length))
    counts[maxGroup(a)]++
  }
  const ev = [2, 3, 4, 5].reduce((s, m) => s + (counts[m] / N) * RAW[m], 0)
  const scale = 1 / ev
  _mult = { 2: RAW[2] * scale, 3: RAW[3] * scale, 4: RAW[4] * scale, 5: RAW[5] * scale }
  return _mult
}

export default function Diamonds() {
  const wallet = useWallet()
  const MULT = getMult()
  const [bet, setBet] = useState(10)
  const [gems, setGems] = useState<number[]>([0, 1, 2, 3, 4])
  const [revealed, setRevealed] = useState(COUNT)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ group: number; m: number } | null>(null)

  function deal() {
    if (busy) return
    if (!wallet.placeBet(bet)) return
    setBusy(true)
    setResult(null)
    const draw = Array.from({ length: COUNT }, () => randInt(0, GEMS.length - 1))
    setGems(draw)
    setRevealed(0)
    let i = 0
    const iv = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= COUNT) {
        clearInterval(iv)
        const g = maxGroup(draw)
        const m = MULT[g] ?? 0
        wallet.payout('Diamonds', bet, m)
        setResult({ group: g, m })
        setBusy(false)
      }
    }, 280)
  }

  return (
    <GameShell name="Diamonds" emoji="💎" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <div className="panel tight">
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>LARGEST MATCH PAYS</div>
            {[5, 4, 3, 2].map((g) => (
              <StatRow key={g} k={`${g} of a kind`} v={mult(MULT[g])} color={result?.group === g ? 'var(--green)' : undefined} />
            ))}
          </div>
          <button className="btn green block lg" disabled={busy || bet <= 0} onClick={deal}>
            {busy ? 'Drawing…' : 'Deal Gems'}
          </button>
          {result && (
            <div className={'result-flash ' + (result.m >= 1 ? 'win' : 'lose')}>
              {result.group > 1 ? `${result.group} of a kind · ${mult(result.m)}` : 'No match'} ·{' '}
              {result.m >= 1 ? `+${money(bet * result.m - bet)}` : `−${money(bet)}`}
            </div>
          )}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex" style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {gems.map((g, i) => {
              const show = i < revealed
              return (
                <div
                  key={i}
                  className={show ? 'pop' : ''}
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: 16,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 38,
                    background: show
                      ? `radial-gradient(circle at 35% 30%, #ffffffaa, ${GEMS[g].c})`
                      : 'var(--panel-2)',
                    border: show ? `2px solid ${GEMS[g].c}` : '1px solid var(--line)',
                    boxShadow: show ? `0 0 22px ${GEMS[g].c}88` : 'none',
                  }}
                >
                  {show ? '💎' : '❔'}
                </div>
              )
            })}
          </div>
          <div className="muted" style={{ marginTop: 22, fontSize: 12 }}>
            7 gem colours · match colours for a win · true 1 ÷ probability odds
          </div>
        </div>
      </div>
    </GameShell>
  )
}
