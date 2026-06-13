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
