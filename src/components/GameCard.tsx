import { Link } from 'react-router-dom'

export function GameCard({
  to,
  name,
  blurb,
  emoji,
  accent,
  tag,
}: {
  to: string
  name: string
  blurb?: string
  emoji: string
  accent: string
  tag?: string
}) {
  const [a, b] = accent.split(',')
  const tagClass =
    tag === 'HOT' ? 'hot' : tag === 'NEW' ? 'new' : tag === 'LIVE' ? 'live' : tag === 'VIP' ? 'vip' : 'live'
  return (
    <Link
      to={to}
      className="game-card"
      style={{ ['--ca' as any]: a, ['--cb' as any]: b }}
    >
      <span className="emoji">{emoji}</span>
      {tag && <span className={`chip ${tagClass} tag`}>{tag}</span>}
      <div className="gname">{name}</div>
      {blurb && <div className="gblurb">{blurb}</div>}
    </Link>
  )
}
