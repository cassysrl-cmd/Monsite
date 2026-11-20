import type { CSSProperties } from 'react'
import { Snowflake } from 'lucide-react'

const DOT_COUNT = 60
const CRYSTAL_COUNT = 28

const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const seed = (i * 37) % 100
  return {
    left: `${(i * 61 + 7) % 100}%`,
    size: 3 + ((i * 7) % 6),
    opacity: 0.35 + ((i * 13) % 45) / 100,
    duration: `${10 + (seed % 14)}s`,
    delay: `-${(i * 53) % 24}s`,
    sway: `${(i % 2 === 0 ? 1 : -1) * (15 + (seed % 35))}px`,
  }
})

const CRYSTALS = Array.from({ length: CRYSTAL_COUNT }, (_, i) => {
  const seed = (i * 29) % 100
  return {
    left: `${(i * 43 + 3) % 100}%`,
    size: 12 + ((i * 11) % 18),
    opacity: 0.4 + ((i * 17) % 45) / 100,
    duration: `${12 + (seed % 14)}s`,
    delay: `-${(i * 41) % 26}s`,
    spin: `${6 + (seed % 8)}s`,
    sway: `${(i % 2 === 0 ? -1 : 1) * (20 + (seed % 40))}px`,
  }
})

export function FestiveBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="starfield absolute inset-0 opacity-70" />
      {DOTS.map((flake, i) => (
        <span
          key={`dot-${i}`}
          className="snowflake absolute -top-4 rounded-full bg-white"
          style={
            {
              left: flake.left,
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
              animationDuration: flake.duration,
              animationDelay: flake.delay,
              '--sway': flake.sway,
            } as CSSProperties
          }
        />
      ))}
      {CRYSTALS.map((flake, i) => (
        <span
          key={`crystal-${i}`}
          className="snowflake snowflake-crystal absolute -top-8 text-white"
          style={
            {
              left: flake.left,
              opacity: flake.opacity,
              animationDuration: flake.duration,
              animationDelay: flake.delay,
              '--sway': flake.sway,
            } as CSSProperties
          }
        >
          <Snowflake
            className="snowflake-spin"
            style={{ width: flake.size, height: flake.size, animationDuration: flake.spin }}
            strokeWidth={1.5}
          />
        </span>
      ))}
    </div>
  )
}
