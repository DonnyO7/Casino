import { SLOTS } from '../data/slots'
import { GameCard } from '../components/GameCard'

export default function SlotsLobby() {
  return (
    <div>
      <h1 className="page-title">🎞️ Slots</h1>
      <p className="page-sub">{SLOTS.length} themed machines · auto-balanced to 99% RTP · 3-of-a-kind pays</p>
      <div className="grid games">
        {SLOTS.map((s) => (
          <GameCard key={s.slug} to={`/slot/${s.slug}`} name={s.name} blurb={s.blurb} emoji="🎰" accent={s.accent} tag={s.tag} />
        ))}
      </div>
    </div>
  )
}
