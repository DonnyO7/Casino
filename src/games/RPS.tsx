import { useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money } from '../lib/format'

const MOVES = [
  { key: 'rock', icon: '🪨', beats: 'scissors' },
  { key: 'paper', icon: '📄', beats: 'rock' },
  { key: 'scissors', icon: '✂️', beats: 'paper' },
]

export default function RPS() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [you, setYou] = useState<number | null>(null)
  const [cpu, setCpu] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  function play(pick: number) {
    if (busy) return
    if (!wallet.placeBet(bet)) return
    setBusy(true)
    setMsg(null)
    setYou(pick)
    setCpu(null)
    let n = 0
    const iv = setInterval(() => {
      setCpu(randInt(0, 2))
      if (++n > 8) {
        clearInterval(iv)
        const c = randInt(0, 2)
        setCpu(c)
        // win 2x, tie 1x (push), lose 0 -> exactly fair (EV = 1)
        let m = 0
        let text = ''
        if (pick === c) {
          m = 1
          text = 'Tie — push'
        } else if (MOVES[pick].beats === MOVES[c].key) {
          m = 2
          text = `You win — +${money(bet)}`
        } else {
          m = 0
          text = `You lose — −${money(bet)}`
        }
        wallet.payout('Rock Paper Scissors', bet, m)
        setMsg(text)
        setBusy(false)
      }
    }, 90)
  }

  return (
    <GameShell name="Rock Paper Scissors" emoji="✊" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <div>
            <StatRow k="Win" v="2.00× (push on tie)" />
            <StatRow k="Win chance" v="33.3% win · 33.3% push" />
          </div>
          <div className="muted" style={{ fontSize: 13 }}>Choose your move:</div>
          <div className="flex gap-s">
            {MOVES.map((mv, i) => (
              <button key={mv.key} className="btn ghost" style={{ flex: 1, fontSize: 26, padding: '14px 0' }} disabled={busy} onClick={() => play(i)}>
                {mv.icon}
              </button>
            ))}
          </div>
          {msg && <div className={'result-flash ' + (msg.includes('win') ? 'win' : msg.includes('lose') ? 'lose' : '')}>{msg}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex" style={{ gap: 40, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="muted" style={{ marginBottom: 10 }}>You</div>
              <div className={you !== null ? 'pop' : ''} style={{ fontSize: 90 }}>{you !== null ? MOVES[you].icon : '❔'}</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--muted)' }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div className="muted" style={{ marginBottom: 10 }}>CPU</div>
              <div className={cpu !== null && !busy ? 'pop' : ''} style={{ fontSize: 90 }}>{cpu !== null ? MOVES[cpu].icon : '❔'}</div>
            </div>
          </div>
          <div className="muted" style={{ marginTop: 24, fontSize: 12 }}>Win pays 2×, a tie returns your bet — exactly fair.</div>
        </div>
      </div>
    </GameShell>
  )
}
