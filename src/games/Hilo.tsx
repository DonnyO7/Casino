import { useState } from 'react'
import { randomCard, Card } from '../lib/cards'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { PlayingCard } from '../components/PlayingCard'
import { money, mult } from '../lib/format'

export default function Hilo() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [current, setCurrent] = useState<Card>(() => randomCard())
  const [active, setActive] = useState(false)
  const [m, setM] = useState(1)
  const [last, setLast] = useState<Card | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const o = current.order
  const pHigher = (13 - o + 1) / 13 // next rank >= current
  const pLower = o / 13 // next rank <= current
  const multHigher = 1 / pHigher
  const multLower = 1 / pLower

  function start() {
    if (!wallet.placeBet(bet)) return
    setActive(true)
    setM(1)
    setMsg(null)
    setLast(null)
    setCurrent(randomCard())
  }

  function guess(dir: 'hi' | 'lo') {
    if (!active) return
    const next = randomCard()
    setLast(next)
    const correct = dir === 'hi' ? next.order >= o : next.order <= o
    if (correct) {
      const nm = m * (dir === 'hi' ? multHigher : multLower)
      setM(nm)
      setCurrent(next)
      setMsg(`Correct! ${mult(nm)}`)
    } else {
      wallet.payout('Hi-Lo', bet, 0)
      setActive(false)
      setMsg('Wrong — busted.')
      setCurrent(next)
    }
  }

  function cashout() {
    if (!active || m <= 1) return
    wallet.payout('Hi-Lo', bet, m)
    setActive(false)
    setMsg(`Cashed out at ${mult(m)} (+${money(bet * m - bet)})`)
  }

  return (
    <GameShell name="Hi-Lo" emoji="🃏" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={active} />
          <div>
            <StatRow k="Current multiplier" v={mult(m)} color="var(--gold)" />
            <StatRow k="Cashout value" v={money(bet * m)} color="var(--green)" />
          </div>
          {active ? (
            <>
              <div className="flex gap-s">
                <button className="btn green" style={{ flex: 1 }} onClick={() => guess('hi')}>
                  ↑ Higher / Same<br />
                  <small>{mult(multHigher)}</small>
                </button>
                <button className="btn red" style={{ flex: 1 }} onClick={() => guess('lo')}>
                  ↓ Lower / Same<br />
                  <small>{mult(multLower)}</small>
                </button>
              </div>
              <button className="btn gold block" disabled={m <= 1} onClick={cashout}>
                Cash Out {money(bet * m)}
              </button>
            </>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={start}>
              Start Game
            </button>
          )}
          {msg && <div className={'result-flash ' + (active ? 'win' : m > 1 && !active ? '' : '')}>{msg}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center', gap: 26 }}>
          <div className="flex center gap-m">
            <div style={{ textAlign: 'center' }}>
              <div className="muted" style={{ marginBottom: 8 }}>Current</div>
              <PlayingCard card={current} size="lg" />
            </div>
            {last && (
              <div style={{ textAlign: 'center' }}>
                <div className="muted" style={{ marginBottom: 8 }}>Last draw</div>
                <PlayingCard card={last} size="lg" />
              </div>
            )}
          </div>
          <div className="muted">52-card fair deck · payouts = 1 ÷ probability</div>
        </div>
      </div>
    </GameShell>
  )
}
