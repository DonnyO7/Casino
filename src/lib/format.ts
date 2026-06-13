export function money(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function compact(n: number): string {
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function mult(n: number): string {
  return `${n.toFixed(2)}×`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
