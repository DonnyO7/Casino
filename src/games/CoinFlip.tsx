import { useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money } from '../lib/format'

export default function CoinFlip() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [pick, setPick] = useState<'heads' | 'tails'>('heads')
  const [face, setFace] = useState<'heads' | 'tails'>('heads')
  const [won, setWon] = useState<boolean | null>(null)
  const [flipping, setFlipping] = useState(false)

  function play() {
    if (flipping) return
    if (!wallet.placeBet(bet)) return
    setFlipping(true)
    setWon(null)
    const result: 'heads' | 'tails' = rand() < 0.5 ? 'heads' : 'tails'
    let flips = 0
    const iv = setInterval(() => {
      flips++
      setFace((f) => (f === 'heads' ? 'tails' : 'heads'))
      if (flips > 9) {
        clearInterval(iv)
        setFace(result)
        const win = result === pick
        setWon(win)
        wallet.payout('Coin Flip', bet, win ? 2 : 0)
        setFlipping(false)
      }
    }, 70)
  }

  return (
    <GameShell name="Coin Flip" emoji="🪙" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={flipping} />
          <div className="toggle">
            <button className={pick === 'heads' ? 'on' : ''} onClick={() => setPick('heads')}>
              👑 Heads
            </button>
            <button className={pick === 'tails' ? 'on' : ''} onClick={() => setPick('tails')}>
              🪶 Tails
            </button>
          </div>
          <div>
            <StatRow k="Multiplier" v="2.00×" />
            <StatRow k="Win chance" v="50.00%" />
            <StatRow k="Profit on win" v={money(bet)} color="var(--green)" />
          </div>
          <button className="btn green block lg" disabled={flipping || bet <= 0} onClick={play}>
            {flipping ? 'Flipping…' : 'Flip Coin'}
          </button>
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            key={face + (won ?? '')}
            className="pop"
            style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              fontSize: 80,
              background:
                face === 'heads'
                  ? 'radial-gradient(circle at 35% 30%, #ffe9a8, #ffb15c)'
                  : 'radial-gradient(circle at 35% 30%, #cfd6e6, #8a93a8)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.45), inset 0 0 0 8px rgba(255,255,255,0.18)',
            }}
          >
            {face === 'heads' ? '👑' : '🪶'}
          </div>
          <div className="muted" style={{ marginTop: 18, textTransform: 'uppercase', letterSpacing: 2 }}>
            {face}
          </div>
          {won !== null && !flipping && (
            <div className={'result-flash ' + (won ? 'win' : 'lose')} style={{ marginTop: 18 }}>
              {won ? `WIN +${money(bet)}` : `LOST −${money(bet)}`}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  )
}
