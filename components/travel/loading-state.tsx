"use client"

import { useEffect, useState } from "react"

const LOADING_MESSAGES = [
  "Calculating route...",
  "Discovering hidden gems...",
  "Planning your adventure...",
  "Finding the best spots...",
  "Crafting your perfect day...",
]

/**
 * Low-poly airplane built from flat-shaded SVG polygons.
 * Faceted shading is achieved by using multiple solid color tones per surface
 * (lighter on top-facing facets, darker on bottom/shadowed ones).
 */
function LowPolyAirplane({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Tail fin (vertical) */}
      <polygon points="40,80 28,40 50,72" fill="#1e3a8a" />
      <polygon points="40,80 50,72 56,82" fill="#2563eb" />

      {/* Tail wing (horizontal stabilizer, back) */}
      <polygon points="38,82 18,90 50,86" fill="#1e40af" />
      <polygon points="50,86 18,90 30,96" fill="#1e3a8a" />

      {/* Main fuselage — top half (lighter) */}
      <polygon points="50,72 200,68 210,80 50,84" fill="#3b82f6" />
      {/* Main fuselage — bottom half (darker) */}
      <polygon points="50,84 210,80 200,92 50,96" fill="#1d4ed8" />

      {/* Nose cone — top facet */}
      <polygon points="200,68 230,82 210,80" fill="#60a5fa" />
      {/* Nose cone — bottom facet */}
      <polygon points="210,80 230,82 200,92" fill="#2563eb" />

      {/* Main wing — top facet (lighter, catches light) */}
      <polygon points="100,82 80,118 150,108 140,82" fill="#2563eb" />
      {/* Main wing — leading edge highlight */}
      <polygon points="100,82 140,82 120,90" fill="#3b82f6" />
      {/* Main wing — trailing shadow */}
      <polygon points="80,118 150,108 130,118" fill="#1e3a8a" />

      {/* Cockpit window strip */}
      <polygon points="180,72 198,72 196,78 180,78" fill="#0f172a" />
      <polygon points="180,72 184,72 182,76 180,76" fill="#38bdf8" />

      {/* Engine — top */}
      <polygon points="108,90 118,90 120,96 106,96" fill="#475569" />
      {/* Engine — bottom shadow */}
      <polygon points="106,96 120,96 116,100 110,100" fill="#1e293b" />
      {/* Engine intake */}
      <polygon points="108,92 116,92 116,94 108,94" fill="#0f172a" />

      {/* Belly accent line */}
      <polygon points="60,94 200,90 195,96 60,98" fill="#1e3a8a" opacity="0.4" />
    </svg>
  )
}

/**
 * Single animated puff of exhaust smoke. Drifts up-and-back from the engine,
 * scaling up while fading out. Looped via CSS animation; staggered delays
 * (provided by parent) create a continuous trail.
 */
function SmokePuff({
  delay,
  duration = 2.4,
  size = 22,
  startOpacity = 0.6,
}: {
  delay: number
  duration?: number
  size?: number
  startOpacity?: number
}) {
  return (
    <span
      className="absolute rounded-full bg-slate-400/70"
      style={{
        // Anchored just behind the engine exhaust
        right: 0,
        top: "50%",
        width: size,
        height: size,
        transform: "translate(0, -50%)",
        opacity: 0,
        animation: `smoke-drift ${duration}s ease-out ${delay}s infinite`,
        // CSS var used by the keyframe to remember the puff's starting opacity
        ["--smoke-opacity" as string]: String(startOpacity),
        filter: "blur(2px)",
      }}
    />
  )
}

export function LoadingState({ destination }: { destination: string }) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(messageInterval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      {/* Airplane + smoke trail */}
      <div className="relative h-32 w-64 md:h-36 md:w-72">
        {/* Smoke puffs trail off the back-left of the airplane.
            Container is positioned to overlap the airplane's tail/engine area. */}
        <div className="absolute left-2 top-1/2 h-12 w-32 -translate-y-1/2">
          <SmokePuff delay={0} size={20} startOpacity={0.55} />
          <SmokePuff delay={0.4} size={24} startOpacity={0.5} />
          <SmokePuff delay={0.8} size={18} startOpacity={0.6} />
          <SmokePuff delay={1.2} size={26} startOpacity={0.45} />
          <SmokePuff delay={1.6} size={20} startOpacity={0.55} />
          <SmokePuff delay={2.0} size={22} startOpacity={0.5} />
        </div>

        {/* Static low-poly airplane (no movement, only the smoke animates) */}
        <LowPolyAirplane className="relative h-full w-full drop-shadow-[0_8px_16px_rgba(37,99,235,0.25)]" />
      </div>

      {/* Destination */}
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          Planning your trip to
        </p>
        <p className="text-xl font-bold text-primary">{destination}</p>
      </div>

      {/* Loading message with bouncing dots */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span
            className="inline-block size-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="inline-block size-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="inline-block size-2 animate-pulse rounded-full bg-primary"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  )
}
