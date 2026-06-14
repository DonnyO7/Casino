import { Card, isRed } from '../lib/cards'

export function PlayingCard({
  card,
  hidden,
  size = 'md',
}: {
  card?: Card
  hidden?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const dims = size === 'lg' ? { w: 90, h: 126, f: 30 } : size === 'sm' ? { w: 46, h: 64, f: 16 } : { w: 64, h: 90, f: 22 }
  if (hidden || !card) {
    return (
      <div
        className="pop"
        style={{
          width: dims.w,
          height: dims.h,
          borderRadius: 10,
          background: 'repeating-linear-gradient(45deg,#2a3450,#2a3450 6px,#222c41 6px,#222c41 12px)',
          border: '2px solid var(--line)',
          display: 'grid',
          placeItems: 'center',
          fontSize: dims.f,
          color: 'var(--brand)',
        }}
      >
        ✦
      </div>
    )
  }
  const red = isRed(card)
  return (
    <div
      className="pop"
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: 10,
        background: '#f7f9ff',
        color: red ? '#e0294b' : '#16203a',
        border: '1px solid #cbd3e6',
        boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
        position: 'relative',
        fontWeight: 800,
        padding: 6,
      }}
    >
      <div style={{ fontSize: dims.f * 0.6, lineHeight: 1 }}>{card.rank}</div>
      <div style={{ fontSize: dims.f * 0.6, lineHeight: 1 }}>{card.suit}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: dims.f }}>
        {card.suit}
      </div>
    </div>
  )
}
