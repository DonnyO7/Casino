import { useState } from 'react'
import { rand, randInt, shuffle } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

// Prize tiers. Conditional weights average to 3.75, so a win probability of
// 1/3.75 makes the expected value exactly 1 (zero edge). The 3×3 grid is
// cosmetic — the outcome is decided fairly up-front, like a real scratch card.
const TIERS = [
  { m: 0.5, icon: '🍒', w: 0.6 },
  { m: 1, icon: '🔔', w: 0.2 },
  { m: 2, icon: '⭐', w: 0.1 },
  { m: 5, icon: '💰', w: 0.06 },
  { m: 25, icon: '💎', w: 0.03 },
  { m: 200, icon: '👑', w: 0.01 },
]
const AVG = TIERS.reduce((a, t) => a + t.m * t.w, 0) // 3.75
const WIN_PROB = 1 / AVG

function pickTier() {
  let r = rand()
  for (const t of TIERS) {
    if ((r -= t.w) < 0) return t
  }
  return TIERS[0]
}

function buildGrid(winTier: (typeof TIERS)[number] | null): number[] {
  // values are indices into TIERS
  const counts = [0, 0, 0, 0, 0, 0]
  const cells: number[] = []
  if (winTier) {
    const wi = TIERS.indexOf(winTier)
    cells.push(wi, wi, wi)
    counts[wi] = 3
  }
  while (cells.length < 9) {
    const i = randInt(0, TIERS.length - 1)
    if (counts[i] >= 2) continue // never create a second triple
    counts[i]++
    cells.push(i)
  }
  return shuffle(cells)
}

export default function Scratch() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [grid, setGrid] = useState<number[]>([])
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false))
  const [winTier, setWinTier] = useState<number | null>(null)
  const [active, setActive] = useState(false)
  const [settled, setSettled] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  function buy() {
    if (!wallet.placeBet(bet)) return
    const win = rand() < WIN_PROB
    const tier = win ? pickTier() : null
    setGrid(buildGrid(tier))
    setRevealed(Array(9).fill(false))
    setWinTier(tier ? TIERS.indexOf(tier) : null)
    setActive(true)
    setSettled(false)
    setMsg(null)
  }

  function reveal(i: number) {
    if (!active || revealed[i]) return
    const next = revealed.slice()
    next[i] = true
    setRevealed(next)
    if (next.every(Boolean)) settle()
  }

  function scratchAll() {
    if (!active) return
    setRevealed(Array(9).fill(true))
    settle()
  }

  function settle() {
    if (settled) return
    setSettled(true)
    setActive(false)
    const m = winTier !== null ? TIERS[winTier].m : 0
    wallet.payout('Scratch Cards', bet, m)
    setMsg(m > 0 ? `Matched 3× ${TIERS[winTier!].icon} — ${mult(m)} · ${m >= 1 ? '+' : ''}${money(bet * m - bet)}` : `No match — −${money(bet)}`)
  }

  return (
    <GameShell name="Scratch Cards" emoji="🎟️" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={active} />
          <div className="panel tight">
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>MATCH 3 TO WIN</div>
            {TIERS.slice().reverse().map((t) => (
              <StatRow key={t.m} k={`${t.icon} ${t.icon} ${t.icon}`} v={mult(t.m)} color={winTier !== null && TIERS[winTier].m === t.m && settled ? 'var(--green)' : undefined} />
            ))}
          </div>
          {active ? (
            <button className="btn gold block lg" onClick={scratchAll}>
              Scratch All
            </button>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={buy}>
              Buy Ticket {money(bet)}
            </button>
          )}
          {msg && <div className={'result-flash ' + (msg.includes('+') ? 'win' : 'lose')}>{msg}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%', maxWidth: 360 }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const show = revealed[i]
              const tierIdx = grid[i]
              const isWinCell = settled && winTier !== null && tierIdx === winTier
              return (
                <button
                  key={i}
                  onClick={() => reveal(i)}
                  disabled={!active || show}
                  className={show ? 'pop' : ''}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 14,
                    border: '1px solid var(--line)',
                    fontSize: 40,
                    cursor: active && !show ? 'pointer' : 'default',
                    background: show
                      ? isWinCell
                        ? 'radial-gradient(circle at 40% 30%,#5cffb1,#149e57)'
                        : 'var(--panel-2)'
                      : 'repeating-linear-gradient(45deg,#c0c8d6,#c0c8d6 8px,#aab2c4 8px,#aab2c4 16px)',
                    color: show ? '#fff' : 'transparent',
                  }}
                >
                  {show && grid.length ? TIERS[tierIdx].icon : '🪙'}
                </button>
              )
            })}
          </div>
          {!active && !settled && <div className="muted" style={{ marginTop: 18 }}>Buy a ticket and scratch the panels!</div>}
          {active && <div className="muted" style={{ marginTop: 18 }}>Tap panels to scratch ✨</div>}
        </div>
      </div>
    </GameShell>
  )
}
