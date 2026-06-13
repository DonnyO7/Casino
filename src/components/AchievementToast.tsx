import { useEffect, useState } from 'react'
import { useAchievements } from '../store/achievements'
import { fireConfetti } from '../lib/confetti'
import { sound } from '../lib/sound'

export default function AchievementToast() {
  const recent = useAchievements((s) => s.recent)
  const clear = useAchievements((s) => s.clearRecent)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!recent) return
    setShow(true)
    sound.cashout()
    fireConfetti({ count: 80, power: 11, originY: 0.25 })
    const t = setTimeout(() => setShow(false), 3600)
    const t2 = setTimeout(() => clear(), 4000)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [recent, clear])

  if (!recent || !show) return null
  return (
    <div
      className="rise"
      style={{
        position: 'fixed',
        top: 74,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'linear-gradient(120deg,#1b1640,#0c2030)',
        border: '1px solid var(--gold)',
        borderRadius: 14,
        padding: '14px 22px',
        boxShadow: '0 16px 50px rgba(0,0,0,0.55)',
      }}
    >
      <span style={{ fontSize: 40 }}>{recent.icon}</span>
      <div>
        <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>ACHIEVEMENT UNLOCKED</div>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{recent.name}</div>
        <div className="muted" style={{ fontSize: 12 }}>
          {recent.desc} · +{recent.xp} XP
        </div>
      </div>
    </div>
  )
}
