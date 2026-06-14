// Cryptographically-seeded RNG helpers.
// Every game uses these so odds are mathematically fair — payouts are set to
// 1 / probability with NO house edge. This is the "no scam" promise.

export function rand(): number {
  // 32 bits of crypto randomness mapped to [0, 1)
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / 0x100000000
}

// random float in [min, max)
export function randFloat(min: number, max: number): number {
  return min + rand() * (max - min)
}

// random integer in [min, max] inclusive
export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

// pick a random element
export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

// Fisher–Yates shuffle (returns a new array)
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// A short random hex string, used to display a "server seed" for the
// provably-fair theming.
export function seedHex(len = 16): string {
  const buf = new Uint8Array(len)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
}
