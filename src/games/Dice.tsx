import { useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult, clamp } from '../lib/format'

export default function Dice() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [chance, setChance] = useState(50) // win chance %
  const [over, setOver] = useState(false)
  const [roll, setRoll] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [rolling, setRolling] = useState(false)

  // True odds: payout = 100 / winChance  (zero house edge)
  const payout = 100 / chance
  // target threshold on a 0–100 scale
  const target = over ? 100 - chance : chance

  function play() {
    if (rolling) return
    if (!wallet.placeBet(bet)) return
    setRolling(true)
    const r = Math.floor(rand() * 10001) / 100 // 0.00 – 100.00
    setTimeout(() => {
      const win = over ? r > target : r < target
      setRoll(r)
      setWon(win)
      wallet.payout('Dice', bet, win ? payout : 0)
      setRolling(false)
    }, 350)
  }

  return (
    <GameShell name="Dice" emoji="🎲" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={rolling} />

          <div className="toggle">
            <button className={!over ? 'on' : ''} onClick={() => setOver(false)}>
              Roll Under
            </button>
            <button className={over ? 'on' : ''} onClick={() => setOver(true)}>
              Roll Over
            </button>
          </div>

          <div className="field">
            <label>Win Chance — {chance.toFixed(0)}%</label>
            <input
              className="range"
              type="range"
              min={1}
              max={98}
              value={chance}
              onChange={(e) => setChance(clamp(parseInt(e.target.value), 1, 98))}
            />
          </div>

          <div>
            <StatRow k="Multiplier" v={mult(payout)} />
            <StatRow k="Win chance" v={`${chance.toFixed(0)}%`} />
            <StatRow k="Profit on win" v={money(bet * payout - bet)} color="var(--green)" />
          </div>

          <button className="btn green block lg" disabled={rolling || bet <= 0} onClick={play}>
            {rolling ? 'Rolling…' : 'Roll Dice'}
          </button>
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            className={won === null ? '' : 'pop'}
            key={roll ?? 'init'}
            style={{
              fontSize: 90,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: won === null ? 'var(--text)' : won ? 'var(--green)' : 'var(--red)',
            }}
          >
            {roll === null ? '—' : roll.toFixed(2)}
          </div>

          {/* Track visual */}
          <div style={{ width: '100%', maxWidth: 560, marginTop: 30 }}>
            <div
              style={{
                position: 'relative',
                height: 14,
                borderRadius: 999,
                background: over
                  ? 'linear-gradient(90deg, var(--red) 0%, var(--red) var(--t), var(--green) var(--t), var(--green) 100%)'
                  : 'linear-gradient(90deg, var(--green) 0%, var(--green) var(--t), var(--red) var(--t), var(--red) 100%)',
                ['--t' as any]: `${target}%`,
              }}
            >
              {roll !== null && (
                <div
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: `${roll}%`,
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 30,
                    borderRadius: 4,
                    background: '#fff',
                    boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                  }}
                />
              )}
            </div>
            <div className="flex between" style={{ marginTop: 8, color: 'var(--muted)', fontSize: 12 }}>
              <span>0</span>
              <span>
                {over ? 'Win above' : 'Win below'} {target.toFixed(2)}
              </span>
              <span>100</span>
            </div>
          </div>

          {won !== null && (
            <div className={'result-flash ' + (won ? 'win' : 'lose')} style={{ marginTop: 24 }}>
              {won ? `WIN +${money(bet * payout - bet)}` : `BUST −${money(bet)}`}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  )
}
