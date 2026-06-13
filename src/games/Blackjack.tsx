import { useState } from 'react'
import { freshDeck, Card, handTotal } from '../lib/cards'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { PlayingCard } from '../components/PlayingCard'
import { money } from '../lib/format'

type Phase = 'idle' | 'player' | 'dealer' | 'done'

export default function Blackjack() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [stake, setStake] = useState(10)
  const [deck, setDeck] = useState<Card[]>([])
  const [player, setPlayer] = useState<Card[]>([])
  const [dealer, setDealer] = useState<Card[]>([])
  const [phase, setPhase] = useState<Phase>('idle')
  const [msg, setMsg] = useState<string | null>(null)
  const [canDouble, setCanDouble] = useState(false)

  const pt = handTotal(player)
  const dt = handTotal(dealer)

  function deal() {
    if (!wallet.placeBet(bet)) return
    const d = freshDeck()
    const p = [d.pop()!, d.pop()!]
    const dl = [d.pop()!, d.pop()!]
    setDeck(d)
    setPlayer(p)
    setDealer(dl)
    setStake(bet)
    setMsg(null)
    setCanDouble(wallet.balance >= bet)
    const pTotal = handTotal(p).total
    const dTotal = handTotal(dl).total
    if (pTotal === 21 || dTotal === 21) {
      finish(p, dl, d, true)
    } else {
      setPhase('player')
    }
  }

  function hit() {
    if (phase !== 'player') return
    const d = deck.slice()
    const np = [...player, d.pop()!]
    setDeck(d)
    setPlayer(np)
    setCanDouble(false)
    if (handTotal(np).total > 21) finish(np, dealer, d, false)
  }

  function stand() {
    if (phase !== 'player') return
    dealerPlay(player, dealer, deck)
  }

  function double() {
    if (phase !== 'player' || !canDouble) return
    if (!wallet.placeBet(bet)) return
    const d = deck.slice()
    const np = [...player, d.pop()!]
    setStake(bet * 2)
    setDeck(d)
    setPlayer(np)
    setCanDouble(false)
    if (handTotal(np).total > 21) finish(np, dealer, d, false, bet * 2)
    else dealerPlay(np, dealer, d, bet * 2)
  }

  function dealerPlay(p: Card[], dl: Card[], d: Card[], curStake = stake) {
    setPhase('dealer')
    const hand = dl.slice()
    const deckCopy = d.slice()
    while (handTotal(hand).total < 17) hand.push(deckCopy.pop()!)
    setDealer(hand)
    setDeck(deckCopy)
    finish(p, hand, deckCopy, false, curStake)
  }

  function finish(p: Card[], dl: Card[], _d: Card[], natural: boolean, curStake = stake) {
    setPhase('done')
    const pTot = handTotal(p).total
    const dTot = handTotal(dl).total
    const pBJ = natural && pTot === 21 && p.length === 2
    const dBJ = natural && dTot === 21 && dl.length === 2
    let mlt = 0
    let text = ''
    if (pBJ && dBJ) {
      mlt = 1
      text = 'Both Blackjack — push'
    } else if (pBJ) {
      mlt = 2.5
      text = 'Blackjack! 3:2'
    } else if (dBJ) {
      mlt = 0
      text = 'Dealer Blackjack'
    } else if (pTot > 21) {
      mlt = 0
      text = 'Bust'
    } else if (dTot > 21) {
      mlt = 2
      text = 'Dealer busts — you win'
    } else if (pTot > dTot) {
      mlt = 2
      text = 'You win'
    } else if (pTot < dTot) {
      mlt = 0
      text = 'Dealer wins'
    } else {
      mlt = 1
      text = 'Push'
    }
    wallet.payout('Blackjack', curStake, mlt)
    const profit = curStake * mlt - curStake
    setMsg(`${text} · ${profit >= 0 ? '+' : ''}${money(profit)}`)
  }

  const hideDealer = phase === 'player'

  return (
    <GameShell name="Blackjack" emoji="♠️">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={phase === 'player' || phase === 'dealer'} />
          <div>
            <StatRow k="Your total" v={pt.total} />
            <StatRow k="Dealer" v={hideDealer ? '?' : dt.total} />
            <StatRow k="Stake" v={money(stake)} />
          </div>
          {phase === 'player' ? (
            <>
              <div className="flex gap-s">
                <button className="btn green" style={{ flex: 1 }} onClick={hit}>
                  Hit
                </button>
                <button className="btn red" style={{ flex: 1 }} onClick={stand}>
                  Stand
                </button>
              </div>
              <button className="btn gold block" disabled={!canDouble} onClick={double}>
                Double
              </button>
            </>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={deal}>
              Deal
            </button>
          )}
          {msg && (
            <div className={'result-flash ' + (msg.includes('win') || msg.includes('Blackjack!') ? 'win' : msg.includes('Bust') || msg.includes('Dealer wins') || msg.includes('Dealer Blackjack') ? 'lose' : '')}>
              {msg}
            </div>
          )}
        </div>

        <div className="stage">
          <div style={{ marginBottom: 24 }}>
            <div className="muted" style={{ marginBottom: 10 }}>Dealer {!hideDealer && `· ${dt.total}`}</div>
            <div className="flex gap-s wrap">
              {dealer.map((c, i) => (
                <PlayingCard key={i} card={c} hidden={hideDealer && i === 1} />
              ))}
              {dealer.length === 0 && <div className="muted">—</div>}
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div className="muted" style={{ marginBottom: 10 }}>You {player.length > 0 && `· ${pt.total}`}</div>
            <div className="flex gap-s wrap">
              {player.map((c, i) => (
                <PlayingCard key={i} card={c} />
              ))}
              {player.length === 0 && <div className="muted">—</div>}
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  )
}
