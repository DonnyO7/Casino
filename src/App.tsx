import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Casino from './pages/Casino'
import SlotsLobby from './pages/SlotsLobby'
import OriginalsLobby from './pages/OriginalsLobby'
import Promotions from './pages/Promotions'
import VIP from './pages/VIP'
import Leaderboard from './pages/Leaderboard'
import Fairness from './pages/Fairness'
import WalletPage from './pages/WalletPage'
import Profile from './pages/Profile'
import Achievements from './pages/Achievements'
import GameRoute from './pages/GameRoute'
import SlotRoute from './pages/SlotRoute'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casino" element={<Casino />} />
        <Route path="/slots" element={<SlotsLobby />} />
        <Route path="/originals" element={<OriginalsLobby />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/vip" element={<VIP />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/fairness" element={<Fairness />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/game/:slug" element={<GameRoute />} />
        <Route path="/slot/:slug" element={<SlotRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
