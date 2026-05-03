"use client"

import { useEffect, useMemo, useState } from "react"
import { LandingHero } from "@/components/travel/landing-hero"
import { TravelSidebar } from "@/components/travel/travel-sidebar"
import { MapPlaceholder } from "@/components/travel/map-placeholder"
import { type DayItinerary } from "@/lib/itinerary"
import { generateItineraryAction } from "@/app/actions"

export type PlannerState = "form" | "loading" | "results"

export interface TravelData {
  destination: string
  days: number
  preferences: string[]
  startTime: string
  endTime: string
  userCoords?: [number, number]
}

export default function Home() {
  const [showPlanner, setShowPlanner] = useState(false)
  const [plannerVisible, setPlannerVisible] = useState(false)

  // Shared planner state — lifted so the map can react to itinerary selection
  const [state, setState] = useState<PlannerState>("form")
  const [travelData, setTravelData] = useState<TravelData | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [previewLocation, setPreviewLocation] = useState<[number, number] | null>(null)

  const [itinerary, setItinerary] = useState<DayItinerary[] | null>(null)

  useEffect(() => {
    if (showPlanner) {
      // Trigger fade-in on the next frame so the transition runs
      const id = requestAnimationFrame(() => setPlannerVisible(true))
      return () => cancelAnimationFrame(id)
    }
  }, [showPlanner])

  const handleSubmit = async (data: TravelData) => {
    setTravelData(data)
    setSelectedItemId(null)
    setState("loading")
    try {
      const generated = await generateItineraryAction(data.destination, data.days, data.preferences, data.startTime, data.endTime, data.userCoords)
      setItinerary(generated)
      setState("results")
    } catch (error) {
      console.error("Failed to generate itinerary", error)
      setState("form") // Fallback on error
    }
  }

  const handleBack = () => {
    setState("form")
    setSelectedItemId(null)
  }

  if (!showPlanner) {
    return <LandingHero onStart={() => setShowPlanner(true)} />
  }

  return (
    <main
      className={`flex h-screen w-full flex-col overflow-hidden transition-opacity duration-700 lg:flex-row ${
        plannerVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Left Sidebar - Controls & Results (fixed width on desktop, scrolls internally) */}
      <TravelSidebar
        state={state}
        travelData={travelData}
        itinerary={itinerary}
        selectedItemId={selectedItemId}
        onSelectItem={setSelectedItemId}
        onSubmit={handleSubmit}
        onBack={handleBack}
        onPreviewLocation={(lat, lng) => setPreviewLocation([lat, lng])}
      />

      {/* Right Side - Map Area (fills remaining space, never scrolls) */}
      <section className="min-h-0 flex-1 overflow-hidden">
        <MapPlaceholder
          itinerary={itinerary}
          destination={travelData?.destination ?? null}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          previewLocation={previewLocation}
          userCoords={travelData?.userCoords}
        />
      </section>
    </main>
  )
}
