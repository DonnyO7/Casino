import { useMemo, useRef, useState } from 'react'
import { randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

// raw multiplier pattern per risk (repeated around the wheel), normalised so
// the average == 1 (fair, zero edge).
const PATTERNS: Record<string, number[]> = {
  Low: [1.5, 1.2, 0, 1.5, 1.2, 0, 2, 1.2],
  Medium: [0, 1.9, 0, 3, 0, 1.9, 0, 5],
  High: [0, 0, 0, 0, 0, 0, 0, 49.5],
}
const COLORS = ['#7c5cff', '#23e0c8', '#ff5c8a', '#ffd15c', '#5cffb1', '#5c8aff', '#ff7a52', '#b15cff']
const SEGMENTS = 24

function buildWheel(risk: string) {
  const pat = PATTERNS[risk]
  const raw = Array.from({ length: SEGMENTS }, (_, i) => pat[i % pat.length])
  const avg = raw.reduce((a, b) => a + b, 0) / SEGMENTS
  return raw.map((m) => Math.round((m / avg) * 100) / 100)
}

export default function Wheel() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [landed, setLanded] = useState<number | null>(null)
  const segRef = useRef(0)
  const mults = useMemo(() => buildWheel(risk), [risk])

  const seg = 360 / SEGMENTS
  const conic = useMemo(
    () =>
      `conic-gradient(${mults
        .map((m, i) => {
          const c = m === 0 ? '#2a3450' : COLORS[i % COLORS.length]
          return `${c} ${i * seg}deg ${(i + 1) * seg}deg`
        })
        .join(',')})`,
    [mults, seg],
  )

  function spin() {
    if (spinning) return
    if (!wallet.placeBet(bet)) return
    setSpinning(true)
    setLanded(null)
    const target = randInt(0, SEGMENTS - 1)
    segRef.current = target
    // rotate so the middle of target segment ends at the top pointer (0deg)
    const finalAngle = 360 * 6 + (360 - (target * seg + seg / 2))
    setAngle((a) => a - (a % 360) + finalAngle)
    setTimeout(() => {
      const m = mults[target]
      wallet.payout('Wheel', bet, m)
      setLanded(target)
      setSpinning(false)
    }, 4200)
  }

  return (
    <GameShell name="Wheel" emoji="🎡" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={spinning} />
          <div className="field">
            <label>Risk</label>
            <div className="toggle">
              {(['Low', 'Medium', 'High'] as const).map((r) => (
                <button key={r} className={risk === r ? 'on' : ''} disabled={spinning} onClick={() => setRisk(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <StatRow k="Max multiplier" v={mult(Math.max(...mults))} color="var(--gold)" />
          <button className="btn green block lg" disabled={spinning || bet <= 0} onClick={spin}>
            {spinning ? 'Spinning…' : 'Spin Wheel'}
          </button>
          {landed !== null && (
            <div className={'result-flash ' + (mults[landed] >= 1 ? 'win' : 'lose')}>
              {mult(mults[landed])} ·{' '}
              {mults[landed] >= 1 ? `+${money(bet * mults[landed] - bet)}` : `−${money(bet)}`}
            </div>
          )}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 360, height: 360, maxWidth: '90%' }}>
            <div
              style={{
                position: 'absolute',
                top: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '22px solid #fff',
                zIndex: 5,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            />
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: conic,
                transform: `rotate(${angle}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.15,0.85,0.2,1)' : 'none',
                boxShadow: '0 0 0 10px #10141f, 0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: '42%',
                borderRadius: '50%',
                background: 'var(--panel)',
                border: '2px solid var(--line)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
              }}
            >
              {landed !== null ? mult(mults[landed]) : '🎡'}
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  )
}
