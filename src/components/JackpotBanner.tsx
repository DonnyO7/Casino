import { useEffect } from 'react'
import { useJackpot } from '../store/jackpot'
import { useCountUp } from '../lib/useCountUp'
import { money } from '../lib/format'

export default function JackpotBanner() {
  const amount = useJackpot((s) => s.amount)
  const tick = useJackpot((s) => s.tick)
  const shown = useCountUp(amount, 900)

  useEffect(() => {
    const iv = setInterval(tick, 1500)
    return () => clearInterval(iv)
  }, [tick])

  return (
    <div
      className="panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        background: 'linear-gradient(120deg,#2a1640,#101f3a 60%,#0b2a2a)',
        backgroundSize: '300% 300%',
        animation: 'gradientShift 12s ease infinite',
        border: '1px solid rgba(255,209,92,0.4)',
      }}
    >
      <div className="flex center gap-m">
        <span style={{ fontSize: 42 }} className="float">💰</span>
        <div>
          <div className="muted" style={{ fontSize: 12, letterSpacing: 1, fontWeight: 700 }}>PROGRESSIVE JACKPOT</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 24px rgba(255,209,92,0.4)' }}>
            {money(shown)} 🪙
          </div>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 13, maxWidth: 280 }}>
        Drops randomly to a lucky player on any bet. House-funded — it never touches your odds.
      </div>
    </div>
  )
}
