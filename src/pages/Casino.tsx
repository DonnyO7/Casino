import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ORIGINALS } from '../data/games'
import { SLOTS } from '../data/slots'
import { GameCard } from '../components/GameCard'

type Item = { to: string; name: string; blurb: string; emoji: string; accent: string; tag?: string; cat: string }

export default function Casino() {
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [filter, setFilter] = useState<'all' | 'originals' | 'table' | 'slots'>('all')

  const all: Item[] = useMemo(() => {
    const games = ORIGINALS.map((g) => ({
      to: `/game/${g.slug}`,
      name: g.name,
      blurb: g.blurb,
      emoji: g.emoji,
      accent: g.accent,
      tag: g.tag,
      cat: g.category,
    }))
    const slots = SLOTS.map((s) => ({
      to: `/slot/${s.slug}`,
      name: s.name,
      blurb: s.blurb,
      emoji: '🎰',
      accent: s.accent,
      tag: s.tag,
      cat: 'slots',
    }))
    return [...games, ...slots]
  }, [])

  const shown = all.filter((it) => {
    if (filter !== 'all' && it.cat !== filter) return false
    if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const tabs: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'originals', label: 'Originals' },
    { key: 'table', label: 'Table' },
    { key: 'slots', label: 'Slots' },
  ]

  return (
    <div>
      <h1 className="page-title">🎰 Casino Lobby</h1>
      <p className="page-sub">{all.length} games · all provably fair</p>

      <div className="flex between center wrap gap-m" style={{ marginBottom: 18 }}>
        <div className="toggle" style={{ maxWidth: 420 }}>
          {tabs.map((t) => (
            <button key={t.key} className={filter === t.key ? 'on' : ''} onClick={() => setFilter(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          className="search"
          style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px 14px', borderRadius: 10, minWidth: 220 }}
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid games">
        {shown.map((it) => (
          <GameCard key={it.to} {...it} />
        ))}
      </div>
      {shown.length === 0 && <p className="muted">No games match “{q}”.</p>}
    </div>
  )
}
