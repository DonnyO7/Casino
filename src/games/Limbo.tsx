import { useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

export default function Limbo() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [target, setTarget] = useState(2)
  const [result, setResult] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [rolling, setRolling] = useState(false)

  // Fair crash point: with prob 1/x the result is >= x. EV neutral when
  // payout == target. P(win) = 1/target.
  const winChance = (100 / target).toFixed(2)

  function play() {
    if (rolling) return
    if (target < 1.01) return
    if (!wallet.placeBet(bet)) return
    setRolling(true)
    // Generate a fair crash multiplier with CDF P(X < m) = 1 - 1/m.
    const u = rand()
    const crash = Math.max(1, Math.floor((1 / (1 - u)) * 100) / 100)

    // animated count-up
    const start = performance.now()
    const dur = 700
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const shown = 1 + (crash - 1) * (t * t)
      setResult(Math.floor(shown * 100) / 100)
      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        const win = crash >= target
        setResult(crash)
        setWon(win)
        wallet.payout('Limbo', bet, win ? target : 0)
        setRolling(false)
      }
    }
    requestAnimationFrame(tick)
  }

  return (
    <GameShell name="Limbo" emoji="🚀" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={rolling} />

          <div className="field">
            <label>Target Multiplier</label>
            <div className="input-group">
              <input
                type="number"
                step={0.01}
                min={1.01}
                value={target}
                disabled={rolling}
                onChange={(e) => setTarget(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
              />
              <div className="adorn">
                <button className="mini" disabled={rolling} onClick={() => setTarget((t) => Math.max(1.01, +(t / 2).toFixed(2)))}>
                  ½
                </button>
                <button className="mini" disabled={rolling} onClick={() => setTarget((t) => +(t * 2).toFixed(2))}>
                  2×
                </button>
              </div>
            </div>
          </div>

          <div>
            <StatRow k="Payout" v={mult(target)} />
            <StatRow k="Win chance" v={`${winChance}%`} />
            <StatRow k="Profit on win" v={money(bet * target - bet)} color="var(--green)" />
          </div>

          <button className="btn green block lg" disabled={rolling || bet <= 0} onClick={play}>
            {rolling ? 'Launching…' : 'Bet'}
          </button>
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            key={won === null ? 'idle' : result ?? 0}
            style={{
              fontSize: 84,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: won === null ? 'var(--text)' : won ? 'var(--green)' : 'var(--red)',
              textShadow: won ? '0 0 30px rgba(47,212,122,0.5)' : 'none',
            }}
          >
            {result === null ? '1.00×' : mult(result)}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            Target {mult(target)}
          </div>
          {won !== null && !rolling && (
            <div className={'result-flash ' + (won ? 'win' : 'lose')} style={{ marginTop: 26 }}>
              {won ? `WIN +${money(bet * target - bet)}` : `CRASHED −${money(bet)}`}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  )
}
