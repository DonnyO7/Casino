import { NavLink } from 'react-router-dom'

const groups: { label: string; items: { to: string; icon: string; name: string }[] }[] = [
  {
    label: 'Lobby',
    items: [
      { to: '/', icon: '🏠', name: 'Home' },
      { to: '/casino', icon: '🎰', name: 'Casino' },
      { to: '/originals', icon: '✨', name: 'Originals' },
      { to: '/slots', icon: '🎞️', name: 'Slots' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { to: '/promotions', icon: '🎁', name: 'Promotions' },
      { to: '/vip', icon: '💎', name: 'VIP Club' },
      { to: '/leaderboard', icon: '🏆', name: 'Leaderboard' },
      { to: '/achievements', icon: '🏅', name: 'Achievements' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/wallet', icon: '👛', name: 'Wallet' },
      { to: '/profile', icon: '📊', name: 'My Stats' },
      { to: '/fairness', icon: '🛡️', name: 'Provably Fair' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <img className="logo" src="/favicon.svg" alt="" />
        <span>
          <span className="grad">NOVA</span> Casino
        </span>
      </NavLink>

      {groups.map((g) => (
        <nav key={g.label}>
          <div className="nav-group-label">{g.label}</div>
          {g.items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <span className="ico">{it.icon}</span>
              {it.name}
            </NavLink>
          ))}
        </nav>
      ))}

      <div style={{ marginTop: 'auto', padding: '8px 12px', fontSize: 11, color: 'var(--muted-2)' }}>
        Play money only. 18+. <br />
        For entertainment — no real currency.
      </div>
    </aside>
  )
}
