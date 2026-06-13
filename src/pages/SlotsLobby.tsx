import { SLOTS } from '../data/slots'
import { GameCard } from '../components/GameCard'

export default function SlotsLobby() {
  return (
    <div>
      <h1 className="page-title">🎞️ Slots</h1>
      <p className="page-sub">
        {SLOTS.length} machines · 5×3 reels · 20 paylines · 🃏 Wilds · 🌈 Scatters → Free Spins · auto-balanced to ~99% RTP
      </p>
      <div className="grid games">
        {SLOTS.map((s) => (
          <GameCard key={s.slug} to={`/slot/${s.slug}`} name={s.name} blurb={s.blurb} emoji="🎰" accent={s.accent} tag={s.tag} />
        ))}
      </div>
    </div>
  )
}
