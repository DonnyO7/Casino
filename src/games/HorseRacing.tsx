import { useRef, useState } from 'react'
import { randInt, rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money } from '../lib/format'
import { sound } from '../lib/sound'

const HORSES = [
  { n: 1, c: '#ff5470' },
  { n: 2, c: '#5c8aff' },
  { n: 3, c: '#2fd47a' },
  { n: 4, c: '#ffd15c' },
  { n: 5, c: '#b15cff' },
]
const N = HORSES.length

export default function HorseRacing() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [pick, setPick] = useState(0)
  const [pos, setPos] = useState<number[]>(Array(N).fill(0))
  const [racing, setRacing] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const iv = useRef<number>()

  function race() {
    if (racing) return
    if (!wallet.placeBet(bet)) return
    setRacing(true)
    setMsg(null)
    setWinner(null)
    setPos(Array(N).fill(0))
    // winner is uniformly random -> exactly 1/N, payout N× is fair
    const win = randInt(0, N - 1)
    const p = Array(N).fill(0)
    iv.current = window.setInterval(() => {
      for (let i = 0; i < N; i++) {
        // the chosen winner gets a slightly stronger stride so it leads the pack
        p[i] += rand() * 2.4 + (i === win ? 1.6 : 0.4)
      }
      // make sure the designated winner is in front
      p[win] = Math.max(p[win], Math.max(...p))
      setPos([...p])
      if (p[win] >= 100) {
        clearInterval(iv.current)
        setPos((prev) => prev.map((v, i) => (i === win ? 100 : Math.min(v, 98))))
        setWinner(win)
        const won = win === pick
        wallet.payout('Horse Racing', bet, won ? N : 0)
        sound[won ? 'win' : 'lose']()
        setMsg(won ? `Horse ${win + 1} wins — +${money(bet * N - bet)}!` : `Horse ${win + 1} wins — −${money(bet)}`)
        setRacing(false)
      }
    }, 60)
  }

  return (
    <GameShell name="Horse Racing" emoji="🐎" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={racing} />
          <div className="field">
            <label>Your Horse</label>
            <div className="flex gap-s">
              {HORSES.map((h, i) => (
                <button
                  key={h.n}
                  className="btn"
                  disabled={racing}
                  onClick={() => setPick(i)}
                  style={{ flex: 1, background: pick === i ? `linear-gradient(135deg,${h.c},${h.c})` : 'var(--panel-2)', border: pick === i ? 'none' : '1px solid var(--line)', color: pick === i ? '#0c0f17' : 'var(--text)' }}
                >
                  {h.n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <StatRow k="Win chance" v={`${(100 / N).toFixed(0)}%`} />
            <StatRow k="Payout" v={`${N}.00×`} color="var(--gold)" />
            <StatRow k="Profit on win" v={money(bet * N - bet)} color="var(--green)" />
          </div>
          <button className="btn green block lg" disabled={racing || bet <= 0} onClick={race}>
            {racing ? 'And they’re off…' : 'Start Race'}
          </button>
          {msg && <div className={'result-flash ' + (msg.includes('+') ? 'win' : 'lose')}>{msg}</div>}
        </div>

        <div className="stage" style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {HORSES.map((h, i) => (
              <div key={h.n} style={{ position: 'relative', height: 40, background: 'var(--bg-2)', borderRadius: 10, border: pick === i ? `1px solid ${h.c}` : '1px solid var(--line)' }}>
                <div style={{ position: 'absolute', right: 8, top: 8, fontSize: 18 }}>🏁</div>
                <div
                  style={{
                    position: 'absolute',
                    left: `calc(${Math.min(100, pos[i])}% - 18px)`,
                    top: 3,
                    fontSize: 28,
                    transition: 'left 0.06s linear',
                    filter: winner === i ? 'drop-shadow(0 0 8px ' + h.c + ')' : 'none',
                  }}
                >
                  🐎
                </div>
                <div style={{ position: 'absolute', left: 8, top: 11, fontSize: 12, fontWeight: 800, color: h.c }}>{h.n}</div>
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>Each horse is equally likely — true {N}× odds, zero edge.</div>
        </div>
      </div>
    </GameShell>
  )
}
