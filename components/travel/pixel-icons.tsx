"use client"

import { cn } from "@/lib/utils"

export function PixelAirplane({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-16", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Retro pixel airplane */}
      <rect x="2" y="14" width="2" height="4" fill="currentColor" />
      <rect x="4" y="12" width="2" height="8" fill="currentColor" />
      <rect x="6" y="10" width="2" height="12" fill="currentColor" />
      <rect x="8" y="14" width="2" height="4" fill="currentColor" />
      <rect x="10" y="14" width="8" height="4" fill="currentColor" />
      <rect x="18" y="12" width="2" height="8" fill="currentColor" />
      <rect x="20" y="10" width="2" height="12" fill="currentColor" />
      <rect x="22" y="8" width="2" height="16" fill="currentColor" />
      <rect x="24" y="6" width="2" height="6" fill="currentColor" />
      <rect x="24" y="20" width="2" height="6" fill="currentColor" />
      <rect x="26" y="4" width="2" height="4" fill="currentColor" />
      <rect x="26" y="24" width="2" height="4" fill="currentColor" />
      <rect x="28" y="2" width="2" height="4" fill="currentColor" />
      <rect x="28" y="26" width="2" height="4" fill="currentColor" />
      {/* Windows */}
      <rect x="12" y="15" width="2" height="2" fill="oklch(0.75 0.15 170)" />
      <rect x="15" y="15" width="2" height="2" fill="oklch(0.75 0.15 170)" />
    </svg>
  )
}

export function PixelBus({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-16", className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Retro pixel bus body */}
      <rect x="2" y="10" width="28" height="12" fill="currentColor" />
      <rect x="4" y="8" width="24" height="2" fill="currentColor" />
      {/* Windows */}
      <rect x="5" y="12" width="4" height="4" fill="oklch(0.75 0.15 170)" />
      <rect x="11" y="12" width="4" height="4" fill="oklch(0.75 0.15 170)" />
      <rect x="17" y="12" width="4" height="4" fill="oklch(0.75 0.15 170)" />
      <rect x="23" y="12" width="4" height="4" fill="oklch(0.75 0.15 170)" />
      {/* Wheels */}
      <rect x="6" y="22" width="4" height="4" fill="oklch(0.3 0.02 250)" />
      <rect x="22" y="22" width="4" height="4" fill="oklch(0.3 0.02 250)" />
      <rect x="7" y="23" width="2" height="2" fill="oklch(0.5 0.02 250)" />
      <rect x="23" y="23" width="2" height="2" fill="oklch(0.5 0.02 250)" />
      {/* Door */}
      <rect x="26" y="14" width="2" height="6" fill="oklch(0.96 0.01 240)" />
    </svg>
  )
}
