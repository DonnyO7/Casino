import { ACHIEVEMENTS, useAchievements } from '../store/achievements'

export default function Achievements() {
  const unlocked = useAchievements((s) => s.unlocked)
  const count = Object.keys(unlocked).length
  const totalXp = ACHIEVEMENTS.filter((a) => unlocked[a.id]).reduce((s, a) => s + a.xp, 0)
  const pct = Math.round((count / ACHIEVEMENTS.length) * 100)

  return (
    <div>
      <h1 className="page-title">🏅 Achievements</h1>
      <p className="page-sub">
        {count} / {ACHIEVEMENTS.length} unlocked · {totalXp.toLocaleString()} bonus XP earned
      </p>

      <div className="panel" style={{ marginBottom: 22 }}>
        <div className="flex between" style={{ fontSize: 13, marginBottom: 6 }}>
          <span className="muted">Completion</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 12, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,var(--gold),#ffb15c)' }} />
        </div>
      </div>

      <div className="grid wide">
        {ACHIEVEMENTS.map((a) => {
          const got = !!unlocked[a.id]
          return (
            <div
              key={a.id}
              className="panel"
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                opacity: got ? 1 : 0.5,
                borderColor: got ? 'rgba(255,209,92,0.5)' : undefined,
                boxShadow: got ? '0 0 0 1px rgba(255,209,92,0.3)' : undefined,
              }}
            >
              <span style={{ fontSize: 38, filter: got ? 'none' : 'grayscale(1)' }}>{got ? a.icon : '🔒'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{a.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>{a.desc}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, marginTop: 2 }}>+{a.xp} XP</div>
              </div>
              {got && <span className="chip new">DONE</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
