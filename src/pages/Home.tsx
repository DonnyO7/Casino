import { Link } from 'react-router-dom'
import { ORIGINALS } from '../data/games'
import { SLOTS } from '../data/slots'
import { GameCard } from '../components/GameCard'
import { useWallet } from '../store/wallet'
import { money, compact } from '../lib/format'

export default function Home() {
  const w = useWallet()
  return (
    <div>
      <section className="hero">
        <div className="glow" />
        <span className="chip live" style={{ marginBottom: 14 }}>
          ⚡ PROVABLY FAIR · ZERO HOUSE EDGE
        </span>
        <h1>
          Welcome to <span style={{ color: 'var(--brand-2)' }}>NOVA</span> Casino
        </h1>
        <p>
          Play 26+ originals, table classics and themed slots with{' '}
          <strong>true mathematical odds</strong> — no rigged RNG, no hidden edge. Just you,
          play-money chips and a fair shot at the jackpot.
        </p>
        <div className="cta">
          <Link to="/casino" className="btn primary lg">
            🎰 Enter Casino
          </Link>
          <Link to="/game/dice" className="btn lg">
            🎲 Quick Play Dice
          </Link>
          <Link to="/fairness" className="btn ghost lg">
            🛡️ How fairness works
          </Link>
        </div>
      </section>

      <div className="stat-cards" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <div className="label">Your Balance</div>
          <div className="num">{money(w.balance)} 🪙</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Wagered</div>
          <div className="num">{compact(w.totalWagered)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Bets Placed</div>
          <div className="num">{compact(w.totalBets)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Biggest Win</div>
          <div className="num">{money(w.biggestWin)}</div>
        </div>
      </div>

      <div className="section-head">
        <h2>✨ NOVA Originals</h2>
        <Link to="/originals" className="btn ghost">
          View all →
        </Link>
      </div>
      <div className="grid games">
        {ORIGINALS.slice(0, 8).map((g) => (
          <GameCard
            key={g.slug}
            to={`/game/${g.slug}`}
            name={g.name}
            blurb={g.blurb}
            emoji={g.emoji}
            accent={g.accent}
            tag={g.tag}
          />
        ))}
      </div>

      <div className="section-head">
        <h2>🎞️ Popular Slots</h2>
        <Link to="/slots" className="btn ghost">
          View all →
        </Link>
      </div>
      <div className="grid games">
        {SLOTS.slice(0, 8).map((s) => (
          <GameCard
            key={s.slug}
            to={`/slot/${s.slug}`}
            name={s.name}
            blurb={s.blurb}
            emoji="🎰"
            accent={s.accent}
            tag={s.tag}
          />
        ))}
      </div>
    </div>
  )
}
