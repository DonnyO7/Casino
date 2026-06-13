import { useParams, Navigate } from 'react-router-dom'
import Dice from '../games/Dice'
import Limbo from '../games/Limbo'
import Plinko from '../games/Plinko'
import Crash from '../games/Crash'
import Mines from '../games/Mines'
import Keno from '../games/Keno'
import Wheel from '../games/Wheel'
import Hilo from '../games/Hilo'
import Tower from '../games/Tower'
import CoinFlip from '../games/CoinFlip'
import Roulette from '../games/Roulette'
import Blackjack from '../games/Blackjack'
import Baccarat from '../games/Baccarat'
import VideoPoker from '../games/VideoPoker'
import SicBo from '../games/SicBo'
import Scratch from '../games/Scratch'
import Cases from '../games/Cases'
import Diamonds from '../games/Diamonds'

const MAP: Record<string, () => JSX.Element> = {
  dice: Dice,
  limbo: Limbo,
  plinko: Plinko,
  crash: Crash,
  mines: Mines,
  keno: Keno,
  wheel: Wheel,
  hilo: Hilo,
  tower: Tower,
  coinflip: CoinFlip,
  roulette: Roulette,
  blackjack: Blackjack,
  baccarat: Baccarat,
  videopoker: VideoPoker,
  sicbo: SicBo,
  scratch: Scratch,
  cases: Cases,
  diamonds: Diamonds,
}

export default function GameRoute() {
  const { slug } = useParams()
  const Comp = slug ? MAP[slug] : undefined
  if (!Comp) return <Navigate to="/casino" replace />
  return <Comp />
}
