import { useMemo } from 'react'
import { BetRecord } from '../store/wallet'
import { money } from '../lib/format'

export default function ProfitChart({ history }: { history: BetRecord[] }) {
  const { path, area, pts, min, max, last } = useMemo(() => {
    const chrono = [...history].reverse().slice(-80)
    let cum = 0
    const series = chrono.map((h) => (cum += h.profit))
    if (series.length === 0) return { path: '', area: '', pts: [] as number[], min: 0, max: 0, last: 0 }
    const min = Math.min(0, ...series)
    const max = Math.max(0, ...series)
    const W = 600
    const H = 180
    const span = max - min || 1
    const x = (i: number) => (series.length === 1 ? 0 : (i / (series.length - 1)) * W)
    const y = (v: number) => H - ((v - min) / span) * H
    const path = series.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
    const area = `${path} L${W},${H} L0,${H} Z`
    return { path, area, pts: series, min, max, last: series[series.length - 1] }
  }, [history])

  if (pts.length === 0) {
    return <div className="muted" style={{ padding: 30, textAlign: 'center' }}>Play a few rounds to see your profit curve.</div>
  }

  const up = last >= 0
  const stroke = up ? 'var(--green)' : 'var(--red)'
  const zeroY = (() => {
    const span = max - min || 1
    return 180 - ((0 - min) / span) * 180
  })()

  return (
    <div>
      <div className="flex between center" style={{ marginBottom: 10 }}>
        <span className="muted" style={{ fontSize: 13 }}>Cumulative profit · last {pts.length} bets</span>
        <span style={{ fontWeight: 800, color: stroke }}>{last >= 0 ? '+' : ''}{money(last)}</span>
      </div>
      <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width: '100%', height: 180, display: 'block' }}>
        <defs>
          <linearGradient id="pc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={stroke} stopOpacity="0.35" />
            <stop offset="1" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1={zeroY} x2="600" y2={zeroY} stroke="var(--line)" strokeDasharray="4 4" />
        <path d={area} fill="url(#pc)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}
