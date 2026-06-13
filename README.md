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

**26+ games across three categories:**

- **Originals** — Dice, Limbo, Plinko, Crash, Mines, Keno, Wheel, Hi-Lo,
  Dragon Tower, Coin Flip
- **Table games** — Roulette (single-zero, fair payouts), Blackjack, Baccarat,
  Video Poker (Jacks or Better)
- **12 themed slots** — Norse Fury, Desert Bandit, Sweet Rush, Pharaoh's Gold,
  Neon Fruits, Lucky Koi, Jungle Quest, Frost Bite, Mount Olympus, Pirate
  Plunder, Galaxy Spin, Diamond Vault — all driven by one engine that
  auto-balances each machine to a 99% RTP.

**Plus full casino chrome:** lobby with search/filter, slots & originals
lobbies, daily-bonus promotions, a VIP tier/level system, a leaderboard, a
wallet with deposit/reset + bet history, a personal stats dashboard, and the
provably-fair explainer.

Your balance, level, XP and full bet history persist in `localStorage`.

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
