import { ReactNode, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Toaster from './Toaster'
import MobileNav from './MobileNav'
import Effects from './Effects'
import AchievementToast from './AchievementToast'
import BigWinOverlay from './BigWinOverlay'
import WelcomeModal from './WelcomeModal'
import { useSettings } from '../store/settings'

export default function Layout({ children }: { children: ReactNode }) {
  const apply = useSettings((s) => s.apply)
  useEffect(() => apply(), [apply])
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">{children}</div>
        <footer style={{ padding: '20px 24px 40px', borderTop: '1px solid var(--line)', color: 'var(--muted-2)', fontSize: 12, textAlign: 'center', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 800, color: 'var(--muted)' }}>
            <span className="grad-text">NOVA</span> Casino
          </div>
          <div>Provably fair · Zero house edge on originals · Play-money only — no real currency anywhere.</div>
          <div>18+ · For entertainment. If gambling stops being fun, take a break.</div>
        </footer>
      </div>
      <Toaster />
      <MobileNav />
      <Effects />
      <AchievementToast />
      <BigWinOverlay />
      <WelcomeModal />
    </div>
  )
}
