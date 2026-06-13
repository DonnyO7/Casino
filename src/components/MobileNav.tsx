import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', icon: '🏠', name: 'Home' },
  { to: '/casino', icon: '🎰', name: 'Casino' },
  { to: '/slots', icon: '🎞️', name: 'Slots' },
  { to: '/wallet', icon: '👛', name: 'Wallet' },
  { to: '/profile', icon: '📊', name: 'Stats' },
]

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) => 'mnav-item' + (isActive ? ' active' : '')}
        >
          <span style={{ fontSize: 20 }}>{it.icon}</span>
          <span>{it.name}</span>
        </NavLink>
      ))}
    </nav>
  )
}
