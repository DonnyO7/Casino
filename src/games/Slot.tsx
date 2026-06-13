import { useMemo, useRef, useState } from 'react'
import { rand } from '../lib/rng'
import { SlotConfig, scaledPayouts, TARGET_RTP } from '../data/slots'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const REELS = 3
const VISIBLE = 3 // rows shown per reel; centre row is the payline

function weightedIndex(cfg: SlotConfig): number {
  const W = cfg.symbols.reduce((s, x) => s + x.weight, 0)
  let r = rand() * W
  for (let i = 0; i < cfg.symbols.length; i++) {
    r -= cfg.symbols[i].weight
    if (r < 0) return i
  }
  return cfg.symbols.length - 1
}

export default function Slot({ cfg }: { cfg: SlotConfig }) {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const { multipliers } = useMemo(() => scaledPayouts(cfg), [cfg])
  const [a, b] = cfg.accent.split(',')

  // grid[reel][row] -> symbol index
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: REELS }, () => Array.from({ length: VISIBLE }, () => weightedIndex(cfg))),
  )
  const [spinning, setSpinning] = useState<boolean[]>([false, false, false])
  const [win, setWin] = useState<number | null>(null)
  const [auto, setAuto] = useState(false)
  const intervals = useRef<number[]>([])
  const busyRef = useRef(false)

  function spin() {
    if (busyRef.current) return
    if (!wallet.placeBet(bet)) {
      setAuto(false)
      return
    }
    busyRef.current = true
    setWin(null)

    // final outcome
    const final: number[][] = Array.from({ length: REELS }, () =>
      Array.from({ length: VISIBLE }, () => weightedIndex(cfg)),
    )

    setSpinning([true, true, true])
    intervals.current.forEach(clearInterval)
    intervals.current = []

    // animate each reel: fast cycling, staggered stop
    for (let reel = 0; reel < REELS; reel++) {
      const iv = window.setInterval(() => {
        setGrid((g) => {
          const ng = g.map((col) => col.slice())
          ng[reel] = Array.from({ length: VISIBLE }, () => weightedIndex(cfg))
          return ng
        })
      }, 60)
      intervals.current.push(iv)

      setTimeout(() => {
        clearInterval(iv)
        setGrid((g) => {
          const ng = g.map((col) => col.slice())
          ng[reel] = final[reel]
          return ng
        })
        setSpinning((s) => {
          const ns = s.slice()
          ns[reel] = false
          return ns
        })
        if (reel === REELS - 1) settle(final)
      }, 600 + reel * 350)
    }
  }

  function settle(final: number[][]) {
    const line = final.map((col) => col[1]) // centre row
    let m = 0
    if (line[0] === line[1] && line[1] === line[2]) {
      m = multipliers[line[0]]
    }
    wallet.payout(cfg.name, bet, m)
    setWin(m)
    busyRef.current = false
    if (auto) setTimeout(spin, 600)
  }

  const payTable = useMemo(
    () =>
      cfg.symbols
        .map((s, i) => ({ icon: s.icon, name: s.name, m: multipliers[i] }))
        .sort((x, y) => y.m - x.m),
    [cfg, multipliers],
  )

  return (
    <GameShell name={cfg.name} emoji="🎰" rtp={`${(TARGET_RTP * 100).toFixed(0)}%`}>
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busyRef.current} />
          <button className="btn green block lg" disabled={busyRef.current || bet <= 0} onClick={spin}>
            {busyRef.current ? 'Spinning…' : 'Spin'}
          </button>
          <button
            className={'btn block ' + (auto ? 'gold' : 'ghost')}
            onClick={() => {
              const next = !auto
              setAuto(next)
              if (next && !busyRef.current) spin()
            }}
          >
            {auto ? '■ Stop Auto' : '▶ Auto Spin'}
          </button>
          {win !== null && (
            <div className={'result-flash ' + (win >= 1 ? 'win' : 'lose')}>
              {win > 0 ? `${mult(win)} · +${money(bet * win - bet)}` : `No line · −${money(bet)}`}
            </div>
          )}
          <div className="panel tight" style={{ maxHeight: 220, overflow: 'auto' }}>
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>3-OF-A-KIND PAYS</div>
            {payTable.map((row) => (
              <StatRow key={row.name} k={`${row.icon} ${row.name}`} v={mult(row.m)} />
            ))}
          </div>
        </div>

        <div
          className="stage"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(160deg, ${a}22, ${b}11), var(--panel)`,
          }}
        >
          <div className="muted" style={{ marginBottom: 14 }}>{cfg.blurb}</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${REELS}, 1fr)`,
              gap: 12,
              background: '#0a0d15',
              padding: 14,
              borderRadius: 16,
              border: `1px solid ${a}55`,
              boxShadow: `0 0 40px ${a}33`,
              width: '100%',
              maxWidth: 460,
            }}
          >
            {Array.from({ length: REELS }).map((_, reel) => (
              <div
                key={reel}
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${VISIBLE}, 1fr)`,
                  gap: 8,
                  filter: spinning[reel] ? 'blur(1.2px)' : 'none',
                }}
              >
                {grid[reel].map((sym, row) => (
                  <div
                    key={row}
                    style={{
                      aspectRatio: '1',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 38,
                      borderRadius: 12,
                      background:
                        row === 1
                          ? `linear-gradient(180deg, ${a}33, ${b}22)`
                          : 'rgba(255,255,255,0.03)',
                      border: row === 1 ? `1px solid ${a}` : '1px solid transparent',
                      transition: 'transform 0.1s',
                    }}
                  >
                    {cfg.symbols[sym].icon}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
            Wins pay on the centre line · auto-balanced to {(TARGET_RTP * 100).toFixed(0)}% RTP
          </div>
        </div>
      </div>
    </GameShell>
  )
}
