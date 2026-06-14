import { useState } from 'react'
import { freshDeck, Card } from '../lib/cards'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { PlayingCard } from '../components/PlayingCard'
import { money } from '../lib/format'
import { sound } from '../lib/sound'

type Side = 'andar' | 'bahar'

export default function AndarBahar() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [side, setSide] = useState<Side>('andar')
  const [joker, setJoker] = useState<Card | null>(null)
  const [andar, setAndar] = useState<Card[]>([])
  const [bahar, setBahar] = useState<Card[]>([])
  const [busy, setBusy] = useState(false)
  const [winner, setWinner] = useState<Side | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function deal() {
    if (busy) return
    if (!wallet.placeBet(bet)) return
    setBusy(true)
    setMsg(null)
    setWinner(null)
    setAndar([])
    setBahar([])
    const deck = freshDeck()
    const jk = deck.pop()!
    setJoker(jk)
    // randomise which side receives the first card -> exact 50/50, zero edge
    let turn: Side = rand() < 0.5 ? 'andar' : 'bahar'
    const a: Card[] = []
    const b: Card[] = []
    const iv = setInterval(() => {
      const card = deck.pop()!
      if (turn === 'andar') a.push(card)
      else b.push(card)
      setAndar([...a])
      setBahar([...b])
      sound.tick()
      if (card.rank === jk.rank) {
        clearInterval(iv)
        const win = turn
        setWinner(win)
        wallet.payout('Andar Bahar', bet, win === side ? 2 : 0)
        setMsg(win === side ? `${win.toUpperCase()} matched — +${money(bet)}` : `${win.toUpperCase()} matched — −${money(bet)}`)
        setBusy(false)
        return
      }
      turn = turn === 'andar' ? 'bahar' : 'andar'
    }, 360)
  }

  function Pile({ name, cards, s }: { name: string; cards: Card[]; s: Side }) {
    return (
      <div style={{ flex: 1 }}>
        <div className="flex between center" style={{ marginBottom: 8 }}>
          <strong style={{ color: side === s ? 'var(--brand-2)' : undefined }}>{name}</strong>
          {winner === s && <span className="chip new">MATCH</span>}
        </div>
        <div
          style={{
            minHeight: 120,
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: 8,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            background: winner === s ? 'rgba(47,212,122,0.08)' : 'var(--bg-2)',
          }}
        >
          {cards.map((c, i) => (
            <PlayingCard key={i} card={c} size="sm" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <GameShell name="Andar Bahar" emoji="🎴" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <BetAmount bet={bet} setBet={setBet} disabled={busy} />
          <div className="toggle">
            <button className={side === 'andar' ? 'on' : ''} onClick={() => setSide('andar')}>Andar 2×</button>
            <button className={side === 'bahar' ? 'on' : ''} onClick={() => setSide('bahar')}>Bahar 2×</button>
          </div>
          <div>
            <StatRow k="Win chance" v="50.00%" />
            <StatRow k="Profit on win" v={money(bet)} color="var(--green)" />
          </div>
          <button className="btn green block lg" disabled={busy || bet <= 0} onClick={deal}>
            {busy ? 'Dealing…' : 'Deal'}
          </button>
          {msg && <div className={'result-flash ' + (msg.includes('+') ? 'win' : 'lose')}>{msg}</div>}
        </div>

        <div className="stage">
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div className="muted" style={{ marginBottom: 8 }}>Joker</div>
            {joker ? <PlayingCard card={joker} size="lg" /> : <PlayingCard hidden size="lg" />}
          </div>
          <div className="flex gap-m" style={{ alignItems: 'flex-start' }}>
            <Pile name="Andar" cards={andar} s="andar" />
            <Pile name="Bahar" cards={bahar} s="bahar" />
          </div>
          <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
            Fair 50/50 variant — first card goes to a random side, so each pile is exactly even.
          </div>
        </div>
      </div>
    </GameShell>
  )
}
