import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useWallet } from '../store/wallet'
import { money } from '../lib/format'
import { isMuted, toggleMuted, onMuteChange, sound } from '../lib/sound'

export default function Topbar() {
  const balance = useWallet((s) => s.balance)
  const deposit = useWallet((s) => s.deposit)
  const nav = useNavigate()
  const [muted, setMutedState] = useState(isMuted())
  useEffect(() => onMuteChange(setMutedState), [])

  return (
    <header className="topbar">
      <button className="btn ghost" style={{ padding: '8px 10px' }} onClick={() => nav('/casino')}>
        🎰
      </button>
      <div className="search">
        <input
          placeholder="Search games…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') nav('/casino?q=' + encodeURIComponent((e.target as HTMLInputElement).value))
          }}
        />
      </div>
      <div style={{ flex: 1 }} />
      <div className="balance-pill">
        <span className="cur">🪙</span>
        <span className="amt">{money(balance)}</span>
        <button className="btn green" style={{ padding: '8px 14px' }} onClick={() => nav('/wallet')}>
          Wallet
        </button>
      </div>
      <button
        className="btn ghost"
        title="Quick top-up +1000"
        style={{ padding: '9px 12px' }}
        onClick={() => {
          deposit(1000)
          sound.bet()
        }}
      >
        ＋
      </button>
      <button
        className="btn ghost"
        title={muted ? 'Unmute' : 'Mute'}
        style={{ padding: '9px 12px' }}
        onClick={() => {
          toggleMuted()
          if (isMuted() === false) sound.click()
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </header>
  )
}
