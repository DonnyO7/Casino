import { useEffect, useRef, useState } from 'react'
import { rand } from '../lib/rng'
import { useWallet } from '../store/wallet'
import { GameShell, BetAmount, StatRow } from '../components/GameUI'
import { money, mult, clamp } from '../lib/format'

export default function Dice() {
  const wallet = useWallet()
  const [bet, setBet] = useState(10)
  const [chance, setChance] = useState(50)
  const [over, setOver] = useState(false)
  const [roll, setRoll] = useState<number | null>(null)
  const [won, setWon] = useState<boolean | null>(null)
  const [rolling, setRolling] = useState(false)
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')

  // auto-bet config
  const [numBets, setNumBets] = useState(20)
  const [onWin, setOnWin] = useState(0) // % change to bet after a win (0 = reset)
  const [onLoss, setOnLoss] = useState(0)
  const [stopProfit, setStopProfit] = useState(0)
  const [stopLoss, setStopLoss] = useState(0)
  const [autoRunning, setAutoRunning] = useState(false)
  const [sessionProfit, setSessionProfit] = useState(0)
  const auto = useRef({ running: false, left: 0, cur: 0, profit: 0 })

  const payout = 100 / chance
  const target = over ? 100 - chance : chance

  // returns true on win
  function rollOnce(curBet: number): boolean {
    if (!wallet.placeBet(curBet)) return false
    const r = Math.floor(rand() * 10001) / 100
    const win = over ? r > target : r < target
    setRoll(r)
    setWon(win)
    wallet.payout('Dice', curBet, win ? payout : 0)
    return win
  }

  function playManual() {
    if (rolling || autoRunning) return
    setRolling(true)
    setTimeout(() => {
      rollOnce(bet)
      setRolling(false)
    }, 250)
  }

  function startAuto() {
    if (autoRunning) return
    auto.current = { running: true, left: numBets > 0 ? numBets : Infinity, cur: bet, profit: 0 }
    setSessionProfit(0)
    setAutoRunning(true)
    stepAuto()
  }

  function stopAuto() {
    auto.current.running = false
    setAutoRunning(false)
  }

  function stepAuto() {
    const a = auto.current
    if (!a.running) return
    if (a.left <= 0) return stopAuto()
    if (stopProfit > 0 && a.profit >= stopProfit) return stopAuto()
    if (stopLoss > 0 && a.profit <= -stopLoss) return stopAuto()
    if (wallet.balance < a.cur || a.cur <= 0) return stopAuto()

    const win = rollOnce(a.cur)
    a.profit += win ? a.cur * payout - a.cur : -a.cur
    setSessionProfit(a.profit)
    // adjust next bet
    const pct = win ? onWin : onLoss
    a.cur = pct === 0 ? bet : Math.max(0.01, Math.round(a.cur * (1 + pct / 100) * 100) / 100)
    a.left -= 1
    setTimeout(stepAuto, 230)
  }

  useEffect(() => () => stopAuto(), [])

  // hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        if (mode === 'manual') playManual()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, rolling, autoRunning, bet, chance, over])

  return (
    <GameShell name="Dice" emoji="🎲" rtp="100%">
      <div className="game-wrap">
        <div className="bet-panel">
          <div className="toggle">
            <button className={mode === 'manual' ? 'on' : ''} disabled={autoRunning} onClick={() => setMode('manual')}>Manual</button>
            <button className={mode === 'auto' ? 'on' : ''} disabled={autoRunning} onClick={() => setMode('auto')}>Auto</button>
          </div>

          <BetAmount bet={bet} setBet={setBet} disabled={rolling || autoRunning} />

          <div className="toggle">
            <button className={!over ? 'on' : ''} disabled={autoRunning} onClick={() => setOver(false)}>Roll Under</button>
            <button className={over ? 'on' : ''} disabled={autoRunning} onClick={() => setOver(true)}>Roll Over</button>
          </div>

          <div className="field">
            <label>Win Chance — {chance.toFixed(0)}%</label>
            <input className="range" type="range" min={1} max={98} value={chance} disabled={autoRunning} onChange={(e) => setChance(clamp(parseInt(e.target.value), 1, 98))} />
          </div>

          <div>
            <StatRow k="Multiplier" v={mult(payout)} />
            <StatRow k="Profit on win" v={money(bet * payout - bet)} color="var(--green)" />
          </div>

          {mode === 'auto' && (
            <div className="panel tight" style={{ display: 'grid', gap: 10 }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Number of Bets (0 = ∞)</label>
                <div className="input-group"><input type="number" value={numBets} disabled={autoRunning} onChange={(e) => setNumBets(Math.max(0, parseInt(e.target.value) || 0))} /></div>
              </div>
              <div className="flex gap-s">
                <div className="field" style={{ margin: 0, flex: 1 }}>
                  <label>On Win %</label>
                  <div className="input-group"><input type="number" value={onWin} disabled={autoRunning} onChange={(e) => setOnWin(parseFloat(e.target.value) || 0)} /></div>
                </div>
                <div className="field" style={{ margin: 0, flex: 1 }}>
                  <label>On Loss %</label>
                  <div className="input-group"><input type="number" value={onLoss} disabled={autoRunning} onChange={(e) => setOnLoss(parseFloat(e.target.value) || 0)} /></div>
                </div>
              </div>
              <div className="flex gap-s">
                <div className="field" style={{ margin: 0, flex: 1 }}>
                  <label>Stop on Profit</label>
                  <div className="input-group"><input type="number" value={stopProfit} disabled={autoRunning} onChange={(e) => setStopProfit(Math.max(0, parseFloat(e.target.value) || 0))} /></div>
                </div>
                <div className="field" style={{ margin: 0, flex: 1 }}>
                  <label>Stop on Loss</label>
                  <div className="input-group"><input type="number" value={stopLoss} disabled={autoRunning} onChange={(e) => setStopLoss(Math.max(0, parseFloat(e.target.value) || 0))} /></div>
                </div>
              </div>
              <StatRow k="Session profit" v={`${sessionProfit >= 0 ? '+' : ''}${money(sessionProfit)}`} color={sessionProfit >= 0 ? 'var(--green)' : 'var(--red)'} />
            </div>
          )}

          {mode === 'manual' ? (
            <button className="btn green block lg" disabled={rolling || bet <= 0} onClick={playManual}>{rolling ? 'Rolling…' : 'Roll Dice'}</button>
          ) : autoRunning ? (
            <button className="btn red block lg" onClick={stopAuto}>■ Stop Auto</button>
          ) : (
            <button className="btn green block lg" disabled={bet <= 0} onClick={startAuto}>▶ Start Auto</button>
          )}
        </div>

        <div className="stage" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div key={roll ?? 'init'} className={won === null ? '' : 'pop'} style={{ fontSize: 90, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: won === null ? 'var(--text)' : won ? 'var(--green)' : 'var(--red)' }}>
            {roll === null ? '—' : roll.toFixed(2)}
          </div>
          <div style={{ width: '100%', maxWidth: 560, marginTop: 30 }}>
            <div style={{ position: 'relative', height: 14, borderRadius: 999, background: over ? 'linear-gradient(90deg, var(--red) 0%, var(--red) var(--t), var(--green) var(--t), var(--green) 100%)' : 'linear-gradient(90deg, var(--green) 0%, var(--green) var(--t), var(--red) var(--t), var(--red) 100%)', ['--t' as any]: `${target}%` }}>
              {roll !== null && <div style={{ position: 'absolute', top: -8, left: `${roll}%`, transform: 'translateX(-50%)', width: 4, height: 30, borderRadius: 4, background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.8)' }} />}
            </div>
            <div className="flex between" style={{ marginTop: 8, color: 'var(--muted)', fontSize: 12 }}>
              <span>0</span>
              <span>{over ? 'Win above' : 'Win below'} {target.toFixed(2)}</span>
              <span>100</span>
            </div>
          </div>
          {won !== null && <div className={'result-flash ' + (won ? 'win' : 'lose')} style={{ marginTop: 24 }}>{won ? `WIN +${money((roll !== null ? bet : bet) * payout - bet)}` : `BUST`}</div>}
        </div>
      </div>
    </GameShell>
  )
}
