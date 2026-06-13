import { useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

// All 216 outcomes, precomputed once.
const OUTCOMES: [number, number, number][] = []
for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) for (let c = 1; c <= 6; c++) OUTCOMES.push([a, b, c])

function wins(key: string, d: [number, number, number]): boolean {
  const sum = d[0] + d[1] + d[2]
  const triple = d[0] === d[1] && d[1] === d[2]
  if (key === 'small') return sum >= 4 && sum <= 10 && !triple
  if (key === 'big') return sum >= 11 && sum <= 17 && !triple
  if (key === 'odd') return sum % 2 === 1 && !triple
  if (key === 'even') return sum % 2 === 0 && !triple
  if (key === 'anytriple') return triple
  if (key.startsWith('total-')) return sum === parseInt(key.slice(6))
  if (key.startsWith('triple-')) return triple && d[0] === parseInt(key.slice(7))
  if (key.startsWith('single-')) return d.includes(parseInt(key.slice(7)) as any)
  return false
}

// fair payout (incl. stake) = 216 / winning outcomes
function payoutFor(key: string): number {
  const n = OUTCOMES.filter((d) => wins(key, d)).length
  return n === 0 ? 0 : 216 / n
}

export default function SicBo() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [bets, setBets] = useState<Record<string, number>>({})
  const [dice, setDice] = useState<[number, number, number]>([1, 2, 3])
  const [rolling, setRolling] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const total = Object.values(bets).reduce((a, b) => a + b, 0)
  const add = (k: string) => {
    if (rolling) return
    setBets((b) => ({ ...b, [k]: (b[k] || 0) + bet }))
    setMsg(null)
  }

  function roll() {
    if (rolling || total <= 0) return
    if (!wallet.placeBet(total)) return
    setRolling(true)
    setMsg(null)
    const final: [number, number, number] = [randInt(1, 6), randInt(1, 6), randInt(1, 6)]
    let n = 0
    const iv = setInterval(() => {
      setDice([randInt(1, 6), randInt(1, 6), randInt(1, 6)])
      if (++n > 11) {
        clearInterval(iv)
        setDice(final)
        let ret = 0
        for (const [k, stake] of Object.entries(bets)) if (wins(k, final)) ret += stake * payoutFor(k)
        wallet.payout('Sic Bo', total, ret / total)
        setMsg(ret > total ? `Win +${money(ret - total)}` : ret > 0 ? `Returned ${money(ret)}` : `Lost ${money(total)}`)
        setBets({})
        setRolling(false)
      }
    }, 70)
  }

  const PIPS = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  const cell = (k: string, label: string) => (
    <button key={k} className="btn ghost" style={{ flex: 1, fontSize: 12, position: 'relative' }} onClick={() => add(k)}>
      {label}
      <span className="muted" style={{ display: 'block', fontSize: 10 }}>{mult(payoutFor(k))}</span>
      {bets[k] && <span style={{ position: 'absolute', top: 2, right: 4, color: 'var(--gold)', fontSize: 10 }}>●{money(bets[k])}</span>}
    </button>
  )

  return (
    <GameShell name="Sic Bo" emoji="🎲" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={rolling} />
          <StatRow k="Total staked" v={money(total)} color="var(--gold)" />
          <div className="panel tight" style={{ maxHeight: 130, overflow: 'auto' }}>
            {Object.entries(bets).length === 0 && <div className="muted" style={{ fontSize: 13 }}>Tap the table to bet.</div>}
            {Object.entries(bets).map(([k, v]) => (
              <StatRow key={k} k={k} v={money(v)} />
            ))}
          </div>
          <button className="btn green block lg" disabled={rolling || total <= 0} onClick={roll}>
            {rolling ? 'Rolling…' : 'Roll Dice'}
          </button>
          <button className="btn ghost block" disabled={rolling} onClick={() => setBets({})}>
            Clear
          </button>
          {msg && <div className={'result-flash ' + (msg.startsWith('Win') ? 'win' : msg.startsWith('Lost') ? 'lose' : '')}>{msg}</div>}
        </div>

        <div className="stage">
          <div className="flex center" style={{ justifyContent: 'center', gap: 18, marginBottom: 22 }}>
            {dice.map((d, i) => (
              <div
                key={i}
                className={rolling ? '' : 'pop'}
                style={{ fontSize: 76, lineHeight: 1, color: rolling ? 'var(--muted)' : '#fff', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.4))' }}
              >
                {PIPS[d]}
              </div>
            ))}
          </div>
          <div className="flex center" style={{ justifyContent: 'center', marginBottom: 18 }}>
            <span className="chip live">SUM {dice[0] + dice[1] + dice[2]}</span>
          </div>

          <div className="flex gap-s" style={{ marginBottom: 8 }}>{cell('small', 'SMALL 4-10')}{cell('big', 'BIG 11-17')}</div>
          <div className="flex gap-s" style={{ marginBottom: 8 }}>{cell('odd', 'ODD')}{cell('even', 'EVEN')}{cell('anytriple', 'ANY TRIPLE')}</div>
          <div className="muted" style={{ fontSize: 11, margin: '10px 0 4px' }}>SINGLE DIE</div>
          <div className="flex gap-s" style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => cell('single-' + n, PIPS[n]))}
          </div>
          <div className="muted" style={{ fontSize: 11, margin: '10px 0 4px' }}>SPECIFIC TRIPLE</div>
          <div className="flex gap-s" style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => cell('triple-' + n, PIPS[n] + PIPS[n] + PIPS[n]))}
          </div>
          <div className="muted" style={{ fontSize: 11, margin: '10px 0 4px' }}>EXACT TOTAL</div>
          <div className="flex gap-s wrap">
            {Array.from({ length: 14 }, (_, i) => i + 4).map((n) => cell('total-' + n, String(n)))}
          </div>
        </div>
      </div>
    </GameShell>
  )
}
