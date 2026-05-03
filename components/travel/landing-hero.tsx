"use client"

import { useState, useEffect } from "react"
import { Plane } from "lucide-react"
import { LowPolyGlobe } from "./low-poly-globe"

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
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes orbitFlight {
          0%   { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .animate-orbit-plane {
          offset-path: path('M 0 600 C 0 300 60 100 150 -180 A 150 150 0 1 0 -150 -180 A 150 150 0 1 0 150 -180 C 150 -600 0 -900 0 -1400');
          offset-rotate: auto 45deg;
          animation: orbitFlight 5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          z-index: 50;
        }
      `}} />
      <button
        onClick={onClick}
        disabled={disabled}
        className={`group relative mt-6 flex cursor-pointer items-center justify-center text-xl font-medium text-muted-foreground transition-all hover:text-foreground md:text-3xl translate-x-4 md:translate-x-8 ${isLeaving ? "cursor-default" : ""}`}
      >
        <span className={`transition-opacity duration-700 ${isLeaving ? "opacity-0 delay-[1500ms]" : "opacity-100 delay-0"}`}>
          I want to go to{" "}
          <span className="inline-block w-[110px] text-left font-bold text-foreground md:w-[170px]">
            {text}
            <span className="animate-pulse text-primary">|</span>
          </span>
        </span>
      </button>
    </>
  )
}

export function LandingHero({ onStart }: { onStart: () => void }) {
  const [isReady, setIsReady] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    if (isLeaving) return
    setIsLeaving(true)
    // Wait 5 seconds for the airplane to fly away before swapping screens
    setTimeout(() => onStart(), 5000)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Calculate normalized mouse position from -1 to 1
    if (typeof window !== "undefined") {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePos({ x, y })
    }
  }

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center pb-32 md:pb-40 lg:pb-48 overflow-hidden bg-white"
      onMouseMove={handleMouseMove}
    >

      {/* Dot Grid Background with radial fade mask so it doesn't clash with the globe's solid white background */}
      <div
        className={`absolute -inset-[100px] pointer-events-none transition-opacity duration-700 ${isLeaving ? "opacity-0 delay-[1500ms]" : "opacity-100 delay-0"}`}
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(#94a3b8_2px,transparent_2px)] [background-size:24px_24px] opacity-80 md:[background-size:32px_32px] transition-transform duration-300 ease-out"
          style={{
            maskImage: "radial-gradient(ellipse at center, transparent 30%, black 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, transparent 30%, black 70%)",
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`
          }}
        />
      </div>

      {/* Globe container */}
      <div className={`relative mt-24 mb-0 md:mt-32 transition-opacity duration-1000 ${!isReady ? "opacity-0" : isLeaving ? "opacity-0 delay-[1200ms]" : "opacity-100 delay-0"}`}>
        <LowPolyGlobe className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96" />
      </div>

      {/* Text content fading out */}
      <div className={`relative z-10 flex flex-col items-center gap-4 px-4 text-center md:gap-6 mt-4 transition-opacity duration-700 ${isLeaving ? "opacity-0 delay-[1500ms]" : "opacity-100 delay-0"}`}>
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

      {/* Magic Orbiting Plane - Appears from bottom when leaving */}
      {isLeaving && (
        <div className="absolute left-1/2 top-1/2 pointer-events-none z-50">
          <Plane className="animate-orbit-plane size-8 text-primary" />
        </div>
      )}
    </div>
  )
}
