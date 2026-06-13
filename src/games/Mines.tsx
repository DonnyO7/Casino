import { useState } from 'react'
import { shuffle } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult } from '../lib/format'

const SIZE = 25

// Fair multiplier after revealing `picks` gems with `mines` bombs (no edge).
function fairMult(mines: number, picks: number) {
  let m = 1
  for (let i = 0; i < picks; i++) {
    m *= (SIZE - i) / (SIZE - mines - i)
  }
  return m
}

export default function Mines() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [mines, setMines] = useState(3)
  const [board, setBoard] = useState<boolean[]>([]) // true = mine
  const [revealed, setRevealed] = useState<boolean[]>(Array(SIZE).fill(false))
  const [active, setActive] = useState(false)
  const [dead, setDead] = useState(false)

  const picks = revealed.filter(Boolean).length
  const curMult = active ? fairMult(mines, picks) : 1
  const nextMult = fairMult(mines, picks + 1)

  function start() {
    if (!wallet.placeBet(bet)) return
    const arr = Array(SIZE).fill(false)
    const idx = shuffle(Array.from({ length: SIZE }, (_, i) => i)).slice(0, mines)
    idx.forEach((i) => (arr[i] = true))
    setBoard(arr)
    setRevealed(Array(SIZE).fill(false))
    setActive(true)
    setDead(false)
  }

  function clickTile(i: number) {
    if (!active || revealed[i]) return
    if (board[i]) {
      // hit a mine
      const all = Array(SIZE).fill(true)
      setRevealed(all)
      setActive(false)
      setDead(true)
      wallet.payout('Mines', bet, 0)
      return
    }
    const next = revealed.slice()
    next[i] = true
    setRevealed(next)
    const newPicks = next.filter(Boolean).length
    if (newPicks === SIZE - mines) {
      // cleared the whole board
      cashout(fairMult(mines, newPicks))
    }
  }

  function cashout(forced?: number) {
    if (!active || picks === 0) return
    const m = forced ?? curMult
    wallet.payout('Mines', bet, m)
    setActive(false)
    setRevealed(board.map((isMine, i) => isMine || revealed[i]))
  }

  return (
    <GameShell name="Mines" emoji="💣" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={active} />
          <div className="field">
            <label>Mines — {mines}</label>
            <input
              className="range"
              type="range"
              min={1}
              max={24}
              value={mines}
              disabled={active}
              onChange={(e) => setMines(parseInt(e.target.value))}
            />
          </div>
          <div>
            <StatRow k="Gems found" v={picks} />
            <StatRow k="Current multiplier" v={mult(curMult)} color="var(--gold)" />
            <StatRow k="Next tile" v={mult(nextMult)} />
            <StatRow k="Cashout value" v={money(bet * curMult)} color="var(--green)" />
          </div>
          {active ? (
            <button className="btn gold block lg" disabled={picks === 0} onClick={() => cashout()}>
              Cash Out {money(bet * curMult)}
            </button>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={start}>
              Start Game
            </button>
          )}
          {dead && <div className="result-flash lose">BOOM — you hit a mine.</div>}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10,
              width: '100%',
              maxWidth: 440,
            }}
          >
            {Array.from({ length: SIZE }).map((_, i) => {
              const show = revealed[i]
              const isMine = board[i]
              return (
                <button
                  key={i}
                  onClick={() => clickTile(i)}
                  disabled={!active || revealed[i]}
                  className={show ? 'pop' : ''}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                    fontSize: 26,
                    fontWeight: 800,
                    background: show
                      ? isMine
                        ? 'radial-gradient(circle at 40% 30%, #ff8a9e, #b51f3a)'
                        : 'radial-gradient(circle at 40% 30%, #5cffb1, #149e57)'
                      : 'linear-gradient(180deg, var(--panel-3), var(--panel-2))',
                    cursor: active && !revealed[i] ? 'pointer' : 'default',
                    transition: '0.1s',
                  }}
                >
                  {show ? (isMine ? '💣' : '💎') : ''}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </GameShell>
  )
}
