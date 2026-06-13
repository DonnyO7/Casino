import { useFeed } from '../store/feed'
import { money, mult } from '../lib/format'

export default function Toaster() {
  const toasts = useFeed((s) => s.toasts)
  const dismiss = useFeed((s) => s.dismiss)
  return (
    <div
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pop"
          onClick={() => dismiss(t.id)}
          style={{
            pointerEvents: 'auto',
            cursor: 'pointer',
            minWidth: 230,
            background: 'linear-gradient(120deg,#1b1640,#0c2030)',
            border: '1px solid rgba(124,92,255,0.5)',
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex between center" style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 800 }}>{t.multiplier >= 10 ? '🔥 BIG WIN' : '🎉 Win'}</span>
            <span className="chip live">{mult(t.multiplier)}</span>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            {t.game} · <span style={{ color: 'var(--green)', fontWeight: 700 }}>+{money(t.profit)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
