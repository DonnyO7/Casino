import { randInt, shuffle } from './rng'

export const SUITS = ['♠', '♥', '♦', '♣'] as const
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const

export type Suit = (typeof SUITS)[number]
export type Rank = (typeof RANKS)[number]

export interface Card {
  rank: Rank
  suit: Suit
  /** 1..13 ordering for Hi-Lo */
  order: number
}

export function freshDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    RANKS.forEach((rank, i) => deck.push({ rank, suit, order: i + 1 }))
  }
  return shuffle(deck)
}

export function randomCard(): Card {
  const suit = SUITS[randInt(0, 3)]
  const i = randInt(0, 12)
  return { rank: RANKS[i], suit, order: i + 1 }
}

export function isRed(c: Card): boolean {
  return c.suit === '♥' || c.suit === '♦'
}

/** Blackjack value of a rank (Ace handled by caller). */
export function bjValue(c: Card): number {
  if (c.rank === 'A') return 11
  if (['10', 'J', 'Q', 'K'].includes(c.rank)) return 10
  return parseInt(c.rank)
}

export function handTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = 0
  let aces = 0
  for (const c of cards) {
    total += bjValue(c)
    if (c.rank === 'A') aces++
  }
  let soft = aces > 0
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  soft = aces > 0 && total <= 21
  return { total, soft }
}
