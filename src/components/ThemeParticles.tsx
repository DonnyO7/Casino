import { useMemo } from 'react'

// Ambient drifting symbols behind a slot's reels.
export default function ThemeParticles({ icons }: { icons: string[] }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        icon: icons[i % icons.length],
        left: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 7 + Math.random() * 7,
        size: 16 + Math.random() * 22,
      })),
    [icons],
  )
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            bottom: -30,
            fontSize: b.size,
            opacity: 0,
            animation: `floatUp ${b.dur}s linear ${b.delay}s infinite`,
            filter: 'blur(0.4px)',
          }}
        >
          {b.icon}
        </span>
      ))}
    </div>
  )
}
