import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { money } from '../lib/format'
import { useWallet } from '../store/wallet'

export function GameShell({
  name,
  emoji,
  rtp,
  children,
}: {
  name: string
  emoji: string
  rtp?: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="flex between center" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div className="flex center gap-m">
          <Link to="/casino" className="btn ghost" style={{ padding: '8px 12px' }}>
            ← Lobby
          </Link>
          <h1 className="page-title" style={{ margin: 0, fontSize: 24 }}>
            <span style={{ marginRight: 8 }}>{emoji}</span>
            {name}
          </h1>
        </div>
        <Link to="/fairness" className="fair-banner" style={{ textDecoration: 'none' }} title="How fairness works">
          🛡️ Provably fair · No house edge{rtp ? ` · RTP ${rtp}` : ''} ›
        </Link>
      </div>
      {children}
    </div>
  )
}

/** Amount input with quick-adjust buttons. */
export function BetAmount({
  bet,
  setBet,
  disabled,
}: {
  bet: number
  setBet: (n: number) => void
  disabled?: boolean
}) {
  const balance = useWallet((s) => s.balance)
  const safe = (n: number) => setBet(Math.max(0, Math.round(n * 100) / 100))
  return (
    <div className="field">
      <label>Bet Amount</label>
      <div className="input-group">
        <input
          type="number"
          value={Number.isFinite(bet) ? bet : 0}
          min={0}
          disabled={disabled}
          onChange={(e) => safe(parseFloat(e.target.value) || 0)}
        />
        <div className="adorn">
          <button className="mini" disabled={disabled} onClick={() => safe(bet / 2)}>
            ½
          </button>
          <button className="mini" disabled={disabled} onClick={() => safe(bet * 2)}>
            2×
          </button>
          <button className="mini" disabled={disabled} onClick={() => safe(balance)}>
            MAX
          </button>
        </div>
      </div>
      <div className="flex gap-s" style={{ marginTop: 8 }}>
        {[1, 10, 100, 1000].map((q) => (
          <button
            key={q}
            className="btn ghost"
            style={{ padding: '6px 10px', fontSize: 12, flex: 1 }}
            disabled={disabled}
            onClick={() => safe(q)}
          >
            {money(q)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function StatRow({ k, v, color }: { k: string; v: ReactNode; color?: string }) {
  return (
    <div className="stat-row">
      <span className="k">{k}</span>
      <span className="v" style={color ? { color } : undefined}>
        {v}
      </span>
    </div>
  )
}
