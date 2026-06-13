import { useMemo } from 'react'
import { useWallet } from '../store/wallet'
import { money } from '../lib/format'

const NAMES = [
  'CryptoKnight', 'LuckyLuna', 'RollTide', 'NeonNinja', 'MidasTouch', 'VegasVibe', 'HighRoller99',
  'SpinDoctor', 'AceOfSpades', 'DiamondHands', 'TheGambler', 'FrostByte', 'QuantumDice', 'GoldRush',
  'ZeroEdge', 'MoonShot', 'SilkRoad', 'RiskItAll', 'PixelPirate', 'JackpotJ',
]

export default function Leaderboard() {
  const { totalWon, totalWagered } = useWallet()

  const board = useMemo(() => {
    const rows = NAMES.map((name, i) => ({
      name,
      wagered: Math.round(50000 + Math.random() * 950000),
      profit: Math.round((Math.random() - 0.35) * 200000),
    }))
    rows.push({ name: 'You', wagered: Math.round(totalWagered), profit: Math.round(totalWon) })
    return rows.sort((a, b) => b.profit - a.profit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <h1 className="page-title">🏆 Leaderboard</h1>
      <p className="page-sub">Weekly wager race · top players by net play-money profit.</p>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Player</th>
              <th className="right">Wagered</th>
              <th className="right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {board.map((r, i) => (
              <tr key={r.name} style={r.name === 'You' ? { background: 'rgba(124,92,255,0.12)' } : undefined}>
                <td style={{ fontWeight: 800 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td style={{ fontWeight: r.name === 'You' ? 800 : 600, color: r.name === 'You' ? 'var(--brand-2)' : undefined }}>
                  {r.name}
                </td>
                <td className="right">{money(r.wagered)}</td>
                <td className="right" style={{ color: r.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                  {r.profit >= 0 ? '+' : ''}
                  {money(r.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
