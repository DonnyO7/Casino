import { useState } from 'react'
import { useWallet } from '../store/wallet'
import { money } from '../lib/format'
import DailyWheel from '../components/DailyWheel'

const DAILY_KEY = 'nova-daily-claim'

export default function Promotions() {
  const deposit = useWallet((s) => s.deposit)
  const [claimedToday, setClaimedToday] = useState(() => localStorage.getItem(DAILY_KEY) === new Date().toDateString())
  const [toast, setToast] = useState<string | null>(null)

  function claimDaily() {
    if (claimedToday) return
    const amt = 2500
    deposit(amt)
    localStorage.setItem(DAILY_KEY, new Date().toDateString())
    setClaimedToday(true)
    setToast(`Claimed ${money(amt)} daily bonus!`)
  }

  function claim(amt: number, label: string) {
    deposit(amt)
    setToast(`${label}: +${money(amt)} added!`)
  }

  const promos = [
    { icon: '🎁', name: 'Welcome Reload', desc: 'Top up your play balance instantly.', amt: 5000, accent: '#7c5cff,#23e0c8' },
    { icon: '🔁', name: 'Rakeback Boost', desc: 'A little something back on your wagering.', amt: 1500, accent: '#23e0c8,#5cffb1' },
    { icon: '🎰', name: 'Slots Free Spins', desc: 'Fuel for the reels — go chase a jackpot.', amt: 1000, accent: '#ff5c8a,#b15cff' },
    { icon: '🏆', name: 'Weekend Race', desc: 'Stake-up chips for the leaderboard race.', amt: 3000, accent: '#ffd15c,#ff7a52' },
  ]

  return (
    <div>
      <h1 className="page-title">🎁 Promotions</h1>
      <p className="page-sub">Free play-money bonuses — grab some chips and keep spinning.</p>

      {toast && <div className="fair-banner" style={{ marginBottom: 16 }}>✅ {toast}</div>}

      <div style={{ marginBottom: 22 }}>
        <DailyWheel />
      </div>

      <div className="panel" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, background: 'linear-gradient(120deg,#1b1640,#0c2030)' }}>
        <div>
          <div className="flex center gap-s">
            <span style={{ fontSize: 34 }}>📅</span>
            <div>
              <h2 style={{ margin: 0 }}>Daily Bonus</h2>
              <div className="muted">Come back every day for {money(2500)} free chips.</div>
            </div>
          </div>
        </div>
        <button className="btn gold lg" disabled={claimedToday} onClick={claimDaily}>
          {claimedToday ? 'Claimed today ✓' : 'Claim 2,500 🪙'}
        </button>
      </div>

      <div className="grid wide">
        {promos.map((p) => {
          const [a, b] = p.accent.split(',')
          return (
            <div key={p.name} className="panel" style={{ borderTop: `3px solid ${a}` }}>
              <div style={{ fontSize: 40 }}>{p.icon}</div>
              <h3 style={{ margin: '10px 0 4px' }}>{p.name}</h3>
              <p className="muted" style={{ marginTop: 0, fontSize: 14, minHeight: 40 }}>{p.desc}</p>
              <button
                className="btn block"
                style={{ background: `linear-gradient(90deg, ${a}, ${b})`, border: 'none' }}
                onClick={() => claim(p.amt, p.name)}
              >
                Claim {money(p.amt)} 🪙
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
