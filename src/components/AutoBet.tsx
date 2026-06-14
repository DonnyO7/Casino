import { useEffect, useRef, useState } from 'react'
import { useWallet } from '../store/wallet'
import { money } from '../lib/format'
import { StatRow } from './GameUI'

export interface AutoBet {
  running: boolean
  sessionProfit: number
  numBets: number
  onWin: number
  onLoss: number
  stopProfit: number
  stopLoss: number
  setNumBets: (n: number) => void
  setOnWin: (n: number) => void
  setOnLoss: (n: number) => void
  setStopProfit: (n: number) => void
  setStopLoss: (n: number) => void
  start: () => void
  stop: () => void
}

// rollOnce(bet) performs one bet and returns the NET profit (positive = win).
export function useAutoBet(rollOnce: (bet: number) => number, baseBet: () => number): AutoBet {
  const balanceRef = useRef(0)
  balanceRef.current = useWallet((s) => s.balance)
  const [running, setRunning] = useState(false)
  const [sessionProfit, setSessionProfit] = useState(0)
  const [numBets, setNumBets] = useState(20)
  const [onWin, setOnWin] = useState(0)
  const [onLoss, setOnLoss] = useState(0)
  const [stopProfit, setStopProfit] = useState(0)
  const [stopLoss, setStopLoss] = useState(0)
  const a = useRef({ running: false, left: 0, cur: 0, profit: 0 })

  function start() {
    if (a.current.running) return
    a.current = { running: true, left: numBets > 0 ? numBets : Infinity, cur: baseBet(), profit: 0 }
    setSessionProfit(0)
    setRunning(true)
    step()
  }
  function stop() {
    a.current.running = false
    setRunning(false)
  }
  function step() {
    const s = a.current
    if (!s.running) return
    if (s.left <= 0) return stop()
    if (stopProfit > 0 && s.profit >= stopProfit) return stop()
    if (stopLoss > 0 && s.profit <= -stopLoss) return stop()
    if (s.cur <= 0 || balanceRef.current < s.cur) return stop()
    const delta = rollOnce(s.cur)
    s.profit += delta
    setSessionProfit(s.profit)
    const pct = delta > 0 ? onWin : onLoss
    s.cur = pct === 0 ? baseBet() : Math.max(0.01, Math.round(s.cur * (1 + pct / 100) * 100) / 100)
    s.left -= 1
    setTimeout(step, 240)
  }

  useEffect(() => () => stop(), [])

  return { running, sessionProfit, numBets, onWin, onLoss, stopProfit, stopLoss, setNumBets, setOnWin, setOnLoss, setStopProfit, setStopLoss, start, stop }
}

export function AutoBetFields({ a }: { a: AutoBet }) {
  const num = (v: number, set: (n: number) => void, min = -100) => (
    <div className="input-group">
      <input type="number" value={v} disabled={a.running} onChange={(e) => set(Math.max(min, parseFloat(e.target.value) || 0))} />
    </div>
  )
  return (
    <div className="panel tight" style={{ display: 'grid', gap: 10 }}>
      <div className="field" style={{ margin: 0 }}>
        <label>Number of Bets (0 = ∞)</label>
        {num(a.numBets, a.setNumBets, 0)}
      </div>
      <div className="flex gap-s">
        <div className="field" style={{ margin: 0, flex: 1 }}><label>On Win %</label>{num(a.onWin, a.setOnWin)}</div>
        <div className="field" style={{ margin: 0, flex: 1 }}><label>On Loss %</label>{num(a.onLoss, a.setOnLoss)}</div>
      </div>
      <div className="flex gap-s">
        <div className="field" style={{ margin: 0, flex: 1 }}><label>Stop Profit</label>{num(a.stopProfit, a.setStopProfit, 0)}</div>
        <div className="field" style={{ margin: 0, flex: 1 }}><label>Stop Loss</label>{num(a.stopLoss, a.setStopLoss, 0)}</div>
      </div>
      <StatRow k="Session profit" v={`${a.sessionProfit >= 0 ? '+' : ''}${money(a.sessionProfit)}`} color={a.sessionProfit >= 0 ? 'var(--green)' : 'var(--red)'} />
    </div>
  )
}
