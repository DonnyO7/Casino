import { Link } from 'react-router-dom'
import { useFavorites } from '../store/favorites'
import { sound } from '../lib/sound'

export function GameCard({
  to,
  name,
  blurb,
  emoji,
  accent,
  tag,
  features,
}: {
  to: string
  name: string
  blurb?: string
  emoji: string
  accent: string
  tag?: string
  features?: string[]
}) {
  const favs = useFavorites((s) => s.favs)
  const toggle = useFavorites((s) => s.toggle)
  const isFav = favs.includes(to)
  const [a, b] = accent.split(',')
  const tagClass =
    tag === 'HOT' ? 'hot' : tag === 'NEW' ? 'new' : tag === 'LIVE' ? 'live' : tag === 'VIP' ? 'vip' : 'live'
  return (
    <Link
      to={to}
      className="game-card"
      style={{ ['--ca' as any]: a, ['--cb' as any]: b }}
    >
      <span className="shine" />
      <span className="emoji float">{emoji}</span>
      <button
        className="fav-btn"
        title={isFav ? 'Remove favourite' : 'Add favourite'}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggle(to)
          sound.click()
        }}
        style={{ color: isFav ? 'var(--gold)' : 'rgba(255,255,255,0.7)' }}
      >
        {isFav ? '★' : '☆'}
      </button>
      {tag && <span className={`chip ${tagClass} tag`}>{tag}</span>}
      <div className="gname">{name}</div>
      {features && features.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {features.map((f, i) => (
            <span key={i} style={{ fontSize: 13, background: 'rgba(0,0,0,0.35)', borderRadius: 6, padding: '1px 5px' }}>{f}</span>
          ))}
        </div>
      )}
      {blurb && <div className="gblurb">{blurb}</div>}
    </Link>
  )
}
