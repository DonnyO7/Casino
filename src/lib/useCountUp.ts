import { useEffect, useRef, useState } from 'react'

/** Smoothly animates a number toward `value`. */
export function useCountUp(value: number, ms = 600): number {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const raf = useRef<number>()

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      const cur = from + (to - from) * eased
      setDisplay(cur)
      fromRef.current = cur
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else {
        fromRef.current = to
        setDisplay(to)
      }
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current!)
  }, [value, ms])

  return display
}
