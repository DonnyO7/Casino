import { useState } from 'react'
import { freshDeck, Card } from '../lib/cards'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { PlayingCard } from '../components/PlayingCard'
import { money } from '../lib/format'

function val(c: Card) {
  if (['10', 'J', 'Q', 'K'].includes(c.rank)) return 0
  if (c.rank === 'A') return 1
  return parseInt(c.rank)
}
function total(cards: Card[]) {
  return cards.reduce((a, c) => a + val(c), 0) % 10
}

type Side = 'player' | 'banker' | 'tie'

export default function Baccarat() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [side, setSide] = useState<Side>('player')
  const [p, setP] = useState<Card[]>([])
  const [b, setB] = useState<Card[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function deal() {
    if (busy) return
    if (!wallet.placeBet(bet)) return
    setBusy(true)
    setMsg(null)
    const d = freshDeck()
    const ph = [d.pop()!, d.pop()!]
    const bh = [d.pop()!, d.pop()!]
    let pt = total(ph)
    let bt = total(bh)

    // natural check
    if (pt < 8 && bt < 8) {
      let playerThird: Card | null = null
      if (pt <= 5) {
        playerThird = d.pop()!
        ph.push(playerThird)
        pt = total(ph)
      }
      // banker draw rules
      const bDraw = (() => {
        if (playerThird === null) return bt <= 5
        const v = val(playerThird)
        if (bt <= 2) return true
        if (bt === 3) return v !== 8
        if (bt === 4) return v >= 2 && v <= 7
        if (bt === 5) return v >= 4 && v <= 7
        if (bt === 6) return v === 6 || v === 7
        return false
      })()
      if (bDraw) {
        bh.push(d.pop()!)
        bt = total(bh)
      }
    }

    setP(ph)
    setB(bh)

    const winner: Side = pt > bt ? 'player' : bt > pt ? 'banker' : 'tie'
    // Near-fair payouts: Player/Banker 2×, Tie 8×; on a tie the P/B stake pushes.
    let mlt = 0
    if (winner === 'tie') {
      mlt = side === 'tie' ? 9 : 1 // tie bet pays 9× (≈ fair 10.5×), P/B push
    } else if (winner === side) {
      mlt = 2
    } else {
      mlt = 0
    }
    setTimeout(() => {
      wallet.payout('Baccarat', bet, mlt)
      const profit = bet * mlt - bet
      setMsg(`${winner.toUpperCase()} wins (P ${pt} · B ${bt}) · ${profit >= 0 ? '+' : ''}${money(profit)}`)
      setBusy(false)
    }, 500)
  }

  return (
    <GameShell name="Baccarat" emoji="🀄">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <div className="field">
            <label>Bet On</label>
            <div className="toggle">
              <button className={side === 'player' ? 'on' : ''} onClick={() => setSide('player')}>
                Player 2×
              </button>
              <button className={side === 'banker' ? 'on' : ''} onClick={() => setSide('banker')}>
                Banker 2×
              </button>
              <button className={side === 'tie' ? 'on' : ''} onClick={() => setSide('tie')}>
                Tie 9×
              </button>
            </div>
          </div>
          <StatRow k="Player total" v={p.length ? total(p) : '—'} />
          <StatRow k="Banker total" v={b.length ? total(b) : '—'} />
          <button className="btn green block lg" disabled={busy || bet <= 0} onClick={deal}>
            {busy ? 'Dealing…' : 'Deal'}
          </button>
          {msg && <div className={'result-flash ' + (msg.includes('+') ? 'win' : 'lose')}>{msg}</div>}
        </div>

        <div className="stage">
          <div style={{ marginBottom: 28 }}>
            <div className="muted" style={{ marginBottom: 10 }}>Player {p.length > 0 && `· ${total(p)}`}</div>
            <div className="flex gap-s wrap">
              {p.length ? p.map((c, i) => <PlayingCard key={i} card={c} />) : <div className="muted">—</div>}
            </div>
          </div>
          <div>
            <div className="muted" style={{ marginBottom: 10 }}>Banker {b.length > 0 && `· ${total(b)}`}</div>
            <div className="flex gap-s wrap">
              {b.length ? b.map((c, i) => <PlayingCard key={i} card={c} />) : <div className="muted">—</div>}
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  )
}
