import { useEffect, useRef } from 'react'
import { useFeed } from '../store/feed'
import { fireConfetti, screenFlash } from '../lib/confetti'

// Listens to the global win feed and fires celebratory effects for the
// current player's notable wins — works across every game centrally.
export default function Effects() {
  const last = useRef<string | null>(null)
  useEffect(() => {
    return useFeed.subscribe((s) => {
      const w = s.wins[0]
      if (!w || w.id === last.current) return
      last.current = w.id
      if (w.multiplier >= 10) {
        fireConfetti({ count: 240, power: 16, originY: 0.4 })
        setTimeout(() => fireConfetti({ count: 120, originX: 0.25, power: 13 }), 150)
        setTimeout(() => fireConfetti({ count: 120, originX: 0.75, power: 13 }), 300)
        screenFlash('rgba(255,209,92,0.4)')
      } else if (w.multiplier >= 3) {
        fireConfetti({ count: 90, power: 11 })
      }
    })
  }, [])
  return null
}
