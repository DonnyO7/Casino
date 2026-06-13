export interface GameMeta {
  slug: string
  name: string
  category: 'originals' | 'table' | 'slots'
  tag?: string // "HOT", "NEW", etc.
  accent: string // gradient pair "a,b"
  emoji: string
  blurb: string
}

export const ORIGINALS: GameMeta[] = [
  { slug: 'dice', name: 'Dice', category: 'originals', tag: 'HOT', accent: '#7c5cff,#23e0c8', emoji: '🎲', blurb: 'Roll over or under. Set your own win chance.' },
  { slug: 'limbo', name: 'Limbo', category: 'originals', tag: 'HOT', accent: '#ff5c8a,#ffb15c', emoji: '🚀', blurb: 'Pick a target multiplier and beat the crash.' },
  { slug: 'plinko', name: 'Plinko', category: 'originals', tag: 'HOT', accent: '#23e0c8,#5cffb1', emoji: '🔵', blurb: 'Drop the ball, ride the pegs into a multiplier.' },
  { slug: 'crash', name: 'Crash', category: 'originals', tag: 'LIVE', accent: '#ff5c5c,#ff9f5c', emoji: '📈', blurb: 'Cash out before the rocket explodes.' },
  { slug: 'mines', name: 'Mines', category: 'originals', tag: 'HOT', accent: '#5c8aff,#5cffe0', emoji: '💣', blurb: 'Reveal gems, dodge the mines, cash out.' },
  { slug: 'keno', name: 'Keno', category: 'originals', accent: '#b15cff,#5c8aff', emoji: '🔢', blurb: 'Pick your lucky numbers and watch the draw.' },
  { slug: 'wheel', name: 'Wheel', category: 'originals', accent: '#ffd15c,#ff5c8a', emoji: '🎡', blurb: 'Spin the wheel of fortune across risk levels.' },
  { slug: 'hilo', name: 'Hi-Lo', category: 'originals', accent: '#5cffb1,#23e0c8', emoji: '🃏', blurb: 'Guess higher or lower, stack the multiplier.' },
  { slug: 'tower', name: 'Dragon Tower', category: 'originals', tag: 'NEW', accent: '#ff5c5c,#ffd15c', emoji: '🐉', blurb: 'Climb the tower, avoid the eggs.' },
  { slug: 'coinflip', name: 'Coin Flip', category: 'originals', accent: '#ffd15c,#ffb15c', emoji: '🪙', blurb: 'Heads or tails. The original 50/50.' },
  { slug: 'cases', name: 'Mystery Cases', category: 'originals', tag: 'NEW', accent: '#5cffe0,#7c5cff', emoji: '📦', blurb: 'Spin the case for a multiplier drop.' },
  { slug: 'sicbo', name: 'Sic Bo', category: 'originals', accent: '#ff7a52,#ffd15c', emoji: '🎲', blurb: 'Three dice, dozens of bets, true odds.' },
  { slug: 'scratch', name: 'Scratch Cards', category: 'originals', tag: 'NEW', accent: '#ff5c8a,#23e0c8', emoji: '🎟️', blurb: 'Scratch the panels, match 3 to win.' },
  { slug: 'diamonds', name: 'Diamonds', category: 'originals', tag: 'NEW', accent: '#5cffe0,#b15cff', emoji: '💎', blurb: 'Draw five gems, match the colours.' },
  { slug: 'roulette', name: 'Roulette', category: 'table', accent: '#ff5c5c,#5c8aff', emoji: '🎯', blurb: 'European single-zero roulette.' },
  { slug: 'blackjack', name: 'Blackjack', category: 'table', tag: 'HOT', accent: '#5cffb1,#5c8aff', emoji: '♠️', blurb: 'Hit, stand, double — beat the dealer to 21.' },
  { slug: 'baccarat', name: 'Baccarat', category: 'table', accent: '#b15cff,#ff5c8a', emoji: '🀄', blurb: 'Player, Banker or Tie. The high-roller classic.' },
  { slug: 'videopoker', name: 'Video Poker', category: 'table', accent: '#23e0c8,#7c5cff', emoji: '🂡', blurb: 'Jacks or Better. Hold and draw for the win.' },
]

export function findGame(slug: string): GameMeta | undefined {
  return ORIGINALS.find((g) => g.slug === slug)
}
