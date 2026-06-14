import { ORIGINALS } from '../data/games'
import { GameCard } from '../components/GameCard'

export default function OriginalsLobby() {
  const originals = ORIGINALS.filter((g) => g.category === 'originals')
  const table = ORIGINALS.filter((g) => g.category === 'table')
  return (
    <div>
      <h1 className="page-title">✨ NOVA Originals</h1>
      <p className="page-sub">In-house games with true 1 ÷ probability payouts — zero house edge.</p>

      <div className="section-head">
        <h2>🎯 Originals</h2>
      </div>
      <div className="grid games">
        {originals.map((g) => (
          <GameCard key={g.slug} to={`/game/${g.slug}`} name={g.name} blurb={g.blurb} emoji={g.emoji} accent={g.accent} tag={g.tag} />
        ))}
      </div>

      <div className="section-head">
        <h2>🃏 Table Games</h2>
      </div>
      <div className="grid games">
        {table.map((g) => (
          <GameCard key={g.slug} to={`/game/${g.slug}`} name={g.name} blurb={g.blurb} emoji={g.emoji} accent={g.accent} tag={g.tag} />
        ))}
      </div>
    </div>
  )
}
