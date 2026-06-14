import { useState } from 'react'
import { useSettings, THEMES } from '../store/settings'
import { useWallet } from '../store/wallet'
import { isMuted, setMuted, sound } from '../lib/sound'

export default function Settings() {
  const s = useSettings()
  const reset = useWallet((w) => w.reset)
  const [muted, setMutedState] = useState(isMuted())

  return (
    <div>
      <h1 className="page-title">⚙️ Settings</h1>
      <p className="page-sub">Tune the experience to your taste.</p>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>🔊 Audio</h3>
        <div className="flex between center" style={{ marginBottom: 16 }}>
          <span>Sound effects</span>
          <button
            className={'btn ' + (muted ? 'ghost' : 'green')}
            onClick={() => {
              const next = !muted
              setMuted(next)
              setMutedState(next)
              if (!next) sound.coin()
            }}
          >
            {muted ? 'Off' : 'On'}
          </button>
        </div>
        <div className="field">
          <label>Master Volume — {Math.round(s.volume * 100)}%</label>
          <input
            className="range"
            type="range"
            min={0}
            max={100}
            value={Math.round(s.volume * 100)}
            onChange={(e) => s.setVolume(parseInt(e.target.value) / 100)}
            onMouseUp={() => sound.coin()}
          />
        </div>
        <div className="flex between center" style={{ marginTop: 12 }}>
          <div>
            <div>Ambient music</div>
            <div className="muted" style={{ fontSize: 13 }}>A gentle generative background pad.</div>
          </div>
          <button className={'btn ' + (s.music ? 'green' : 'ghost')} onClick={() => s.setMusic(!s.music)}>
            {s.music ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>🎨 Accent Theme</h3>
        <div className="flex gap-s wrap">
          {Object.entries(THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => s.setAccent(key)}
              title={t.name}
              style={{
                width: 54,
                height: 54,
                borderRadius: 12,
                border: s.accent === key ? '3px solid #fff' : '1px solid var(--line)',
                background: `linear-gradient(135deg, ${t.a}, ${t.b})`,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>{THEMES[s.accent]?.name}</div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>✨ Visuals</h3>
        <div className="flex between center">
          <div>
            <div>Reduced motion</div>
            <div className="muted" style={{ fontSize: 13 }}>Turns off confetti, screen flashes and shakes.</div>
          </div>
          <button className={'btn ' + (s.reducedMotion ? 'green' : 'ghost')} onClick={() => s.setReducedMotion(!s.reducedMotion)}>
            {s.reducedMotion ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>🗑️ Account</h3>
        <div className="flex between center">
          <div>
            <div>Reset account</div>
            <div className="muted" style={{ fontSize: 13 }}>Back to 10,000 chips. Wipes stats, history and level.</div>
          </div>
          <button
            className="btn red"
            onClick={() => {
              if (confirm('Reset your account to 10,000 chips? This wipes everything.')) reset()
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
