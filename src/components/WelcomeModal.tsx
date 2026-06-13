import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fireConfetti } from '../lib/confetti'
import { sound } from '../lib/sound'

const KEY = 'nova-welcomed'

export default function WelcomeModal() {
  const [open, setOpen] = useState(() => !localStorage.getItem(KEY))
  const nav = useNavigate()
  if (!open) return null

  function close(go?: string) {
    localStorage.setItem(KEY, '1')
    setOpen(false)
    sound.coin()
    fireConfetti({ count: 160, power: 14, originY: 0.3 })
    if (go) nav(go)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(6,8,14,0.78)',
        backdropFilter: 'blur(6px)',
        padding: 20,
      }}
    >
      <div
        className="rise"
        style={{
          maxWidth: 460,
          width: '100%',
          background: 'linear-gradient(150deg,#1b1640,#0c1b2e 60%,#0b2a2a)',
          border: '1px solid rgba(124,92,255,0.4)',
          borderRadius: 20,
          padding: 30,
          textAlign: 'center',
          boxShadow: '0 30px 90px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 56 }} className="float">🎰</div>
        <h1 style={{ margin: '6px 0 4px', fontSize: 30 }}>
          Welcome to <span className="grad-text">NOVA</span> Casino
        </h1>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
          A casino with <strong style={{ color: 'var(--text)' }}>zero house edge</strong> — every original
          game pays the true odds. Play-money only, just for the fun of seeing what a fair casino feels like.
        </p>
        <div
          className="panel"
          style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', margin: '16px 0', background: 'rgba(47,212,122,0.08)', border: '1px solid rgba(47,212,122,0.3)' }}
        >
          <span style={{ fontSize: 28 }}>🪙</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>10,000 free chips</span>
          <span className="muted">to start</span>
        </div>
        <div className="flex gap-s" style={{ marginTop: 8 }}>
          <button className="btn primary lg" style={{ flex: 1 }} onClick={() => close('/casino')}>
            🎲 Start Playing
          </button>
          <button className="btn ghost lg" onClick={() => close('/fairness')}>
            How it's fair
          </button>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 14 }}>18+ · Entertainment only · No real currency</div>
      </div>
    </div>
  )
}
