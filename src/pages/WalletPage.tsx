import { useWallet } from '../store/wallet'
import { money } from '../lib/format'

export default function WalletPage() {
  const w = useWallet()
  return (
    <div>
      <h1 className="page-title">👛 Wallet</h1>
      <p className="page-sub">Play-money only — top up freely, it isn't real currency.</p>

      <div className="panel" style={{ marginBottom: 20, background: 'linear-gradient(120deg,#11203a,#0c1b2e)' }}>
        <div className="muted">Balance</div>
        <div style={{ fontSize: 42, fontWeight: 800 }}>{money(w.balance)} 🪙</div>
        <div className="flex gap-s wrap" style={{ marginTop: 16 }}>
          {[100, 500, 1000, 5000, 25000].map((amt) => (
            <button key={amt} className="btn green" onClick={() => w.deposit(amt)}>
              + {money(amt)}
            </button>
          ))}
          <button className="btn red" onClick={() => { if (confirm('Reset your entire account to 10,000 chips? This wipes your stats and history.')) w.reset() }}>
            Reset account
          </button>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 22 }}>
        <div className="stat-card"><div className="label">Total Wagered</div><div className="num">{money(w.totalWagered)}</div></div>
        <div className="stat-card"><div className="label">Total Won</div><div className="num">{money(w.totalWon)}</div></div>
        <div className="stat-card"><div className="label">Bets Placed</div><div className="num">{w.totalBets}</div></div>
        <div className="stat-card"><div className="label">Biggest Win</div><div className="num">{money(w.biggestWin)}</div></div>
      </div>

      <div className="section-head"><h2>Recent bets</h2></div>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Game</th><th className="right">Bet</th><th className="right">Mult</th><th className="right">Payout</th><th className="right">Profit</th></tr>
          </thead>
          <tbody>
            {w.history.slice(0, 25).map((h) => (
              <tr key={h.id}>
                <td style={{ fontWeight: 600 }}>{h.game}</td>
                <td className="right">{money(h.bet)}</td>
                <td className="right">{h.multiplier.toFixed(2)}×</td>
                <td className="right">{money(h.payout)}</td>
                <td className="right" style={{ color: h.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                  {h.profit >= 0 ? '+' : ''}{money(h.profit)}
                </td>
              </tr>
            ))}
            {w.history.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ padding: 24, textAlign: 'center' }}>No bets yet — go play something!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
