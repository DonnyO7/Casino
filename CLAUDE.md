# NOVA Casino — repo guide for Claude

A play-money "provably fair" online casino: React 18 + TypeScript + Vite, React
Router, Zustand (persisted). Single hand-rolled CSS design system in
`src/index.css`. No backend — everything runs in the browser and persists to
`localStorage`.

## Commands
- `npm run dev` — Vite dev server (host 0.0.0.0, port 5173)
- `npm run build` — `tsc -b && vite build` (use this to type-check)
- `npm run preview` — serve the production build

## Core principle: fairness
Originals pay **exactly 1 ÷ probability** (zero house edge). Slots are
**Monte-Carlo calibrated** to ~99% RTP. All randomness comes from
`crypto.getRandomValues` via `src/lib/rng.ts`. Keep this property when editing —
if you add a game, the expected value of a bet must be ≤ break-even and clearly
fair; for variable-payout games, normalise the payout table to a target EV.

## Layout
- `src/lib/` — `rng.ts`, `cards.ts`, `format.ts`, `sound.ts`, `music.ts`,
  `confetti.ts`, `slotEngine.ts` (the 5×3 / 20-line slot engine with wilds,
  scatters, free spins, tumble/orb/expand/sticky mechanics + RTP calibration),
  `useCountUp.ts`
- `src/store/` — `wallet.ts` (balance/XP/level/history; `payout()` is the
  central settle that also feeds jackpot, tournament, achievements, sound,
  confetti feed), plus `feed`, `jackpot`, `achievements`, `tournament`,
  `recents`, `favorites`, `settings`
- `src/games/` — one component per game; `Slot.tsx` is the shared slot UI driven
  by configs in `src/data/slots.ts`
- `src/data/` — `games.ts` (originals/table registry), `slots.ts` (slot configs)
- `src/pages/` — lobbies, promos, VIP, leaderboard, tournaments, fairness,
  wallet, profile, achievements, settings, and the `GameRoute`/`SlotRoute`
  resolvers
- `src/components/` — Layout shell, GameUI (`GameShell`, `BetAmount`, `StatRow`),
  `AutoBet` (shared auto-bet hook), overlays/toasts/effects

## Adding a game
1. Create `src/games/Foo.tsx` using `GameShell` + `BetAmount`; settle via
   `wallet.placeBet(bet)` then `wallet.payout(name, bet, multiplier)`.
2. Register it in `src/data/games.ts` (ORIGINALS) and in `MAP` in
   `src/pages/GameRoute.tsx`.

## Adding a slot
Add a `SlotConfig` to `SLOTS` in `src/data/slots.ts` (8 symbols, weights, base
pays). Optional flags: `tumble`, `expandWilds`, `stickyWilds`. The engine
auto-calibrates RTP on first open.

Always run `npm run build` before committing to catch type errors.
