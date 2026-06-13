import { useState } from 'react'
import { shuffle } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const ROWS = 9

const DIFFS = {
  Easy: { tiles: 4, eggs: 1 },
  Medium: { tiles: 3, eggs: 1 },
  Hard: { tiles: 2, eggs: 1 },
  Expert: { tiles: 3, eggs: 2 },
  Master: { tiles: 4, eggs: 3 },
} as const

type Diff = keyof typeof DIFFS

export default function Tower() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [diff, setDiff] = useState<Diff>('Medium')
  const [eggs, setEggs] = useState<number[][]>([]) // egg column indices per row
  const [picked, setPicked] = useState<(number | null)[]>([])
  const [activeRow, setActiveRow] = useState(-1) // -1 = not playing; counts from bottom (ROWS-1) up
  const [dead, setDead] = useState(false)

  const cfg = DIFFS[diff]
  const perRow = cfg.tiles / (cfg.tiles - cfg.eggs) // fair multiplier per row
  const rowsClimbed = activeRow >= 0 ? ROWS - 1 - activeRow : picked.filter((p) => p !== null).length
  const curMult = Math.pow(perRow, rowsClimbed)
  const playing = activeRow >= 0 && !dead

  function start() {
    if (!wallet.placeBet(bet)) return
    const e = Array.from({ length: ROWS }, () =>
      shuffle(Array.from({ length: cfg.tiles }, (_, i) => i)).slice(0, cfg.eggs),
    )
    setEggs(e)
    setPicked(Array(ROWS).fill(null))
    setActiveRow(ROWS - 1)
    setDead(false)
  }

  function clickTile(row: number, col: number) {
    if (!playing || row !== activeRow) return
    const np = picked.slice()
    np[row] = col
    setPicked(np)
    if (eggs[row].includes(col)) {
      setDead(true)
      setActiveRow(-1)
      wallet.payout('Dragon Tower', bet, 0)
      return
    }
    if (row === 0) {
      // reached the top
      const total = Math.pow(perRow, ROWS)
      wallet.payout('Dragon Tower', bet, total)
      setActiveRow(-2) // won
      return
    }
    setActiveRow(row - 1)
  }

  function cashout() {
    if (!playing || rowsClimbed === 0) return
    wallet.payout('Dragon Tower', bet, curMult)
    setActiveRow(-2)
  }

  return (
    <GameShell name="Dragon Tower" emoji="🐉" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={playing} />
          <div className="field">
            <label>Difficulty</label>
            <div className="toggle" style={{ flexWrap: 'wrap' }}>
              {(Object.keys(DIFFS) as Diff[]).map((d) => (
                <button key={d} className={diff === d ? 'on' : ''} disabled={playing} onClick={() => setDiff(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <StatRow k="Per-row multiplier" v={mult(perRow)} />
            <StatRow k="Rows climbed" v={`${rowsClimbed} / ${ROWS}`} />
            <StatRow k="Current multiplier" v={mult(curMult)} color="var(--gold)" />
          </div>
          {playing ? (
            <button className="btn gold block lg" disabled={rowsClimbed === 0} onClick={cashout}>
              Cash Out {money(bet * curMult)}
            </button>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={start}>
              Start Climb
            </button>
          )}
          {dead && <div className="result-flash lose">🔥 The dragon got you.</div>}
          {activeRow === -2 && !dead && <div className="result-flash win">Cashed out · +{money(bet * curMult - bet)}</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 460 }}>
            {Array.from({ length: ROWS }).map((_, row) => {
              const isActive = row === activeRow
              const revealed = picked[row] !== null || activeRow < 0
              const rowMult = Math.pow(perRow, ROWS - row)
              return (
                <div key={row} className="flex center gap-s">
                  <div className="muted mono" style={{ width: 54, fontSize: 12 }}>{mult(rowMult)}</div>
                  <div className="flex" style={{ gap: 8, flex: 1 }}>
                    {Array.from({ length: cfg.tiles }).map((__, col) => {
                      const isEgg = eggs[row]?.includes(col)
                      const chosen = picked[row] === col
                      const showEgg = (revealed && isEgg) || (dead && isEgg)
                      const showGem = revealed && !isEgg && (chosen || activeRow < 0)
                      return (
                        <button
                          key={col}
                          onClick={() => clickTile(row, col)}
                          disabled={!isActive}
                          style={{
                            flex: 1,
                            height: 40,
                            borderRadius: 9,
                            border: '1px solid var(--line)',
                            fontSize: 20,
                            background: chosen && !isEgg
                              ? 'radial-gradient(circle,#5cffb1,#149e57)'
                              : showEgg
                                ? 'radial-gradient(circle,#ff8a9e,#b51f3a)'
                                : isActive
                                  ? 'linear-gradient(180deg,var(--panel-3),var(--panel-2))'
                                  : 'var(--panel-2)',
                            opacity: !isActive && activeRow >= 0 && row < activeRow ? 0.5 : 1,
                            boxShadow: isActive ? '0 0 0 1px var(--brand)' : 'none',
                            cursor: isActive ? 'pointer' : 'default',
                          }}
                        >
                          {showEgg ? '🥚' : showGem ? '💎' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </GameShell>
  )
}
