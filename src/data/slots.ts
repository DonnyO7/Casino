// Themed slot machines. They all share one engine (src/games/Slot.tsx).
//
// Fairness: the engine spins 3 independent weighted reels and pays on a
// 3-of-a-kind on the centre line. We define each symbol's *relative* payout,
// then the engine auto-scales every payout so the theoretical RTP equals
// exactly TARGET_RTP (99%). That means no theme can be rigged against you —
// rarer symbols simply pay proportionally more.

export interface SlotSymbol {
  icon: string
  weight: number // how often it appears on a reel
  pay: number // relative 3-of-a-kind payout (auto-scaled by the engine)
  name: string
}

export interface SlotConfig {
  slug: string
  name: string
  blurb: string
  accent: string // "colorA,colorB"
  bg: string // page background gradient
  tag?: string
  tumble?: boolean // cascading reels: wins explode and new symbols drop in
  expandWilds?: boolean // in free spins, a wild expands to fill its reel
  symbols: SlotSymbol[]
}

export const TARGET_RTP = 0.99

export const SLOTS: SlotConfig[] = [
  {
    slug: 'norse-fury',
    expandWilds: true,
    name: 'Norse Fury',
    blurb: 'Raid the halls of Valhalla with the vikings.',
    accent: '#5c8aff,#23e0c8',
    bg: '#0a1320,#0b0e16',
    tag: 'HOT',
    symbols: [
      { icon: '🪓', weight: 24, pay: 3, name: 'Axe' },
      { icon: '🛡️', weight: 22, pay: 4, name: 'Shield' },
      { icon: '⚔️', weight: 18, pay: 6, name: 'Swords' },
      { icon: '🏹', weight: 14, pay: 9, name: 'Bow' },
      { icon: '🐺', weight: 10, pay: 16, name: 'Wolf' },
      { icon: '⚡', weight: 7, pay: 30, name: 'Thunder' },
      { icon: '👑', weight: 4, pay: 80, name: 'Crown' },
      { icon: '🪐', weight: 2, pay: 250, name: 'Bifrost' },
    ],
  },
  {
    slug: 'desert-bandit',
    name: 'Desert Bandit',
    blurb: 'Stick up the saloon and ride off with the loot.',
    accent: '#ffb15c,#ff5c5c',
    bg: '#1d1108,#0b0e16',
    tag: 'HOT',
    symbols: [
      { icon: '🤠', weight: 24, pay: 3, name: 'Bandit' },
      { icon: '🐎', weight: 21, pay: 4, name: 'Horse' },
      { icon: '🔫', weight: 18, pay: 6, name: 'Revolver' },
      { icon: '🪙', weight: 13, pay: 10, name: 'Gold' },
      { icon: '💀', weight: 9, pay: 18, name: 'Skull' },
      { icon: '🏜️', weight: 7, pay: 33, name: 'Dunes' },
      { icon: '💰', weight: 4, pay: 90, name: 'Sack' },
      { icon: '⭐', weight: 2, pay: 300, name: 'Sheriff' },
    ],
  },
  {
    slug: 'sweet-rush',
    tumble: true,
    name: 'Sweet Rush',
    blurb: 'A sugar-coated cascade of candy wins.',
    accent: '#ff5c8a,#b15cff',
    bg: '#1a0a16,#0b0e16',
    tag: 'NEW',
    symbols: [
      { icon: '🍬', weight: 24, pay: 3, name: 'Candy' },
      { icon: '🍭', weight: 21, pay: 4, name: 'Lolly' },
      { icon: '🍓', weight: 18, pay: 6, name: 'Berry' },
      { icon: '🍇', weight: 13, pay: 10, name: 'Grapes' },
      { icon: '🍫', weight: 9, pay: 18, name: 'Choc' },
      { icon: '🍩', weight: 7, pay: 33, name: 'Donut' },
      { icon: '🎂', weight: 4, pay: 90, name: 'Cake' },
      { icon: '💎', weight: 2, pay: 320, name: 'Diamond' },
    ],
  },
  {
    slug: 'pharaohs-gold',
    expandWilds: true,
    name: "Pharaoh's Gold",
    blurb: 'Unearth the riches of the ancient tombs.',
    accent: '#ffd15c,#ffb15c',
    bg: '#161204,#0b0e16',
    symbols: [
      { icon: '🪬', weight: 24, pay: 3, name: 'Amulet' },
      { icon: '🐍', weight: 21, pay: 4, name: 'Cobra' },
      { icon: '🪲', weight: 18, pay: 6, name: 'Scarab' },
      { icon: '👁️', weight: 13, pay: 10, name: 'Eye' },
      { icon: '🏺', weight: 9, pay: 18, name: 'Vase' },
      { icon: '🐫', weight: 7, pay: 33, name: 'Camel' },
      { icon: '👑', weight: 4, pay: 90, name: 'Nemes' },
      { icon: '🔆', weight: 2, pay: 300, name: 'Sun' },
    ],
  },
  {
    slug: 'neon-fruits',
    name: 'Neon Fruits',
    blurb: 'Retro fruit machine, cyberpunk skin.',
    accent: '#23e0c8,#5cffb1',
    bg: '#04161a,#0b0e16',
    symbols: [
      { icon: '🍒', weight: 24, pay: 3, name: 'Cherry' },
      { icon: '🍋', weight: 21, pay: 4, name: 'Lemon' },
      { icon: '🍊', weight: 18, pay: 6, name: 'Orange' },
      { icon: '🍉', weight: 13, pay: 10, name: 'Melon' },
      { icon: '🔔', weight: 9, pay: 18, name: 'Bell' },
      { icon: '⭐', weight: 7, pay: 33, name: 'Star' },
      { icon: '7️⃣', weight: 4, pay: 90, name: 'Seven' },
      { icon: '💎', weight: 2, pay: 300, name: 'Diamond' },
    ],
  },
  {
    slug: 'lucky-koi',
    name: 'Lucky Koi',
    blurb: 'Fortune flows through the lotus pond.',
    accent: '#ff5c5c,#ffd15c',
    bg: '#1a0606,#0b0e16',
    symbols: [
      { icon: '🐟', weight: 24, pay: 3, name: 'Koi' },
      { icon: '🪷', weight: 21, pay: 4, name: 'Lotus' },
      { icon: '🏮', weight: 18, pay: 6, name: 'Lantern' },
      { icon: '🎋', weight: 13, pay: 10, name: 'Bamboo' },
      { icon: '🐉', weight: 9, pay: 18, name: 'Dragon' },
      { icon: '🧧', weight: 7, pay: 33, name: 'Envelope' },
      { icon: '🪙', weight: 4, pay: 90, name: 'Coin' },
      { icon: '☯️', weight: 2, pay: 300, name: 'Harmony' },
    ],
  },
  {
    slug: 'jungle-quest',
    name: 'Jungle Quest',
    blurb: 'Hack through the vines to the idol.',
    accent: '#5cffb1,#23e0c8',
    bg: '#06160a,#0b0e16',
    symbols: [
      { icon: '🐒', weight: 24, pay: 3, name: 'Monkey' },
      { icon: '🦜', weight: 21, pay: 4, name: 'Parrot' },
      { icon: '🐍', weight: 18, pay: 6, name: 'Snake' },
      { icon: '🍌', weight: 13, pay: 10, name: 'Banana' },
      { icon: '🐯', weight: 9, pay: 18, name: 'Tiger' },
      { icon: '🗿', weight: 7, pay: 33, name: 'Idol' },
      { icon: '💎', weight: 4, pay: 90, name: 'Gem' },
      { icon: '🌋', weight: 2, pay: 300, name: 'Volcano' },
    ],
  },
  {
    slug: 'frost-bite',
    name: 'Frost Bite',
    blurb: 'Icy reels with avalanche-sized payouts.',
    accent: '#5c8aff,#5cffe0',
    bg: '#06101a,#0b0e16',
    tag: 'NEW',
    symbols: [
      { icon: '❄️', weight: 24, pay: 3, name: 'Flake' },
      { icon: '🐧', weight: 21, pay: 4, name: 'Penguin' },
      { icon: '🧊', weight: 18, pay: 6, name: 'Ice' },
      { icon: '🐻‍❄️', weight: 13, pay: 10, name: 'Bear' },
      { icon: '🦌', weight: 9, pay: 18, name: 'Deer' },
      { icon: '🏔️', weight: 7, pay: 33, name: 'Peak' },
      { icon: '💎', weight: 4, pay: 90, name: 'Crystal' },
      { icon: '🌌', weight: 2, pay: 300, name: 'Aurora' },
    ],
  },
  {
    slug: 'gates-of-olympus',
    expandWilds: true,
    name: 'Mount Olympus',
    blurb: 'Summon the gods for divine multipliers.',
    accent: '#b15cff,#5c8aff',
    bg: '#0e0820,#0b0e16',
    tag: 'HOT',
    symbols: [
      { icon: '⚡', weight: 24, pay: 3, name: 'Bolt' },
      { icon: '🏛️', weight: 21, pay: 4, name: 'Temple' },
      { icon: '🦅', weight: 18, pay: 6, name: 'Eagle' },
      { icon: '🔱', weight: 13, pay: 10, name: 'Trident' },
      { icon: '🏺', weight: 9, pay: 18, name: 'Urn' },
      { icon: '💍', weight: 7, pay: 33, name: 'Ring' },
      { icon: '👑', weight: 4, pay: 90, name: 'Crown' },
      { icon: '⚜️', weight: 2, pay: 300, name: 'Zeus' },
    ],
  },
  {
    slug: 'pirate-plunder',
    name: 'Pirate Plunder',
    blurb: 'Hoist the sails for buried treasure.',
    accent: '#23e0c8,#ffd15c',
    bg: '#04141a,#0b0e16',
    symbols: [
      { icon: '🦜', weight: 24, pay: 3, name: 'Parrot' },
      { icon: '⚓', weight: 21, pay: 4, name: 'Anchor' },
      { icon: '🗡️', weight: 18, pay: 6, name: 'Cutlass' },
      { icon: '🧭', weight: 13, pay: 10, name: 'Compass' },
      { icon: '🦴', weight: 9, pay: 18, name: 'Bones' },
      { icon: '🏴‍☠️', weight: 7, pay: 33, name: 'Flag' },
      { icon: '💰', weight: 4, pay: 90, name: 'Chest' },
      { icon: '💎', weight: 2, pay: 300, name: 'Jewel' },
    ],
  },
  {
    slug: 'galaxy-spin',
    name: 'Galaxy Spin',
    blurb: 'Warp through the cosmos for stellar wins.',
    accent: '#7c5cff,#23e0c8',
    bg: '#0a0820,#0b0e16',
    symbols: [
      { icon: '🚀', weight: 24, pay: 3, name: 'Rocket' },
      { icon: '🛸', weight: 21, pay: 4, name: 'UFO' },
      { icon: '🌙', weight: 18, pay: 6, name: 'Moon' },
      { icon: '☄️', weight: 13, pay: 10, name: 'Comet' },
      { icon: '🪐', weight: 9, pay: 18, name: 'Planet' },
      { icon: '👽', weight: 7, pay: 33, name: 'Alien' },
      { icon: '⭐', weight: 4, pay: 90, name: 'Star' },
      { icon: '🌌', weight: 2, pay: 300, name: 'Galaxy' },
    ],
  },
  {
    slug: 'diamond-vault',
    name: 'Diamond Vault',
    blurb: 'Crack the vault for the high-roller jackpot.',
    accent: '#5cffe0,#5c8aff',
    bg: '#06121a,#0b0e16',
    tag: 'VIP',
    symbols: [
      { icon: '🔑', weight: 24, pay: 3, name: 'Key' },
      { icon: '💵', weight: 21, pay: 4, name: 'Cash' },
      { icon: '💳', weight: 18, pay: 6, name: 'Card' },
      { icon: '🪙', weight: 13, pay: 10, name: 'Coin' },
      { icon: '⌚', weight: 9, pay: 18, name: 'Watch' },
      { icon: '💍', weight: 7, pay: 33, name: 'Ring' },
      { icon: '🏆', weight: 4, pay: 90, name: 'Trophy' },
      { icon: '💎', weight: 2, pay: 350, name: 'Diamond' },
    ],
  },
  {
    slug: 'aztec-sun',
    tumble: true,
    name: 'Aztec Sun',
    blurb: 'Climb the temple steps to the golden idol.',
    accent: '#ffb15c,#5cffb1',
    bg: '#161004,#0b0e16',
    symbols: [
      { icon: '🌽', weight: 24, pay: 3, name: 'Maize' },
      { icon: '🗿', weight: 21, pay: 4, name: 'Statue' },
      { icon: '🐆', weight: 18, pay: 6, name: 'Jaguar' },
      { icon: '🪶', weight: 13, pay: 10, name: 'Feather' },
      { icon: '🏹', weight: 9, pay: 18, name: 'Arrow' },
      { icon: '🐍', weight: 7, pay: 33, name: 'Serpent' },
      { icon: '🌞', weight: 4, pay: 90, name: 'Sun' },
      { icon: '🟡', weight: 2, pay: 300, name: 'Idol' },
    ],
  },
  {
    slug: 'wild-west-gold',
    name: 'Wild West Gold',
    blurb: 'Strike it rich at the frontier mine.',
    accent: '#ffd15c,#ff7a52',
    bg: '#1a1206,#0b0e16',
    tag: 'HOT',
    symbols: [
      { icon: '⛏️', weight: 24, pay: 3, name: 'Pick' },
      { icon: '🪣', weight: 21, pay: 4, name: 'Pan' },
      { icon: '🐴', weight: 18, pay: 6, name: 'Mule' },
      { icon: '🚂', weight: 13, pay: 10, name: 'Train' },
      { icon: '💣', weight: 9, pay: 18, name: 'Dynamite' },
      { icon: '🥃', weight: 7, pay: 33, name: 'Whiskey' },
      { icon: '🪙', weight: 4, pay: 90, name: 'Nugget' },
      { icon: '💰', weight: 2, pay: 300, name: 'Motherlode' },
    ],
  },
  {
    slug: 'cyber-spin',
    name: 'Cyber Spin',
    blurb: 'Neon-drenched reels from the year 2099.',
    accent: '#ff5c8a,#23e0c8',
    bg: '#10041a,#0b0e16',
    tag: 'NEW',
    symbols: [
      { icon: '🤖', weight: 24, pay: 3, name: 'Droid' },
      { icon: '💾', weight: 21, pay: 4, name: 'Disk' },
      { icon: '🕹️', weight: 18, pay: 6, name: 'Joystick' },
      { icon: '📡', weight: 13, pay: 10, name: 'Dish' },
      { icon: '⚙️', weight: 9, pay: 18, name: 'Gear' },
      { icon: '🔋', weight: 7, pay: 33, name: 'Cell' },
      { icon: '💿', weight: 4, pay: 90, name: 'Holo' },
      { icon: '🧬', weight: 2, pay: 320, name: 'Core' },
    ],
  },
  {
    slug: 'fortune-panda',
    tumble: true,
    name: 'Fortune Panda',
    blurb: 'Bamboo, blossoms and bountiful bonuses.',
    accent: '#5cffb1,#ff5c8a',
    bg: '#06160e,#0b0e16',
    symbols: [
      { icon: '🐼', weight: 24, pay: 3, name: 'Panda' },
      { icon: '🎍', weight: 21, pay: 4, name: 'Bamboo' },
      { icon: '🌸', weight: 18, pay: 6, name: 'Blossom' },
      { icon: '🍵', weight: 13, pay: 10, name: 'Tea' },
      { icon: '🏯', weight: 9, pay: 18, name: 'Castle' },
      { icon: '🎐', weight: 7, pay: 33, name: 'Chime' },
      { icon: '🧧', weight: 4, pay: 90, name: 'Envelope' },
      { icon: '🐲', weight: 2, pay: 300, name: 'Dragon' },
    ],
  },
  {
    slug: 'big-bass-bonanza',
    tumble: true,
    name: 'Big Catch',
    blurb: 'Cast a line for the lunker payout.',
    accent: '#5c8aff,#5cffe0',
    bg: '#04121a,#0b0e16',
    symbols: [
      { icon: '🪱', weight: 24, pay: 3, name: 'Bait' },
      { icon: '🎣', weight: 21, pay: 4, name: 'Rod' },
      { icon: '🦐', weight: 18, pay: 6, name: 'Shrimp' },
      { icon: '🦀', weight: 13, pay: 10, name: 'Crab' },
      { icon: '🐠', weight: 9, pay: 18, name: 'Fish' },
      { icon: '🐡', weight: 7, pay: 33, name: 'Puffer' },
      { icon: '🦈', weight: 4, pay: 90, name: 'Shark' },
      { icon: '🐋', weight: 2, pay: 300, name: 'Whale' },
    ],
  },
  {
    slug: 'vampire-riches',
    name: 'Vampire Riches',
    blurb: 'Sink your teeth into the midnight jackpot.',
    accent: '#ff5470,#b15cff',
    bg: '#16060e,#0b0e16',
    tag: 'HOT',
    expandWilds: true,
    symbols: [
      { icon: '🦇', weight: 24, pay: 3, name: 'Bat' },
      { icon: '🕯️', weight: 21, pay: 4, name: 'Candle' },
      { icon: '⚰️', weight: 18, pay: 6, name: 'Coffin' },
      { icon: '🩸', weight: 13, pay: 10, name: 'Blood' },
      { icon: '🗝️', weight: 9, pay: 18, name: 'Key' },
      { icon: '🏰', weight: 7, pay: 33, name: 'Castle' },
      { icon: '💍', weight: 4, pay: 90, name: 'Ring' },
      { icon: '🧛', weight: 2, pay: 320, name: 'Count' },
    ],
  },
  {
    slug: 'samurai-spin',
    name: 'Samurai Spin',
    blurb: 'Honour and gold on the path of the blade.',
    accent: '#ff7a52,#23e0c8',
    bg: '#160a0a,#0b0e16',
    symbols: [
      { icon: '🍣', weight: 24, pay: 3, name: 'Sushi' },
      { icon: '🎏', weight: 21, pay: 4, name: 'Koi Flag' },
      { icon: '🏯', weight: 18, pay: 6, name: 'Castle' },
      { icon: '🍶', weight: 13, pay: 10, name: 'Sake' },
      { icon: '🗾', weight: 9, pay: 18, name: 'Map' },
      { icon: '⛩️', weight: 7, pay: 33, name: 'Gate' },
      { icon: '🗡️', weight: 4, pay: 90, name: 'Katana' },
      { icon: '👹', weight: 2, pay: 300, name: 'Oni' },
    ],
  },
  {
    slug: 'rio-carnival',
    name: 'Rio Carnival',
    blurb: 'Samba your way to a fiesta of wins.',
    accent: '#ffd15c,#ff5c8a',
    bg: '#1a0612,#0b0e16',
    tag: 'NEW',
    tumble: true,
    symbols: [
      { icon: '🎉', weight: 24, pay: 3, name: 'Confetti' },
      { icon: '🪅', weight: 21, pay: 4, name: 'Piñata' },
      { icon: '🥁', weight: 18, pay: 6, name: 'Drum' },
      { icon: '🦩', weight: 13, pay: 10, name: 'Flamingo' },
      { icon: '🍹', weight: 9, pay: 18, name: 'Cocktail' },
      { icon: '🎭', weight: 7, pay: 33, name: 'Mask' },
      { icon: '🪶', weight: 4, pay: 90, name: 'Feather' },
      { icon: '👑', weight: 2, pay: 300, name: 'Queen' },
    ],
  },
  {
    slug: 'leprechaun-luck',
    name: "Leprechaun's Luck",
    blurb: 'Follow the rainbow to the pot of gold.',
    accent: '#5cffb1,#ffd15c',
    bg: '#06160c,#0b0e16',
    symbols: [
      { icon: '🍀', weight: 24, pay: 3, name: 'Clover' },
      { icon: '🎩', weight: 21, pay: 4, name: 'Hat' },
      { icon: '🪙', weight: 18, pay: 6, name: 'Coin' },
      { icon: '🍺', weight: 13, pay: 10, name: 'Ale' },
      { icon: '🐸', weight: 9, pay: 18, name: 'Frog' },
      { icon: '🎻', weight: 7, pay: 33, name: 'Fiddle' },
      { icon: '💰', weight: 4, pay: 90, name: 'Pot' },
      { icon: '🧙', weight: 2, pay: 300, name: 'Leprechaun' },
    ],
  },
  {
    slug: 'safari-spins',
    name: 'Safari Spins',
    blurb: 'Track the big five across the savanna.',
    accent: '#ffb15c,#5cffb1',
    bg: '#12100a,#0b0e16',
    symbols: [
      { icon: '🦓', weight: 24, pay: 3, name: 'Zebra' },
      { icon: '🦒', weight: 21, pay: 4, name: 'Giraffe' },
      { icon: '🦛', weight: 18, pay: 6, name: 'Hippo' },
      { icon: '🐘', weight: 13, pay: 10, name: 'Elephant' },
      { icon: '🦏', weight: 9, pay: 18, name: 'Rhino' },
      { icon: '🦁', weight: 7, pay: 33, name: 'Lion' },
      { icon: '🐆', weight: 4, pay: 90, name: 'Leopard' },
      { icon: '🌅', weight: 2, pay: 300, name: 'Sunset' },
    ],
  },
  {
    slug: 'candy-cosmos',
    name: 'Candy Cosmos',
    blurb: 'Sweet treats from a galaxy far away.',
    accent: '#b15cff,#23e0c8',
    bg: '#0c0620,#0b0e16',
    tag: 'NEW',
    tumble: true,
    symbols: [
      { icon: '🍭', weight: 24, pay: 3, name: 'Lolly' },
      { icon: '🌟', weight: 21, pay: 4, name: 'Star' },
      { icon: '🍪', weight: 18, pay: 6, name: 'Cookie' },
      { icon: '🧁', weight: 13, pay: 10, name: 'Cupcake' },
      { icon: '🍫', weight: 9, pay: 18, name: 'Choc' },
      { icon: '🪐', weight: 7, pay: 33, name: 'Planet' },
      { icon: '🍩', weight: 4, pay: 90, name: 'Donut' },
      { icon: '☄️', weight: 2, pay: 300, name: 'Comet' },
    ],
  },
]

export function findSlot(slug: string): SlotConfig | undefined {
  return SLOTS.find((s) => s.slug === slug)
}

// Compute the auto-scaled payout table so RTP === TARGET_RTP for a
// 3-independent-reel, 3-of-a-kind-pays model.
export function scaledPayouts(cfg: SlotConfig): { multipliers: number[]; rtpRaw: number } {
  const W = cfg.symbols.reduce((s, x) => s + x.weight, 0)
  // raw RTP if we paid exactly `pay` for each triple
  const rtpRaw = cfg.symbols.reduce((acc, s) => {
    const p = s.weight / W
    return acc + p * p * p * s.pay
  }, 0)
  const scale = TARGET_RTP / rtpRaw
  return {
    multipliers: cfg.symbols.map((s) => s.pay * scale),
    rtpRaw,
  }
}
