import { useState } from 'react'
import { shuffle } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const ZONES = 5 // top-left, top-right, centre, bottom-left, bottom-right
const POS = [
  { x: 18, y: 26, label: 'Top L' },
  { x: 82, y: 26, label: 'Top R' },
  { x: 50, y: 30, label: 'Centre' },
  { x: 18, y: 64, label: 'Low L' },
  { x: 82, y: 64, label: 'Low R' },
]

export default function Penalty() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [keepers, setKeepers] = useState(2) // zones the keeper covers
  const [pick, setPick] = useState<number | null>(null)
  const [covered, setCovered] = useState<number[]>([])
  const [shot, setShot] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const payout = ZONES / (ZONES - keepers) // fair, zero edge

  function shoot(zone: number) {
    if (busy) return
    if (!wallet.placeBet(bet)) return
    setBusy(true)
    setPick(zone)
    setShot(null)
    setMsg(null)
    const cov = shuffle(Array.from({ length: ZONES }, (_, i) => i)).slice(0, keepers)
    setCovered(cov)
    setTimeout(() => {
      setShot(zone)
      const scored = !cov.includes(zone)
      wallet.payout('Penalty', bet, scored ? payout : 0)
      setMsg(scored ? `GOAL! ${mult(payout)} · +${money(bet * payout - bet)}` : `SAVED! −${money(bet)}`)
      setBusy(false)
    }, 650)
  }

  return (
    <GameShell name="Penalty Shootout" emoji="⚽" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <div className="field">
            <label>Keeper covers — {keepers} zone{keepers > 1 ? 's' : ''}</label>
            <input className="range" type="range" min={1} max={4} value={keepers} disabled={busy} onChange={(e) => setKeepers(parseInt(e.target.value))} />
          </div>
          <div>
            <StatRow k="Score chance" v={`${(((ZONES - keepers) / ZONES) * 100).toFixed(0)}%`} />
            <StatRow k="Payout" v={mult(payout)} color="var(--gold)" />
            <StatRow k="Profit on goal" v={money(bet * payout - bet)} color="var(--green)" />
          </div>
          <div className="muted" style={{ fontSize: 13 }}>Pick a corner on the goal to shoot.</div>
          {msg && <div className={'result-flash ' + (msg.startsWith('GOAL') ? 'win' : 'lose')}>{msg}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 520,
              aspectRatio: '16 / 10',
              borderRadius: 12,
              background: 'linear-gradient(180deg,#0c2a16,#0a1f12)',
              border: '3px solid #fff',
              boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* net */}
            <div style={{ position: 'absolute', inset: 8, backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)', backgroundSize: '20px 20px', borderRadius: 8 }} />
            {POS.map((p, i) => {
              const isCovered = covered.includes(i) && shot !== null
              const isPick = pick === i
              return (
                <button
                  key={i}
                  onClick={() => shoot(i)}
                  disabled={busy}
                  style={{
                    position: 'absolute',
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    transform: 'translate(-50%,-50%)',
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: isPick ? '2px solid var(--gold)' : '1px dashed rgba(255,255,255,0.4)',
                    background: isCovered ? 'radial-gradient(circle,#ff8a9e,#b51f3a)' : 'rgba(255,255,255,0.06)',
                    fontSize: 28,
                    cursor: busy ? 'default' : 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {isCovered ? '🧤' : isPick && shot !== null ? '⚽' : ''}
                </button>
              )
            })}
            {/* ball start */}
            {shot === null && <div style={{ position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)', fontSize: 30 }}>⚽</div>}
          </div>
          <div className="muted" style={{ marginTop: 16, fontSize: 12 }}>True odds: payout = 5 ÷ open zones. No edge.</div>
        </div>
      </div>
    </GameShell>
  )
}
