import { useWallet, xpForLevel } from '../store/wallet'
import { money, compact } from '../lib/format'

const TIERS = [
  { name: 'Bronze', min: 1, icon: '🥉', color: '#c08457' },
  { name: 'Silver', min: 5, icon: '🥈', color: '#c0c8d6' },
  { name: 'Gold', min: 10, icon: '🥇', color: '#ffd15c' },
  { name: 'Platinum', min: 20, icon: '💠', color: '#23e0c8' },
  { name: 'Diamond', min: 35, icon: '💎', color: '#5cffe0' },
  { name: 'Obsidian', min: 60, icon: '⬛', color: '#b15cff' },
]

export default function VIP() {
  const { level, xp } = useWallet()
  const cur = [...TIERS].reverse().find((t) => level >= t.min) ?? TIERS[0]
  const next = TIERS.find((t) => t.min > level)
  const need = xpForLevel(level)
  const pct = Math.min(100, (xp / need) * 100)

  return (
    <div>
      <h1 className="page-title">💎 VIP Club</h1>
      <p className="page-sub">Wager play-money to climb levels and unlock tiers.</p>

      <div className="panel" style={{ marginBottom: 22 }}>
        <div className="flex between center wrap gap-m">
          <div className="flex center gap-m">
            <span style={{ fontSize: 54 }}>{cur.icon}</span>
            <div>
              <div className="muted">Current tier</div>
              <h2 style={{ margin: 0, color: cur.color }}>
                {cur.name} · Level {level}
              </h2>
            </div>
          </div>
          {next && (
            <div className="right">
              <div className="muted">Next tier</div>
              <h3 style={{ margin: 0 }}>
                {next.icon} {next.name} @ Lvl {next.min}
              </h3>
            </div>
          )}
        </div>
        <div style={{ marginTop: 18 }}>
          <div className="flex between" style={{ fontSize: 13, marginBottom: 6 }}>
            <span className="muted">Progress to Level {level + 1}</span>
            <span>
              {compact(xp)} / {compact(need)} XP
            </span>
          </div>
          <div style={{ height: 12, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,var(--brand),var(--brand-2))' }} />
          </div>
        </div>
      </div>

      <div className="grid wide">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className="panel"
            style={{
              borderTop: `3px solid ${t.color}`,
              opacity: level >= t.min ? 1 : 0.55,
              boxShadow: cur.name === t.name ? '0 0 0 2px ' + t.color : undefined,
            }}
          >
            <div style={{ fontSize: 40 }}>{t.icon}</div>
            <h3 style={{ margin: '8px 0 2px', color: t.color }}>{t.name}</h3>
            <div className="muted">Reach Level {t.min}</div>
            <div style={{ marginTop: 10, fontSize: 13 }}>
              {level >= t.min ? '✓ Unlocked' : `${t.min - level} levels to go`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
