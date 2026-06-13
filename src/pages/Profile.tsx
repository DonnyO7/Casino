import { useMemo } from 'react'
import { useWallet, xpForLevel } from '../store/wallet'
import { money, compact } from '../lib/format'

export default function Profile() {
  const w = useWallet()

  const byGame = useMemo(() => {
    const map: Record<string, { bets: number; wagered: number; profit: number }> = {}
    for (const h of w.history) {
      const g = (map[h.game] ??= { bets: 0, wagered: 0, profit: 0 })
      g.bets++
      g.wagered += h.bet
      g.profit += h.profit
    }
    return Object.entries(map).sort((a, b) => b[1].wagered - a[1].wagered)
  }, [w.history])

  const winRate = w.totalBets ? ((w.history.filter((h) => h.profit > 0).length / Math.min(w.totalBets, w.history.length)) * 100) : 0
  const net = w.balance - 10000

  return (
    <div>
      <h1 className="page-title">📊 My Stats</h1>
      <p className="page-sub">Level {w.level} · {compact(w.xp)} / {compact(xpForLevel(w.level))} XP to next level</p>

      <div className="stat-cards" style={{ marginBottom: 22 }}>
        <div className="stat-card"><div className="label">Net Profit</div><div className="num" style={{ color: net >= 0 ? 'var(--green)' : 'var(--red)' }}>{net >= 0 ? '+' : ''}{money(net)}</div></div>
        <div className="stat-card"><div className="label">Win Rate (recent)</div><div className="num">{winRate.toFixed(1)}%</div></div>
        <div className="stat-card"><div className="label">Total Bets</div><div className="num">{w.totalBets}</div></div>
        <div className="stat-card"><div className="label">Biggest Win</div><div className="num">{money(w.biggestWin)}</div></div>
      </div>

      <div className="section-head"><h2>Per-game breakdown</h2></div>
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Game</th><th className="right">Bets</th><th className="right">Wagered</th><th className="right">Net Profit</th></tr>
          </thead>
          <tbody>
            {byGame.map(([game, s]) => (
              <tr key={game}>
                <td style={{ fontWeight: 600 }}>{game}</td>
                <td className="right">{s.bets}</td>
                <td className="right">{money(s.wagered)}</td>
                <td className="right" style={{ color: s.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                  {s.profit >= 0 ? '+' : ''}{money(s.profit)}
                </td>
              </tr>
            ))}
            {byGame.length === 0 && (
              <tr><td colSpan={4} className="muted" style={{ padding: 24, textAlign: 'center' }}>Play a few games to build your stats.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
