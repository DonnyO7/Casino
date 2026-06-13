import { useEffect, useRef, useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

type Phase = 'idle' | 'running' | 'crashed' | 'cashed'

export default function Crash() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [auto, setAuto] = useState(2)
  const [phase, setPhase] = useState<Phase>('idle')
  const [cur, setCur] = useState(1)
  const [cashedAt, setCashedAt] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const raf = useRef<number>()
  const crashRef = useRef(1)
  const cashedRef = useRef<number | null>(null)

  useEffect(() => () => cancelAnimationFrame(raf.current!), [])

  function start() {
    if (phase === 'running') return
    if (!wallet.placeBet(bet)) return
    const u = rand()
    const crash = Math.max(1, Math.floor((1 / (1 - u)) * 100) / 100) // P(>=m)=1/m
    crashRef.current = crash
    cashedRef.current = null
    setCashedAt(null)
    setCur(1)
    setPhase('running')

    const t0 = performance.now()
    const loop = (now: number) => {
      const t = (now - t0) / 1000
      const m = Math.floor(Math.pow(Math.E, 0.18 * t) * 100) / 100
      // auto cashout
      if (cashedRef.current === null && auto > 1 && m >= auto && auto <= crash) {
        doCash(auto)
        return
      }
      if (m >= crash) {
        setCur(crash)
        setPhase((p) => (cashedRef.current === null ? 'crashed' : p))
        if (cashedRef.current === null) wallet.payout('Crash', bet, 0)
        setHistory((h) => [crash, ...h].slice(0, 14))
        return
      }
      setCur(m)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
  }

  function doCash(at?: number) {
    if (phase !== 'running' || cashedRef.current !== null) return
    cancelAnimationFrame(raf.current!)
    const m = at ?? cur
    cashedRef.current = m
    setCashedAt(m)
    setCur(m)
    setPhase('cashed')
    wallet.payout('Crash', bet, m)
    setHistory((h) => [crashRef.current, ...h].slice(0, 14))
  }

  const color = phase === 'crashed' ? 'var(--red)' : phase === 'cashed' ? 'var(--green)' : 'var(--text)'

  return (
    <GameShell name="Crash" emoji="📈" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={phase === 'running'} />
          <div className="field">
            <label>Auto Cashout (0 = manual)</label>
            <div className="input-group">
              <input
                type="number"
                step={0.1}
                value={auto}
                disabled={phase === 'running'}
                onChange={(e) => setAuto(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>
          <div>
            <StatRow k="Win chance @ target" v={auto > 1 ? `${(100 / auto).toFixed(2)}%` : '—'} />
            <StatRow k="Profit @ target" v={auto > 1 ? money(bet * auto - bet) : '—'} color="var(--green)" />
          </div>
          {phase === 'running' ? (
            <button className="btn gold block lg" onClick={() => doCash()}>
              Cash Out {mult(cur)}
            </button>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={start}>
              Bet
            </button>
          )}
        </div>

        <div className="stage">
          <div className="flex gap-s wrap" style={{ marginBottom: 14 }}>
            {history.map((h, i) => (
              <span
                key={i}
                className="chip"
                style={{
                  background: h >= 2 ? 'rgba(47,212,122,0.14)' : 'rgba(255,84,112,0.14)',
                  color: h >= 2 ? 'var(--green)' : 'var(--red)',
                }}
              >
                {mult(h)}
              </span>
            ))}
          </div>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
            <div
              className="rocket"
              style={{
                fontSize: 60,
                position: 'absolute',
                bottom: `${Math.min(80, (cur - 1) * 14)}%`,
                left: `${Math.min(80, (cur - 1) * 14)}%`,
                transition: 'all 0.05s linear',
                filter: phase === 'crashed' ? 'grayscale(1)' : 'none',
              }}
            >
              {phase === 'crashed' ? '💥' : '🚀'}
            </div>
            <div style={{ fontSize: 88, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
              {mult(cur)}
            </div>
          </div>
          {phase === 'crashed' && <div className="result-flash lose">CRASHED · −{money(bet)}</div>}
          {phase === 'cashed' && (
            <div className="result-flash win">
              CASHED @ {mult(cashedAt ?? cur)} · +{money(bet * (cashedAt ?? cur) - bet)}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  )
}
