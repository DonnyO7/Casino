import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
