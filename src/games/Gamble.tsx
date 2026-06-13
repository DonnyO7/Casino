import { useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const MAX_STEPS = 10 // up to 1024x

export default function Gamble() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [step, setStep] = useState(0)
  const [active, setActive] = useState(false)
  const [pot, setPot] = useState(0)
  const [last, setLast] = useState<'red' | 'black' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [flipping, setFlipping] = useState(false)

  function start() {
    if (!wallet.placeBet(bet)) return
    setActive(true)
    setStep(0)
    setPot(bet)
    setLast(null)
    setMsg(null)
  }

  function guess(color: 'red' | 'black') {
    if (!active || flipping) return
    setFlipping(true)
    setMsg(null)
    const result: 'red' | 'black' = rand() < 0.5 ? 'red' : 'black'
    setTimeout(() => {
      setLast(result)
      if (result === color) {
        const ns = step + 1
        setStep(ns)
        setPot((p) => p * 2)
        if (ns >= MAX_STEPS) {
          // auto cash at the top
          wallet.payout('Gamble', bet, Math.pow(2, ns))
          setActive(false)
          setMsg(`MAX LADDER! +${money(bet * Math.pow(2, ns) - bet)}`)
        } else {
          setMsg(`Correct — ${color} ✓`)
        }
      } else {
        wallet.payout('Gamble', bet, 0)
        setActive(false)
        setMsg(`Wrong — it was ${result}. Lost ${money(bet)}.`)
        setStep(0)
      }
      setFlipping(false)
    }, 450)
  }

  function cashout() {
    if (!active || step === 0) return
    const m = Math.pow(2, step)
    wallet.payout('Gamble', bet, m)
    setActive(false)
    setMsg(`Cashed out at ${mult(m)} — +${money(bet * m - bet)}`)
  }

  const curMult = Math.pow(2, step)

  return (
    <GameShell name="Gamble" emoji="🎴" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={active} />
          <div>
            <StatRow k="Ladder step" v={`${step} / ${MAX_STEPS}`} />
            <StatRow k="Current multiplier" v={mult(curMult)} color="var(--gold)" />
            <StatRow k="Pot" v={money(pot)} color="var(--green)" />
          </div>
          {active ? (
            <>
              <div className="flex gap-s">
                <button className="btn red" style={{ flex: 1 }} disabled={flipping} onClick={() => guess('red')}>
                  ♦ RED
                </button>
                <button className="btn" style={{ flex: 1, background: '#1c2536' }} disabled={flipping} onClick={() => guess('black')}>
                  ♠ BLACK
                </button>
              </div>
              <button className="btn gold block" disabled={step === 0 || flipping} onClick={cashout}>
                Cash Out {money(pot)}
              </button>
            </>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={start}>
              Start
            </button>
          )}
          {msg && <div className={'result-flash ' + (msg.includes('+') ? 'win' : msg.includes('Wrong') ? 'lose' : '')}>{msg}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            key={last + '' + step}
            className={last ? 'pop' : ''}
            style={{
              width: 150,
              height: 150,
              borderRadius: 20,
              display: 'grid',
              placeItems: 'center',
              fontSize: 70,
              marginBottom: 24,
              background:
                last === 'red'
                  ? 'radial-gradient(circle at 35% 30%, #ff9aa8, #c0273f)'
                  : last === 'black'
                    ? 'radial-gradient(circle at 35% 30%, #4a5874, #161c2c)'
                    : 'var(--panel-2)',
              boxShadow: '0 16px 50px rgba(0,0,0,0.45)',
            }}
          >
            {last === 'red' ? '♦' : last === 'black' ? '♠' : '🎴'}
          </div>

          <div className="flex" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 520 }}>
            {Array.from({ length: MAX_STEPS }).map((_, i) => {
              const reached = i < step
              const isNext = i === step && active
              return (
                <div
                  key={i}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid var(--line)',
                    color: reached ? '#0c0f17' : isNext ? 'var(--gold)' : 'var(--muted)',
                    background: reached ? 'linear-gradient(180deg,#5cffb1,#149e57)' : isNext ? 'rgba(255,209,92,0.12)' : 'var(--panel-2)',
                    boxShadow: isNext ? '0 0 0 1px var(--gold)' : 'none',
                  }}
                >
                  {mult(Math.pow(2, i + 1))}
                </div>
              )
            })}
          </div>
          <div className="muted" style={{ marginTop: 20, fontSize: 12 }}>Guess the colour — exactly 50/50, double every time, no edge.</div>
        </div>
      </div>
    </GameShell>
  )
}
