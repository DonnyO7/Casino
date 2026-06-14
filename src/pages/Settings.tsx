import { useState } from 'react'
import { useSettings } from '../store/settings'
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
