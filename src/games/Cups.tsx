import { useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money } from '../lib/format'
import { sound } from '../lib/sound'

export default function Cups() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [cups, setCups] = useState(3)
  const [ball, setBall] = useState<number | null>(null)
  const [pick, setPick] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'shuffle' | 'pick' | 'done'>('idle')
  const [msg, setMsg] = useState<string | null>(null)

  const payout = cups // true odds: 1/cups chance, cups× payout

  function start() {
    if (phase === 'shuffle' || phase === 'pick') return
    if (!wallet.placeBet(bet)) return
    setMsg(null)
    setPick(null)
    setBall(null)
    setPhase('shuffle')
    let n = 0
    const iv = setInterval(() => {
      sound.tick()
      if (++n > 8) {
        clearInterval(iv)
        setBall(randInt(0, cups - 1))
        setPhase('pick')
      }
    }, 130)
  }

  function choose(i: number) {
    if (phase !== 'pick') return
    setPick(i)
    setPhase('done')
    const win = i === ball
    wallet.payout('Cups', bet, win ? payout : 0)
    setMsg(win ? `Found it! +${money(bet * payout - bet)}` : `Empty — −${money(bet)}`)
  }

  return (
    <GameShell name="Shell Game" emoji="🥤" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={phase === 'shuffle' || phase === 'pick'} />
          <div className="field">
            <label>Cups — {cups}</label>
            <input className="range" type="range" min={2} max={6} value={cups} disabled={phase === 'shuffle' || phase === 'pick'} onChange={(e) => setCups(parseInt(e.target.value))} />
          </div>
          <div>
            <StatRow k="Win chance" v={`${(100 / cups).toFixed(1)}%`} />
            <StatRow k="Payout" v={`${payout}.00×`} color="var(--gold)" />
            <StatRow k="Profit on win" v={money(bet * payout - bet)} color="var(--green)" />
          </div>
          <button className="btn green block lg" disabled={phase === 'shuffle' || phase === 'pick' || bet <= 0} onClick={start}>
            {phase === 'shuffle' ? 'Shuffling…' : phase === 'pick' ? 'Pick a cup!' : 'Play'}
          </button>
          {msg && <div className={'result-flash ' + (msg.includes('+') ? 'win' : 'lose')}>{msg}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex" style={{ gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: cups }).map((_, i) => {
              const reveal = phase === 'done'
              const hasBall = reveal && ball === i
              const picked = pick === i
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={phase !== 'pick'}
                  className={phase === 'shuffle' ? '' : 'pop'}
                  style={{
                    width: 90,
                    height: 100,
                    borderRadius: '14px 14px 8px 8px',
                    border: picked ? '2px solid var(--gold)' : '1px solid var(--line)',
                    background: hasBall ? 'radial-gradient(circle at 50% 80%, #ffd15c, #ff7a52)' : 'linear-gradient(180deg, var(--panel-3), var(--panel-2))',
                    fontSize: 44,
                    display: 'grid',
                    placeItems: 'end center',
                    paddingBottom: 8,
                    cursor: phase === 'pick' ? 'pointer' : 'default',
                    transform: phase === 'shuffle' ? `translateY(${(i % 2 ? -1 : 1) * 8}px)` : 'none',
                    transition: 'transform 0.12s',
                  }}
                >
                  {hasBall ? '🔴' : '🥤'}
                </button>
              )
            })}
          </div>
          <div className="muted" style={{ marginTop: 20, fontSize: 12 }}>Find the ball — true {cups}× odds, no edge.</div>
        </div>
      </div>
    </GameShell>
  )
}
