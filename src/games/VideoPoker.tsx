import { useState } from 'react'
import { freshDeck, Card, RANKS } from '../lib/cards'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { PlayingCard } from '../components/PlayingCard'

// Jacks-or-Better "for 1" paytable (total return multiplier). ~99.5% RTP.
const PAYTABLE: { name: string; mult: number }[] = [
  { name: 'Royal Flush', mult: 250 },
  { name: 'Straight Flush', mult: 50 },
  { name: 'Four of a Kind', mult: 25 },
  { name: 'Full House', mult: 9 },
  { name: 'Flush', mult: 6 },
  { name: 'Straight', mult: 4 },
  { name: 'Three of a Kind', mult: 3 },
  { name: 'Two Pair', mult: 2 },
  { name: 'Jacks or Better', mult: 1 },
  { name: 'No Win', mult: 0 },
]

function rankIndex(c: Card) {
  return RANKS.indexOf(c.rank) // A=0 ... K=12
}

function evaluate(cards: Card[]): { name: string; mult: number } {
  const counts: Record<string, number> = {}
  cards.forEach((c) => (counts[c.rank] = (counts[c.rank] || 0) + 1))
  const groups = Object.values(counts).sort((a, b) => b - a)
  const flush = cards.every((c) => c.suit === cards[0].suit)

  // straight: unique consecutive. handle A-high and A-low.
  const idxs = Array.from(new Set(cards.map(rankIndex))).sort((a, b) => a - b)
  let straight = false
  if (idxs.length === 5) {
    if (idxs[4] - idxs[0] === 4) straight = true
    // A(0),10(9),J(10),Q(11),K(12) -> royal/straight with ace high
    if (JSON.stringify(idxs) === JSON.stringify([0, 9, 10, 11, 12])) straight = true
  }
  const royal = straight && flush && idxs.includes(0) && idxs.includes(12)

  if (royal) return PAYTABLE[0]
  if (straight && flush) return PAYTABLE[1]
  if (groups[0] === 4) return PAYTABLE[2]
  if (groups[0] === 3 && groups[1] === 2) return PAYTABLE[3]
  if (flush) return PAYTABLE[4]
  if (straight) return PAYTABLE[5]
  if (groups[0] === 3) return PAYTABLE[6]
  if (groups[0] === 2 && groups[1] === 2) return PAYTABLE[7]
  // pair of Jacks or better
  const highPair = Object.entries(counts).find(
    ([rank, n]) => n === 2 && ['J', 'Q', 'K', 'A'].includes(rank),
  )
  if (highPair) return PAYTABLE[8]
  return PAYTABLE[9]
}

export default function VideoPoker() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [deck, setDeck] = useState<Card[]>([])
  const [hand, setHand] = useState<Card[]>([])
  const [holds, setHolds] = useState<boolean[]>([false, false, false, false, false])
  const [phase, setPhase] = useState<'idle' | 'draw' | 'done'>('idle')
  const [result, setResult] = useState<{ name: string; mult: number } | null>(null)

  function deal() {
    if (!wallet.placeBet(bet)) return
    const d = freshDeck()
    const h = [d.pop()!, d.pop()!, d.pop()!, d.pop()!, d.pop()!]
    setDeck(d)
    setHand(h)
    setHolds([false, false, false, false, false])
    setPhase('draw')
    setResult(null)
  }

  function draw() {
    const d = deck.slice()
    const h = hand.map((c, i) => (holds[i] ? c : d.pop()!))
    setHand(h)
    setPhase('done')
    const r = evaluate(h)
    wallet.payout('Video Poker', bet, r.mult)
    setResult(r)
  }

  function toggleHold(i: number) {
    if (phase !== 'draw') return
    setHolds((hs) => hs.map((v, j) => (j === i ? !v : v)))
  }

  return (
    <GameShell name="Video Poker" emoji="🂡" rtp="99.5%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={phase === 'draw'} />
          <div className="panel tight">
            {PAYTABLE.slice(0, 9).map((row) => (
              <StatRow
                key={row.name}
                k={row.name}
                v={`${row.mult}×`}
                color={result?.name === row.name ? 'var(--green)' : undefined}
              />
            ))}
          </div>
          {phase === 'draw' ? (
            <button className="btn green block lg" onClick={draw}>
              Draw
            </button>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={deal}>
              Deal
            </button>
          )}
          {result && (
            <div className={'result-flash ' + (result.mult >= 1 ? 'win' : 'lose')}>
              {result.name}
              {result.mult > 1 ? ` · ${result.mult}×` : result.mult === 1 ? ' · push' : ''}
            </div>
          )}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex gap-m" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {hand.length === 0
              ? Array.from({ length: 5 }).map((_, i) => <PlayingCard key={i} hidden size="lg" />)
              : hand.map((c, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <PlayingCard card={c} size="lg" />
                    <button
                      className={'btn ' + (holds[i] ? 'gold' : 'ghost')}
                      style={{ marginTop: 10, padding: '6px 14px', fontSize: 12 }}
                      disabled={phase !== 'draw'}
                      onClick={() => toggleHold(i)}
                    >
                      {holds[i] ? 'HELD' : 'HOLD'}
                    </button>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </GameShell>
  )
}
