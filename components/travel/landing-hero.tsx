"use client"

import { useState, useEffect } from "react"
import { Plane } from "lucide-react"

function SpinningGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Spin%20The%20Globe%20-%20Anton%20Moek-ZKdREW5DL756CHQfUzDn7OvYvQI5cD.gif"
        alt="Spinning 3D globe with low-poly style"
        className="h-full w-full object-contain"
      />
    </div>
  )
}

const DESTINATIONS = ["Canada", "London", "Tokyo", "Paris", "New York", "Mexico"]

function TypewriterButton({ onClick, disabled, isLeaving }: { onClick: () => void; disabled: boolean; isLeaving: boolean }) {
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    let timer: NodeJS.Timeout
    const handleType = () => {
      const i = loopNum % DESTINATIONS.length
      const fullText = DESTINATIONS[i]

      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1))

      setTypingSpeed(isDeleting ? 60 : 120)

      if (!isDeleting && text === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000) // Pause at end of word
      } else if (isDeleting && text === "") {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
        timer = setTimeout(handleType, 500) // Pause before next word
      } else {
        timer = setTimeout(handleType, typingSpeed)
      }
    }

    timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, typingSpeed])

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative mt-6 flex cursor-pointer items-center justify-center text-xl font-medium text-muted-foreground transition-all hover:text-foreground md:text-3xl translate-x-4 md:translate-x-8 ${isLeaving ? "cursor-default" : ""}`}
    >
      <span className={`transition-opacity duration-700 ${isLeaving ? "opacity-0" : "opacity-100"}`}>
        I want to go to{" "}
        <span className="inline-block w-[110px] text-left font-bold text-foreground md:w-[170px]">
          {text}
          <span className="animate-pulse text-primary">|</span>
        </span>
      </span>
      <Plane
        className={`absolute -right-8 top-1/2 size-6 -rotate-45 text-primary md:-right-12 md:size-8 ${isLeaving
            ? "transition-all duration-[1500ms] ease-in-out -translate-y-[150vh] scale-[2]"
            : "transition-all duration-300 -translate-y-1/2 group-hover:translate-x-3 group-hover:-translate-y-[80%]"
          }`}
      />
    </button>
  )
}

export function LandingHero({ onStart }: { onStart: () => void }) {
  const [isReady, setIsReady] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    if (isLeaving) return
    setIsLeaving(true)
    // Wait 1.5 seconds for the airplane to fly away before swapping screens
    setTimeout(() => onStart(), 1500)
  }

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center pb-32 md:pb-40 lg:pb-48 overflow-hidden bg-white">

      {/* Dot Grid Background with radial fade mask so it doesn't clash with the globe's solid white background */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isLeaving ? "opacity-0" : "opacity-100"}`}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:24px_24px] opacity-80 md:[background-size:32px_32px]"
          style={{
            maskImage: "radial-gradient(ellipse at center, transparent 30%, black 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, transparent 30%, black 70%)"
          }}
        />
      </div>

      {/* Globe container */}
      <div className={`relative mt-24 mb-0 md:mt-32 transition-opacity duration-1000 ${!isReady || isLeaving ? "opacity-0" : "opacity-100"}`}>
        <SpinningGlobe className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96" />
      </div>

      {/* Text content fading out */}
      <div className={`relative z-10 flex flex-col items-center gap-4 px-4 text-center md:gap-6 mt-4 transition-opacity duration-700 ${isLeaving ? "opacity-0" : "opacity-100"}`}>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl max-w-4xl">
          Planning a trip? Don&apos;t worry. <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Travelia
          </span>{" "}
          is here.
        </h1>
        <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg lg:text-xl">
          Let AI take care of it for you — amazing destinations, personalized itineraries.
        </p>
      </div>

      {/* Button is kept outside so the plane doesn't fade, only the text inside does */}
      <div className="relative z-20">
        <TypewriterButton onClick={handleStart} isLeaving={isLeaving} disabled={isLeaving} />
      </div>

    </div>
  )
}
