import { useEffect, useRef, useState } from 'react'
import { rand, randInt, pick } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'
import { sound } from '../lib/sound'

type Phase = 'idle' | 'running' | 'crashed' | 'cashed'

interface Bot {
  name: string
  bet: number
  target: number
}

const BOT_NAMES = ['CryptoKnight', 'LuckyLuna', 'NeonNinja', 'MidasTouch', 'FrostByte', 'GoldRush', 'MoonShot', 'ZeroEdge', 'PixelPirate', 'HighRoller99', 'QuantumDice', 'SilkRoad']

function fairTarget() {
  return Math.max(1.05, Math.floor((1 / (1 - rand())) * 100) / 100)
}

export default function Crash() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [auto, setAuto] = useState(2)
  const [phase, setPhase] = useState<Phase>('idle')
  const [cur, setCur] = useState(1)
  const [cashedAt, setCashedAt] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [bots, setBots] = useState<Bot[]>(() =>
    Array.from({ length: 7 }, () => ({ name: pick(BOT_NAMES), bet: pick([5, 10, 25, 50, 100, 250, 500]), target: fairTarget() })),
  )
  const raf = useRef<number>()
  const crashRef = useRef(1)
  const cashedRef = useRef<number | null>(null)
  const runningRef = useRef(false)

  useEffect(() => () => cancelAnimationFrame(raf.current!), [])

  function start() {
    if (phase === 'running') return
    if (!wallet.placeBet(bet)) return
    const u = rand()
    const crash = Math.max(1, Math.floor((1 / (1 - u)) * 100) / 100) // P(>=m)=1/m
    crashRef.current = crash
    cashedRef.current = null
    runningRef.current = true
    setCashedAt(null)
    setCur(1)
    setBots(Array.from({ length: randInt(5, 9) }, () => ({ name: pick(BOT_NAMES), bet: pick([5, 10, 25, 50, 100, 250, 500]), target: fairTarget() })))
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
        runningRef.current = false
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
    if (!runningRef.current || cashedRef.current !== null) return
    runningRef.current = false
    cancelAnimationFrame(raf.current!)
    // clamp manual cashout to the crash point so a same-frame click can't overpay
    const m = Math.min(at ?? cur, crashRef.current)
    cashedRef.current = m
    setCashedAt(m)
    setCur(m)
    setPhase('cashed')
    sound.cashout()
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

          <div className="panel tight" style={{ marginTop: 14, maxHeight: 168, overflow: 'auto' }}>
            <div className="flex between center" style={{ marginBottom: 6 }}>
              <strong style={{ fontSize: 13 }}>
                <span className="live-dot" style={{ marginRight: 6 }} />Players this round
              </strong>
              <span className="muted" style={{ fontSize: 12 }}>{bots.length + 1} in</span>
            </div>
            <PlayerRow name="You" bet={bet} cashed={phase === 'cashed'} at={cashedAt} busted={phase === 'crashed'} you />
            {bots.map((b, i) => {
              const cashed = b.target <= cur && b.target < crashRef.current
              const busted = phase === 'crashed' && b.target >= crashRef.current
              return <PlayerRow key={i} name={b.name} bet={b.bet} cashed={cashed} at={cashed ? b.target : null} busted={busted} />
            })}
          </div>
        </div>
      </div>
    </GameShell>
  )
}

function PlayerRow({ name, bet, cashed, at, busted, you }: { name: string; bet: number; cashed: boolean; at: number | null; busted: boolean; you?: boolean }) {
  return (
    <div className="flex between center" style={{ padding: '5px 4px', borderBottom: '1px solid rgba(40,51,73,0.4)', background: you ? 'rgba(124,92,255,0.1)' : undefined, borderRadius: 6 }}>
      <span style={{ fontWeight: you ? 800 : 600, color: you ? 'var(--brand-2)' : undefined, fontSize: 13, minWidth: 110 }}>{name}</span>
      <span className="muted" style={{ fontSize: 12, flex: 1 }}>{money(bet)}</span>
      {cashed ? (
        <span className="chip" style={{ background: 'rgba(47,212,122,0.14)', color: 'var(--green)' }}>{mult(at ?? 0)} · +{money(bet * (at ?? 1) - bet)}</span>
      ) : busted ? (
        <span className="chip" style={{ background: 'rgba(255,84,112,0.14)', color: 'var(--red)' }}>busted</span>
      ) : (
        <span className="muted" style={{ fontSize: 12 }}>…</span>
      )}
    </div>
  )
}
