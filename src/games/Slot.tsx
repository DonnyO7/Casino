import { useEffect, useMemo, useRef, useState } from 'react'
import { SlotConfig, TARGET_RTP } from '../data/slots'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'
import { sound } from '../lib/sound'
import { fireConfetti, screenFlash } from '../lib/confetti'
import { useAchievements } from '../store/achievements'
import {
  REELS,
  ROWS,
  WILD,
  SCATTER,
  FS_MULT,
  spinGrid,
  resolveBoard,
  freeSpinMult,
  getScale,
  payTable,
  buyBonusCost,
  Grid,
  BoardResult,
  FREE_SPINS_AWARD,
  MAX_FREE,
} from '../lib/slotEngine'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const key = (reel: number, row: number) => `${reel}-${row}`

export default function Slot({ cfg }: { cfg: SlotConfig }) {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [a, b] = cfg.accent.split(',')

  const allIcons = useMemo(() => [...cfg.symbols.map((s) => s.icon), WILD, SCATTER], [cfg])
  const randIcon = () => allIcons[(Math.random() * allIcons.length) | 0]

  const [scale, setScale] = useState<number | null>(null)
  const [grid, setGrid] = useState<Grid>(() => spinGrid(cfg))
  const [spinning, setSpinning] = useState<boolean[]>(Array(REELS).fill(false))
  const [highlight, setHighlight] = useState<Set<string>>(new Set())
  const [scatterHi, setScatterHi] = useState<Set<string>>(new Set())
  const [lastWin, setLastWin] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [auto, setAuto] = useState(false)

  // free spins
  const [mode, setMode] = useState<'base' | 'free'>('base')
  const [freeLeft, setFreeLeft] = useState(0)
  const [freeTotal, setFreeTotal] = useState(0)
  const [freeWin, setFreeWin] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)
  const [orbs, setOrbs] = useState<number[]>([])

  const busyRef = useRef(false)
  const autoRef = useRef(false)

  // calibrate RTP off the main paint
  useEffect(() => {
    setScale(null)
    const id = setTimeout(() => setScale(getScale(cfg)), 30)
    return () => clearTimeout(id)
  }, [cfg])

  const table = useMemo(() => (scale ? payTable(cfg, scale) : []), [cfg, scale])
  const bonusCost = useMemo(() => (scale ? buyBonusCost(cfg, scale) : 0), [cfg, scale])

  function runReelAnim(target: Grid): Promise<void> {
    return new Promise((resolve) => {
      setSpinning(Array(REELS).fill(true))
      for (let reel = 0; reel < REELS; reel++) {
        const iv = window.setInterval(() => {
          setGrid((g) => {
            const ng = g.map((c) => c.slice())
            ng[reel] = Array.from({ length: ROWS }, randIcon)
            return ng
          })
        }, 55)
        setTimeout(() => {
          clearInterval(iv)
          setGrid((g) => {
            const ng = g.map((c) => c.slice())
            ng[reel] = target[reel].slice()
            return ng
          })
          setSpinning((s) => {
            const ns = s.slice()
            ns[reel] = false
            return ns
          })
          sound.reel()
          if (reel === REELS - 1) resolve()
        }, 420 + reel * 170)
      }
    })
  }

  function applyHighlights(winCells: [number, number][], scatterCells: [number, number][]) {
    setHighlight(new Set(winCells.map(([r, ro]) => key(r, ro))))
    setScatterHi(new Set(scatterCells.map(([r, ro]) => key(r, ro))))
  }

  function clearHi() {
    setHighlight(new Set())
    setScatterHi(new Set())
  }

  // Plays a resolved board (animating tumbles for cascade slots), pays it, and
  // returns the board. `paid` is the total-bet multiplier credited.
  async function settleSpin(target: Grid, inFree: boolean): Promise<{ board: BoardResult; paid: number }> {
    setOrbs([])
    const board = resolveBoard(cfg, target)
    if (board.steps.length === 0) {
      applyHighlights([], board.scatterCells)
    } else {
      for (let i = 0; i < board.steps.length; i++) {
        const st = board.steps[i]
        setGrid(st.grid)
        applyHighlights(st.winCells, i === 0 ? board.scatterCells : [])
        if (i > 0) sound.coin()
        await sleep(540)
        if (cfg.tumble) {
          clearHi()
          const next = board.steps[i + 1]?.grid ?? board.finalGrid
          setGrid(next)
          await sleep(220)
        }
      }
    }
    const base = board.rawLine + board.rawScatter
    let freeMul = 1
    if (inFree) {
      const fm = freeSpinMult(cfg, base > 0)
      freeMul = fm.mult
      if (fm.orbs.length) {
        setOrbs(fm.orbs)
        sound.coin()
        if (base > 0) {
          screenFlash('rgba(255,209,92,0.4)')
          await sleep(700)
        }
      }
    }
    const paid = base * freeMul * (scale ?? 1)
    wallet.payout(cfg.name, bet, paid)
    setLastWin(paid)
    return { board, paid }
  }

  async function runFreeSpins(award: number) {
    useAchievements.getState().unlock('bonus')
    setMode('free')
    setFreeWin(0)
    setFreeTotal(award)
    setFreeLeft(award)
    setBanner(cfg.tumble ? `🌈 ${award} FREE SPINS — multiplier orbs active!` : `🌈 ${award} FREE SPINS — all wins ×${FS_MULT}!`)
    sound.jackpot()
    fireConfetti({ count: 200, power: 15 })
    screenFlash('rgba(255,209,92,0.45)')
    await sleep(1700)
    setBanner(null)

    let left = award
    let total = award
    let used = 0
    while (left > 0 && used < MAX_FREE) {
      left--
      used++
      setFreeLeft(left)
      const target = spinGrid(cfg)
      await runReelAnim(target)
      const { board, paid } = await settleSpin(target, true)
      setFreeWin((w) => w + bet * paid)
      if (board.freeSpinsAwarded > 0) {
        const add = board.freeSpinsAwarded
        left = Math.min(left + add, MAX_FREE - used)
        total += add
        setFreeTotal(total)
        setBanner(`🔁 RETRIGGER +${add} SPINS!`)
        sound.bigWin()
        fireConfetti({ count: 140, power: 13 })
        await sleep(1100)
        setBanner(null)
      }
      await sleep(450)
    }
    setOrbs([])
    setBanner(`✨ BONUS COMPLETE`)
    await sleep(1400)
    setBanner(null)
    setMode('base')
  }

  async function doSpin(buyBonus = false) {
    if (busyRef.current || scale === null) return
    const cost = buyBonus ? bonusCost * bet : bet
    if (!wallet.placeBet(cost)) {
      setAuto(false)
      autoRef.current = false
      return
    }
    busyRef.current = true
    setBusy(true)
    setLastWin(null)
    clearHi()

    if (buyBonus) {
      await runFreeSpins(FREE_SPINS_AWARD[3])
    } else {
      const target = spinGrid(cfg)
      await runReelAnim(target)
      const { board } = await settleSpin(target, false)
      if (board.freeSpinsAwarded > 0) {
        await sleep(500)
        await runFreeSpins(board.freeSpinsAwarded)
      }
    }

    busyRef.current = false
    setBusy(false)
    if (autoRef.current && wallet.balance >= bet) setTimeout(() => doSpin(), 650)
  }

  function toggleAuto() {
    const next = !auto
    setAuto(next)
    autoRef.current = next
    if (next && !busyRef.current) doSpin()
  }

  const calibrating = scale === null

  return (
    <GameShell name={cfg.name} emoji="🎰" rtp={`~${(TARGET_RTP * 100).toFixed(0)}%`}>
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <button className="btn green block lg" disabled={busy || bet <= 0 || calibrating} onClick={() => doSpin()}>
            {calibrating ? 'Calibrating fair RTP…' : busy && mode === 'base' ? 'Spinning…' : mode === 'free' ? 'Free Spins…' : 'Spin'}
          </button>
          <div className="flex gap-s">
            <button className={'btn ' + (auto ? 'gold' : 'ghost')} style={{ flex: 1 }} disabled={calibrating} onClick={toggleAuto}>
              {auto ? '■ Stop' : '▶ Auto'}
            </button>
            <button className="btn ghost" style={{ flex: 1.4 }} disabled={busy || calibrating} onClick={() => doSpin(true)} title="Fairly priced at the bonus's true EV">
              🌈 Buy Bonus
            </button>
          </div>
          {!calibrating && (
            <div className="muted" style={{ fontSize: 11, textAlign: 'center' }}>
              Buy {FREE_SPINS_AWARD[3]} free spins for {mult(bonusCost)} bet = {money(bonusCost * bet)}
            </div>
          )}
          {lastWin !== null && (
            <div className={'result-flash ' + (lastWin >= 1 ? 'win' : 'lose')}>
              {lastWin > 0 ? `${mult(lastWin)} · +${money(bet * lastWin - bet)}` : `No win · −${money(bet)}`}
            </div>
          )}
          <div className="panel tight" style={{ maxHeight: 240, overflow: 'auto' }}>
            <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>PAYTABLE (×bet per line · 3 / 4 / 5)</div>
            {table.map((row) => (
              <div key={row.name} className="stat-row">
                <span className="k">{row.icon} {row.name}</span>
                <span className="v" style={{ fontSize: 12 }}>
                  {row.x3.toFixed(2)} / {row.x4.toFixed(2)} / {row.x5.toFixed(2)}
                </span>
              </div>
            ))}
            <StatRow k={`${SCATTER} Scatter ×3+`} v="Free Spins" color="var(--gold)" />
          </div>
        </div>

        <div
          className="stage"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(160deg, ${a}22, ${b}11), var(--panel)`,
            position: 'relative',
          }}
        >
          {mode === 'free' && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 14,
                zIndex: 6,
                textAlign: 'right',
                background: 'rgba(10,13,21,0.7)',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--gold)',
              }}
            >
              <div style={{ color: 'var(--gold)', fontWeight: 800 }}>FREE SPINS ×{FS_MULT}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {freeLeft} / {freeTotal} left
              </div>
              <div style={{ color: 'var(--green)', fontWeight: 700 }}>+{money(freeWin)}</div>
            </div>
          )}

          {mode === 'free' && orbs.length > 0 && (
            <div
              className="rise"
              style={{
                position: 'absolute',
                bottom: 60,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                zIndex: 8,
                pointerEvents: 'none',
              }}
            >
              {orbs.map((v, i) => (
                <div
                  key={i}
                  className="pop"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#1a1304',
                    background: 'radial-gradient(circle at 35% 30%, #ffe9a8, #ff7a52)',
                    boxShadow: '0 0 22px rgba(255,122,82,0.8)',
                    border: '2px solid #fff',
                  }}
                >
                  {v}×
                </div>
              ))}
            </div>
          )}

          {banner && (
            <div
              className="rise"
              style={{
                position: 'absolute',
                top: '42%',
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 7,
                fontSize: 26,
                fontWeight: 800,
                color: 'var(--gold)',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              {banner}
            </div>
          )}

          <div className="muted" style={{ marginBottom: 12 }}>{cfg.blurb}</div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${REELS}, 1fr)`,
              gap: 8,
              background: '#0a0d15',
              padding: 12,
              borderRadius: 16,
              border: `1px solid ${a}55`,
              boxShadow: mode === 'free' ? `0 0 50px ${a}66` : `0 0 30px ${a}33`,
              width: '100%',
              maxWidth: 560,
            }}
          >
            {Array.from({ length: REELS }).map((_, reel) => (
              <div
                key={reel}
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  gap: 6,
                  filter: spinning[reel] ? 'blur(1.4px)' : 'none',
                }}
              >
                {grid[reel].map((sym, row) => {
                  const hi = highlight.has(key(reel, row))
                  const sc = scatterHi.has(key(reel, row))
                  return (
                    <div
                      key={row}
                      style={{
                        aspectRatio: '1',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 32,
                        borderRadius: 10,
                        background: sc
                          ? 'radial-gradient(circle,#ffe9a8,#ffb15c)'
                          : hi
                            ? `radial-gradient(circle, ${a}, ${b})`
                            : 'rgba(255,255,255,0.03)',
                        border: hi || sc ? `2px solid var(--gold)` : '1px solid transparent',
                        boxShadow: hi || sc ? '0 0 16px rgba(255,209,92,0.6)' : 'none',
                        transition: 'background .15s, box-shadow .15s',
                        transform: hi || sc ? 'scale(1.04)' : 'none',
                      }}
                    >
                      {sym}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
            20 paylines · {WILD} Wild · {SCATTER}×3 = Free Spins{cfg.tumble ? ' · ⬇️ Tumbling Reels' : ''} · ~{(TARGET_RTP * 100).toFixed(0)}% RTP
          </div>
        </div>
      </div>
    </GameShell>
  )
}
