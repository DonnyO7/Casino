# 🎰 NOVA Casino

A full-featured, **provably-fair** online-casino web app — play-money only, with
*true mathematical odds and zero house edge* on the originals. Inspired by the
Stake / Shuffle style of crypto casino, built as a fast React + Vite SPA.

> ⚠️ Entertainment only. There is no real money anywhere in this app — the
> balance is a fake number stored in your browser's localStorage. 18+.

## Why "no scam"?

Real casinos shave every payout a few percent below the true odds (the *house
edge*). NOVA's in-house games do the opposite — every multiplier is set to
**exactly `1 ÷ probability`**, so the expected value of each bet is break-even.
It's a fair coin flip, all the way down. See the in-app **Provably Fair** page
for the per-game maths.

All randomness comes from the browser's cryptographic RNG
(`crypto.getRandomValues`), not `Math.random`.

## What's inside

**30+ games across three categories:**

- **Originals** — Dice, Limbo, Plinko, Crash (multiplayer-style), Mines, Keno,
  Wheel, Hi-Lo, Dragon Tower, Coin Flip, Mystery Cases, Sic Bo, Scratch Cards,
  Diamonds
- **Table games** — Roulette (single-zero, fair payouts), Blackjack, Baccarat,
  Video Poker (Jacks or Better)
- **18 video slots** — 5×3 reels, 20 paylines, 🃏 Wilds, 🌈 Scatter → **Free
  Spins**, with **cascading/tumbling reels** + **multiplier orbs** on several
  machines, and a fair "Buy Bonus". One engine Monte-Carlo-calibrates every
  machine to ~99% RTP — even with wilds, scatters, free spins and cascades.

**Meta & juice:**

- **Progressive jackpot** that ticks live and drops randomly to a lucky player
  (house-funded, never touches your odds)
- **18 achievements** with unlock banners + a completion page
- **Daily reward wheel** (free chips every 24h) and daily/bonus promotions
- **Big Win** celebration overlay (Big → Mega → Epic → Legendary), confetti,
  screen flashes, synth sound engine, animated counters, live wins feed
- VIP tier/level system, leaderboard, wallet + bet history, stats dashboard,
  an **interactive provably-fair verifier**, and a **Settings** page (volume,
  reduced motion, reset)

Your balance, level, XP, achievements, jackpot and bet history persist in
`localStorage`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Tech

React 18 · TypeScript · Vite · React Router · Zustand (persisted store). No UI
framework — a single hand-rolled CSS design system in `src/index.css`.

## Project layout

```
src/
  components/   Layout, Sidebar, Topbar, GameCard, PlayingCard, shared game UI
  data/         games.ts (originals registry), slots.ts (themed slot configs)
  games/        one component per game (Dice, Limbo, …, Slot engine)
  lib/          rng.ts (crypto RNG), cards.ts (deck), format.ts
  pages/        Home, Casino, lobbies, Promotions, VIP, Leaderboard, Fairness,
                Wallet, Profile, route resolvers
  store/        wallet.ts (balance, XP, history — persisted)
```
