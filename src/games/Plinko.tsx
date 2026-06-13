import { useMemo, useRef, useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const ROWS = 12

// Binomial probability of landing in bucket k (0..ROWS)
function binom(n: number, k: number) {
  let c = 1
  for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1)
  return c / Math.pow(2, n)
}

// Relative payout "shapes" per risk. We normalise each so EV == 1 (fair).
const SHAPES: Record<string, number[]> = {
  Low: [11, 3, 1.6, 1.2, 1, 0.7, 0.5, 0.7, 1, 1.2, 1.6, 3, 11],
  Medium: [24, 6, 2.5, 1.2, 0.7, 0.4, 0.3, 0.4, 0.7, 1.2, 2.5, 6, 24],
  High: [170, 24, 8, 2, 0.5, 0.2, 0.1, 0.2, 0.5, 2, 8, 24, 170],
}

function fairMultipliers(risk: string): number[] {
  const raw = SHAPES[risk]
  const ev = raw.reduce((acc, m, k) => acc + m * binom(ROWS, k), 0)
  return raw.map((m) => Math.round((m / ev) * 100) / 100)
}

export default function Plinko() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [balls, setBalls] = useState<{ id: number; path: number[]; bucket: number }[]>([])
  const [hits, setHits] = useState<{ k: number; m: number; t: number }[]>([])
  const idRef = useRef(0)
  const mults = useMemo(() => fairMultipliers(risk), [risk])

  function drop() {
    if (!wallet.placeBet(bet)) return
    // simulate 12 fair coin flips
    let rights = 0
    const path: number[] = [0.5]
    for (let i = 1; i <= ROWS; i++) {
      if (rand() < 0.5) rights++
      path.push(0.5 + (2 * rights - i) / (2 * ROWS))
    }
    const bucket = rights
    const id = idRef.current++
    setBalls((b) => [...b, { id, path, bucket }])

    // settle when ball lands
    setTimeout(() => {
      const m = mults[bucket]
      wallet.payout('Plinko', bet, m)
      setHits((h) => [{ k: bucket, m, t: Date.now() }, ...h].slice(0, 8))
      setBalls((b) => b.filter((x) => x.id !== id))
    }, 1900)
  }

  return (
    <GameShell name="Plinko" emoji="🔵" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} />
          <div className="field">
            <label>Risk</label>
            <div className="toggle">
              {(['Low', 'Medium', 'High'] as const).map((r) => (
                <button key={r} className={risk === r ? 'on' : ''} onClick={() => setRisk(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <StatRow k="Rows" v={ROWS} />
            <StatRow k="Max win" v={mult(Math.max(...mults))} color="var(--gold)" />
          </div>
          <button className="btn green block lg" disabled={bet <= 0} onClick={drop}>
            Drop Ball
          </button>
          <div>
            {hits.map((h, i) => (
              <StatRow key={h.t + '' + i} k={`Bucket ${h.k}`} v={`${mult(h.m)}  →  ${money(bet * h.m)}`} color={h.m >= 1 ? 'var(--green)' : 'var(--red)'} />
            ))}
          </div>
        </div>

        <div className="stage">
          <div style={{ position: 'relative', flex: 1, minHeight: 380 }}>
            {/* pegs */}
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: r + 3 }).map((__, c) => {
                const rowFrac = (r + 1) / (ROWS + 1)
                const span = (r + 2) / (ROWS + 1)
                const xFrac = 0.5 - span / 2 + (c * span) / (r + 2)
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      position: 'absolute',
                      left: `${xFrac * 100}%`,
                      top: `${rowFrac * 88}%`,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--muted)',
                      transform: 'translate(-50%,-50%)',
                      opacity: 0.7,
                    }}
                  />
                )
              }),
            )}
            {/* balls */}
            {balls.map((ball) => (
              <Ball key={ball.id} path={ball.path} />
            ))}
          </div>
          {/* buckets */}
          <div className="flex" style={{ gap: 3 }}>
            {mults.map((m, k) => {
              const hot = m >= 5
              return (
                <div
                  key={k}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '7px 2px',
                    borderRadius: 6,
                    color: '#10131c',
                    background: hot
                      ? 'linear-gradient(180deg,#ffd15c,#ff7a52)'
                      : m >= 1
                        ? 'linear-gradient(180deg,#34d07a,#149e57)'
                        : 'linear-gradient(180deg,#5c8aff,#7c5cff)',
                  }}
                >
                  {m}×
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </GameShell>
  )
}

function Ball({ path }: { path: number[] }) {
  // animate via CSS keyframe offset over the path using a moving div.
  const [step, setStep] = useState(0)
  const ref = useRef<number>()
  useMemo(() => {
    const t0 = performance.now()
    const dur = 1800
    const loop = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      setStep(t * (path.length - 1))
      if (t < 1) ref.current = requestAnimationFrame(loop)
    }
    ref.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(ref.current!)
  }, [])
  const i = Math.floor(step)
  const f = step - i
  const x = path[i] + (path[Math.min(i + 1, path.length - 1)] - path[i]) * f
  const y = (step / (path.length - 1)) * 88
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y}%`,
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #fff, #ff7a52)',
        transform: 'translate(-50%,-50%)',
        boxShadow: '0 0 12px rgba(255,122,82,0.8)',
        zIndex: 5,
      }}
    />
  )
}
