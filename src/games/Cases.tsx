import { useMemo, useRef, useState } from 'react'
import { rand, randInt } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

interface RawItem {
  m: number
  w: number
  icon: string
  color: string
}

const CASES: Record<string, { label: string; accent: string; items: RawItem[] }> = {
  Bronze: {
    label: 'Bronze Case',
    accent: '#c08457',
    items: [
      { m: 0, w: 20, icon: '🥉', color: '#5d6678' },
      { m: 0.7, w: 26, icon: '🪙', color: '#8a93a8' },
      { m: 1.3, w: 26, icon: '💵', color: '#5c8aff' },
      { m: 2.2, w: 18, icon: '💍', color: '#23e0c8' },
      { m: 4, w: 8, icon: '💎', color: '#7c5cff' },
      { m: 10, w: 2, icon: '👑', color: '#ffd15c' },
    ],
  },
  Gold: {
    label: 'Gold Case',
    accent: '#ffd15c',
    items: [
      { m: 0, w: 26, icon: '🥈', color: '#5d6678' },
      { m: 0.5, w: 24, icon: '🪙', color: '#8a93a8' },
      { m: 1.4, w: 20, icon: '💵', color: '#5c8aff' },
      { m: 3, w: 16, icon: '💍', color: '#23e0c8' },
      { m: 9, w: 9, icon: '💎', color: '#7c5cff' },
      { m: 35, w: 4, icon: '👑', color: '#ffd15c' },
      { m: 150, w: 1, icon: '🏆', color: '#ff5c8a' },
    ],
  },
  Diamond: {
    label: 'Diamond Case',
    accent: '#5cffe0',
    items: [
      { m: 0, w: 34, icon: '🧊', color: '#5d6678' },
      { m: 0.4, w: 22, icon: '🪙', color: '#8a93a8' },
      { m: 1.5, w: 18, icon: '💵', color: '#5c8aff' },
      { m: 4, w: 14, icon: '💍', color: '#23e0c8' },
      { m: 15, w: 8, icon: '💎', color: '#7c5cff' },
      { m: 75, w: 3, icon: '👑', color: '#ffd15c' },
      { m: 500, w: 1, icon: '🌟', color: '#ff5c8a' },
    ],
  },
}

const ITEM_W = 104 // px incl. margins

function normalize(items: RawItem[]) {
  const W = items.reduce((s, i) => s + i.w, 0)
  const ev = items.reduce((s, i) => s + (i.w / W) * i.m, 0)
  const scale = 1 / ev
  return items.map((i) => ({ ...i, mult: Math.round(i.m * scale * 100) / 100, p: i.w / W }))
}

export default function Cases() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [type, setType] = useState<'Bronze' | 'Gold' | 'Diamond'>('Gold')
  const [strip, setStrip] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => normalize(CASES[type].items), [type])

  function pickIndex() {
    let r = rand()
    for (let i = 0; i < items.length; i++) if ((r -= items[i].p) < 0) return i
    return items.length - 1
  }

  function open() {
    if (spinning) return
    if (!wallet.placeBet(bet)) return
    setSpinning(true)
    setResult(null)
    const winIdx = pickIndex()
    const len = 60
    const winPos = 52
    const s = Array.from({ length: len }, (_, i) => (i === winPos ? winIdx : randInt(0, items.length - 1)))
    setStrip(s)

    // reset then animate
    setOffset(0)
    requestAnimationFrame(() => {
      const cw = trackRef.current?.clientWidth ?? 600
      const jitter = (rand() - 0.5) * (ITEM_W * 0.5)
      const target = winPos * ITEM_W + ITEM_W / 2 - cw / 2 + jitter
      requestAnimationFrame(() => setOffset(target))
    })

    setTimeout(() => {
      wallet.payout(CASES[type].label, bet, items[winIdx].mult)
      setResult(winIdx)
      setSpinning(false)
    }, 5200)
  }

  const accent = CASES[type].accent

  return (
    <GameShell name="Mystery Cases" emoji="📦" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={spinning} />
          <div className="field">
            <label>Case</label>
            <div className="toggle">
              {(['Bronze', 'Gold', 'Diamond'] as const).map((c) => (
                <button key={c} className={type === c ? 'on' : ''} disabled={spinning} onClick={() => setType(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="panel tight" style={{ maxHeight: 200, overflow: 'auto' }}>
            {items.slice().sort((a, b) => b.mult - a.mult).map((it) => (
              <StatRow
                key={it.icon}
                k={`${it.icon} ${(it.p * 100).toFixed(1)}%`}
                v={mult(it.mult)}
                color={result !== null && items[result].icon === it.icon ? 'var(--green)' : undefined}
              />
            ))}
          </div>
          <button className="btn green block lg" disabled={spinning || bet <= 0} onClick={open}>
            {spinning ? 'Opening…' : `Open ${CASES[type].label}`}
          </button>
          {result !== null && (
            <div className={'result-flash ' + (items[result].mult >= 1 ? 'win' : 'lose')}>
              {items[result].icon} {mult(items[result].mult)} ·{' '}
              {items[result].mult >= 1 ? `+${money(bet * items[result].mult - bet)}` : `−${money(bet)}`}
            </div>
          )}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 620 }}>
            {/* center pointer */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: -8,
                bottom: -8,
                width: 3,
                background: accent,
                transform: 'translateX(-50%)',
                zIndex: 4,
                boxShadow: `0 0 14px ${accent}`,
              }}
            />
            <div
              ref={trackRef}
              style={{
                overflow: 'hidden',
                borderRadius: 14,
                border: `1px solid ${accent}55`,
                background: '#0a0d15',
                padding: '14px 0',
                boxShadow: `inset 0 0 40px ${accent}22`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  transform: `translateX(${-offset}px)`,
                  transition: spinning ? 'transform 5s cubic-bezier(0.12,0.7,0.12,1)' : 'none',
                }}
              >
                {(strip.length ? strip : Array.from({ length: 12 }, (_, i) => i % items.length)).map((idx, i) => {
                  const it = items[idx]
                  return (
                    <div
                      key={i}
                      style={{
                        width: ITEM_W - 12,
                        margin: '0 6px',
                        flexShrink: 0,
                        height: 110,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        background: `linear-gradient(180deg, ${it.color}33, ${it.color}11)`,
                        border: `1px solid ${it.color}66`,
                      }}
                    >
                      <div style={{ fontSize: 40 }}>{it.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: it.color }}>{mult(it.mult)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="muted" style={{ marginTop: 16, fontSize: 12 }}>
            Drop rates shown left · auto-balanced to 100% RTP (zero edge)
          </div>
        </div>
      </div>
    </GameShell>
  )
}
